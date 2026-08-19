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
// The invariant that matters is (2) below; (1) holds for the forward pass only:
//   1. The forward pass never rewinds — interim wobble can't drag the cursor
//      back. Going back is a separate, deliberately harder decision (see
//      detectRepeat), so a repeat has to prove itself.
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
  /** Token indices of whole verses the reciter passed without reciting. */
  skipped: number[];
  /** This update rewound the cursor — the reciter went back over earlier text. */
  repeated: boolean;
  /** Nothing in the passage matches what's being recited — they've wandered
   *  into another surah, or somewhere else entirely. */
  lost: boolean;
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

const DEFAULT_LOOKBACK = 60;
const DEFAULT_LOOKAHEAD = 25;

/** Below this, two words are considered different. */
const SIM_FLOOR = 0.75;
/** The word the cursor lands on must be at least this close. */
const TRAILING_SIM = 0.82;
/**
 * Gap penalties, asymmetric on purpose.
 *
 * An unmatched *spoken* word (GAP_HYP) is suspicious — it usually means the
 * alignment is being forced. An unmatched *expected* word (GAP_EXPECTED) is a
 * normal, meaningful event: the reciter skipped it. Charging both the same made
 * a wholly skipped verse cost more to bridge than to abandon, so the alignment
 * split in two and the cursor stalled at the end of the previous verse instead
 * of following the voice — and with no bridge there was no gap to report.
 */
const GAP_HYP = -0.6;
const GAP_EXPECTED = -0.25;
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

/**
 * Repeat detection. The forward pass can't find a repeat: its window contains
 * everything recited in the last several seconds, so the longest — and
 * therefore best-scoring — run is the original pass through the text, not the
 * few words just re-recited. So we probe separately with only the *tail* of the
 * transcript, which is where the voice is right now, against the whole passage.
 */
const TAIL_WORDS = 6;
/** Fewest tail words that must land before a rewind is believable. */
const REPEAT_MIN_PAIRS = 4;
/**
 * Gate on how *well* the tail matched, not on total points. Score is a sum, so
 * an absolute threshold silently demands more matched words the further back
 * you go (the distance prior below is charged per pair) — which is backwards:
 * a bigger rewind is more obvious, not less. That bug meant going back a verse
 * only registered after re-reciting twelve words, longer than the verse itself.
 */
const REPEAT_MIN_SIM = 0.9;
/** Ignore rewinds shorter than this — that's ordinary alignment jitter. */
const REPEAT_MIN_JUMP = 4;
/**
 * Symmetric distance prior for the probe. The Quran repeats itself, so a tail
 * can match several places equally well; nearest-to-the-cursor wins, which
 * means identical text never reads as a rewind. Deliberately tiny: it only has
 * to break ties between equally good matches, and it is charged per pair, so
 * anything larger swamps the evidence it is supposed to be arbitrating.
 */
const REPEAT_DRIFT = 0.004;
const REPEAT_DRIFT_CAP = 200;
/** Bad windows tolerated before a pending rewind is forgotten. Real tails are
 *  noisy; demanding two *consecutive* clean ones rarely happened. */
const REPEAT_PATIENCE = 2;

/**
 * How close a transcript word must be to count as having said an expected one.
 *
 * Not 0.9: the model writes standard orthography where the Uthmani text uses
 * Quranic marks, and the two disagree systematically. "ٱلْكَٰفِرُونَ" normalises to
 * "الكفرون" once the dagger alef is stripped, while Whisper returns
 * "الكافرون" — 0.875 similar, and at 0.9 a flawless reciter was told they had
 * missed the word. Being lenient here costs only missed detections; being
 * strict costs false accusations, which is much worse.
 */
const SKIP_SIM = 0.85;
/**
 * A verse counts as skipped only if essentially none of it was heard. Verses,
 * not words, are the unit here: per-word detection asks text-only ASR to tell
 * "you didn't say this" apart from "I didn't hear this", which it cannot do —
 * it chimed at flawless recitation about once a surah. A whole verse missing
 * from the transcript is not something a mishearing produces.
 */
