// Run with: npm run test:recite
//
// Whole-Quran recognition. The behaviours worth pinning down are the ones that
// decide whether we route the reciter somewhere wrong: too little evidence must
// produce no answer rather than a guess, and genuinely repeated text must come
// back as alternatives rather than one confident lie.
import assert from "node:assert/strict";
import {test} from "node:test";
import {QuranLocator, type LocateIndexData} from "./locate.ts";

// A miniature mushaf. Real Arabic words (so normalization behaves as it does in
// production) but an invented arrangement, so the expectations stay readable.
const A = "الحمد لله رب العالمين";
const B = "الرحمن الرحيم مالك يوم الدين";
const C = "اياك نعبد واياك نستعين";
const REFRAIN = "فباي الاء ربكما تكذبان";
const D = "ونعمة من ربكم فاعتبروا يا اولي الابصار";

function build(surahs: {n: number; name: string; ayahs: string[]}[]): LocateIndexData {
  const words: string[] = [];
  const ayahs: number[] = [];
  for (const s of surahs) {
    for (const ayah of s.ayahs) {
      const w = ayah.split(" ");
      words.push(...w);
      ayahs.push(w.length);
    }
  }
  return {
    version: 1,
    words: words.join(" "),
    ayahs,
    surahs: surahs.map((s) => ({n: s.n, a: s.ayahs.length, name: s.name, ar: s.name})),
  };
}

const index = build([
  {n: 1, name: "First", ayahs: [A, B, C]},
  // The refrain repeats, exactly as Ar-Rahman's does 31 times.
  {n: 55, name: "Repeated", ayahs: [REFRAIN, D, REFRAIN, D, REFRAIN]},
]);

test("a whole ayah lands on the right surah and ayah", () => {
  const hits = new QuranLocator(index).locate(B);
  assert.equal(hits[0].surah, 1);
  assert.equal(hits[0].ayah, 2);
  assert.equal(hits[0].wordInAyah, 0);
});

test("starting mid-ayah reports where in the ayah it started", () => {
  const hits = new QuranLocator(index).locate("مالك يوم الدين اياك نعبد");
  assert.equal(hits[0].surah, 1);
  assert.equal(hits[0].ayah, 2);
  assert.equal(hits[0].wordInAyah, 2, "third word of the ayah");
});

test("recitation crossing an ayah boundary still resolves", () => {
  // The trigram spanning the boundary only exists because the index runs over a
  // continuous stream; per-ayah indexing would lose it entirely.
  const hits = new QuranLocator(index).locate("رب العالمين الرحمن الرحيم");
  assert.equal(hits[0].surah, 1);
  assert.equal(hits[0].ayah, 1);
});

test("too few words is no answer, not a guess", () => {
  const locator = new QuranLocator(index);
  assert.equal(locator.locate("الحمد").length, 0, "one word");
  assert.equal(locator.locate("الحمد لله").length, 0, "two words");
});

test("text that isn't in the corpus returns nothing", () => {
  const hits = new QuranLocator(index).locate("سبحان الذي سخر لنا هذا وما كنا له مقرنين");
  assert.equal(hits.length, 0);
});

test("a repeated verse comes back as several candidates, not one certainty", () => {
  const hits = new QuranLocator(index).locate(REFRAIN, 3);
  assert.ok(hits.length > 1, `expected alternatives, got ${hits.length}`);
  assert.ok(
    hits.every((h) => h.surah === 55),
    "every candidate is in the surah that repeats it",
  );
  const ayahs = hits.map((h) => h.ayah).sort();
  assert.deepEqual(ayahs, [1, 3, 5], "all three occurrences offered");
});

test("context around a repeated verse disambiguates it", () => {
  // The refrain alone is ambiguous; the words leading into it are not.
  const hits = new QuranLocator(index).locate(`${D} ${REFRAIN}`);
  assert.equal(hits[0].surah, 55);
  assert.equal(hits[0].ayah, 2, "the D that precedes the second refrain");
});

test("a dropped word does not break the match", () => {
  // "الرحمن الرحيم مالك يوم الدين" with "مالك" missed by the recognizer. Every
  // trigram spanning the gap is destroyed, so this is the bigram tier working.
  const hits = new QuranLocator(index).locate("الرحمن الرحيم يوم الدين اياك نعبد");
  assert.ok(hits.length > 0, "should still find it");
  assert.equal(hits[0].surah, 1);
  assert.equal(hits[0].ayah, 2);
});

test("tashkeel and dagger alef fold away before matching", () => {
  // What the page holds is fully vocalized; what Whisper returns is not.
  const hits = new QuranLocator(index).locate("ٱلرَّحْمَٰنِ ٱلرَّحِيمِ مَٰلِكِ يَوْمِ ٱلدِّينِ");
  assert.equal(hits[0].surah, 1);
  assert.equal(hits[0].ayah, 2);
});

test("more evidence behind a long unambiguous run than a short one", () => {
  const locator = new QuranLocator(index);
  const short = locator.locate(A);
  const long = locator.locate(`${A} ${B}`);
  assert.ok(long[0].confidence >= short[0].confidence);
  assert.ok(long[0].votes > short[0].votes);
});

test("resolving never runs off the end of the corpus", () => {
  const hits = new QuranLocator(index).locate(REFRAIN, 5);
  for (const h of hits) {
    assert.ok(h.ayah >= 1 && h.ayah <= 5);
    assert.ok(h.wordInAyah >= 0);
  }
});
