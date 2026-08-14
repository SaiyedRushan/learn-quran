// Tracks where a reciter is in a known passage by aligning a rolling ASR
// transcript against the expected text.
//
// Whisper only tells us *what was said*; it has no notion of position. But this
// app always knows exactly which ayahs are on screen, so position is a string
// alignment problem, not a search problem. We run Smith-Waterman (local
// alignment) between the transcript and a bounded window of expected words, and
// move the cursor to the last expected word that a transcript word actually
// landed on.
//
// Two invariants, both of which fix failure modes the previous tracker had:
//   1. Monotonic — the cursor only moves forward, except via seek().
//   2. Never ahead of the voice — the cursor lands on a word that appears in the
//      transcript, so it cannot run into text that hasn't been recited.
//
// Pure module: no DOM, no onnxruntime, no path aliases — so it runs in the
// worker and in tests under `node --test` (hence the explicit .ts extension,
// which Node's ESM resolver requires and webpack accepts).
import {normalizeArabicWords, wordSimilarity} from "./arabic.ts";

export type MatchToken = {
  /** Index into the UI's flat word list (includes non-matchable waqf marks). */
  flat: number;
  ayah: number;
  /** Normalized skeleton used for matching. */
  norm: string;
};

export type MatchResult = {
  /** Number of expected words confirmed recited = index of the next one. */
  matched: number;
  /** Alignment score of the run that produced this result. */
  score: number;
};

export type MatcherOptions = {
  /** How far behind the cursor the alignment window reaches. Must comfortably
   *  exceed the number of words in one audio window, since the transcript
   *  re-states everything already recited in it. */
  lookback?: number;
  /** How far ahead the window reaches — this is the hard cap on how far a
   *  single update may jump. */
  lookahead?: number;
};

const DEFAULT_LOOKBACK = 40;
const DEFAULT_LOOKAHEAD = 25;

/** Below this, two words are considered different. */
const SIM_FLOOR = 0.75;
/** The word the cursor lands on must be at least this close. */
const TRAILING_SIM = 0.82;
/** Gap penalty — a skipped word costs less than a wrong match. */
const GAP = -0.6;
/** Fewest aligned word pairs before we believe an alignment at all. */
const MIN_PAIRS = 2;
/** Fewest total points before we believe an alignment at all. */
const MIN_SCORE = 1.4;
/**
 * Per-word penalty for matching text that sits ahead of the cursor. The Quran
 * repeats itself — Al-Kafirun's ayahs 3 and 5 are word-for-word identical —
 * and without this a transcript of ayah 3 aligns just as well to ayah 5,
 * throwing the cursor into text that hasn't been recited. The reciter is far
 * more likely to be where we last saw them, so distance ahead costs points.
 * Capped so a deliberate jump forward can still win given enough evidence.
 */
const DRIFT_PENALTY = 0.08;
const DRIFT_CAP = 12;

const STOP = 0;
const DIAG = 1;
const UP = 2;
const LEFT = 3;

function pairScore(a: string, b: string): number {
  const sim = wordSimilarity(a, b);
  // Rewards near-exact matches, punishes forcing unrelated words together.
  return sim >= SIM_FLOOR ? sim * 2 - 0.5 : -1;
}

export class RecitationMatcher {
  /** Number of expected words confirmed recited; index of the next expected. */
  matched = 0;
  /** True once we've located the reciter at least once. Until then the whole
   *  passage is searchable, so starting from the middle works. */
  anchored = false;

  private tokens: MatchToken[];
  private lookback: number;
  private lookahead: number;

  constructor(tokens: MatchToken[], options: MatcherOptions = {}) {
    this.tokens = tokens;
    this.lookback = options.lookback ?? DEFAULT_LOOKBACK;
    this.lookahead = options.lookahead ?? DEFAULT_LOOKAHEAD;
  }

  get total(): number {
    return this.tokens.length;
  }

  get done(): boolean {
    return this.matched >= this.tokens.length;
  }

  /** Token the cursor currently sits on, or null once the passage is finished. */
  get current(): MatchToken | null {
    return this.tokens[this.matched] ?? null;
  }

  reset(): void {
    this.matched = 0;
    this.anchored = false;
  }

  /** Jump the cursor (user tapped a word). Re-anchors there. */
  seek(tokenIndex: number): void {
    this.matched = Math.max(0, Math.min(tokenIndex, this.tokens.length));
    this.anchored = true;
  }

