/**
 * Soulmate Matcher — uses Groq AI for smart recommendations,
 * with GitHub Search API as fallback.
 */

import { searchRepos, fetchUser } from '../../github-api.js';
import { calculateMoodScores } from '../mood-ring/scoring.js';
import { getAIRecommendations } from '../../groq-ai.js';

export async function findSoulmates(profile, args = []) {
  const mood = calculateMoodScores(profile);

  // Try AI-powered recommendations first
  try {
    const aiRecs = await getAIRecommendations(profile, mood);
    if (aiRecs && aiRecs.length > 0) {
      const enriched = await enrichAIRecommendations(aiRecs, profile);
      if (enriched.length > 0) return enriched;
    }
  } catch (err) {
    console.warn('AI recommendations failed, falling back to GitHub Search:', err);
  }

  // Fallback: GitHub Search API
  return fallbackSearch(profile, mood, args);
}

/**
 * Take AI recommendations and enrich them with real GitHub data.
 */
async function enrichAIRecommendations(aiRecs, profile) {
  const results = [];

  for (const rec of aiRecs.slice(0, 5)) {
    try {
      const [owner, repo] = rec.repo.split('/');
      if (!owner || !repo) continue;

      // Fetch real repo data to verify it exists
      const repoData = await fetchRepoSafe(owner, repo);
      if (!repoData) continue;

      const stars = repoData.stargazers_count || 0;
      let difficulty = 'Intermediate';
      if (stars > 5000 || (repoData.forks_count || 0) > 1000) difficulty = 'Advanced';
      else if (stars < 500) difficulty = 'Beginner-friendly';

      const vibeToTag = {
        chill: '😌 Chill vibes',
        ambitious: '🚀 Ambitious',
        creative: '🎨 Creative',
        exploratory: '🔭 Exploratory',
        impactful: '💥 High impact',
      };

      results.push({
        name: repoData.full_name,
        url: repoData.html_url,
        description: repoData.description || rec.why,
        language: repoData.language,
        stars,
        forks: repoData.forks_count || 0,
        issues: repoData.open_issues_count || 0,
        score: calculateAIScore(repoData, profile, rec.vibe),
        reasons: [
          vibeToTag[rec.vibe] || '✨ AI picked',
          rec.why,
        ],
        difficulty,
        aiPowered: true,
      });
    } catch {
      // Skip repos that fail to resolve
      continue;
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

async function fetchRepoSafe(owner, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function calculateAIScore(repo, profile, vibe) {
  let score = 50; // Base score for AI recommendations

  // Language match
  const repoLang = (repo.language || '').toLowerCase();
  const profileLangs = Object.keys(profile.languages).map(l => l.toLowerCase());
  if (profileLangs.includes(repoLang)) score += 20;

  // Active project
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) score += 10;

  // Right-sized community
  if (repo.stargazers_count >= 100 && repo.stargazers_count <= 10000) score += 10;

  // Vibe bonus
  if (vibe === 'creative' || vibe === 'exploratory') score += 5;

  return Math.min(score, 98);
}

/**
 * Fallback: original GitHub Search API approach.
 */
async function fallbackSearch(profile, mood, args) {
  const flags = parseFlags(args);

  const topLangs = Object.entries(profile.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([l]) => l.toLowerCase());

  const searchLangs = flags.lang ? [flags.lang.toLowerCase()] : topLangs;
  if (searchLangs.length === 0) return [];

  const queries = searchLangs.map(lang => {
    let q = `language:${lang} stars:>50`;
    if (flags.easy) q += ' good-first-issues:>3';
    if (mood.overallMood === 'grinding' || mood.overallMood === 'resting') {
      q += ' help-wanted-issues:>2';
    }
    return q;
  });

  const results = await Promise.all(
    queries.map(q => searchRepos(q).catch(() => ({ items: [] })))
  );

  const seen = new Set();
  const allRepos = [];
  for (const result of results) {
    for (const repo of (result.items || [])) {
      if (!seen.has(repo.full_name)) {
        seen.add(repo.full_name);
        allRepos.push(repo);
      }
    }
  }

  const scored = allRepos.map(repo => scoreMatch(repo, profile, mood, flags));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

function scoreMatch(repo, profile, mood, flags) {
  let score = 0;
  const reasons = [];

  const repoLang = (repo.language || '').toLowerCase();
  const profileLangs = Object.keys(profile.languages).map(l => l.toLowerCase());
  if (profileLangs.includes(repoLang)) {
    score += 25;
    reasons.push(`You know ${repo.language}`);
  }

  if (repo.open_issues_count > 5) { score += 10; reasons.push('Active issue tracker'); }
  if (repo.stargazers_count >= 100 && repo.stargazers_count <= 10000) { score += 15; reasons.push('Right-sized community'); }
  else if (repo.stargazers_count > 10000) { score += 5; reasons.push('Large community'); }

  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) { score += 15; reasons.push('Updated recently'); }
  if (repo.description) score += 5;
  if (repo.license) { score += 5; reasons.push('Licensed'); }

  if (mood.overallMood === 'grinding' || mood.overallMood === 'scattered') {
    if (repo.stargazers_count < 1000) score += 10;
  }
  if (mood.overallMood === 'flow') {
    if (repo.stargazers_count > 500) score += 10;
  }
  if (flags.easy && repo.open_issues_count > 10) { score += 10; reasons.push('Good for beginners'); }

  let difficulty = 'Intermediate';
  if (repo.stargazers_count > 5000 || repo.forks_count > 1000) difficulty = 'Advanced';
  else if (flags.easy || repo.stargazers_count < 500) difficulty = 'Beginner-friendly';

  return {
    name: repo.full_name,
    url: repo.html_url,
    description: repo.description || 'No description',
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    score: Math.min(score, 100),
    reasons,
    difficulty,
  };
}

function parseFlags(args) {
  const flags = { easy: false, lang: null, chill: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--easy') flags.easy = true;
    if (args[i] === '--chill') flags.chill = true;
    if (args[i] === '--lang' && args[i + 1]) { flags.lang = args[i + 1]; i++; }
  }
  return flags;
}
