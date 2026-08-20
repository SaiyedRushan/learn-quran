// Arabic normalization for ASR alignment. Both sides of the match — the
// Uthmani text on the page and Whisper's transcript — get folded to the same
// skeleton so orthographic differences (tashkeel, dagger alef, hamza carriers)
// don't count as mistakes.
//
// Deliberately preserves word boundaries, unlike lib/search.ts's normalizeArabic
// which strips whitespace for surah-name search.

// Harakat, quranic annotation marks, superscript alef, waqf marks, tatweel.
const DIACRITICS_RE = /[ؐ-ًؚ-ٰٟۖ-ۭـࣰ-ࣿ]/g;

const FOLD: Record<string, string> = {
  "أ": "ا", // أ -> ا
  "إ": "ا", // إ -> ا
  "آ": "ا", // آ -> ا
  "ٱ": "ا", // ٱ -> ا
  "ة": "ه", // ة -> ه
  "ى": "ي", // ى -> ي
  "ؤ": "و", // ؤ -> و
  "ئ": "ي", // ئ -> ي
};

/** Fold one token to its match skeleton. Returns "" for tokens with no Arabic
 *  letters (waqf marks, punctuation, digits, latin). */
export function normalizeArabicWord(token: string): string {
  const folded = token
    .normalize("NFC")
    .replace(/﻿/g, "")
    .replace(DIACRITICS_RE, "")
    .replace(/./g, (ch) => FOLD[ch] ?? ch)
    .replace(/[^ء-ي]/g, "");
  return folded;
}

/**
 * Fold a normalized word further, to a skeleton with no alefs at all.
 *
 * The Uthmani text writes many long ā's as a superscript dagger alef, which
 * `normalizeArabicWord` strips as a diacritic — so `مَـٰلِكِ` becomes `ملك`
 * while a recognizer, transcribing in plain spelling, gives `مالك`. The two are
 * the same word and must match.
 *
 * The matcher handles this by falling back to an alef-stripped comparison when
 * the direct one fails (see `saidSame`). An inverted index has no such fallback
 * — a hash lookup either hits or doesn't — so anything keyed by word has to
 * apply this to BOTH sides up front.
 */
export function alefSkeleton(word: string): string {
  return word.replace(/ا/g, "");
}

/** Split a transcript into normalized words, dropping anything that folds away. */
export function normalizeArabicWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeArabicWord)
    .filter((w) => w.length > 0);
}

/** Levenshtein distance, capped at `max` for early exit (returns max + 1 when
 *  the true distance exceeds it). Words here are short, so the simple
 *  two-row implementation is plenty. */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[b.length];
}

/** 0..1 similarity between two normalized words. */
export function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 0;
  return 1 - levenshtein(a, b) / longest;
}
