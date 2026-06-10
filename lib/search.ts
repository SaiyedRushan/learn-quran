// Typo-tolerant surah search. Matches the English name, the English meaning
// (epithet), the Arabic name, and the surah number — and tolerates spelling
// mistakes and the inconsistent transliterations in the source data
// (e.g. "Al-Ghaashiya" vs a user typing "ghashiya").
//
// Approach:
//   - normalise both sides aggressively (case, diacritics, punctuation) and
//     collapse repeated letters, which neutralises the doubled-vowel noise in
//     the transliterations ("naaziaat" -> "naziat").
//   - score with prefix / substring / windowed Levenshtein so typos inside a
//     word still match.

export interface Searchable {
  number: number;
  name: string; // e.g. "Al-Mutaffifin"
  epithet: string; // e.g. "The Defrauders"
  arabicName: string; // e.g. "سُورَةُ المُطَفِّفِينَ"
}

const ARABIC_RE = /[؀-ۿ]/;

/** Lowercase, strip diacritics & punctuation, then collapse repeated letters. */
export function normalizeLatin(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // latin diacritics
    .replace(/[^a-z0-9]/g, "") // drop spaces, hyphens, apostrophes
    .replace(/(.)\1+/g, "$1"); // collapse runs: "aa" -> "a"
}

/** Strip Arabic diacritics/marks and normalise letter variants. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟـۖ-ۭ]/g, "") // harakat, tatweel, quranic marks
    .replace(/[إأآٱا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "");
}

/** Match key for an Arabic name: normalise, then drop the leading "سورة"
 *  prefix and the ubiquitous "ال" article so they don't inflate similarity. */
export function arabicKey(s: string): string {
  return normalizeArabic(s)
    .replace(/^سوره/, "")
    .replace(/^ال/, "");
}

/** Levenshtein edit distance. */
function lev(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let cur = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

/** Score query (normalised) against one target (normalised). 0 = no match. */
function matchScore(q: string, target: string): number {
  if (!q || !target) return 0;
  if (q === target) return 1;
  if (target.startsWith(q)) return 0.92;
  if (target.includes(q)) return 0.82;

  // windowed fuzzy: tolerate typos inside the target
  const maxDist = q.length <= 3 ? 1 : q.length <= 6 ? 2 : 3;
  let best = Infinity;
  for (let w = Math.max(1, q.length - maxDist); w <= q.length + maxDist; w++) {
    for (let i = 0; i + w <= target.length; i++) {
      const d = lev(q, target.substr(i, w));
      if (d < best) best = d;
      if (best === 0) break;
    }
    if (best === 0) break;
  }
  if (best <= maxDist) return 0.5 + 0.2 * (1 - best / (maxDist + 1));

  return 0;
}

/** Best score for a surah across all of its searchable fields. */
export function scoreSurah(rawQuery: string, s: Searchable): number {
  const query = rawQuery.trim();
  if (!query) return 1;

  let best = 0;

  // number
  const digits = query.replace(/\D/g, "");
  if (digits) {
    const num = String(s.number);
    if (num === digits) best = Math.max(best, 0.99);
    else if (num.startsWith(digits)) best = Math.max(best, 0.9);
  }

  if (ARABIC_RE.test(query)) {
    const q = arabicKey(query);
    if (q) best = Math.max(best, matchScore(q, arabicKey(s.arabicName)));
  } else {
    const q = normalizeLatin(query);
    if (q) {
      best = Math.max(best, matchScore(q, normalizeLatin(s.name)));
      best = Math.max(best, matchScore(q, normalizeLatin(s.epithet)));
    }
  }

  return best;
}

/** Filter + rank surahs for a query. Empty query returns the input order. */
export function searchSurahs<T extends Searchable>(query: string, list: T[]): T[] {
  if (!query.trim()) return list;
  return list
    .map((s) => ({ s, score: scoreSurah(query, s) }))
    .filter((r) => r.score >= 0.5)
    .sort((a, b) => b.score - a.score || a.s.number - b.s.number)
    .map((r) => r.s);
}
