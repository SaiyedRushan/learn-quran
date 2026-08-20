// Fetches Mishari Rashid al-`Afasy ayah audio URLs + word-level timestamps
// from the quran.com v4 API for every surah we have verse data for. The
// recitation-practice page plays [word start -> word end] slices of these
// ayah mp3s as "next words" hints, so the hint voice is a real reciter.
//
// Output: public/recite/audio/alafasy/{surah}.json
//   { "<ayah>": { "url": "https://verses.quran.com/...mp3",
//                 "segments": [[wordNumber(1-based), startMs, endMs], ...] } }
//
// Validates that the API's word count matches our own tokenization of the
// ayah (whitespace tokens containing an Arabic letter — mirrors
// lib/drills/text.ts isArabicWord), so index drift is caught here, not in UI.
//
// Run: node scripts/fetch-recitation-audio.mjs

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// public/quran holds all 114 surahs (content/quran holds only the 51 with
// a guide), so hints work anywhere recitation practice does. The Arabic in the
// two is byte-identical where they overlap — both are Quran.com text_uthmani.
const QURAN_DIR = join(ROOT, "public", "quran");
const OUT_DIR = join(ROOT, "public", "recite", "audio", "alafasy");

const RECITATION_ID = 7; // Mishari Rashid al-`Afasy
const API = "https://api.quran.com/api/v4";
const AUDIO_BASE = "https://verses.quran.com/";

const isArabicWord = (token) => /[ء-يٱ]/.test(token);
const arabicWordCount = (text) =>
  text.split(/\s+/).filter((t) => t && isArabicWord(t)).length;

async function fetchAudioFiles(surah) {
  const files = [];
  let page = 1;
  for (;;) {
    const url = `${API}/recitations/${RECITATION_ID}/by_chapter/${surah}?fields=segments&per_page=50&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for surah ${surah} page ${page}`);
    const json = await res.json();
    files.push(...json.audio_files);
    if (!json.pagination.next_page) return files;
    page = json.pagination.next_page;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const surahFiles = (await readdir(QURAN_DIR)).filter((f) => /^\d+\.json$/.test(f));
  // 114 surahs of paginated segment data is a slow fetch; make reruns resumable.
  const force = process.argv.includes("--force");
  const have = new Set(force ? [] : await readdir(OUT_DIR).catch(() => []));
  let mismatches = 0;

  for (const file of surahFiles.sort((a, b) => parseInt(a) - parseInt(b))) {
    const surah = parseInt(file, 10);
    if (have.has(file)) continue;
    const verseData = JSON.parse(await readFile(join(QURAN_DIR, file), "utf8"));
    const audioFiles = await fetchAudioFiles(surah);

    const out = {};
    for (const af of audioFiles) {
      const ayah = parseInt(af.verse_key.split(":")[1], 10);
      // API segment rows are [segmentIndex, wordNumber, startMs, endMs]
      const segments = (af.segments ?? [])
        .filter((s) => s.length >= 4)
        .map(([, word, start, end]) => [word, start, end]);
      if (!segments.length) continue;
      out[ayah] = { url: AUDIO_BASE + af.url, segments };

      const ours = verseData.ayahs.find((a) => a.number === ayah);
      if (!ours) continue; // API returns whole surahs; we may only hold a passage
      const ourCount = arabicWordCount(ours.arabic);
      const apiCount = Math.max(...segments.map(([w]) => w));
      if (ourCount !== apiCount) {
        mismatches++;
        console.warn(
          `MISMATCH ${surah}:${ayah} — our tokens ${ourCount}, API words ${apiCount}`,
        );
      }
    }

    await writeFile(join(OUT_DIR, `${surah}.json`), JSON.stringify(out));
    console.log(`surah ${surah}: ${Object.keys(out).length} ayahs`);
  }

  if (mismatches > 0) {
    console.warn(`\n${mismatches} word-count mismatch(es) — hint slices may be off there.`);
  } else {
    console.log("\nall word counts match our tokenization");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
