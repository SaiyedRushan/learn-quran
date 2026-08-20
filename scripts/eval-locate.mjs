// Measures whole-Quran recitation recognition: if someone recites k words from
// anywhere in the mushaf, how often do we land them on the right ayah?
//
// Text-only, no audio and no model — this isolates the retrieval question from
// the ASR question. Recognizer error is simulated by corrupting words at a
// given rate (drop a letter, drop a prefix, add a spurious alef), which is what
// Whisper's mistakes look like after normalization folds away the orthographic
// differences.
//
// The metric that matters is `ayah` — landed on the exact ayah — because that
// is what the UI routes to. `surah` is the softer version: right surah, wrong
// verse, which still puts the reciter on the right page.
//
// Run: npm run eval:locate  [-- --trials 4000]

import {readFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {QuranLocator} from "../lib/recite/locate.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const TRIALS = Number(arg("trials", 4000));

// Deterministic PRNG: reruns are comparable, and a regression is a real change.
let seed = 20260819;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

function corrupt(words, rate) {
  const out = [];
  for (const w of words) {
    if (rnd() > rate) {
      out.push(w);
      continue;
    }
    const r = rnd();
    if (r < 0.34) {
      if (w.length > 2) out.push(w.slice(0, -1));
    } else if (r < 0.67) {
      if (w.length > 2) out.push(w.slice(1));
    } else {
      out.push(w + "ا");
    }
  }
  return out;
}

async function main() {
  const data = JSON.parse(
    await readFile(join(ROOT, "public", "recite", "quran-locate.json"), "utf8"),
  );
  const t0 = performance.now();
  const locator = new QuranLocator(data);
  const buildMs = performance.now() - t0;

  const words = data.words.split(" ");
  // Truth table: global word offset -> {surah, ayah}
  const surahAt = new Int16Array(words.length);
  const ayahAt = new Int16Array(words.length);
  let at = 0;
  let gi = 0;
  for (const s of data.surahs) {
    for (let a = 1; a <= s.a; a++) {
      const n = data.ayahs[gi++];
      for (let i = 0; i < n; i++, at++) {
        surahAt[at] = s.n;
        ayahAt[at] = a;
      }
    }
  }

  console.log(`index: ${words.length} words, ${locator.size} distinct trigrams, built in ${buildMs.toFixed(0)}ms`);
  console.log(`\nsuccess = top hit lands on the exact ayah the reciter started in`);
  console.log(`${"k".padStart(3)}  ${"noise".padStart(5)}   ${"ayah".padStart(6)}  ${"surah".padStart(6)}  ${"top3".padStart(6)}  ${"nothing".padStart(7)}  ${"ms".padStart(5)}`);

  for (const k of [3, 5, 8, 12, 20]) {
    for (const noise of [0, 0.15, 0.3]) {
      let exact = 0;
      let sameSurah = 0;
      let top3 = 0;
      let empty = 0;
      let elapsed = 0;
      for (let t = 0; t < TRIALS; t++) {
        const start = Math.floor(rnd() * (words.length - k));
        const truthSurah = surahAt[start];
        const truthAyah = ayahAt[start];
        // Don't run a query across a surah boundary — nobody recites that.
        if (surahAt[start + k - 1] !== truthSurah) continue;
        const q = corrupt(words.slice(start, start + k), noise);
        const t1 = performance.now();
        const hits = locator.locate(q, 3);
        elapsed += performance.now() - t1;
        if (!hits.length) {
          empty++;
          continue;
        }
        if (hits[0].surah === truthSurah && hits[0].ayah === truthAyah) exact++;
        if (hits[0].surah === truthSurah) sameSurah++;
        if (hits.some((h) => h.surah === truthSurah && h.ayah === truthAyah)) top3++;
      }
      const pct = (n) => `${((100 * n) / TRIALS).toFixed(1)}%`.padStart(6);
      console.log(
        `${String(k).padStart(3)}  ${`${(noise * 100).toFixed(0)}%`.padStart(5)}   ${pct(exact)}  ${pct(sameSurah)}  ${pct(top3)}  ${pct(empty).padStart(7)}  ${(elapsed / TRIALS).toFixed(2).padStart(5)}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
