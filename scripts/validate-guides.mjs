// Content-integrity check for the authored guides.
//   1. Each section's display groups cover its from..to (no gaps).
//   2. Every ayah a section references exists in the guide's verse data.
//   3. verseCount is consistent (full surahs: == numberOfAyahs and 1..N covered;
//      passages: == the number of ayahs the sections cover).
//   4. Every vocab Arabic string appears in the verse text (diacritic-insensitive)
//      — catches hand-typed / mistyped Arabic.
//
// Run: node --experimental-strip-types scripts/validate-guides.mjs

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.join(import.meta.dirname, "..");
const GUIDES = path.join(ROOT, "content", "guides");
const QURAN = path.join(ROOT, "content", "quran");

const norm = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
const stripMn = (s) => norm(s).replace(/ـ/g, "").replace(/\p{Mn}/gu, "");

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
  const present = new Set(verses.ayahs.map((a) => a.number));
  const isPassage = g.meta.collection === "virtues";
  const label = `${num} ${g.meta.slug}`;
  let secOk = true;

  const covered = new Set();
  for (const sec of g.sections) {
    for (let v = sec.from; v <= sec.to; v++) {
      if (covered.has(v)) (secOk = false), console.log(`✗ ${label}: verse ${v} in 2+ sections`);
      covered.add(v);
      if (!present.has(v))
        (secOk = false), console.log(`✗ ${label}: section references v${v} not in verse data`);
    }
    const gc = new Set();
    for (const grp of sec.groups) for (let v = grp.from; v <= grp.to; v++) gc.add(v);
    for (let v = sec.from; v <= sec.to; v++)
      if (!gc.has(v)) (secOk = false), console.log(`✗ ${label}: §"${sec.title}" v${v} not in any group`);
  }

  if (isPassage) {
    if (g.meta.verseCount !== covered.size)
      (secOk = false),
        console.log(`✗ ${label}: meta.verseCount ${g.meta.verseCount} ≠ covered ${covered.size}`);
  } else {
    if (g.meta.verseCount !== verses.numberOfAyahs)
      (secOk = false),
        console.log(`✗ ${label}: meta.verseCount ${g.meta.verseCount} ≠ data ${verses.numberOfAyahs}`);
    for (let v = 1; v <= verses.numberOfAyahs; v++)
      if (!covered.has(v)) (secOk = false), console.log(`✗ ${label}: verse ${v} not covered`);
  }
  if (!secOk) problems++;

  // vocab tokens present in the (covered) verse text
  const haystack = norm(verses.ayahs.map((a) => a.arabic).join(" "));
  const haystackND = stripMn(haystack);
  for (const grp of g.vocab || [])
    for (const item of grp.items) {
      vocabChecked++;
      const needle = norm(item.arabic);
      const needleND = stripMn(needle);
      const tokenOk =
        haystack.includes(needle) ||
        haystackND.includes(needleND) ||
        needleND.split(" ").every((w) => w && haystackND.includes(w));
      if (!tokenOk) {
        vocabMissing++;
        console.log(`  ⚠ ${label}: vocab "${item.arabic}" (${item.roman}) not found in verse text`);
      }
    }
}

console.log(
  `\nChecked ${files.length} guides · ${vocabChecked} vocab items.` +
    ` Structural problems: ${problems}. Vocab not-found warnings: ${vocabMissing}.`
);
process.exit(problems > 0 ? 1 : 0);
