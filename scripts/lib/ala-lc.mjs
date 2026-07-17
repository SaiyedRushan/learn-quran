// Rule-based ALA-LC transliterator for fully-vocalized Quranic Arabic
// (alquran.cloud "quran-simple" / Imlaei edition).
//
// This is a deterministic function of the verified Arabic text — not a
// model-generated guess. It produces the diacritic-rich, pronunciation-oriented
// romanization used elsewhere in the app (the duas): ʿ for ʿayn, ʾ for medial
// hamza, macrons for long vowels (ā ī ū), dots under emphatics (ḥ ṣ ḍ ṭ ẓ),
// doubled consonants for shadda, and the definite article assimilated into sun
// letters ("ash-shams", "ar-raḥmān"). Reading is continuous (waṣl); the final
// short vowel / tanwīn of each ayah's last word is dropped (pausal / waqf).
//
// Scope note: it models grammar-level romanization (article assimilation,
// hamzat-al-waṣl elision, long vowels, diphthongs, tanwīn) but not tajwīd-level
// euphonic assimilation (idghām/ikhfāʾ), matching standard scholarly practice.

const FATHA = "َ";
const KASRA = "ِ";
const DAMMA = "ُ";
const FATHATAN = "ً";
const KASRATAN = "ٍ";
const DAMMATAN = "ٌ";
const SHADDA = "ّ";
const SUKUN = "ْ";
const DAGGER_ALIF = "ٰ"; // superscript alif → long ā
const ALIF = "ا";
const WAW = "و";
const YA = "ي";
const LAM = "ل";
const HA = "ه";
const ALIF_MADDA = "آ";
const ALIF_MAQSURA = "ى";

const SHORT_VOWELS = new Set([FATHA, KASRA, DAMMA]);
const TANWIN = new Set([FATHATAN, KASRATAN, DAMMATAN]);
const MARKS = new Set([
  FATHA, KASRA, DAMMA, FATHATAN, KASRATAN, DAMMATAN, SHADDA, SUKUN, DAGGER_ALIF,
]);

// Base consonant → romanization.
const CONS = {
  "ء": "ʾ", // hamza ء
  "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "ḥ",
  "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
  "س": "s", "ش": "sh", "ص": "ṣ", "ض": "ḍ", "ط": "ṭ",
  "ظ": "ẓ", "ع": "ʿ", "غ": "gh", "ف": "f", "ق": "q",
  "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h",
  "ة": "t", // tāʾ marbūṭa
  "و": "w", "ي": "y",
};

// Hamza carriers: word-initial → silent glottal stop (bare vowel); else ʾ.
const HAMZA_CARRIERS = new Set(["أ", "إ", "ؤ", "ئ", "ء", ALIF_MADDA]);

// Single-letter proclitic particles that attach to the front of a word (wa-,
// fa-, bi-, ka-, ta-). After one of these, an alif + doubled lām is the waṣl
// alif of the relative pronoun ("wa-lladhī"), not a long ā ("wālid" keeps its ā
// because its lām is voweled, not doubled).
const PREFIX_PARTICLES = new Set(["و", "ف", "ب", "ك", "ت"]);

// Sun letters — the article's lām assimilates into these.
const SUN = new Set([
  "ت", "ث", "د", "ذ", "ر", "ز", "س", "ش",
  "ص", "ض", "ط", "ظ", "ل", "ن",
]);

// The name Allāh and its prefixed forms are irregular (the long ā is unwritten),
// so they are matched by consonant skeleton and rendered directly.
const ALLAH_STEMS = {
  "الله": "Allāh", // الله
  "بالله": "billāh", // بالله
  "تالله": "tallāh", // تالله
  "لله": "lillāh", // لله
  "اللهم": "Allāhumma", // اللهم
};

const stripMarks = (s) => [...s].filter((c) => !MARKS.has(c)).join("");
const hasShortVowel = (s) =>
  [...s].some((c) => SHORT_VOWELS.has(c) || TANWIN.has(c));

