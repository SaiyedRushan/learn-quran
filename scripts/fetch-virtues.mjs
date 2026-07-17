// Fetches verified verse data for the "Recommended Recitations" collection
// (surahs/passages outside Juz 30). Full surahs for Yasin & Al-Mulk; only the
// relevant ayahs for the Al-Kahf protection passage and the Al-Baqarah endings.
//
// Run: node scripts/fetch-virtues.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transliterateAyah } from "./lib/ala-lc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QURAN_DIR = join(__dirname, "..", "content", "quran");

// number -> predicate selecting which ayahs to keep (null = keep all)
const TARGETS = {
  36: null, // Ya-Sin, full
  67: null, // Al-Mulk, full
  18: (n) => (n >= 1 && n <= 10) || (n >= 101 && n <= 110), // Al-Kahf first & last 10
  2: (n) => n === 255 || n === 285 || n === 286, // Ayat al-Kursi + last two
};

// strip tatweel, all Arabic diacritics (Unicode nonspacing marks) and spaces
const bare = (s) => s.replace(/ـ/g, "").replace(/\p{Mn}/gu, "").replace(/\s+/g, "");
function stripBismillah(text) {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length > 4 && bare(text).startsWith("بسم")) {
    return tokens.slice(4).join(" ").trim();
  }
  return text;
}

async function fetchSurah(num, keep) {
  const url = `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,quran-simple`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for surah ${num}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`API code ${json.code} for surah ${num}`);
  const [ar, en, simple] = json.data;

  const ayahs = ar.ayahs
    .map((a, i) => {
      let arabic = a.text.trim();
      let simpleText = simple.ayahs[i].text.trim();
      if (a.numberInSurah === 1) {
        arabic = stripBismillah(arabic);
        simpleText = stripBismillah(simpleText);
      }
      return {
        number: a.numberInSurah,
        arabic,
        transliteration: transliterateAyah(simpleText),
        translation: en.ayahs[i].text.trim(),
      };
    })
    .filter((a) => (keep ? keep(a.number) : true));

  return {
    number: num,
    arabicName: ar.name,
    englishName: ar.englishName,
    englishNameTranslation: ar.englishNameTranslation,
    revelationType: ar.revelationType,
    numberOfAyahs: ar.numberOfAyahs, // full-surah total (ayahs may be a subset)
    ayahs,
  };
}

async function main() {
  await mkdir(QURAN_DIR, { recursive: true });
  for (const [num, keep] of Object.entries(TARGETS)) {
    process.stdout.write(`Fetching surah ${num}... `);
    const data = await fetchSurah(Number(num), keep);
    await writeFile(join(QURAN_DIR, `${num}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`✓ ${data.englishName} (${data.ayahs.length} ayah${data.ayahs.length === 1 ? "" : "s"} kept)`);
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("\nFetch failed:", err.message);
  process.exit(1);
});
