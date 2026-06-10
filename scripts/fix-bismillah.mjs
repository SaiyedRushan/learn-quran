// One-off: scan every Juz 30 surah for a leaked bismillah on ayah 1 (the fetch
// script's strip missed cases where the bāʾ carries a shadda, e.g. "بِّسْمِ"),
// and remove it. Detection is diacritic-insensitive: no genuine Juz 30 surah
// begins its first ayah with "بسم".
//
// Run: node scripts/fix-bismillah.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const QURAN = path.join(import.meta.dirname, "..", "content", "quran");

// strip harakat, tanwin, superscript alef, quranic marks, tatweel + spaces
const bare = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ\s]/g, "");

const files = readdirSync(QURAN).filter((f) => /^\d+\.json$/.test(f));
let fixed = 0;

for (const file of files) {
  const p = path.join(QURAN, file);
  const data = JSON.parse(readFileSync(p, "utf8"));
  const a1 = data.ayahs[0];
  if (!a1) continue;
  if (bare(a1.arabic).startsWith("بسم")) {
    const tokens = a1.arabic.trim().split(/\s+/);
    const before = a1.arabic;
    a1.arabic = tokens.slice(4).join(" ").trim(); // drop the 4 bismillah words
    writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
    fixed++;
    console.log(`✗ ${file} (surah ${data.number} ${data.englishName}) — removed leaked bismillah`);
    console.log(`    was: ${before}`);
    console.log(`    now: ${a1.arabic}`);
  }
}

console.log(`\nScanned ${files.length} surahs. Fixed ${fixed}.`);
