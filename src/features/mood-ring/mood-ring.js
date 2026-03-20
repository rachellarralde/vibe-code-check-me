/**
 * Mood Ring — generates story cards for the Wrapped experience.
 */

import { calculateMoodScores } from './scoring.js';

const MOOD_EMOJI = {
  zen: '🧘',
  flow: '⚡',
  grinding: '🔥',
  scattered: '🌀',
  resting: '💤',
};

const MOOD_TITLES = {
  zen: 'Zen Master',
  flow: 'Flow State',
  grinding: 'Grind Mode',
  scattered: 'Scattered Energy',
  resting: 'Recharging',
};

const MOOD_DESC = {
  zen: 'You\'re in perfect coding harmony. Balanced output, diverse skills, healthy boundaries. This is rare — protect it.',
  flow: 'You\'re locked in. Commits are consistent, code is flowing, and you\'re building more than breaking. Ship it.',
  grinding: 'Late nights, weekend pushes, high churn. You\'re going hard, but your code deserves a rested author.',
  scattered: 'Bursts of activity followed by silence. You might be context-switching too much — pick a lane.',
  resting: 'Low recent activity. Either a well-earned break or the calm before the storm. Nothing wrong with that.',
};

const MOOD_TIPS = {
  zen: ['Mentor someone — your balance is rare', 'Try a new language to keep things fresh', 'Document your workflow for others'],
  flow: ['Protect this time — minimize meetings', 'Ship that side project now', 'Take walks to sustain the flow'],
  grinding: ['Set a hard stop time tonight', 'Take tomorrow off if you can', 'Delegate or defer one task this week'],
  scattered: ['Pick one project and focus for a week', 'Use a time-boxing technique', 'Write down your top 3 priorities'],
  resting: ['Review and clean up old repos', 'Read code from projects you admire', 'Come back when the spark hits'],
};

export function generateMoodCards(profile) {
  const scores = calculateMoodScores(profile);
  const mood = scores.overallMood;

  // Card 1: The big mood reveal
  const card1 = {
    theme: 'mood',
    html: `
      <div class="card-eyebrow">YOUR DEVELOPER MOOD</div>
      <div class="mood-emoji">${MOOD_EMOJI[mood]}</div>
      <div class="mood-badge ${mood}">${MOOD_TITLES[mood]}</div>
      <p class="card-body">${MOOD_DESC[mood]}</p>
    `,
  };

  // Card 2: Score breakdown
  const burnoutColor = scores.burnoutScore > 50 ? 'red' : scores.burnoutScore > 30 ? 'red' : 'green';
  const card2 = {
    theme: 'activity',
    html: `
      <div class="card-eyebrow">MOOD BREAKDOWN</div>
      <div class="card-headline">Your Scores</div>
      <div class="score-bars">
        <div class="score-row">
          <span class="score-label">Burnout Risk</span>
          <div class="score-track"><div class="score-fill ${burnoutColor}" style="width: ${scores.burnoutScore}%;"></div></div>
          <span class="score-val">${scores.burnoutScore}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Flow State</span>
          <div class="score-track"><div class="score-fill green" style="width: ${scores.flowScore}%;"></div></div>
          <span class="score-val">${scores.flowScore}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Diversity</span>
          <div class="score-track"><div class="score-fill teal" style="width: ${scores.diversityScore}%;"></div></div>
          <span class="score-val">${scores.diversityScore}</span>
        </div>
        <div class="score-row">
          <span class="score-label">Consistency</span>
          <div class="score-track"><div class="score-fill purple" style="width: ${scores.consistencyScore}%;"></div></div>
          <span class="score-val">${scores.consistencyScore}</span>
        </div>
      </div>
      <div class="tips-list">
        ${MOOD_TIPS[mood].map(t => `<div class="tip-item"><span class="tip-arrow">→</span><span>${t}</span></div>`).join('')}
      </div>
    `,
  };

  return [card1, card2];
}

// Keep backwards compat export
export function renderMoodRing(profile) {
  const cards = generateMoodCards(profile);
  return cards.map(c => c.html).join('');
}
