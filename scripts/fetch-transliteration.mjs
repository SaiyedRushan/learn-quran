// Backfills an ALA-LC transliteration onto every verse already stored in
// content/quran/{num}.json.
//
// The transliteration is produced deterministically from the verified,
// fully-vocalized Arabic (alquran.cloud "quran-simple" / Imlaei edition) by the
// rule-based engine in scripts/lib/ala-lc.mjs — it is derived from the verified
// text, never model-generated. As with the Arabic pipeline, the bismillah is
// stripped from ayah 1 so the transliteration matches how the surah is recited.
//
// Run: npm run fetch:transliteration

import { readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transliterateAyah } from "./lib/ala-lc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const QURAN_DIR = join(ROOT, "content", "quran");

// Strip the leading bismillah (4 tokens) from ayah 1, diacritic-insensitively.
function stripBismillah(text) {
  const bare = (s) => s.replace(/ـ/g, "").replace(/\p{Mn}/gu, "").replace(/\s+/g, "");
  const tokens = text.trim().split(/\s+/);
  if (tokens.length > 4 && bare(text).startsWith("بسم")) {
    return tokens.slice(4).join(" ").trim();
  }
  return text;
}

async function fetchSimpleText(num) {
  const url = `https://api.alquran.cloud/v1/surah/${num}/quran-simple`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for surah ${num}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`API code ${json.code} for surah ${num}`);
  const byNumber = new Map();
  for (const a of json.data.ayahs) {
    byNumber.set(a.numberInSurah, a.text.trim());
  }
  return byNumber;
}

async function backfillSurah(file) {
  const path = join(QURAN_DIR, file);
  const data = JSON.parse(await readFile(path, "utf8"));
  const simple = await fetchSimpleText(data.number);

  const ayahs = data.ayahs.map((a) => {
    let arabic = simple.get(a.number);
    if (arabic === undefined) {
      throw new Error(`No simple text for surah ${data.number} ayah ${a.number}`);
    }
    if (a.number === 1) arabic = stripBismillah(arabic);
    return {
      number: a.number,
      arabic: a.arabic,
      transliteration: transliterateAyah(arabic),
      translation: a.translation,
    };
  });

  await writeFile(path, JSON.stringify({ ...data, ayahs }, null, 2) + "\n", "utf8");
  return ayahs.length;
}

async function main() {
  const files = (await readdir(QURAN_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => parseInt(a) - parseInt(b));

  for (const file of files) {
    process.stdout.write(`Transliterating ${file}... `);
    const count = await backfillSurah(file);
    console.log(`✓ ${count} ayahs`);
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`\nBackfilled ALA-LC transliteration into ${files.length} surahs`);
}

main().catch((err) => {
  console.error("\nBackfill failed:", err.message);
  process.exit(1);
});
