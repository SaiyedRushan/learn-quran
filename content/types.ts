// ──────────────────────────────────────────────────────────────────────────
// Content schema for Learn Quran.
//
// Two layers, kept deliberately separate:
//   1. VERIFIED verse data (Arabic + translation) — fetched from a trusted
//      Quran API (alquran.cloud: Uthmani text + Sahih International). Never
//      hand-typed or model-generated. Lives in content/quran/{num}.json.
//   2. The authored GUIDE layer (overview, sections, memory hooks, vocab,
//      recitation) — references verses by range so the sacred text always
//      renders from the verified source, not from the guide.
// ──────────────────────────────────────────────────────────────────────────

export type PillColor = "teal" | "purple" | "amber" | "coral" | "slate";

/** A single verified verse. */
export interface Ayah {
  number: number; // ayah number within the surah (1-indexed)
  arabic: string; // verified Uthmani text (bismillah stripped from ayah 1)
  translation: string; // verified English (Sahih International)
}

/** Verified surah text — the output of the fetch script. */
export interface VerseData {
  number: number; // surah number 1..114
  arabicName: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  ayahs: Ayah[];
}

/** A factual stat shown in the top banner grid. */
export interface SurahStat {
  label: string;
  value: string;
}

/** Surah metadata for the banner + index card. */
export interface SurahMeta {
  number: number; // 1..114
  slug: string; // "al-mutaffifin"
  name: string; // "Al-Mutaffifin"
  epithet: string; // "The Defrauders"
  arabicName: string; // "سُورَةُ الْمُطَفِّفِين"
  juz: number; // primary juz (30 for everything we ship first)
  revelationType: "Makkan" | "Madinan";
  /** Free-text detail shown in the meta line, e.g. "Transitional (late Makkan / early Madinan)". */
  revelationDetail: string;
  verseCount: number;
  rukus?: number;
  stats: SurahStat[]; // Verses / Words / Letters / Revelation order, etc.
}

/** A context / hadith callout in the overview. */
export interface GuideBanner {
  label: string;
  text: string;
  attribution?: string;
}

export interface Theme {
  text: string;
  color: PillColor;
}

/** A coloured note block inside a section. Maps to the original CSS note styles. */
export interface GuideNote {
  kind: "core" | "memory" | "extra" | "teal";
  label: string;
  text: string; // limited inline HTML allowed: <em>, <strong>
}

/**
 * A display chunk inside a section. References verified ayahs by range — the
 * component pulls the Arabic + translation from VerseData, never from here.
 */
export interface VerseGroup {
  from: number;
  to: number;
}

export interface GuideSection {
  badge: string; // "Section 1"
  color: PillColor;
  title: string;
  from: number; // first ayah of the section
  to: number; // last ayah of the section
  groups: VerseGroup[]; // how to chunk the section's verses for display
  notes: GuideNote[]; // core message, memory hooks, extra notes (order preserved)
}

export interface VocabItem {
  arabic: string;
  roman: string;
  english: string;
  where: string; // "v.1 — ..."
}

export interface VocabGroup {
  title: string;
  items: VocabItem[];
}

export interface RecitationCard {
  icon: string; // "A", "B", "C"
  title: string;
  sub: string;
  rows: string[]; // bullet texts (inline <em>/<strong> allowed)
}

export interface RecitationStop {
  verse: string; // "v.6"
  text: string;
}

export interface RecitationGuide {
  intro?: { label: string; text: string };
  cards: RecitationCard[];
  stopsLabel?: string;
  stops: RecitationStop[];
}

/**
 * The full authored guide for one surah. Composed at render time with the
 * matching VerseData to produce the page.
 */
export interface SurahGuide {
  meta: SurahMeta;
  overview: string; // paragraphs separated by \n\n; inline <em> allowed
  banners: GuideBanner[];
  themes: Theme[];
  sections: GuideSection[];
  vocab: VocabGroup[];
  recitation: RecitationGuide;
  /**
   * "draft"   = AI-drafted, pending review (shows the review banner)
   * "reviewed" = verified by a qualified reviewer (no banner)
   */
  reviewStatus: "draft" | "reviewed";
}
