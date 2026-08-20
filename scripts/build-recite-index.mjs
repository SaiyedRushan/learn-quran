// Builds the whole-Quran recognition index served to the browser at
// public/recite/quran-locate.json.
//
// The artifact is deliberately dumb: a single stream of normalized words plus
// the per-ayah word counts needed to map a position in that stream back to a
// surah and ayah. The trigram index itself is built client-side in a worker
// (lib/recite/locate.ts) — it's a few hundred milliseconds of Map building, and
// shipping it precomputed would multiply the download for no gain.
//
// Words are folded with the same normalizeArabicWord the recitation matcher
// uses, so the recognizer's transcript and this index meet on one skeleton:
// no tashkeel, no dagger alef, hamza carriers folded. That is what lets
// Whisper's plain spelling match the Uthmani text.
//
// Run: npm run build:recite-index   (after npm run fetch:quran-text)

import {readFile, writeFile, mkdir} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {gzipSync} from "node:zlib";
import {normalizeArabicWords} from "../lib/recite/arabic.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TEXT_DIR = join(ROOT, "public", "quran");
const OUT = join(ROOT, "public", "recite", "quran-locate.json");

async function main() {
  const words = [];
  /** One entry per ayah, in mushaf order: how many normalized words it holds. */
  const ayahCounts = [];
  const surahs = [];

  for (let n = 1; n <= 114; n++) {
    const data = JSON.parse(await readFile(join(TEXT_DIR, `${n}.json`), "utf8"));
    for (const ayah of data.ayahs) {
      const w = normalizeArabicWords(ayah.arabic);
      if (!w.length) throw new Error(`surah ${n} ayah ${ayah.number} normalized to nothing`);
      words.push(...w);
      ayahCounts.push(w.length);
    }
    surahs.push({
      n,
      a: data.ayahs.length,
      name: data.englishName,
      ar: data.arabicName,
    });
  }

  const payload = {
    version: 1,
    words: words.join(" "),
    ayahs: ayahCounts,
    surahs,
  };

  const json = JSON.stringify(payload);
  await mkdir(dirname(OUT), {recursive: true});
  await writeFile(OUT, json);

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`ayahs: ${ayahCounts.length}  words: ${words.length}`);
  console.log(`written: public/recite/quran-locate.json`);
  console.log(`  raw ${kb(Buffer.byteLength(json))}, gzipped ${kb(gzipSync(json).length)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
