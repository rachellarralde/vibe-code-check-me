/**
 * Aura — generates a mystical developer aura story card.
 */

import { generateAura } from '../../groq-ai.js';
import { calculateMoodScores } from '../mood-ring/scoring.js';

const ELEMENT_COLORS = {
  fire:      { primary: '#ff4500', secondary: '#ff8c00', glow: 'rgba(255,69,0,0.3)' },
  water:     { primary: '#00bfff', secondary: '#1e90ff', glow: 'rgba(0,191,255,0.3)' },
  earth:     { primary: '#8b4513', secondary: '#daa520', glow: 'rgba(218,165,32,0.3)' },
  air:       { primary: '#e0e0e0', secondary: '#b0c4de', glow: 'rgba(176,196,222,0.3)' },
  lightning: { primary: '#ffd700', secondary: '#ffef00', glow: 'rgba(255,215,0,0.4)' },
  shadow:    { primary: '#8a2be2', secondary: '#4b0082', glow: 'rgba(138,43,226,0.3)' },
  crystal:   { primary: '#e0f7fa', secondary: '#80deea', glow: 'rgba(224,247,250,0.3)' },
  nature:    { primary: '#32cd32', secondary: '#228b22', glow: 'rgba(50,205,50,0.3)' },
};

const RARITY_STYLES = {
  Common:    { color: '#aaa', label: 'COMMON' },
  Uncommon:  { color: '#1eff00', label: 'UNCOMMON' },
  Rare:      { color: '#0070ff', label: 'RARE' },
  Epic:      { color: '#a335ee', label: 'EPIC' },
  Legendary: { color: '#ff8000', label: 'LEGENDARY' },
};

export async function generateAuraCards(profile) {
  const mood = calculateMoodScores(profile);
  const aura = await generateAura(profile, mood);

  if (!aura) return [];

  const el = ELEMENT_COLORS[aura.element] || ELEMENT_COLORS.shadow;
  const rarity = RARITY_STYLES[aura.rarity] || RARITY_STYLES.Common;

  return [{
    theme: 'aura',
    html: `
      <div class="card-eyebrow">YOUR DEVELOPER AURA</div>
      <div class="aura-orb" style="
        background: radial-gradient(circle, ${el.primary} 0%, ${el.secondary} 50%, transparent 70%);
        box-shadow: 0 0 80px ${el.glow}, 0 0 160px ${el.glow};
      "></div>
      <div class="card-headline aura-title">${aura.aura}</div>
      <div class="aura-rarity" style="color: ${rarity.color}; border-color: ${rarity.color};">
        ${rarity.label}
      </div>
      <p class="card-body aura-desc">${aura.description}</p>
      <div class="aura-power">
        <span class="power-label">Special Power</span>
        <span class="power-text">${aura.power}</span>
      </div>
      <div class="aura-element" style="color: ${el.primary};">
        ${aura.element.toUpperCase()} ELEMENT
      </div>
    `,
  }];
}
