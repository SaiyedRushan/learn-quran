// Round construction for the fill-in-the-blank quiz. Deterministic for a given
// (verses, seed, level) so a challenge link reproduces the identical puzzle.

import type {Ayah} from "@/content/types";
import {mulberry32, sampleIndices, shuffled} from "./random";

export const QUIZ_LEVELS = [
  {label: "Easy", blanks: 1, distractors: 3},
  {label: "Medium", blanks: 2, distractors: 4},
  {label: "Hard", blanks: 3, distractors: 5},
] as const;

/** One option chip in the word bank. Chips are instances, not unique texts —
 * a word blanked twice in a verse needs two chips. */
export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizRound {
  ayah: Ayah;
  /** The ayah's Arabic words in order. */
  words: string[];
  /** Indices into `words` that are blanked, ascending. */
  blanks: number[];
  /** Shuffled bank: one chip per blank's correct word + distractors. */
  options: QuizOption[];
}

/** Total blanks across a quiz — the max score. */
export function totalBlanks(rounds: QuizRound[]): number {
  return rounds.reduce((s, r) => s + r.blanks.length, 0);
}

export function buildQuiz(ayahs: Ayah[], seed: number, level: number): QuizRound[] {
  const cfg = QUIZ_LEVELS[Math.max(0, Math.min(QUIZ_LEVELS.length - 1, level))];
  const rand = mulberry32(seed);

  const wordsPerAyah = ayahs.map((a) => a.arabic.split(/\s+/).filter(Boolean));

  // Distractors come from the same surah so they look plausible; dedupe by
  // text so the bank never carries two identical wrong chips.
  const allWords = Array.from(new Set(wordsPerAyah.flat()));

  let chipId = 0;
  return ayahs.map((ayah, ai) => {
    const words = wordsPerAyah[ai];
    // Never blank more than half the verse (short verses stay solvable), but
    // always blank at least one word.
    const blankCount = Math.max(1, Math.min(cfg.blanks, Math.floor(words.length / 2)));
    const blanks = sampleIndices(words.length, blankCount, rand);
    const correctTexts = new Set(blanks.map((b) => words[b]));

    // Prefer distractors of similar length to the answers so length alone
    // doesn't give the answer away. Random tiebreak via pre-shuffle.
    const avgLen = blanks.reduce((s, b) => s + words[b].length, 0) / blanks.length;
    const distractors = shuffled(
      allWords.filter((w) => !correctTexts.has(w)),
      rand,
    )
      .sort((a, b) => Math.abs(a.length - avgLen) - Math.abs(b.length - avgLen))
      .slice(0, cfg.distractors);

    const options = shuffled(
      [...blanks.map((b) => words[b]), ...distractors].map((text) => ({id: chipId++, text})),
      rand,
    );

    return {ayah, words, blanks, options};
  });
}
