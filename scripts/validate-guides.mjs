// Content-integrity check for the authored guides.
//   1. Sections cover verses 1..verseCount contiguously (no gaps / overlaps).
//   2. Each section's display groups cover from..to contiguously.
//   3. meta.verseCount matches the verified verse data.
//   4. Every vocab Arabic string is a substring of the verified surah text
//      (normalized) — catches hand-typed / mistyped Arabic.
//
// Run: node --experimental-strip-types scripts/validate-guides.mjs

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.join(import.meta.dirname, "..");
const GUIDES = path.join(ROOT, "content", "guides");
const QURAN = path.join(ROOT, "content", "quran");

const norm = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();

const files = readdirSync(GUIDES)
  .filter((f) => /^\d+-.+\.ts$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));

let problems = 0;
let vocabChecked = 0;
let vocabMissing = 0;

for (const file of files) {
  const num = parseInt(file);
  const mod = await import(pathToFileURL(path.join(GUIDES, file)).href);
  const g = mod.default;
  const verses = JSON.parse(readFileSync(path.join(QURAN, `${num}.json`), "utf8"));
  const N = verses.numberOfAyahs;
  const label = `${num} ${g.meta.slug}`;

  if (g.meta.verseCount !== N)
    (problems++, console.log(`✗ ${label}: meta.verseCount ${g.meta.verseCount} ≠ data ${N}`));

  // section coverage
  const covered = new Set();
  let secOk = true;
  for (const sec of g.sections) {
    for (let v = sec.from; v <= sec.to; v++) {
      if (covered.has(v)) (secOk = false), console.log(`✗ ${label}: verse ${v} in 2+ sections`);
      covered.add(v);
    }
    // group coverage within section
    const gc = new Set();
    for (const grp of sec.groups)
      for (let v = grp.from; v <= grp.to; v++) gc.add(v);
    for (let v = sec.from; v <= sec.to; v++)
      if (!gc.has(v)) (secOk = false), console.log(`✗ ${label}: §"${sec.title}" v${v} not in any group`);
  }
  for (let v = 1; v <= N; v++)
    if (!covered.has(v)) (secOk = false), console.log(`✗ ${label}: verse ${v} not covered by any section`);
  if (!secOk) problems++;

  // vocab tokens present in surah text
  const haystack = norm(verses.ayahs.map((a) => a.arabic).join(" "));
  const haystackNoDiacritics = haystack.replace(/[ً-ٰٟۖ-ۭـ]/g, "");
  for (const grp of g.vocab || [])
    for (const item of grp.items) {
      vocabChecked++;
      const needle = norm(item.arabic);
      const needleND = needle.replace(/[ً-ٰٟۖ-ۭـ]/g, "");
      // allow exact or diacritic-insensitive match (vocab may drop case endings)
      const tokenOk =
        haystack.includes(needle) ||
        haystackNoDiacritics.includes(needleND) ||
        needle.split(" ").every((w) => haystackNoDiacritics.includes(w.replace(/[ً-ٰٟۖ-ۭـ]/g, "")));
      if (!tokenOk) {
        vocabMissing++;
        console.log(`  ⚠ ${label}: vocab "${item.arabic}" (${item.roman}) not found in surah text`);
      }
    }
}

console.log(
  `\nChecked ${files.length} guides · ${vocabChecked} vocab items.` +
    ` Structural problems: ${problems}. Vocab not-found warnings: ${vocabMissing}.`
);
process.exit(problems > 0 ? 1 : 0);
