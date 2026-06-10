// Server-side loader for the verified verse data. Reads the JSON produced by
// scripts/fetch-verses.mjs at build time (static export pre-renders everything,
// so file I/O here is fine and never reaches the client).

import fs from "node:fs";
import path from "node:path";
import type { VerseData, Ayah } from "@/content/types";

const QURAN_DIR = path.join(process.cwd(), "content", "quran");

export function getVerseData(num: number): VerseData {
  const raw = fs.readFileSync(path.join(QURAN_DIR, `${num}.json`), "utf8");
  return JSON.parse(raw) as VerseData;
}

/** Verses within an inclusive ayah range [from, to]. */
export function versesInRange(data: VerseData, from: number, to: number): Ayah[] {
  return data.ayahs.filter((a) => a.number >= from && a.number <= to);
}
