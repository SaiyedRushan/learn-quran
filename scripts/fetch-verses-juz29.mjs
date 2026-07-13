// Fetches verified Quran text for Juz 29 (surahs 67–77) from alquran.cloud:
//   - Uthmani Arabic (edition: quran-uthmani)
//   - Sahih International English (edition: en.sahih)
//
// Writes one content/quran/{num}.json per surah (VerseData) and a combined
// content/juz29-index.json used by the home page. Mirrors fetch-verses.mjs
// (Juz 30); see that file for the bismillah-stripping rationale.
//
// Run: npm run fetch:verses:juz29

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const QURAN_DIR = join(ROOT, "content", "quran");

const FIRST = 67;
const LAST = 77;

// Cairo (1924) revelation-order (nuzul) sequence for surahs 67–77.
const REVELATION_ORDER = {
  67: 77, 68: 2, 69: 78, 70: 79, 71: 71, 72: 40, 73: 3, 74: 4, 75: 31,
  76: 98, 77: 33,
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
// Detection is diacritic-insensitive: some surahs encode the bāʾ with a shadda
// (e.g. "بِّسْمِ"), so we compare against the bare letters "بسم". No genuine
// Juz 29 surah begins its first ayah with "بسم".
function stripBismillah(text) {
  // strip tatweel, all Arabic diacritics (Unicode nonspacing marks) and spaces
  const bare = (s) => s.replace(/ـ/g, "").replace(/\p{Mn}/gu, "").replace(/\s+/g, "");
  const tokens = text.trim().split(/\s+/);
  if (tokens.length > 4 && bare(text).startsWith("بسم")) {
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
    juz: 29,
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
    join(ROOT, "content", "juz29-index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8"
  );
  console.log(`\nWrote ${index.length} surahs + juz29-index.json`);
}

main().catch((err) => {
  console.error("\nFetch failed:", err.message);
  process.exit(1);
});
