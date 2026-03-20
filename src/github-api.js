/**
 * GitHub API client — all public endpoints, client-side, no auth.
 * Caches responses in localStorage with 1-hour TTL.
 */

const API_BASE = 'https://api.github.com';
const CACHE_PREFIX = 'vcc_gh_';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

let rateLimitRemaining = 60;
let rateLimitReset = 0;

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached._ts < CACHE_TTL) return cached.data;
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch { /* ignore */ }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, _ts: Date.now() }));
  } catch { /* storage full — ignore */ }
}

async function ghFetch(path) {
  const cached = getCached(path);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  });

  rateLimitRemaining = parseInt(res.headers.get('x-ratelimit-remaining') || '60', 10);
  rateLimitReset = parseInt(res.headers.get('x-ratelimit-reset') || '0', 10);

  if (!res.ok) {
    if (res.status === 404) throw new Error('User not found');
    if (res.status === 403 && rateLimitRemaining === 0) {
      const resetMin = Math.ceil((rateLimitReset * 1000 - Date.now()) / 60000);
      throw new Error(`Rate limit exceeded. Resets in ~${resetMin} min.`);
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  setCache(path, data);
  return data;
}

export function getRateLimit() {
  return { remaining: rateLimitRemaining, reset: rateLimitReset };
}

/** Fetch user profile */
export async function fetchUser(username) {
  return ghFetch(`/users/${username}`);
}

/** Fetch user repos (up to 100, sorted by most recently updated) */
export async function fetchRepos(username) {
  return ghFetch(`/users/${username}/repos?per_page=100&sort=updated`);
}

/** Fetch language breakdown for a single repo */
export async function fetchRepoLanguages(owner, repo) {
  return ghFetch(`/repos/${owner}/${repo}/languages`);
}

/** Fetch public events (most recent 100) */
export async function fetchEvents(username) {
  return ghFetch(`/users/${username}/events/public?per_page=100`);
}

/** Fetch weekly commit activity for a repo (last year) */
export async function fetchCommitActivity(owner, repo) {
  return ghFetch(`/repos/${owner}/${repo}/stats/commit_activity`);
}

/** Fetch code frequency (additions/deletions per week) */
export async function fetchCodeFrequency(owner, repo) {
  return ghFetch(`/repos/${owner}/${repo}/stats/code_frequency`);
}

/** Search repositories for soulmate matching */
export async function searchRepos(query) {
  return ghFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=10&sort=stars`);
}

/**
 * Build a full developer profile from GitHub data.
 * This aggregates user info, repos, events, and code stats.
 */
export async function buildDeveloperProfile(username) {
  const [user, repos, events] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);

  // Aggregate languages across repos
  const languageTotals = {};
  const topRepos = repos.slice(0, 10); // limit API calls
  const languageResults = await Promise.all(
    topRepos.map(r => fetchRepoLanguages(r.owner.login, r.name).catch(() => ({})))
  );

  for (const langs of languageResults) {
    for (const [lang, bytes] of Object.entries(langs)) {
      languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
    }
  }

  // Convert to percentages
  const totalBytes = Object.values(languageTotals).reduce((a, b) => a + b, 0) || 1;
  const languages = {};
  for (const [lang, bytes] of Object.entries(languageTotals)) {
    languages[lang] = Math.round((bytes / totalBytes) * 100);
  }

  // Compute recent activity stats from events
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(e => new Date(e.created_at).getTime() > thirtyDaysAgo);
  const eventHours = recentEvents.map(e => new Date(e.created_at).getHours());
  const peakHour = eventHours.length > 0 ? mode(eventHours) : 12;
  const weekendEvents = recentEvents.filter(e => {
    const day = new Date(e.created_at).getDay();
    return day === 0 || day === 6;
  });
  const eventTypes = {};
  for (const e of recentEvents) {
    eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
  }

  // Fetch commit activity from top 3 repos for trending
  const commitData = await Promise.all(
    topRepos.slice(0, 3).map(r =>
      fetchCommitActivity(r.owner.login, r.name).catch(() => [])
    )
  );

  // Fetch code frequency from top 3 repos
  const codeFreqData = await Promise.all(
    topRepos.slice(0, 3).map(r =>
      fetchCodeFrequency(r.owner.login, r.name).catch(() => [])
    )
  );

  // Aggregate commit history
  let totalCommits = 0;
  let weeksActive = 0;
  const weeklyTotals = [];
  for (const repoWeeks of commitData) {
    if (!Array.isArray(repoWeeks)) continue;
    for (let i = 0; i < repoWeeks.length; i++) {
      const w = repoWeeks[i];
      if (!weeklyTotals[i]) weeklyTotals[i] = 0;
      weeklyTotals[i] += w.total || 0;
      totalCommits += w.total || 0;
    }
  }
  for (const wt of weeklyTotals) {
    if (wt > 0) weeksActive++;
  }

  // Calculate current streak
  let streakCurrent = 0;
  for (let i = weeklyTotals.length - 1; i >= 0; i--) {
    if (weeklyTotals[i] > 0) streakCurrent++;
    else break;
  }

  // Trend: compare last 4 weeks vs previous 4 weeks
  const recent4 = weeklyTotals.slice(-4).reduce((a, b) => a + b, 0);
  const prev4 = weeklyTotals.slice(-8, -4).reduce((a, b) => a + b, 0);
  const trend = prev4 === 0 ? 0 : ((recent4 - prev4) / prev4);

  // Aggregate code churn
  let totalAdditions = 0;
  let totalDeletions = 0;
  let churnWeeks = 0;
  for (const repoFreq of codeFreqData) {
    if (!Array.isArray(repoFreq)) continue;
    for (const [, adds, dels] of repoFreq) {
      totalAdditions += adds || 0;
      totalDeletions += Math.abs(dels || 0);
      churnWeeks++;
    }
  }
  const avgWeeklyAdditions = churnWeeks > 0 ? Math.round(totalAdditions / churnWeeks) : 0;
  const avgWeeklyDeletions = churnWeeks > 0 ? Math.round(totalDeletions / churnWeeks) : 0;
  const addDeleteRatio = totalDeletions > 0 ? +(totalAdditions / totalDeletions).toFixed(2) : totalAdditions > 0 ? 99 : 1;

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  const accountAge = Math.floor((now - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio || '',
    accountAge,
    publicRepos: user.public_repos,
    followers: user.followers,
    languages,
    totalStars,
    totalForks,
    recentActivity: {
      eventsLast30Days: recentEvents.length,
      peakHour,
      weekendRatio: recentEvents.length > 0 ? +(weekendEvents.length / recentEvents.length).toFixed(2) : 0,
      eventTypes,
    },
    commitHistory: {
      weeksActive,
      totalCommits,
      streakCurrent,
      trend,
      weeklyTotals,
    },
    codeChurn: {
      addDeleteRatio,
      avgWeeklyAdditions,
      avgWeeklyDeletions,
    },
  };
}

function mode(arr) {
  const counts = {};
  let maxCount = 0;
  let maxVal = arr[0];
  for (const val of arr) {
    counts[val] = (counts[val] || 0) + 1;
    if (counts[val] > maxCount) {
      maxCount = counts[val];
      maxVal = val;
    }
  }
  return maxVal;
}
