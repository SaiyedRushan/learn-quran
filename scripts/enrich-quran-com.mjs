// Re-sources the Arabic in every content/quran/{num}.json from Quran.com's
// KFGQPC editions, and adds an IndoPak variant:
//
//   - arabic         ← text_uthmani  (.../quran/verses/uthmani?chapter_number=N)
//   - arabicIndopak  ← text_indopak  (.../quran/verses/indopak?chapter_number=N)
//
// Why: alquran.cloud's quran-uthmani (Tanzil) edition stamps a small iqlāb-style
// meem on nearly every tanwīn not followed by a throat letter — non-standard vs
// the printed mushaf. Quran.com's KFGQPC text_uthmani marks only true iqlāb
// (e.g. drops the extra meems on lahab/naar/hablun, keeps the correct one on
// masad). IndoPak is a genuinely different orthography, not just a font, so it
// ships as its own field rendered with a self-hosted IndoPak Nastaleeq face.
//
// This is an in-place enrichment: it patches `arabic` and inserts
// `arabicIndopak`, matching each ayah by its number, and preserves the existing
// transliteration and translation untouched. Only the ayahs present in each
// file are updated (surahs 2, 18, 36 are partial passages) — Quran.com returns
// the full chapter, so we index its verses by ayah number and look up.
//
// Quran.com's verse 1 already excludes the bismillah, matching how these files
// store ayah 1, so no stripping is needed.
//
// Run: node scripts/enrich-quran-com.mjs

import {readdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const QURAN_DIR = join(ROOT, "content", "quran");

// Fetch a KFGQPC script for a whole chapter, returning a Map<ayahNumber, text>.
async function fetchScript(script, chapter, field) {
  const url = `https://api.quran.com/api/v4/quran/verses/${script}?chapter_number=${chapter}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${script} chapter ${chapter}`);
  const json = await res.json();
  const map = new Map();
  for (const v of json.verses) {
    // verse_key is "chapter:ayah"; the ayah half is the number within the surah.
    const ayah = Number(v.verse_key.split(":")[1]);
    map.set(ayah, v[field].trim());
  }
  return map;
}

async function main() {
  const files = (await readdir(QURAN_DIR)).filter((f) => f.endsWith(".json")).sort((a, b) => parseInt(a) - parseInt(b));

  for (const file of files) {
    const num = parseInt(file);
    const path = join(QURAN_DIR, file);
    const data = JSON.parse(await readFile(path, "utf8"));

    process.stdout.write(`Surah ${num} (${data.ayahs.length} ayahs)... `);
    const [uthmani, indopak] = await Promise.all([
      fetchScript("uthmani", num, "text_uthmani"),
      fetchScript("indopak", num, "text_indopak"),
    ]);

    let patched = 0;
    data.ayahs = data.ayahs.map((a) => {
      const u = uthmani.get(a.number);
      const ip = indopak.get(a.number);
      if (!u || !ip) throw new Error(`Missing ayah ${a.number} in Quran.com response for surah ${num}`);
      patched++;
      // Re-order keys so the two Arabic scripts sit together, ahead of the
      // derived transliteration and translation (both preserved verbatim).
      return {
        number: a.number,
        arabic: u,
        arabicIndopak: ip,
        transliteration: a.transliteration,
        translation: a.translation,
      };
    });

    await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
    process.stdout.write(`patched ${patched}\n`);
  }

  console.log(`\nDone: enriched ${files.length} surah files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
