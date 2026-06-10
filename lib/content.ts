import juz30Json from "@/content/surah-index.json";
import virtuesJson from "@/content/virtues-index.json";
import { guides } from "@/content/guides";
import type { SurahGuide, Collection } from "@/content/types";

export interface IndexEntry {
  number: number;
  slug: string; // unique per entry (passages use distinct slugs)
  name: string;
  epithet: string;
  arabicName: string;
  juz: number;
  revelationType: "Makkan" | "Madinan";
  verseCount: number;
  collection: Collection;
  revelationOrder?: number;
  revelationOrdinal?: string | null;
  note?: string; // short recommendation shown on virtues cards (e.g. "Before sleep")
  passageRef?: string; // e.g. "Al-Baqarah 285–286"
}

/** Juz 30 surahs in mushaf order (78 → 114). */
export const juz30Index: IndexEntry[] = (juz30Json as Omit<IndexEntry, "collection">[])
  .map((e) => ({ ...e, collection: "juz30" as const }))
  .sort((a, b) => a.number - b.number);

/** Recommended recitations outside Juz 30 (Yasin, Al-Mulk, passages…). */
export const virtuesIndex: IndexEntry[] = virtuesJson as IndexEntry[];

/** Every entry, both collections. */
export const surahIndex: IndexEntry[] = [...juz30Index, ...virtuesIndex];

// Guides are keyed by slug (passages can share a surah number).
const guideBySlug = new Map(guides.map((g) => [g.meta.slug, g]));

export function getIndexBySlug(slug: string): IndexEntry | undefined {
  return surahIndex.find((s) => s.slug === slug);
}

export function getGuide(slug: string): SurahGuide | undefined {
  return guideBySlug.get(slug);
}

/** Previous / next entry within the same collection (for the pager). */
export function neighbours(slug: string): {
  prev?: IndexEntry;
  next?: IndexEntry;
} {
  const entry = getIndexBySlug(slug);
  if (!entry) return {};
  const list = entry.collection === "virtues" ? virtuesIndex : juz30Index;
  const i = list.findIndex((s) => s.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
  };
}
