/**
 * Playlist — generates story card for the code quality genre mapping.
 */

import { mapToPlaylist } from './mapper.js';

export function generatePlaylistCards(profile) {
  const playlist = mapToPlaylist(profile);

  const traitRows = Object.values(playlist.traits).map(t => `
    <div class="trait-row">
      <span class="trait-emoji">${t.emoji}</span>
      <span class="trait-label">${t.label}</span>
      <div class="trait-track"><div class="trait-fill" style="width: ${t.value}%;"></div></div>
      <span class="trait-genre">${t.genre}</span>
    </div>
  `).join('');

  return [{
    theme: 'playlist',
    html: `
      <div class="card-eyebrow">YOUR CODE PLAYLIST</div>
      <div id="playlist-capture" class="playlist-wrap">
        <div class="playlist-genre">${playlist.genreName}</div>
        <div class="playlist-sub">${playlist.subtitle}</div>
        <div class="playlist-traits">${traitRows}</div>
        <div class="playlist-desc">${playlist.personality}</div>
        <div class="playlist-credit">@${profile.username} · vibecodecheck.me</div>
      </div>
    `,
  }];
}

// Keep backwards compat export
export function renderPlaylist(profile) {
  const cards = generatePlaylistCards(profile);
  return cards.map(c => c.html).join('');
}
