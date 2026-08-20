// Fetches the Arabic text of all 114 surahs from Quran.com's KFGQPC Uthmani
// edition into public/quran/{num}.json.
//
// This is a SEPARATE artifact from content/quran/{num}.json, deliberately:
//   - content/quran/    — the 51 surahs with a memorization guide. Arabic +
//                         IndoPak + transliteration + Sahih International
//                         translation. Drives the guide pages.
//   - public/quran/     — all 114, Arabic only. Drives whole-Quran recognition
//                         and recitation practice for surahs with no guide.
//                         It lives under public/ rather than content/ because
//                         continuous mode fetches surahs lazily in the browser.
//
// Arabic only, and that is the point: the Quranic text is in the public domain,
// whereas the Sahih International translation is not, so recognition (which
// needs no translation at all) doesn't drag it across the whole mushaf.
//
// Source has to be Quran.com text_uthmani, not alquran.cloud: the word-level
// audio timings in public/recite/audio/alafasy/ are indexed against Quran.com's
// tokenization, and fetch-recitation-audio.mjs validates the two agree. A
// different edition would silently shift every hint by a word or two.
//
// Quran.com's verse 1 already excludes the bismillah, matching how
// content/quran/ stores it, so nothing needs stripping.
//
// Run: npm run fetch:quran-text   (add --force to refetch what's already there)

import {mkdir, readdir, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "quran");
const API = "https://api.quran.com/api/v4";

const FORCE = process.argv.includes("--force");

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** All 114 chapters' metadata in one request. */
async function fetchChapters() {
  const {chapters} = await getJson(`${API}/chapters?language=en`);
  const byNumber = new Map();
  for (const c of chapters) {
    byNumber.set(c.id, {
      number: c.id,
      arabicName: c.name_arabic,
      englishName: c.name_simple,
      englishNameTranslation: c.translated_name?.name ?? "",
      revelationType: c.revelation_place === "makkah" ? "Meccan" : "Medinan",
      numberOfAyahs: c.verses_count,
    });
  }
  return byNumber;
}

async function fetchUthmani(chapter) {
  const {verses} = await getJson(`${API}/quran/verses/uthmani?chapter_number=${chapter}`);
  return verses.map((v) => ({
    number: Number(v.verse_key.split(":")[1]),
    arabic: v.text_uthmani.trim(),
  }));
}

async function main() {
  await mkdir(OUT_DIR, {recursive: true});
  const have = new Set(
    FORCE ? [] : (await readdir(OUT_DIR).catch(() => [])).filter((f) => f.endsWith(".json")),
  );

  const chapters = await fetchChapters();
  console.log(`chapters: ${chapters.size}`);

  let written = 0;
  for (let n = 1; n <= 114; n++) {
    if (have.has(`${n}.json`)) continue;
    const meta = chapters.get(n);
    if (!meta) throw new Error(`no metadata for chapter ${n}`);
    const ayahs = await fetchUthmani(n);
    if (ayahs.length !== meta.numberOfAyahs) {
      throw new Error(`surah ${n}: got ${ayahs.length} ayahs, expected ${meta.numberOfAyahs}`);
    }
    // Ayah numbers must be a dense 1..n run — a gap would silently misalign
    // every downstream word index.
    ayahs.forEach((a, i) => {
      if (a.number !== i + 1) throw new Error(`surah ${n}: ayah ${i + 1} numbered ${a.number}`);
    });
    await writeFile(join(OUT_DIR, `${n}.json`), JSON.stringify({...meta, ayahs}, null, 0) + "\n");
    written++;
    process.stdout.write(`\rsurah ${n}/114 (${meta.englishName})${" ".repeat(20)}`);
  }
  console.log(`\ndone — ${written} written, ${have.size} already present`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