  /**
   * Feed a transcript of the last few seconds of audio.
   * Returns null when the transcript is unusable (empty, or no alignment we
   * trust) — in which case the cursor is deliberately left where it was.
   */
  update(transcript: string): MatchResult | null {
    const hyp = normalizeArabicWords(transcript);
    if (hyp.length === 0 || this.tokens.length === 0) return null;

    const start = this.anchored ? Math.max(0, this.matched - this.lookback) : 0;
    const end = this.anchored
      ? Math.min(this.tokens.length, this.matched + this.lookahead)
      : this.tokens.length;
    if (end <= start) return null;

    // The drift prior only makes sense once we know where the reciter is; on
    // the first pass every candidate is "ahead" of a cursor that means nothing.
    const aligned = align(hyp, this.tokens, start, end, this.anchored ? this.matched : null);
    if (!aligned) return null;
    if (aligned.pairs.length < MIN_PAIRS || aligned.score < MIN_SCORE) return null;

    // The cursor lands just past the last expected word we're confident about.
    let landing = -1;
    for (let i = aligned.pairs.length - 1; i >= 0; i--) {
      if (aligned.pairs[i].sim >= TRAILING_SIM) {
        landing = aligned.pairs[i].expected;
        break;
      }
    }
    if (landing < 0) return null;

    this.anchored = true;
    const next = landing + 1;
    if (next > this.matched) this.matched = next;
    return {matched: this.matched, score: aligned.score};
  }
}

type Pair = {hyp: number; expected: number; sim: number};

/**
 * Smith-Waterman local alignment of `hyp` against `tokens[start..end)`.
 * `cursor` (when known) biases the alignment toward text at or behind the
 * current position. Returns the aligned word pairs of the best-scoring local
 * run, or null.
 */
function align(
  hyp: string[],
  tokens: MatchToken[],
  start: number,
  end: number,
  cursor: number | null,
): {pairs: Pair[]; score: number} | null {
  const n = hyp.length;
  const m = end - start;
  const width = m + 1;

  const scores = new Float32Array((n + 1) * width);
  const ptrs = new Uint8Array((n + 1) * width);

  let best = 0;
  let bestI = 0;
  let bestJ = 0;

  for (let i = 1; i <= n; i++) {
    const row = i * width;
    const prevRow = (i - 1) * width;
    for (let j = 1; j <= m; j++) {
      const expected = start + j - 1;
      const ahead = cursor === null ? 0 : Math.max(0, expected - cursor);
      const prior = -DRIFT_PENALTY * Math.min(ahead, DRIFT_CAP);
      const diag =
        scores[prevRow + j - 1] + pairScore(hyp[i - 1], tokens[expected].norm) + prior;
      const up = scores[prevRow + j] + GAP;
      const left = scores[row + j - 1] + GAP;

      let value = 0;
      let ptr = STOP;
      if (diag > value) {
        value = diag;
        ptr = DIAG;
      }
      if (up > value) {
        value = up;
        ptr = UP;
      }
      if (left > value) {
        value = left;
        ptr = LEFT;
      }
      scores[row + j] = value;
      ptrs[row + j] = ptr;
      // Strict > so ties go to the earliest position; the drift prior above is
      // what decides between repeated passages, not scan order.
      if (value > best) {
        best = value;
        bestI = i;
        bestJ = j;
      }
    }
  }

  if (best <= 0) return null;

  const pairs: Pair[] = [];
  let i = bestI;
  let j = bestJ;
  while (i > 0 && j > 0 && ptrs[i * width + j] !== STOP) {
    const ptr = ptrs[i * width + j];
    if (ptr === DIAG) {
      const expected = start + j - 1;
      const sim = wordSimilarity(hyp[i - 1], tokens[expected].norm);
      if (sim >= SIM_FLOOR) pairs.push({hyp: i - 1, expected, sim});
      i--;
      j--;
    } else if (ptr === UP) {
      i--;
    } else {
      j--;
    }
  }
  pairs.reverse();
  return {pairs, score: best};
}

/** Build matcher tokens from the UI's flat word list. */
export function buildTokens(
  words: {flat: number; ayah: number; display: string; matchable: boolean}[],
): MatchToken[] {
  const tokens: MatchToken[] = [];
  for (const w of words) {
    if (!w.matchable) continue;
    const norm = normalizeArabicWordSafe(w.display);
    if (!norm) continue;
    tokens.push({flat: w.flat, ayah: w.ayah, norm});
  }
  return tokens;
}

function normalizeArabicWordSafe(display: string): string {
  const parts = normalizeArabicWords(display);
  return parts.length ? parts.join("") : "";
}
