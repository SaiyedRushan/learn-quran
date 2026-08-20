// Server-side loader for the verified verse data. Reads the JSON produced by
// scripts/fetch-verses.mjs at build time (static export pre-renders everything,
// so file I/O here is fine and never reaches the client).

import fs from "node:fs";
import path from "node:path";
import type { VerseData, Ayah } from "@/content/types";

const QURAN_DIR = path.join(process.cwd(), "content", "quran");
const TEXT_DIR = path.join(process.cwd(), "public", "quran");

export function getVerseData(num: number): VerseData {
  const raw = fs.readFileSync(path.join(QURAN_DIR, `${num}.json`), "utf8");
  return JSON.parse(raw) as VerseData;
}

/** Arabic-only text for any of the 114 surahs (public/quran). Unlike
 *  getVerseData this carries no translation or transliteration — it backs
 *  recitation practice for surahs that have no memorization guide. */
export interface SurahText {
  number: number;
  arabicName: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  ayahs: {number: number; arabic: string}[];
}

export function getSurahText(num: number): SurahText {
  const raw = fs.readFileSync(path.join(TEXT_DIR, `${num}.json`), "utf8");
  return JSON.parse(raw) as SurahText;
}

/** Verses within an inclusive ayah range [from, to]. */
export function versesInRange(data: VerseData, from: number, to: number): Ayah[] {
  return data.ayahs.filter((a) => a.number >= from && a.number <= to);
}
