// Central site metadata — single source of truth for URLs, brand, and the
// values reused across page metadata, structured data (JSON-LD), and the sitemap.

export const SITE = {
  name: "Learn Quran",
  url: "https://learn-quran.app",
  tagline: "Memorize the Quran, Juz by Juz — with understanding",
  description:
    "Free, structured section-by-section guides for memorizing and understanding the Quran — Juz 29 (Tabārak) and Juz 30 (Juz ʿAmma). Verified Arabic text and translation, key vocabulary, memory hooks, and recitation guidance.",
  locale: "en_US",
} as const;

/** Absolute URL for a site-relative path (e.g. "/blog/" → "https://…/blog/"). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
