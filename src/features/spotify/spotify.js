/**
 * Spotify — generates an AI-curated coding playlist story card.
 * Compact grid layout to fit all songs without scrolling.
 */

import { generateSpotifyPlaylist } from '../../groq-ai.js';
import { calculateMoodScores } from '../mood-ring/scoring.js';

export async function generateSpotifyCards(profile) {
  const mood = calculateMoodScores(profile);
  const playlist = await generateSpotifyPlaylist(profile, mood);

  if (!playlist || !playlist.songs?.length) return [];

  const tracks = playlist.songs.map((song, i) => {
    const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
    const spotifyUrl = `https://open.spotify.com/search/${searchQuery}`;

    return `
      <a class="sp-card" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer" style="animation-delay: ${0.2 + i * 0.1}s;">
        <div class="sp-num">${i + 1}</div>
        <div class="sp-title">${song.title}</div>
        <div class="sp-artist">${song.artist}</div>
      </a>
    `;
  }).join('');

  return [{
    theme: 'spotify',
    html: `
      <div class="card-eyebrow">YOUR CODING PLAYLIST</div>
      <div class="card-headline spotify-title">${playlist.playlistName}</div>
      <p class="card-body">AI-curated songs that match your coding energy.</p>
      <div class="sp-grid">${tracks}</div>
      <div class="spotify-cta">Tap a song to find it on Spotify</div>
    `,
  }];
}
