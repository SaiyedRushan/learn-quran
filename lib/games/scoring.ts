// Scoring for the guess-the-translation game. Pure functions, no DOM.
//
// Exact word matching is too harsh ("Lord of the worlds" vs "Lord of all
// worlds" is not 60% wrong), so a guess is scored as a weighted token-overlap
// F1 against the reference translation:
//   - both sides are normalized (case, punctuation, a few aliases like
//     God/Allah) and tokenized;
//   - each reference token greedily claims one unused guess token, exact
//     matches first, then fuzzy (edit distance scaled by word length) so
//     typos and plural/singular don't tank the score;
//   - stopwords carry reduced weight so keyword hits dominate;
//   - score = harmonic mean of weighted precision and recall, as a percent.
// The per-token match flags feed the colored diff shown after each round.

/** Words that carry little meaning — matched, but at reduced weight. */
const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "to", "in", "on", "for", "with", "at", "by",
  "is", "are", "was", "were", "be", "been", "will", "shall", "do", "does",
  "did", "have", "has", "had", "it", "its", "that", "this", "those", "these",
  "then", "than", "so", "as", "but", "or", "not", "no", "there", "from",
  "he", "him", "his", "she", "her", "they", "them", "their", "you", "your",
  "we", "us", "our", "i", "me", "my", "who", "whom", "which", "what", "when",
  "indeed", "o",
]);

/** Variant spellings mapped to one canonical form before comparing. */
const ALIASES: Record<string, string> = {
  god: "allah",
  apostle: "messenger",
  messengers: "messenger",
  apostles: "messenger",
  koran: "quran",
  quran: "quran",
  "qur'an": "quran",
  mankind: "people",
  humankind: "people",
};

const STOPWORD_WEIGHT = 0.25;

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    // Sahih International wraps clarifications in brackets; the words inside
    // still count, only the punctuation goes.
    .replace(/[^a-z0-9']+/g, " ")
    .split(" ")
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter(Boolean);
}

function canonical(t: string): string {
  return ALIASES[t] ?? t;
}

/** Levenshtein distance, bailing out early once it exceeds `cap`. */
function editDistance(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({length: b.length + 1}, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > cap) return cap + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Allowed typo budget scales with word length; tiny words must match exactly. */
function fuzzyEqual(a: string, b: string): boolean {
  const ca = canonical(a);
  const cb = canonical(b);
  if (ca === cb) return true;
  const cap = Math.min(ca.length, cb.length) >= 8 ? 2 : Math.min(ca.length, cb.length) >= 4 ? 1 : 0;
  if (cap === 0) return false;
  return editDistance(ca, cb, cap) <= cap;
}

export interface RefToken {
  text: string;
  matched: boolean;
  stop: boolean;
}

export interface GuessResult {
  /** 0..100 */
  score: number;
  /** Reference tokens in order, flagged matched/missed — the diff view. */
  ref: RefToken[];
  /** Guess tokens that matched nothing in the reference. */
  extra: string[];
}

export function scoreGuess(guess: string, reference: string): GuessResult {
  const refWords = tokenize(reference);
  const guessWords = tokenize(guess);

  const refMatched = new Array<boolean>(refWords.length).fill(false);
  const guessUsed = new Array<boolean>(guessWords.length).fill(false);

  // Exact matches claim first so a fuzzy match never steals a word that
  // another token needed exactly.
  for (const exact of [true, false]) {
    refWords.forEach((rw, i) => {
      if (refMatched[i]) return;
      const j = guessWords.findIndex(
        (gw, k) => !guessUsed[k] && (exact ? canonical(gw) === canonical(rw) : fuzzyEqual(gw, rw)),
      );
      if (j >= 0) {
        refMatched[i] = true;
        guessUsed[j] = true;
      }
    });
  }

  const weight = (w: string) => (STOPWORDS.has(w) ? STOPWORD_WEIGHT : 1);
  const refTotal = refWords.reduce((s, w) => s + weight(w), 0);
  const guessTotal = guessWords.reduce((s, w) => s + weight(w), 0);
  const refHit = refWords.reduce((s, w, i) => s + (refMatched[i] ? weight(w) : 0), 0);
  const guessHit = guessWords.reduce((s, w, i) => s + (guessUsed[i] ? weight(w) : 0), 0);

  const recall = refTotal > 0 ? refHit / refTotal : 0;
  const precision = guessTotal > 0 ? guessHit / guessTotal : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    score: Math.round(f1 * 100),
    ref: refWords.map((w, i) => ({text: w, matched: refMatched[i], stop: STOPWORDS.has(w)})),
    extra: guessWords.filter((_, i) => !guessUsed[i]),
  };
}

/** Score for "build it" mode: fraction of positions with the right word. */
export function scoreSequence(picked: string[], reference: string[]): number {
  if (reference.length === 0) return 0;
  let hit = 0;
  for (let i = 0; i < reference.length; i++) {
    if (picked[i] !== undefined && canonical(picked[i].toLowerCase()) === canonical(reference[i].toLowerCase())) hit++;
  }
  return Math.round((hit / reference.length) * 100);
}