// Muqaṭṭaʿāt — the disjoined letter openings, recited as individual letter
// names. Keyed by the bare (mark-free) letters; only matched when the token
// carries no short vowels, so real words like "alam" (أَلَمْ) never collide.
const MUQATTAAT = {
  "الم": "Alif Lām Mīm",
  "المص": "Alif Lām Mīm Ṣād",
  "الر": "Alif Lām Rā",
  "المر": "Alif Lām Mīm Rā",
  "كهيعص": "Kāf Hā Yā ʿAyn Ṣād",
  "طه": "Ṭā Hā",
  "طسم": "Ṭā Sīn Mīm",
  "طس": "Ṭā Sīn",
  "يس": "Yā Sīn",
  "ص": "Ṣād",
  "حم": "Ḥā Mīm",
  "عسق": "ʿAyn Sīn Qāf",
  "ق": "Qāf",
  "ن": "Nūn",
};

function isConsonant(ch) {
  return CONS[ch] !== undefined || HAMZA_CARRIERS.has(ch);
}

function consonantSound(ch, atWordStart) {
  if (HAMZA_CARRIERS.has(ch)) return atWordStart ? "" : "ʾ";
  return CONS[ch] ?? "";
}

// Marks attached to the letter at `idx`, and the index of the next base char.
function scanMarks(chars, idx) {
  const marks = new Set();
  let j = idx + 1;
  while (j < chars.length && MARKS.has(chars[j])) {
    marks.add(chars[j]);
    j++;
  }
  return {marks, next: j};
}

// A waw/ya acts as a long-vowel mater (ū/ī) or glide (aw/ay) unless it carries
// its own short vowel, in which case it is a consonant.
function carriesOwnVowel(chars, idx) {
  const {marks} = scanMarks(chars, idx);
  for (const m of marks) if (SHORT_VOWELS.has(m) || TANWIN.has(m)) return true;
  return false;
}

// Is the alif at `idx` the hamzat-al-waṣl alif of a definite article (…al-…)?
function isArticleAlif(chars, idx) {
  if (chars[idx] !== ALIF || chars[idx + 1] !== LAM) return false;
  const lamMarks = scanMarks(chars, idx + 1).marks;
  if (lamMarks.has(SUKUN)) return true; // moon article
  const sunIdx = idx + 2;
  const sunMarks = chars[sunIdx] ? scanMarks(chars, sunIdx).marks : new Set();
  return !lamMarks.has(SHADDA) && !hasVowel(lamMarks) && SUN.has(chars[sunIdx]) && sunMarks.has(SHADDA);
}

// Is the alif at `idx` a hamzat-al-waṣl (a connective alif that elides in
// continuous reading)? True for the article and for the initial-cluster alif of
// words like "imraʾah"/"istaghfara" — detected by a following sukun-bearing
// consonant. A long-ā mater alif, by contrast, precedes a voweled consonant.
function isWaslAlif(chars, idx) {
  if (chars[idx] !== ALIF) return false;
  if (isArticleAlif(chars, idx)) return true;
  const nextLetter = chars[idx + 1];
  if (!isConsonant(nextLetter)) return false;
  return scanMarks(chars, idx + 1).marks.has(SUKUN);
}

