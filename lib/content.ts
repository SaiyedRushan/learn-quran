import indexJson from "@/content/surah-index.json";
import { guides } from "@/content/guides";
import type { SurahGuide } from "@/content/types";

export interface IndexEntry {
  number: number;
  slug: string;
  name: string;
  epithet: string;
  arabicName: string;
  juz: number;
  revelationType: "Makkan" | "Madinan";
  verseCount: number;
  revelationOrder: number;
  revelationOrdinal: string | null;
}

/** All Juz 30 surahs in mushaf order (78 → 114). */
export const surahIndex: IndexEntry[] = (indexJson as IndexEntry[])
  .slice()
  .sort((a, b) => a.number - b.number);

export function getIndexBySlug(slug: string): IndexEntry | undefined {
  return surahIndex.find((s) => s.slug === slug);
}

export function getIndexByNumber(num: number): IndexEntry | undefined {
  return surahIndex.find((s) => s.number === num);
}

export function getGuide(num: number): SurahGuide | undefined {
  return guides[num];
}

/** Previous / next surah in the index (for the pager). */
export function neighbours(num: number): {
  prev?: IndexEntry;
  next?: IndexEntry;
} {
  const i = surahIndex.findIndex((s) => s.number === num);
  return {
    prev: i > 0 ? surahIndex[i - 1] : undefined,
    next: i >= 0 && i < surahIndex.length - 1 ? surahIndex[i + 1] : undefined,
  };
}
