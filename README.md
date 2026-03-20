# VibeCodeCheck

**Your Developer Wrapped.** Discover your coding personality. See your code like never before.

A Spotify Wrapped-inspired experience for developers. Enter any GitHub username and get a full vibe check — AI-powered aura readings, savage commit roasts, personalized playlists, and more.

**Live at [vibecodecheck.me](https://vibecodecheck.me)**

---

## What You Get

**Profile Overview** — Your GitHub stats at a glance: repos, stars, followers, account age.

**Top Languages** — See your #1 language and full breakdown with animated bars.

**Developer Mood Ring** — Burnout score, flow state, diversity index, and consistency check. Are you zen, grinding, scattered, or in the zone?

**GitHub Aura Generator** — A mystical AI-generated developer identity with element, rarity, and special power. Are you a Midnight Rust Alchemist or a Chaotic TypeScript Oracle?

**Commit Roast** — Three savage (but funny) AI-generated roast lines based on your actual coding habits. You asked for this.

**Open Source Soulmates** — AI-curated project recommendations matched to your skills, mood, and coding patterns.

**Coding Spotify Playlist** — Five real songs that match your coding energy, with direct Spotify links.

---

## Tech Stack

- **Vanilla JS** with ES modules — no framework overhead
- **Vite** for builds, outputs static files
- **Groq AI** (Llama 3.3 70B) for aura, roast, playlist, and soulmate features
- **GitHub API** for all developer data (public, no auth required)
- **Dela Gothic One + Outfit** fonts
- **GitHub Pages** for deployment

## Local Development

```bash
# install
bun install

# create .env with your Groq API key
echo "VITE_GROQ_API_KEY=your_key_here" > .env

# run dev server
bun run dev

# build for production
bun run build
```

## Creator

Built by **Rachel Larralde** — [@witchaudio_](https://twitter.com/witchaudio_)
