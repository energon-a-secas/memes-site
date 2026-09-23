// Shared taxonomy rules. Keep labels short, consistent, and searchable.
export const MAX_LABELS = 8;
export const MAX_LABEL_LENGTH = 32;
export const MAX_CATEGORY_LENGTH = 40;

export function normalizeCategory(value) {
  const normalize = text => text.normalize('NFKC').trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
  const normalized = normalize(value);
  // Typing a friendly built-in name should select it, not create a duplicate.
  return Object.entries(CATEGORY_NAMES).find(([, name]) => normalize(name) === normalized)?.[0] || normalized;
}

export function normalizeLabel(value) {
  return value.normalize('NFKC').trim().replace(/^#+/, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** The one place a category name is judged, shared by uploads, edits and admin tools. */
export function validateCategory(value) {
  const category = normalizeCategory(value);
  if (!category || category === 'all' || category.length > MAX_CATEGORY_LENGTH) {
    throw new Error('Choose a category of 1–40 characters (other than “all”).');
  }
  return category;
}

export function validateOrganization(category, labels) {
  const normalizedCategory = validateCategory(category);
  const normalizedLabels = [...new Set(labels.map(normalizeLabel).filter(Boolean))];
  if (normalizedLabels.length > MAX_LABELS) throw new Error('Use up to 8 labels per meme.');
  if (normalizedLabels.some(label => label.length > MAX_LABEL_LENGTH)) {
    throw new Error('Keep each label to 32 characters or fewer.');
  }
  return { category: normalizedCategory, labels: normalizedLabels };
}

const CATEGORY_NAMES = {
  anime: 'Anime', country: 'Countries', games: 'Games', general: 'General',
  mood: 'Moods & reactions', 'movie-reference': 'Movies',
  'other-references': 'Other references', series: 'TV & series',
  simpsons: 'The Simpsons', talent: 'Talent', templates: 'Templates',
};

export function categoryName(category) {
  return CATEGORY_NAMES[category] || category.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Search scoring.
 *
 * A word has to land somewhere on every meme it keeps (the old AND behaviour),
 * but where it lands now decides the order: a hit on the name outranks one on a
 * label, which outranks one on the category, and an exact token outranks a
 * prefix, a substring and finally a near-miss. Accents fold away, so "manana"
 * finds "mañana-cubre-turno" and a keyboard without ñ is not a dead end.
 */
const FIELD_WEIGHT = { name: 6, label: 4, category: 2 };
const MATCH_EXACT = 4, MATCH_PREFIX = 3, MATCH_SUBSTRING = 2, MATCH_NEAR = 1;

/** Lowercase and strip diacritics, for comparison only. Nothing stored is folded. */
const fold = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Optimal string alignment distance, abandoned as soon as it cannot come in
 * under `allowance`. Bailing on the length difference first keeps a long label
 * from being measured against a short word at all. A swapped pair of letters
 * counts as one typo rather than two, because "anmie" for "anime" is the shape
 * people actually type and plain Levenshtein scores it too harshly to find.
 */
function isNear(candidate, word, allowance) {
  if (Math.abs(candidate.length - word.length) > allowance) return false;
  let twoBack = null;
  let previous = Array.from({ length: word.length + 1 }, (_, i) => i);
  for (let i = 1; i <= candidate.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= word.length; j++) {
      const cost = candidate[i - 1] === word[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j - 1] + cost, previous[j] + 1, current[j - 1] + 1);
      if (i > 1 && j > 1 && candidate[i - 1] === word[j - 2] && candidate[i - 2] === word[j - 1]) {
        current[j] = Math.min(current[j], twoBack[j - 2] + 1);
      }
      best = Math.min(best, current[j]);
    }
    if (best > allowance) return false;
    twoBack = previous;
    previous = current;
  }
  return previous[word.length] <= allowance;
}

/** A typo allowance short words cannot have, or "cat" would match half the vault. */
const allowanceFor = word => (word.length >= 6 ? 2 : word.length >= 4 ? 1 : 0);

function scoreField(word, text) {
  const folded = fold(text);
  if (!folded) return 0;
  const tokens = folded.split(/\s+/).filter(Boolean);
  if (folded === word || tokens.includes(word)) return MATCH_EXACT;
  if (tokens.some(token => token.startsWith(word))) return MATCH_PREFIX;
  if (folded.includes(word)) return MATCH_SUBSTRING;
  const allowance = allowanceFor(word);
  if (allowance && tokens.some(token => isNear(token, word, allowance))) return MATCH_NEAR;
  return 0;
}

function searchFields(meme) {
  return [
    ['name', meme.name],
    ['name', meme.name.replace(/[-_]/g, ' ')],
    ...(meme.labels || []).map(label => ['label', label]),
    ['category', meme.category.replace(/[-_]/g, ' ')],
    ['category', categoryName(meme.category)],
  ];
}

/** Zero means "drop this meme": some word in the query found nothing at all. */
function scoreMeme(meme, words) {
  let total = 0;
  for (const word of words) {
    let best = 0;
    for (const [kind, text] of searchFields(meme)) {
      const hit = scoreField(word, text);
      if (hit) best = Math.max(best, hit * FIELD_WEIGHT[kind]);
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

function comparator(sort, votes) {
  if (sort === 'votes') return (a, b) => (votes[b.name] || 0) - (votes[a.name] || 0);
  if (sort === 'recent') return (a, b) => (b._creationTime ?? -b.id) - (a._creationTime ?? -a.id);
  if (sort === 'name') return (a, b) => a.name.localeCompare(b.name);
  return () => 0;
}

export function searchWords(query) {
  return fold(query).trim().split(/\s+/).filter(Boolean);
}

export function selectMemes(memes, { category = 'all', labels = [], query = '', sort = 'recent', votes = {} } = {}) {
  const words = searchWords(query);
  const kept = [];
  for (const meme of memes) {
    if (category !== 'all' && meme.category !== category) continue;
    if (!labels.every(label => (meme.labels || []).includes(label))) continue;
    const score = words.length ? scoreMeme(meme, words) : 0;
    if (words.length && !score) continue;
    kept.push({ meme, score });
  }
  // With a query on screen, relevance leads and the chosen sort breaks ties.
  const order = comparator(sort, votes);
  kept.sort((a, b) => (words.length ? b.score - a.score : 0) || order(a.meme, b.meme));
  return kept.map(entry => entry.meme);
}
