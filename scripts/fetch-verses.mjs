// Fetches verified Quran text for Juz 30 (surahs 78–114) from alquran.cloud:
//   - Uthmani Arabic (edition: quran-uthmani)
//   - Sahih International English (edition: en.sahih)
//
// Writes one content/quran/{num}.json per surah (VerseData) and a combined
// content/surah-index.json used by the home page.
//
// The Uthmani edition prepends the bismillah to ayah 1 of every surah (except
// Al-Fatiha and At-Tawbah). All of Juz 30 carries it, so we strip the leading
// bismillah (first 4 whitespace tokens) from ayah 1 to match how the verse is
// actually recited as part of the surah.
//
// Run: npm run fetch:verses

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const QURAN_DIR = join(ROOT, "content", "quran");

const FIRST = 78;
const LAST = 114;

// Cairo (1924) revelation-order (nuzul) sequence for surahs 78–114.
const REVELATION_ORDER = {
  78: 80, 79: 81, 80: 24, 81: 7, 82: 82, 83: 86, 84: 83, 85: 27, 86: 36,
  87: 8, 88: 68, 89: 10, 90: 35, 91: 26, 92: 9, 93: 11, 94: 12, 95: 28,
  96: 1, 97: 25, 98: 100, 99: 93, 100: 14, 101: 30, 102: 16, 103: 13,
  104: 32, 105: 19, 106: 29, 107: 17, 108: 15, 109: 18, 110: 114, 111: 6,
  112: 22, 113: 20, 114: 21,
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Strip the leading bismillah (4 tokens) from ayah 1's Arabic text.
function stripBismillah(text) {
  const tokens = text.split(/\s+/);
  // bismillah = بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ (4 words)
  if (tokens.length > 4 && tokens[0].startsWith("بِسْمِ")) {
    return tokens.slice(4).join(" ").trim();
  }
  return text;
}

async function fetchSurah(num) {
  const url = `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for surah ${num}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`API code ${json.code} for surah ${num}`);
  const [ar, en] = json.data;

  const ayahs = ar.ayahs.map((a, i) => {
    let arabic = a.text.trim();
    if (i === 0) arabic = stripBismillah(arabic);
    return {
      number: a.numberInSurah,
      arabic,
      translation: en.ayahs[i].text.trim(),
    };
  });

  const verseData = {
    number: num,
    arabicName: ar.name,
    englishName: ar.englishName,
    englishNameTranslation: ar.englishNameTranslation,
    revelationType: ar.revelationType, // "Meccan" | "Medinan"
    numberOfAyahs: ar.numberOfAyahs,
    ayahs,
  };

  const indexEntry = {
    number: num,
    slug: slugify(ar.englishName),
    name: ar.englishName,
    epithet: ar.englishNameTranslation,
    arabicName: ar.name,
    juz: 30,
    revelationType: ar.revelationType === "Medinan" ? "Madinan" : "Makkan",
    verseCount: ar.numberOfAyahs,
    revelationOrder: REVELATION_ORDER[num],
    revelationOrdinal: REVELATION_ORDER[num] ? ordinal(REVELATION_ORDER[num]) : null,
  };

  return { verseData, indexEntry };
}

async function main() {
  await mkdir(QURAN_DIR, { recursive: true });
  const index = [];

  for (let num = FIRST; num <= LAST; num++) {
    process.stdout.write(`Fetching surah ${num}... `);
    const { verseData, indexEntry } = await fetchSurah(num);
    await writeFile(
      join(QURAN_DIR, `${num}.json`),
      JSON.stringify(verseData, null, 2) + "\n",
      "utf8"
    );
    index.push(indexEntry);
    console.log(`✓ ${indexEntry.name} (${indexEntry.verseCount} ayahs)`);
    // be polite to the public API
    await new Promise((r) => setTimeout(r, 120));
  }

  await writeFile(
    join(ROOT, "content", "surah-index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8"
  );
  console.log(`\nWrote ${index.length} surahs + surah-index.json`);
}

main().catch((err) => {
  console.error("\nFetch failed:", err.message);
  process.exit(1);
});
