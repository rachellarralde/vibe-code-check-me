/**
 * Roast — generates a savage commit roast story card.
 */

import { generateRoast } from '../../groq-ai.js';
import { calculateMoodScores } from '../mood-ring/scoring.js';

export async function generateRoastCards(profile) {
  const mood = calculateMoodScores(profile);
  const roast = await generateRoast(profile, mood);

  if (!roast || !roast.roasts?.length) return [];

  const severityEmoji = {
    mild: '😏',
    medium: '🔥',
    brutal: '💀',
  };

  const emoji = severityEmoji[roast.severity] || '🔥';

  const lines = roast.roasts.map((line, i) => `
    <div class="roast-line" style="animation-delay: ${0.3 + i * 0.2}s;">
      <span class="roast-num">${i + 1}</span>
      <span class="roast-text">${line}</span>
    </div>
  `).join('');

  return [{
    theme: 'roast',
    html: `
      <div class="card-eyebrow">COMMIT ROAST</div>
      <div class="roast-emoji">${emoji}</div>
      <div class="card-headline">You Asked<br>For This</div>
      <div class="roast-severity ${roast.severity}">${roast.severity.toUpperCase()} HEAT</div>
      <div class="roast-lines">${lines}</div>
    `,
  }];
}
