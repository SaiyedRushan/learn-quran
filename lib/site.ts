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

// Mobile app store links. The Android build is on Play's open testing track —
// the link below is the tester opt-in page, not a normal store listing. The
// iOS build is still in App Store review, so there is no public URL yet: set
// `ios` to the App Store link once it's approved and the UI flips itself from
// "coming soon" to a live download button.
export const APPS = {
  android: "https://play.google.com/store/apps/details?id=app.learnquran.mobile",
  ios: null as string | null,
} as const;

/** Absolute URL for a site-relative path (e.g. "/blog/" → "https://…/blog/"). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