function transliterateWord(word, {pausal, sentenceStart}) {
  const skeleton = stripMarks(word);
  if (ALLAH_STEMS[skeleton]) {
    return renderAllah(ALLAH_STEMS[skeleton], word, {pausal, sentenceStart});
  }

  const chars = [...word];
  let out = "";
  let started = false;
  let suppressShadda = false; // one-shot: don't double the assimilated sun letter
  let firstConsonant = true; // is the next consonant the word's first?
  let afterLiLaPrefix = false; // previous letter was a li-/la- proclitic lām
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    // Definite article: bare alif (hamzat al-waṣl) + lām.
    if (ch === ALIF && chars[i + 1] === LAM) {
      const lamMarks = scanMarks(chars, i + 1).marks;
      const sunIdx = i + 2;
      const sunLetter = chars[sunIdx];
      const sunMarks = sunLetter ? scanMarks(chars, sunIdx).marks : new Set();
      const isMoon = lamMarks.has(SUKUN);
      const isSun = !lamMarks.has(SUKUN) && !lamMarks.has(SHADDA) && !hasVowel(lamMarks) && SUN.has(sunLetter) && sunMarks.has(SHADDA);

      if (isMoon || isSun) {
        const vowel = started ? "" : "a";
        if (isSun) {
          out += vowel + CONS[sunLetter] + "-";
          suppressShadda = true;
        } else {
          out += vowel + "l-";
        }
        started = true;
        i += 2; // consume alif + lām; the next letter is handled normally
        continue;
      }
      // Not a plain article (e.g. alladhī, where the lām itself is doubled):
      // treat the alif as a silent/utterance-initial waṣl and fall through.
      out += started ? "" : "a";
      started = true;
      i += 1;
      continue;
    }

    if (ch === ALIF_MADDA) {
      out += (started ? "ʾ" : "") + "ā";
      started = true;
      i += 1;
      continue;
    }

    // A bare alif not forming an article and not consumed as a long-vowel mater
    // is a connective hamzat-al-waṣl alif: it takes a helping vowel "i" at the
    // start of an utterance (e.g. "ihdinā") and elides otherwise.
    if (ch === ALIF) {
      if (!started) {
        out += "i";
        started = true;
      }
      i += 1;
      continue;
    }

    if (isConsonant(ch)) {
      const {marks, next} = scanMarks(chars, i);
      const isFirstConsonant = firstConsonant;
      firstConsonant = false;

      // Definite article after a li-/la- proclitic, whose alif elides in
      // spelling ("لِلْبَشَر" → lil-, "لِلسَّمْع" → lis-). A lām bearing its own
      // shadda here is the doubled lām of a pronoun (lilladhī) — leave it.
      if (ch === LAM && afterLiLaPrefix && !marks.has(SHADDA) && !hasVowel(marks)) {
        afterLiLaPrefix = false;
        const sunLetter = chars[next];
        const sunMarks = sunLetter ? scanMarks(chars, next).marks : new Set();
        if (marks.has(SUKUN)) {
          out += "l-"; // moon: lil-/lal-
          i = next;
          continue;
        }
        if (SUN.has(sunLetter) && sunMarks.has(SHADDA)) {
          out += CONS[sunLetter] + "-"; // sun: assimilated (lis-, lish-, …)
          suppressShadda = true;
          i = next;
          continue;
        }
      }
      afterLiLaPrefix = isFirstConsonant && ch === LAM && (marks.has(KASRA) || marks.has(FATHA));

      let sound = consonantSound(ch, !started);
      if (marks.has(SHADDA) && sound && !suppressShadda) sound += sound;
      suppressShadda = false;
      out += sound;
      if (sound) started = true;

      const following = chars[next];

      // A prefix particle (wa-/fa-/…) followed by alif + doubled lām is the waṣl
      // alif of the relative pronoun ("wa-lladhī"), not the preceding letter's ā.
      const relPronounWasl =
        isFirstConsonant &&
        PREFIX_PARTICLES.has(ch) &&
        following === ALIF &&
        chars[next + 1] === LAM &&
        scanMarks(chars, next + 1).marks.has(SHADDA);

      // Superscript (dagger) alif is a long ā regardless of an accompanying fatḥa.
      if (marks.has(DAGGER_ALIF)) {
        out += "ā";
      } else if (marks.has(FATHA)) {
        if (following === WAW && !carriesOwnVowel(chars, next)) {
          out += "aw";
          i = next + 1;
          continue;
        }
        if (following === YA && !carriesOwnVowel(chars, next)) {
          out += "ay";
          i = next + 1;
          continue;
        }
        // A following alif is a long-ā mater — unless it is a connective waṣl
        // alif (article, "fa-nṣab"/"wa-mraʾah", or "wa-lladhī"), handled next pass.
        if (
          (following === ALIF && !isWaslAlif(chars, next) && !relPronounWasl) ||
          following === ALIF_MAQSURA
        ) {
          out += "ā";
          i = next + 1;
          continue;
        }
        out += "a";
      } else if (marks.has(DAMMA)) {
        if (following === WAW && !carriesOwnVowel(chars, next)) {
          out += "ū";
          i = skipMater(chars, next);
          continue;
        }
        out += "u";
      } else if (marks.has(KASRA)) {
        if (following === YA && !carriesOwnVowel(chars, next)) {
          out += "ī";
          i = skipMater(chars, next);
          continue;
        }
        out += "i";
      } else if (marks.has(FATHATAN)) {
        out += "an";
      } else if (marks.has(DAMMATAN)) {
        out += "un";
      } else if (marks.has(KASRATAN)) {
        out += "in";
      }
      // sukun / no mark → no vowel.

      i = next;
      continue;
    }

    i += 1; // stray diacritic
  }

  if (pausal) out = applyPause(out, word);
  if (sentenceStart) out = capitalize(out);
  return out;
}

