// Run with: npm run test:recite
//
// These cover the behaviours we previously could only guess at from live mic
// sessions: does a skipped word desync the cursor, does a repeated phrase pull
// it backwards, does a garbage transcript move it at all.
import assert from "node:assert/strict";
import {test} from "node:test";
import {buildTokens, RecitationMatcher} from "./matcher.ts";
import {normalizeArabicWord} from "./arabic.ts";

// Al-Ikhlas, exactly as it appears in content/quran/112.json.
const AYAHS: [number, string][] = [
  [1, "قُلْ هُوَ ٱللَّهُ أَحَدٌ"],
  [2, "ٱللَّهُ ٱلصَّمَدُ"],
  [3, "لَمْ يَلِدْ وَلَمْ يُولَدْ"],
  [4, "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ"],
];

function makeWords(ayahs: [number, string][]) {
  const words: {flat: number; ayah: number; display: string; matchable: boolean}[] = [];
  for (const [ayah, text] of ayahs) {
    for (const display of text.split(/\s+/).filter(Boolean)) {
      words.push({flat: words.length, ayah, display, matchable: /[ء-يٱ]/.test(display)});
    }
  }
  return words;
}

function makeMatcher(ayahs = AYAHS) {
  return new RecitationMatcher(buildTokens(makeWords(ayahs)));
}

test("normalizes away tashkeel, dagger alef and hamza carriers", () => {
  assert.equal(normalizeArabicWord("ٱللَّهُ"), normalizeArabicWord("الله"));
  assert.equal(normalizeArabicWord("أَحَدٌ"), normalizeArabicWord("احد"));
  assert.equal(normalizeArabicWord("ٱلرَّحْمَٰن"), normalizeArabicWord("الرحمن"));
  assert.equal(normalizeArabicWord("لَّهُۥ"), normalizeArabicWord("له"));
  assert.equal(normalizeArabicWord("ۖ"), "");
});

test("tokens cover every matchable word and skip waqf marks", () => {
  const m = makeMatcher();
  // 4 + 2 + 4 + 5 words
  assert.equal(m.total, 15);
  assert.equal(m.matched, 0);
  assert.equal(m.current?.ayah, 1);
});

test("anchors mid-transcript and lands on the last word heard", () => {
  const m = makeMatcher();
  const res = m.update("قل هو الله أحد");
  assert.ok(res);
  // All four words of ayah 1 confirmed; next expected is ayah 2's first word.
  assert.equal(m.matched, 4);
  assert.equal(m.current?.ayah, 2);
});

test("does not run ahead of what was transcribed", () => {
  const m = makeMatcher();
  m.update("قل هو");
  assert.equal(m.matched, 2);
});

test("advances across ayah boundaries as the window rolls", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  m.update("قل هو الله أحد الله الصمد لم يلد");
  assert.equal(m.matched, 8);
  assert.equal(m.current?.ayah, 3);
});

test("a repeated phrase does not pull the cursor backwards", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد الله الصمد");
  const before = m.matched;
  assert.equal(before, 6);
  // "الله" occurs in both ayah 1 and ayah 2 — a window that only catches the
  // earlier occurrence must not rewind the cursor.
  m.update("قل هو الله");
  assert.equal(m.matched, before);
});

test("a mis-transcribed word mid-transcript does not desync the cursor", () => {
  const m = makeMatcher();
  // "ٱللَّهُ" heard as "اللاه"
  const res = m.update("قل هو اللاه أحد");
  assert.ok(res);
  assert.equal(m.matched, 4);
});

test("an uncertain trailing word holds the cursor one word back", () => {
  const m = makeMatcher();
  // "يُولَدْ" heard as "يولت" — close enough to align, not close enough to
  // commit to. The next window confirms it; better than landing wrong.
  const res = m.update("لم يلد ولم يولت");
  assert.ok(res);
  assert.equal(m.matched, 9);
});

test("survives a skipped word", () => {
  const m = makeMatcher();
  const res = m.update("قل الله أحد");
  assert.ok(res);
  assert.equal(m.matched, 4);
});

test("ignores a transcript that matches nothing", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  const before = m.matched;
  assert.equal(m.update("مرحبا كيف حالك اليوم"), null);
  assert.equal(m.matched, before);
});

test("ignores a single stray word", () => {
  const m = makeMatcher();
  assert.equal(m.update("الله"), null);
  assert.equal(m.matched, 0);
});

test("starting from the middle of the passage works", () => {
  const m = makeMatcher();
  const res = m.update("لم يلد ولم يولد");
  assert.ok(res);
  assert.equal(m.matched, 10);
  assert.equal(m.current?.ayah, 4);
});

test("a far-away match cannot teleport the cursor once anchored", () => {
  const m = makeMatcher();
  const far = new RecitationMatcher(buildTokens(makeWords(AYAHS)), {lookahead: 3});
  m.update("قل هو");
  far.update("قل هو");
  // With a tight lookahead the later ayah is outside the search window.
  assert.equal(far.update("ولم يكن له كفوا أحد"), null);
  assert.equal(far.matched, 2);
});

test("seek re-anchors and update continues from there", () => {
  const m = makeMatcher();
  m.seek(6); // start of ayah 3
  assert.equal(m.matched, 6);
  assert.equal(m.current?.ayah, 3);
  m.update("لم يلد ولم يولد");
  assert.equal(m.matched, 10);
});

test("reset returns to the beginning", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  m.reset();
  assert.equal(m.matched, 0);
  assert.equal(m.anchored, false);
});

test("reports done at the end of the passage", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد الله الصمد لم يلد ولم يولد");
  m.update("ولم يكن له كفوا أحد");
  assert.equal(m.matched, m.total);
  assert.equal(m.done, true);
  assert.equal(m.current, null);
});
