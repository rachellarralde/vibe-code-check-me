/**
 * Playlist Mapper — maps developer metrics to music genre traits.
 *
 * Tempo (commits/week): <5 Ambient → 5-15 Indie Folk → 15-30 Pop Rock → 30+ Speed Metal
 * Complexity (language count): 1 Lo-fi → 2-3 Indie → 4-6 Prog Rock → 7+ Jazz Fusion
 * Energy (consistency): Sporadic = Experimental, Steady = Classical, Burst = Punk
 * Mood (add/delete ratio): Heavy deletion = Blues, Balanced = Jazz, Heavy addition = EDM
 */

const TEMPO_BANDS = [
  { max: 5, genre: 'Ambient', desc: 'Slow, meditative, minimal output', emoji: '🌊' },
  { max: 15, genre: 'Indie Folk', desc: 'Steady and thoughtful, unhurried', emoji: '🍂' },
  { max: 30, genre: 'Pop Rock', desc: 'Solid pace, reliable delivery', emoji: '🎸' },
  { max: Infinity, genre: 'Speed Metal', desc: 'Relentless velocity, non-stop pushing', emoji: '⚡' },
];

const COMPLEXITY_BANDS = [
  { max: 1, genre: 'Lo-fi', desc: 'One language, one vibe, pure simplicity', emoji: '📻' },
  { max: 3, genre: 'Indie', desc: 'A comfortable palette of a few languages', emoji: '🎹' },
  { max: 6, genre: 'Prog Rock', desc: 'Multi-layered, technically adventurous', emoji: '🎼' },
  { max: Infinity, genre: 'Jazz Fusion', desc: 'Polyglot mastery, genre-bending skills', emoji: '🎷' },
];

const ENERGY_BANDS = [
  { id: 'sporadic', genre: 'Experimental', desc: 'Irregular bursts of creative energy', emoji: '🔮' },
  { id: 'steady', genre: 'Classical', desc: 'Reliable, disciplined, metronomic', emoji: '🎻' },
  { id: 'burst', genre: 'Punk', desc: 'Intense surges followed by silence', emoji: '🔥' },
];

const MOOD_BANDS = [
  { id: 'delete-heavy', genre: 'Blues', desc: 'Refactoring, cleaning, mourning old code', emoji: '🎵' },
  { id: 'balanced', genre: 'Jazz', desc: 'Elegant balance of creation and refinement', emoji: '🎺' },
  { id: 'add-heavy', genre: 'EDM', desc: 'Pure creation energy, building building building', emoji: '💥' },
];

export function mapToPlaylist(profile) {
  const weeklyTotals = profile.commitHistory.weeklyTotals || [];
  const recentWeeks = weeklyTotals.slice(-12);
  const avgCommitsPerWeek = recentWeeks.length > 0
    ? recentWeeks.reduce((a, b) => a + b, 0) / recentWeeks.length
    : 0;

  const langCount = Object.keys(profile.languages).length;
  const { addDeleteRatio } = profile.codeChurn;
  const { streakCurrent } = profile.commitHistory;

  // Tempo
  const tempo = TEMPO_BANDS.find(b => avgCommitsPerWeek < b.max) || TEMPO_BANDS[TEMPO_BANDS.length - 1];
  const tempoValue = Math.min(Math.round((avgCommitsPerWeek / 40) * 100), 100);

  // Complexity
  const complexity = COMPLEXITY_BANDS.find(b => langCount <= b.max) || COMPLEXITY_BANDS[COMPLEXITY_BANDS.length - 1];
  const complexityValue = Math.min(Math.round((langCount / 8) * 100), 100);

  // Energy (consistency pattern)
  let energy;
  const nonZeroWeeks = recentWeeks.filter(w => w > 0).length;
  const activeRatio = recentWeeks.length > 0 ? nonZeroWeeks / recentWeeks.length : 0;
  if (activeRatio > 0.7) {
    energy = ENERGY_BANDS[1]; // steady → Classical
  } else if (streakCurrent >= 3) {
    energy = ENERGY_BANDS[2]; // burst → Punk
  } else {
    energy = ENERGY_BANDS[0]; // sporadic → Experimental
  }
  const energyValue = Math.round(activeRatio * 100);

  // Mood
  let mood;
  if (addDeleteRatio < 0.8) {
    mood = MOOD_BANDS[0]; // delete-heavy → Blues
  } else if (addDeleteRatio <= 3) {
    mood = MOOD_BANDS[1]; // balanced → Jazz
  } else {
    mood = MOOD_BANDS[2]; // add-heavy → EDM
  }
  const moodValue = Math.min(Math.round((addDeleteRatio / 5) * 100), 100);

  // Build genre name
  const genreName = `${tempo.genre} meets ${complexity.genre}`;
  const subtitle = `with ${energy.genre} energy and ${mood.genre} undertones`;

  // Personality description
  const personality = buildPersonality(tempo, complexity, energy, mood, profile);

  return {
    genreName,
    subtitle,
    personality,
    traits: {
      tempo: { label: 'Tempo', value: tempoValue, genre: tempo.genre, desc: tempo.desc, emoji: tempo.emoji },
      complexity: { label: 'Complexity', value: complexityValue, genre: complexity.genre, desc: complexity.desc, emoji: complexity.emoji },
      energy: { label: 'Energy', value: energyValue, genre: energy.genre, desc: energy.desc, emoji: energy.emoji },
      mood: { label: 'Mood', value: moodValue, genre: mood.genre, desc: mood.desc, emoji: mood.emoji },
    },
  };
}

function buildPersonality(tempo, complexity, energy, mood, profile) {
  const topLang = Object.entries(profile.languages)
    .sort((a, b) => b[1] - a[1])[0];
  const langName = topLang ? topLang[0] : 'code';

  const intros = [
    `Your coding style is ${tempo.genre.toLowerCase()} at its core`,
    `You write ${langName} like a ${complexity.genre.toLowerCase()} musician`,
  ];

  const middles = [
    `${energy.desc.toLowerCase()}.`,
    `Your commits have a ${mood.genre.toLowerCase()} quality — ${mood.desc.toLowerCase()}.`,
  ];

  const closers = [
    `If your GitHub were an album, it'd be the kind critics call "ambitious."`,
    `Your repo history reads like a concept album.`,
    `Every push is a track, and you've been recording.`,
  ];

  const intro = intros[Math.floor(profile.username.length % intros.length)];
  const middle = middles[Math.floor(profile.publicRepos % middles.length)];
  const closer = closers[Math.floor(profile.totalStars % closers.length)];

  return `${intro} — ${middle} ${closer}`;
}
