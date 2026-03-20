/**
 * Soulmate — generates story cards for project recommendations.
 */

import { findSoulmates } from './matcher.js';

export async function generateSoulmateCards(profile) {
  const matches = await findSoulmates(profile, []);

  if (matches.length === 0) return [];

  const isAI = matches[0]?.aiPowered;
  const cards = matches.slice(0, 3).map((match, i) => {
    const stars = match.stars >= 1000 ? `${(match.stars / 1000).toFixed(1)}k` : match.stars;

    // For AI picks, the second reason is the "why" sentence
    const vibeTag = match.reasons[0] || '';
    const whyText = match.reasons[1] || match.description;

    const tags = match.aiPowered
      ? `<span class="match-tag ai">${vibeTag}</span>`
      : match.reasons.map(r => `<span class="match-tag">${r}</span>`).join('');

    return `
      <div class="match-item">
        <div class="match-top">
          <div class="match-name"><a href="${match.url}" target="_blank" rel="noopener noreferrer">${match.name}</a></div>
          <div class="match-pct">${match.score}%</div>
        </div>
        <div class="match-desc">${match.aiPowered ? whyText : match.description}</div>
        <div class="match-meta">${match.language || 'Unknown'} · ⭐ ${stars} · ${match.difficulty}</div>
        <div class="match-tags">${tags}</div>
      </div>
    `;
  }).join('');

  const subtitle = isAI
    ? '<p class="card-body" style="margin-top: 8px;">AI-curated picks based on your skills, mood, and coding patterns.</p>'
    : '';

  return [{
    theme: 'soulmate',
    html: `
      <div class="card-eyebrow">YOUR OPEN SOURCE SOULMATES</div>
      <div class="card-headline">Projects<br>Made For You</div>
      ${subtitle}
      <div class="match-list">${cards}</div>
    `,
  }];
}

// Keep backwards compat export
export async function renderSoulmate(profile, args = []) {
  const cards = await generateSoulmateCards(profile);
  return cards.map(c => c.html).join('');
}
