// Whole-Quran recitation recognition: given a transcript of someone reciting,
// work out where in the mushaf they are.
//
// This is NOT the tracker. lib/recite/matcher.ts follows a reciter word by word
// through a passage that is already known; this runs once, against all 77,433
// words, to find out *which* passage that is. Splitting the two is the whole
// design — a continuous whole-Quran tracker is what we tried and deleted, and
// it failed because it had to commit to a guess every few hundred milliseconds.
// A one-shot locator can wait for enough words, and can offer alternatives.
//
// Method: word-trigram inverted index, voting on the implied START position.
// Every trigram of the query that matches at position p, having been the i-th
// trigram of the query, is evidence that the recitation began at p - i. One
// continuous recitation therefore piles all its evidence onto a single offset,
// while coincidental matches scatter. Two details matter:
//
//   - The index runs over a continuous per-surah word stream, not per ayah.
//     Indexing ayah by ayah loses every trigram that straddles a verse
//     boundary, which is most of them for short verses, and people recite
//     straight through boundaries.
//   - Votes are pooled across nearby offsets, because a word the recognizer
//     drops or inserts shifts every subsequent offset by one. Without that,
//     a single missed word splits one strong cluster into two weak ones.
//
// Pure module: no DOM, no fetch. The caller supplies the parsed artifact from
// public/recite/quran-locate.json, which is the same seam that lets this run in
// a worker, in the eval harness, and in tests.

import {alefSkeleton, normalizeArabicWords} from "./arabic.ts";

/** The artifact built by scripts/build-recite-index.mjs. */
export type LocateIndexData = {
  version: number;
  /** Every normalized word of the Quran, space separated, mushaf order. */
  words: string;
  /** Normalized word count per ayah, mushaf order (6236 entries). */
  ayahs: number[];
  /** Per surah: number, ayah count, English and Arabic names. */
  surahs: {n: number; a: number; name: string; ar: string}[];
};

export type LocateHit = {
  surah: number;
  ayah: number;
  surahName: string;
  arabicName: string;
  /** Word offset into that ayah where the recitation appears to have started. */
  wordInAyah: number;
  /** Pooled trigram votes behind this position. */
  votes: number;
  /** votes / trigrams in the query, 0..1. */
  confidence: number;
};

const TRIGRAM = 3;

/** Votes within this many words of each other are the same guess — one dropped
 *  or inserted word shifts the implied start by one. */
const OFFSET_TOLERANCE = 2;

/** Below this the answer is noise: two matching trigrams can happen by chance
 *  across 77k words, especially for formulaic openings. */
const MIN_VOTES = 2;

/** ...and they have to be a real share of what was actually recited, so a long
 *  transcript that matches in only two places isn't reported as a find. */
const MIN_SHARE = 0.25;

/** A trigram this common carries no positional information (it is nearly all
 *  bismillah and formulae); scanning its postings is cost without signal. */
const MAX_POSTINGS = 300;

/** Bigrams are the fallback tier, and far more ambiguous than trigrams, so they
 *  need both a tighter posting cap and more of them before we believe a hit. */
const MAX_POSTINGS_BI = 60;
const MIN_VOTES_BI = 4;
const MIN_SHARE_BI = 0.3;

function add(index: Map<string, number[]>, key: string, at: number): void {
  const postings = index.get(key);
  if (postings) postings.push(at);
  else index.set(key, [at]);
}

export class QuranLocator {
  private words: string[];
  /** `words`, alef-stripped — what the n-gram keys are built from. */
  private keys: string[];
  private index = new Map<string, number[]>();
  private bigrams = new Map<string, number[]>();
  /** Global word offset at which each ayah starts (length = ayah count). */
  private ayahStart: number[] = [];
  /** Surah number and ayah-within-surah for each ayah, by global ayah index. */
  private surahOfAyah: number[] = [];
  private ayahOfAyah: number[] = [];
  private surahs: LocateIndexData["surahs"];

