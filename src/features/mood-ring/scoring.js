/**
 * Mood Ring scoring — pure functions that compute burnout, flow, diversity, consistency.
 */

export function calculateMoodScores(profile) {
  const burnout = calcBurnout(profile);
  const flow = calcFlow(profile);
  const diversity = calcDiversity(profile);
  const consistency = calcConsistency(profile);
  const overallMood = determineOverallMood(burnout, flow, diversity, consistency);

  return { burnoutScore: burnout, flowScore: flow, diversityScore: diversity, consistencyScore: consistency, overallMood };
}

function calcBurnout(p) {
  let score = 0;
  const { recentActivity, commitHistory, codeChurn } = p;

  // High weekend ratio → burnout signal
  score += recentActivity.weekendRatio * 30;

  // Very high event count in 30 days
  if (recentActivity.eventsLast30Days > 200) score += 25;
  else if (recentActivity.eventsLast30Days > 100) score += 15;

  // Late night coding (peak hour between 11pm-4am)
  if (recentActivity.peakHour >= 23 || recentActivity.peakHour <= 4) score += 20;

  // Heavy deletions = frustration
  if (codeChurn.addDeleteRatio < 0.8) score += 15;

  // Declining trend
  if (commitHistory.trend < -0.3) score += 10;

  return clamp(Math.round(score), 0, 100);
}

function calcFlow(p) {
  let score = 0;
  const { recentActivity, commitHistory, codeChurn } = p;

  // Consistent daily commits
  if (commitHistory.streakCurrent >= 4) score += 25;
  if (commitHistory.streakCurrent >= 8) score += 15;

  // Healthy add/delete ratio (building more than breaking)
  if (codeChurn.addDeleteRatio >= 1.5 && codeChurn.addDeleteRatio <= 5) score += 20;

  // Moderate activity (not too little, not too much)
  const events = recentActivity.eventsLast30Days;
  if (events >= 30 && events <= 150) score += 20;

  // Positive trend
  if (commitHistory.trend > 0.1) score += 15;

  // Daytime coding hours (9-6pm)
  if (recentActivity.peakHour >= 9 && recentActivity.peakHour <= 18) score += 10;

  return clamp(Math.round(score), 0, 100);
}

function calcDiversity(p) {
  const langCount = Object.keys(p.languages).length;
  let score = 0;

  // Language variety
  if (langCount >= 7) score += 40;
  else if (langCount >= 4) score += 30;
  else if (langCount >= 2) score += 15;
  else score += 5;

  // No single language dominates > 70%
  const topLangPct = Math.max(...Object.values(p.languages), 0);
  if (topLangPct < 50) score += 25;
  else if (topLangPct < 70) score += 15;

  // Event type variety
  const eventTypeCount = Object.keys(p.recentActivity.eventTypes).length;
  if (eventTypeCount >= 5) score += 20;
  else if (eventTypeCount >= 3) score += 10;

  // Many repos
  if (p.publicRepos >= 20) score += 15;
  else if (p.publicRepos >= 10) score += 10;

  return clamp(Math.round(score), 0, 100);
}

function calcConsistency(p) {
  const { commitHistory, recentActivity } = p;
  let score = 0;

  // Weeks active out of total
  const totalWeeks = commitHistory.weeklyTotals.length || 1;
  const activeRatio = commitHistory.weeksActive / totalWeeks;
  score += activeRatio * 40;

  // Current streak
  if (commitHistory.streakCurrent >= 8) score += 30;
  else if (commitHistory.streakCurrent >= 4) score += 20;
  else if (commitHistory.streakCurrent >= 2) score += 10;

  // Low weekend ratio = consistent work-life balance
  if (recentActivity.weekendRatio < 0.2) score += 15;

  // Stable trend (not wildly up or down)
  if (Math.abs(commitHistory.trend) < 0.2) score += 15;

  return clamp(Math.round(score), 0, 100);
}

function determineOverallMood(burnout, flow, diversity, consistency) {
  if (burnout >= 60) return 'grinding';
  if (flow >= 60 && consistency >= 50) return 'flow';
  if (diversity >= 60 && flow >= 40) return 'zen';
  if (consistency < 30 && flow < 30) return 'resting';
  return 'scattered';
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