const hasVowel = (marks) =>
  [...marks].some((m) => SHORT_VOWELS.has(m) || TANWIN.has(m));

// Advance past a ū/ī mater and any silent trailing alif (alif al-wiqāya).
function skipMater(chars, materIdx) {
  let j = scanMarks(chars, materIdx).next;
  if (chars[j] === ALIF) j += 1;
  return j;
}

// Pausal (waqf) ending: drop the final short vowel / tanwīn per the Arabic
// word's last mark; tanwīn fatḥ becomes a long ā.
function applyPause(roman, word) {
  const chars = [...word];
  let k = chars.length - 1;
  if (chars[k] === ALIF) k -= 1; // silent alif of tanwīn fatḥ
  while (k >= 0 && !MARKS.has(chars[k]) && !isConsonant(chars[k])) k -= 1;
  const finalMark = MARKS.has(chars[k]) ? chars[k] : null;

  if (finalMark === FATHATAN) return roman.replace(/an$/u, "ā");
  if (finalMark === DAMMATAN) return roman.replace(/un$/u, "");
  if (finalMark === KASRATAN) return roman.replace(/in$/u, "");
  if (finalMark === DAMMA) return roman.replace(/u$/u, "");
  if (finalMark === KASRA) return roman.replace(/i$/u, "");
  if (finalMark === FATHA) return roman.replace(/a$/u, "");
  return roman;
}

function renderAllah(stem, word, {pausal, sentenceStart}) {
  let out = stem;
  if (!pausal) {
    // Restore the case vowel carried on the final hāʾ.
    const chars = [...word];
    const haIdx = chars.lastIndexOf(HA);
    const marks = haIdx >= 0 ? scanMarks(chars, haIdx).marks : new Set();
    if (marks.has(DAMMA)) out += "u";
    else if (marks.has(KASRA)) out += "i";
    else if (marks.has(FATHA)) out += "a";
  }
  return sentenceStart ? capitalize(out) : out;
}

// Uppercase the first alphabetic letter, skipping leading glottal marks (ʾ ʿ)
// and treating the diacritic-bearing romanization letters (ā ī ū ṣ ḥ ḍ ṭ ẓ) as
// letters so they capitalize correctly (ṣ → Ṣ).
function capitalize(s) {
  for (let idx = 0; idx < s.length; idx++) {
    if (/[a-zāīūṣḥḍṭẓ]/iu.test(s[idx])) {
      return s.slice(0, idx) + s[idx].toUpperCase() + s.slice(idx + 1);
    }
  }
  return s;
}

// Transliterate a full ayah, joining words with waṣl liaison as in recitation:
// where a word begins with a connective alif (the definite article, "Allāh", or
// an imperative like "ihdinā"), its leading vowel elides and it attaches to the
// preceding vowel-final word with a hyphen ("Allāhu-ṣ-ṣamad", "huwa-llāhu").
// The last word is read in pause; the first word is capitalized.
export function transliterateAyah(arabic) {
  const words = arabic.trim().split(/\s+/);
  const rendered = words.map((w, idx) => {
    const letters = MUQATTAAT[stripMarks(w)];
    if (letters && !hasShortVowel(w)) return {roman: letters, wasl: false};
    return {
      roman: transliterateWord(w, {
        pausal: idx === words.length - 1,
        sentenceStart: idx === 0,
      }),
      // A word beginning with a bare alif (U+0627) opens with hamzat al-waṣl.
      wasl: w.startsWith(ALIF),
    };
  });

  let out = "";
  for (let idx = 0; idx < rendered.length; idx++) {
    const {roman, wasl} = rendered[idx];
    if (!roman) continue;
    if (idx > 0 && wasl && /[aiuāīū]$/u.test(out)) {
      out += "-" + roman.replace(/^[aiu]/iu, ""); // elide the leading waṣl vowel
    } else {
      out += out ? " " + roman : roman;
    }
  }
  return out.trim();
}