  constructor(data: LocateIndexData) {
    this.words = data.words.split(" ");
    // Index keys drop alefs entirely; see `alefSkeleton`. Queries get the same
    // treatment in `rank`, so the two sides always meet on one spelling.
    this.keys = this.words.map(alefSkeleton);
    this.surahs = data.surahs;

    // Ayah -> global word offset, and ayah -> (surah, ayah number).
    let offset = 0;
    let globalAyah = 0;
    const surahEndWord: number[] = [];
    for (const surah of data.surahs) {
      for (let a = 1; a <= surah.a; a++) {
        this.ayahStart.push(offset);
        this.surahOfAyah.push(surah.n);
        this.ayahOfAyah.push(a);
        offset += data.ayahs[globalAyah];
        globalAyah++;
      }
      surahEndWord.push(offset);
    }
    if (globalAyah !== data.ayahs.length) {
      throw new Error(`index mismatch: ${globalAyah} ayahs from surahs, ${data.ayahs.length} counts`);
    }

    // N-grams over a continuous stream, but never bridging two surahs — no one
    // recites across the seam between them.
    let surahIdx = 0;
    for (let i = 0; i + 1 < this.words.length; i++) {
      while (surahIdx < surahEndWord.length && i >= surahEndWord[surahIdx]) surahIdx++;
      const end = surahEndWord[surahIdx];
      if (i + 2 <= end) add(this.bigrams, `${this.keys[i]} ${this.keys[i + 1]}`, i);
      if (i + TRIGRAM <= end) {
        add(this.index, `${this.keys[i]} ${this.keys[i + 1]} ${this.keys[i + 2]}`, i);
      }
    }
  }

  /** Distinct trigrams in the index — diagnostics for the eval harness. */
  get size(): number {
    return this.index.size;
  }

  /**
   * Best guesses at where this recitation sits, most confident first.
   * `transcript` may be raw ASR output; it gets normalized here.
   */
  locate(transcript: string | string[], max = 3): LocateHit[] {
    const query = (
      Array.isArray(transcript) ? transcript : normalizeArabicWords(transcript)
    ).map(alefSkeleton);

    // Trigrams first. They're specific enough that a hit is nearly always the
    // real position, so anything they can answer, they should.
    const tri = this.rank(query, TRIGRAM, this.index, MAX_POSTINGS, MIN_VOTES, MIN_SHARE, max);
    if (tri.length) return tri;

    // Nothing survived — either too little was recited or the recognizer
    // mangled enough words to break every trigram (one bad word destroys
    // three). Bigrams degrade far more gracefully under that.
    return this.rank(query, 2, this.bigrams, MAX_POSTINGS_BI, MIN_VOTES_BI, MIN_SHARE_BI, max);
  }

  /** Position voting for one n-gram tier. */
  private rank(
    query: string[],
    n: number,
    index: Map<string, number[]>,
    maxPostings: number,
    minVotes: number,
    minShare: number,
    max: number,
  ): LocateHit[] {
    const grams = query.length - n + 1;
    if (grams < 1) return [];

    // Vote for the start position each matching n-gram implies.
    const votes = new Map<number, number>();
    for (let i = 0; i < grams; i++) {
      const key = n === 2 ? `${query[i]} ${query[i + 1]}` : `${query[i]} ${query[i + 1]} ${query[i + 2]}`;
      const at = index.get(key);
      if (!at || at.length > maxPostings) continue;
      for (const p of at) {
        const start = p - i;
        votes.set(start, (votes.get(start) ?? 0) + 1);
      }
    }
    if (!votes.size) return [];

    // Pool neighbouring offsets, then take the best non-overlapping peaks.
    const pooled: {start: number; score: number}[] = [];
    for (const start of votes.keys()) {
      let score = 0;
      for (let d = -OFFSET_TOLERANCE; d <= OFFSET_TOLERANCE; d++) {
        score += votes.get(start + d) ?? 0;
      }
      pooled.push({start, score});
    }
    pooled.sort((a, b) => b.score - a.score || a.start - b.start);

    const hits: LocateHit[] = [];
    const taken: number[] = [];
    for (const {start, score} of pooled) {
      if (hits.length >= max) break;
      if (score < minVotes || score / grams < minShare) continue;
      if (taken.some((t) => Math.abs(t - start) <= OFFSET_TOLERANCE * 2)) continue;
      const hit = this.resolve(Math.max(0, Math.min(start, this.words.length - 1)));
      if (!hit) continue;
      taken.push(start);
      hits.push({...hit, votes: score, confidence: Math.min(1, score / grams)});
    }
    return hits;
  }

  /** Global word offset -> surah, ayah, and how far into that ayah it lands. */
  private resolve(
    offset: number,
  ): Omit<LocateHit, "votes" | "confidence"> | null {
    // Rightmost ayah whose start is <= offset.
    let lo = 0;
    let hi = this.ayahStart.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.ayahStart[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    const surahNumber = this.surahOfAyah[lo];
    const surah = this.surahs.find((s) => s.n === surahNumber);
    if (!surah) return null;
    return {
      surah: surahNumber,
      ayah: this.ayahOfAyah[lo],
      surahName: surah.name,
      arabicName: surah.ar,
      wordInAyah: offset - this.ayahStart[lo],
    };
  }
}
