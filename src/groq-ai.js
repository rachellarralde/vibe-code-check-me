/**
 * Groq AI client — fast inference for all AI-powered features.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

async function groqChat(prompt, temperature = 0.8, maxTokens = 1024) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    console.error('Groq API error:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function parseJSON(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  try { return JSON.parse(cleaned); } catch { return null; }
}

function buildProfileSummary(profile, mood) {
  const topLangs = Object.entries(profile.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, pct]) => `${lang} (${pct}%)`);

  return `- Username: ${profile.username}
- Top languages: ${topLangs.join(', ')}
- Public repos: ${profile.publicRepos}
- Stars earned: ${profile.totalStars}
- Account age: ${profile.accountAge} years
- Current mood: ${mood?.overallMood || 'unknown'} (burnout: ${mood?.burnoutScore || 0}/100, flow: ${mood?.flowScore || 0}/100)
- Recent activity: ${profile.recentActivity.eventsLast30Days} events in last 30 days
- Peak coding hour: ${profile.recentActivity.peakHour}:00
- Weekend coding ratio: ${Math.round(profile.recentActivity.weekendRatio * 100)}%
- Code churn: adds ${profile.codeChurn.avgWeeklyAdditions} lines/week, deletes ${profile.codeChurn.avgWeeklyDeletions} lines/week
- Current streak: ${profile.commitHistory.streakCurrent} weeks`;
}

/**
 * Generate a mystical developer aura.
 */
export async function generateAura(profile, mood) {
  const summary = buildProfileSummary(profile, mood);
  const prompt = `You are a mystical developer oracle. Based on this developer's GitHub profile, generate their unique "Developer Aura" — a poetic, mystical identity that captures their coding essence.

DEVELOPER PROFILE:
${summary}

Generate a JSON response with:
- "aura": A 2-4 word mystical title (e.g. "Midnight Rust Alchemist", "Chaotic TypeScript Oracle", "Zen Garden Architect", "Neon Data Sorcerer"). Be creative, poetic, and specific to their actual languages/patterns.
- "element": One of: "fire", "water", "earth", "air", "lightning", "shadow", "crystal", "nature"
- "description": 2 sentences max. Mystical but grounded in their actual coding patterns. Make it feel like a horoscope reading that's eerily accurate.
- "power": A one-line "special power" (e.g. "Can refactor legacy code by moonlight", "Turns coffee into type-safe APIs")
- "rarity": One of: "Common", "Uncommon", "Rare", "Epic", "Legendary" (based on how unique their profile is — lots of stars/repos/languages = rarer)

Respond ONLY with valid JSON, no other text.`;

  const raw = await groqChat(prompt, 0.9, 512);
  return parseJSON(raw);
}

/**
 * Generate a savage (but funny) commit roast.
 */
export async function generateRoast(profile, mood) {
  const summary = buildProfileSummary(profile, mood);
  const prompt = `You are a ruthless but hilarious comedy roast writer for developers. Roast this developer based on their GitHub profile. Be SAVAGE but FUNNY — never mean-spirited or personal, always about their coding habits.

DEVELOPER PROFILE:
${summary}

Write exactly 3 roast lines. Each should be punchy, specific to their actual data (mention their languages, commit times, patterns), and genuinely funny. Think comedy roast, not bullying.

Examples of tone:
- "You mass-committed at 3AM on a Sunday. Therapy is cheaper than refactoring."
- "47 repos and 2 stars? Your code is like a tree falling in an empty forest."
- "Your top language is CSS? That's not a language, that's a cry for help."

Respond ONLY with valid JSON, no other text:
{
  "roasts": ["line 1", "line 2", "line 3"],
  "severity": "mild" | "medium" | "brutal"
}`;

  const raw = await groqChat(prompt, 0.95, 512);
  return parseJSON(raw);
}

/**
 * Generate a coding-themed Spotify playlist.
 */
export async function generateSpotifyPlaylist(profile, mood) {
  const summary = buildProfileSummary(profile, mood);
  const prompt = `You are a music curator who creates perfect coding playlists. Based on this developer's profile and mood, suggest 5 real songs that match their coding vibe.

DEVELOPER PROFILE:
${summary}

RULES:
- Pick REAL songs by REAL artists that exist on Spotify
- Match the vibe: fast committers = high energy, night coders = ambient/lo-fi, grinders = intense/focus music
- Mix genres — don't just pick one type
- Each song should have a witty 1-line reason connecting it to their coding habits
- Think about tempo, energy, and mood matching

Respond ONLY with valid JSON, no other text:
{
  "playlistName": "A creative playlist name (4-6 words, related to their coding style)",
  "songs": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "reason": "Witty one-liner connecting the song to their coding"
    }
  ]
}`;

  const raw = await groqChat(prompt, 0.85, 512);
  return parseJSON(raw);
}

/**
 * Soulmate recommendations (existing).
 */
export async function getAIRecommendations(profile, mood) {
  const summary = buildProfileSummary(profile, mood);
  const prompt = `You are an open source project matchmaker. Given a developer's profile, suggest 5 specific real GitHub repositories they should contribute to or check out.

DEVELOPER PROFILE:
${summary}

RULES:
- Suggest REAL repos that exist on GitHub (owner/repo format)
- Pick interesting, unique projects — NOT the most popular/obvious ones (no React, Vue, Angular, Bootstrap, etc.)
- Match their skill level and languages
- If they're burning out, suggest fun/creative/low-pressure projects
- If they're in flow, suggest ambitious/challenging ones
- If resting, suggest beginner-friendly or exploratory ones
- Include a mix: some in their comfort zone, some that stretch them
- Each recommendation needs a SHORT "why" reason (max 10 words, punchy and specific)

Respond ONLY with valid JSON array, no other text:
[
  {
    "repo": "owner/repo-name",
    "why": "Max 10 words, punchy reason",
    "vibe": "chill" | "ambitious" | "creative" | "exploratory" | "impactful"
  }
]`;

  const result = parseJSON(await groqChat(prompt, 0.8, 1024));
  return Array.isArray(result) ? result : null;
}
