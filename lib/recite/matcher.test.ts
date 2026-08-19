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

// --- mistakes we trust ourselves to report ---

test("says nothing about a single word, however it was mangled", () => {
  const m = makeMatcher();
  // A word left out, and a word replaced. Neither is reported: text-only ASR
  // can't tell "you didn't say this" from "I didn't hear this", and guessing
  // chimed at flawless recitation. Verses are the unit we can be sure about.
  m.update("بسم قل الله أحد");
  assert.deepEqual(m.update("بسم قل الله أحد")?.skipped, [], "word left out");
  const n = makeMatcher();
  n.update("بسم قل شيء الله أحد");
  assert.deepEqual(n.update("بسم قل شيء الله أحد")?.skipped, [], "word replaced");
});

test("reports a verse passed over entirely", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  // Ayah 2 (ٱللَّهُ ٱلصَّمَدُ, tokens 4-5) never recited. A whole verse absent from
  // the transcript is not something a mishearing produces.
  const res = m.update("قل هو الله أحد لم يلد ولم يولد");
  assert.deepEqual(res?.skipped, [4, 5]);
});

test("a verse only partly crossed is not a skipped verse", () => {
  const m = makeMatcher();
  // Mid-verse, with the cursor inside ayah 3 rather than past it.
  m.update("قل هو الله أحد الله الصمد");
  const res = m.update("الله الصمد لم يلد");
  assert.deepEqual(res?.skipped, []);
});

test("says nothing while the recitation is clean", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  const res = m.update("قل هو الله أحد الله الصمد");
  assert.deepEqual(res?.skipped, []);
  assert.equal(res?.lost, false);
});

test("reports being lost when the recitation isn't in this passage", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  // Reciting something from another surah entirely. Inference only runs on
  // speech, so a run of unmatchable windows means they've wandered off.
  let lost = false;
  for (let i = 0; i < 4; i++) lost = m.update("الحمد لله رب العالمين")?.lost ?? lost;
  assert.equal(lost, true);
  assert.equal(m.anchored, false, "drops its anchor so it can re-find them");
});

// --- skipped words -----------------------------------------------------------

test("follows the voice into a verse that was skipped outright", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  const at = m.matched;
  // They jump from ayah 1 to ayah 3, leaving ayah 2 unsaid. The cursor has to
  // follow — with a symmetric gap penalty the aligner used to abandon the run
  // rather than bridge the omission, and simply stalled here.
  m.update("قل هو الله أحد لم يلد ولم يولد");
  assert.ok(m.matched > at + 2, `cursor stalled at ${m.matched}`);
});

test("a clean recitation reports no skips", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد");
  const res = m.update("قل هو الله أحد الله الصمد");
  assert.deepEqual(res?.skipped, []);
});

// --- going back --------------------------------------------------------------

test("rewinds when the reciter goes back over an earlier ayah", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد الله الصمد لم يلد ولم يولد");
  assert.equal(m.matched, 10, "through the end of ayah 3");

  // They stop and start again from the top. The tail is what gives it away —
  // the full transcript still contains the first pass.
  const tail = "قل هو الله أحد الله الصمد لم يلد ولم يولد قل هو الله أحد";
  const first = m.update(tail);
  assert.equal(first?.repeated ?? false, false, "one window is not enough to rewind");
  const second = m.update(tail);
  assert.equal(second?.repeated, true);
  assert.equal(m.matched, 4, "back to just after أحد");
});

test("identical repeated ayahs are not mistaken for going back", () => {
  // Al-Kafirun 3 and 5 are word-for-word identical.
  const m = makeMatcher([
    [1, "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ"],
    [2, "لَآ أَعْبُدُ مَا تَعْبُدُونَ"],
    [3, "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ"],
    [4, "وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ"],
    [5, "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ"],
  ]);
  m.update("قل يا أيها الكافرون لا أعبد ما تعبدون ولا أنتم عابدون ما أعبد");
  m.update("ولا أنا عابد ما عبدتم ولا أنتم عابدون ما أعبد");
  const at = m.matched;
  const res = m.update("ولا أنا عابد ما عبدتم ولا أنتم عابدون ما أعبد");
  assert.equal(res?.repeated ?? false, false);
  assert.ok(m.matched >= at, "ayah 5 must not read as a rewind to ayah 3");
});

test("small backward jitter never rewinds the cursor", () => {
  const m = makeMatcher();
  m.update("قل هو الله أحد الله الصمد");
  const at = m.matched;
  m.update("قل هو الله أحد الله");
  m.update("قل هو الله أحد الله");
  assert.equal(m.matched, at);
});

test("re-searches the whole passage after repeated failures", () => {
  const m = makeMatcher();
  m.update("قل هو الله");
  assert.ok(m.anchored);
  for (let i = 0; i < 4; i++) m.update("كلام لا علاقة له بالنص");
  assert.equal(m.anchored, false, "gives up its anchor so it can re-find them");
});