const VERSE_HEARD_MAX = 0.2;
/** Expected words to reach back over when measuring coverage for a jump. */
const VERSE_CONTEXT = 30;
/** Consecutive unusable transcripts before we admit we're lost and re-search. */
const MAX_MISSES = 4;

/** No positional bias — for alignments used to measure coverage, not position. */
const NO_DRIFT = {ahead: 0, aheadCap: 0, behind: 0, behindCap: 0};

const STOP = 0;
const DIAG = 1;
const UP = 2;
const LEFT = 3;

/**
 * Did this transcript word say this expected word?
 *
 * Alef is where Quranic orthography and the model's plain spelling disagree
 * most, and always in the same direction: the dagger alef in "عَٰبِدُونَ" and
 * "ٱلْكَٰفِرُونَ" is stripped by normalisation, while Whisper writes it out as
 * "عابدون", "الكافرون". Comparing without alefs settles that whole class at
 * once, where lowering the threshold merely traded one wrong answer for
 * another. It can conflate genuinely distinct words (قال and قل), but that
 * direction only costs a missed detection — the other costs a chime at someone
 * reciting perfectly.
 */
function saidSame(said: string, expected: string): boolean {
  if (wordSimilarity(said, expected) >= SKIP_SIM) return true;
  const a = said.replace(/ا/g, "");
  const b = expected.replace(/ا/g, "");
  return a.length > 1 && b.length > 1 && wordSimilarity(a, b) >= SKIP_SIM;
}

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
  /** Token extent of each verse, for whole-verse judgements. */
  private verses: {start: number; end: number}[] = [];
  private lookback: number;
  private lookahead: number;
  /** Rewind seen once, awaiting a second opinion before we act on it. */
  private pendingRepeat: number | null = null;
  private repeatMisses = 0;
  /** Missed-word candidates from the previous update, awaiting a second look. */
  private pendingSkips = new Set<number>();
  private misses = 0;

  constructor(tokens: MatchToken[], options: MatcherOptions = {}) {
    this.tokens = tokens;
    for (let i = 0; i < tokens.length; i++) {
      const last = this.verses[this.verses.length - 1];
      if (last && tokens[i].ayah === tokens[last.start].ayah) last.end = i;
      else this.verses.push({start: i, end: i});
    }
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

  tokenAt(index: number): MatchToken | null {
    return this.tokens[index] ?? null;
  }

  reset(): void {
    this.matched = 0;
    this.anchored = false;
    this.clearPending();
  }

  /** Jump the cursor (user tapped a word). Re-anchors there. */
  seek(tokenIndex: number): void {
    this.matched = Math.max(0, Math.min(tokenIndex, this.tokens.length));
    this.anchored = true;
    this.clearPending();
  }

  private clearPending(): void {
    this.pendingRepeat = null;
    this.repeatMisses = 0;
    this.pendingSkips.clear();
    this.misses = 0;
  }

  /**
   * Nothing in the passage matches this transcript. Inference only runs on
   * speech, so a run of these means they are reciting something that isn't
   * here — a verse from another surah, most likely. After enough we say so and
   * drop the anchor, letting the next update search the whole passage again.
   */
  private miss(): MatchResult | null {
    this.pendingRepeat = null;
    if (!this.anchored) return null;
    if (++this.misses < MAX_MISSES) return null;
    this.misses = 0;
    this.anchored = false;
    return {matched: this.matched, score: 0, skipped: [], repeated: false, lost: true};
  }

  /**
   * Feed a transcript of the last few seconds of audio.
   * Returns null when the transcript is unusable (empty, or no alignment we
   * trust) — in which case the cursor is deliberately left where it was.
   */
  update(transcript: string): MatchResult | null {
    const hyp = normalizeArabicWords(transcript);
    if (hyp.length === 0 || this.tokens.length === 0) return null;

    // Ask "where is the voice *now*?" before "how far have they got?". The
    // forward pass is anchored to everything still sitting in the audio window,
    // so on its own it neither follows a rewind nor follows a skipped verse —
    // it just re-finds the previous run and stalls there.
    const prevMatched = this.matched;
    const jump = this.detectJump(hyp);
    if (jump !== null) {
      const back = jump.next < this.matched;
      // Reach back before the jump so words recited earlier are attributed to
      // where they actually belong rather than to the verse being judged.
      const skipped = back
        ? []
        : this.skippedVerses(
            hyp,
            this.coverage(hyp, prevMatched - VERSE_CONTEXT, jump.next),
            prevMatched,
            jump.next,
          );
      this.matched = jump.next;
      this.misses = 0;
      return {matched: this.matched, score: 0, skipped, repeated: back, lost: false};
    }

    const start = this.anchored ? Math.max(0, this.matched - this.lookback) : 0;
    const end = this.anchored
      ? Math.min(this.tokens.length, this.matched + this.lookahead)
      : this.tokens.length;
    if (end <= start) return this.miss();

    // The drift prior only makes sense once we know where the reciter is; on
    // the first pass every candidate is "ahead" of a cursor that means nothing.
    const aligned = align(hyp, this.tokens, start, end, this.anchored ? this.matched : null, {
      ahead: DRIFT_PENALTY,
      aheadCap: DRIFT_CAP,
      behind: 0,
      behindCap: 0,
    });
    if (!aligned) return this.miss();
    if (aligned.pairs.length < MIN_PAIRS || aligned.score < MIN_SCORE) return this.miss();

    // The cursor lands just past the last expected word we're confident about.
    let landing = -1;
    for (let i = aligned.pairs.length - 1; i >= 0; i--) {
      if (aligned.pairs[i].sim >= TRAILING_SIM) {
        landing = aligned.pairs[i].expected;
        break;
      }
    }
    if (landing < 0) return this.miss();

    this.anchored = true;
    this.misses = 0;
    const next = landing + 1;
    if (next > this.matched) this.matched = next;
    return {
      matched: this.matched,
      score: aligned.score,
      skipped: this.skippedVerses(hyp, aligned.pairs, prevMatched, this.matched),
      repeated: false,
      lost: false,
    };
  }

  /**
   * Whole verses crossed between `from` and `to` that were essentially not
   * recited. Returns their token indices, or an empty list.
   *
   * Only verses lying entirely within the crossed span are considered, and a
   * verse is judged by whether its words appear anywhere in the transcript at
   * all — order and alignment don't come into it. That is deliberately crude:
   * it can't detect a word or a phrase gone missing, but it also can't be
   * fooled by the recogniser mangling one, which is the whole point.
   */
  private skippedVerses(hyp: string[], pairs: Pair[], from: number, to: number): number[] {
    if (to - from < 2) return [];
    // Coverage comes from the alignment rather than from scanning the whole
    // transcript per word: alignment spends each spoken word once, and in
    // order, so ayah 1's "ٱللَّهُ" cannot also stand in for ayah 2's.
    const covered = new Set(
      pairs
        .filter((p) => saidSame(hyp[p.hyp], this.tokens[p.expected].norm))
        .map((p) => p.expected),
    );
    const out: number[] = [];
    for (const verse of this.verses) {
      // Whole verses only. Containment has to be judged against the verse's own
      // extent, not against a slice starting at the cursor — walking forward
      // from `from` made every partly-crossed verse look complete, and emitted
      // its tail as though the verse had been skipped.
      if (verse.start < from || verse.end >= to) continue;
      let heard = 0;
      for (let e = verse.start; e <= verse.end; e++) if (covered.has(e)) heard++;
      if (heard / (verse.end - verse.start + 1) <= VERSE_HEARD_MAX) {
        for (let e = verse.start; e <= verse.end; e++) out.push(e);
      }
    }
    return out;
  }

  /** Align the whole transcript over a span, with no positional bias — used
   *  only to measure what was recited, never to move the cursor. */
  private coverage(hyp: string[], from: number, to: number): Pair[] {
    const start = Math.max(0, Math.min(from, this.tokens.length));
    const end = Math.max(start, Math.min(to, this.tokens.length));
    if (end <= start) return [];
    const aligned = align(hyp, this.tokens, start, end, null, NO_DRIFT);
    return aligned ? aligned.pairs : [];
  }

  /**
   * Align only the tail of the transcript — the last couple of seconds, i.e.
   * where the voice is right now — over the whole passage. If that lands well
   * away from the cursor twice running, the reciter has moved: backwards over
   * text they are repeating, or forwards over text they skipped.
   */
  private detectJump(hyp: string[]): {next: number; pairs: Pair[]} | null {
    if (!this.anchored || hyp.length < REPEAT_MIN_PAIRS) {
      this.pendingRepeat = null;
      this.repeatMisses = 0;
      return null;
    }
    const tail = hyp.slice(Math.max(0, hyp.length - TAIL_WORDS));
    const aligned = align(tail, this.tokens, 0, this.tokens.length, this.matched, {
      ahead: REPEAT_DRIFT,
      aheadCap: REPEAT_DRIFT_CAP,
      behind: REPEAT_DRIFT,
      behindCap: REPEAT_DRIFT_CAP,
    });

    let landing = -1;
    if (aligned && aligned.pairs.length >= REPEAT_MIN_PAIRS) {
      const meanSim = aligned.pairs.reduce((a, p) => a + p.sim, 0) / aligned.pairs.length;
      if (meanSim >= REPEAT_MIN_SIM) {
        for (let i = aligned.pairs.length - 1; i >= 0; i--) {
          if (aligned.pairs[i].sim >= TRAILING_SIM) {
            landing = aligned.pairs[i].expected;
            break;
          }
        }
      }
    }

    const next = landing + 1;
    if (landing < 0 || Math.abs(next - this.matched) < REPEAT_MIN_JUMP) {
      // Forget a pending jump only after a run of unhelpful windows, so one
      // ragged transcript doesn't reset the evidence.
      if (++this.repeatMisses >= REPEAT_PATIENCE) this.pendingRepeat = null;
      return null;
    }

    // Two windows have to agree on roughly the same landing.
    this.repeatMisses = 0;
    const pending = this.pendingRepeat;
    this.pendingRepeat = next;
    if (pending !== null && Math.abs(pending - next) <= 4) {
      this.pendingRepeat = null;
      return {next, pairs: aligned!.pairs};
    }
    return null;
  }
}

type Pair = {hyp: number; expected: number; sim: number};

/** Per-word cost of matching text away from the cursor, in each direction. */
type DriftPrior = {
  ahead: number;
  aheadCap: number;
  behind: number;
  behindCap: number;
};

/**
 * Smith-Waterman local alignment of `hyp` against `tokens[start..end)`.
 * `cursor` (when known) biases the alignment toward text near the current
 * position, per `prior`. Returns the aligned word pairs of the best-scoring
 * local run, or null.
 */
function align(
  hyp: string[],
  tokens: MatchToken[],
  start: number,
  end: number,
  cursor: number | null,
  prior: DriftPrior,
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
      let bias = 0;
      if (cursor !== null) {
        const delta = expected - cursor;
        bias =
          delta >= 0
            ? -prior.ahead * Math.min(delta, prior.aheadCap)
            : -prior.behind * Math.min(-delta, prior.behindCap);
      }
      const diag = scores[prevRow + j - 1] + pairScore(hyp[i - 1], tokens[expected].norm) + bias;
      // UP consumes a spoken word, LEFT an expected one.
      const up = scores[prevRow + j] + GAP_HYP;
      const left = scores[row + j - 1] + GAP_EXPECTED;

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
