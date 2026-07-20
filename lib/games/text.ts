// The verse text contains whitespace-separated tokens that are orthography,
// not words: Arabic waqf pause marks (ۖ ۚ ۗ …), the rubʿ el-hizb (۞), the
// sajdah mark (۩), and in the English, bare dashes and stray quotes. They
// belong in the *displayed* text but must never become a blank, a bank tile,
// or a distractor.

/** True if the token contains at least one Arabic letter (incl. alef wasla). */
export function isArabicWord(token: string): boolean {
  return /[ء-يٱ]/.test(token);
}

/** True if the token contains at least one Latin letter or digit. */
export function isEnglishWord(token: string): boolean {
  return /[a-zA-Z0-9]/.test(token);
}
