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

// The other apps built for the same reason. The full cards (<MoreApps />) run
// on the home page only; every other page gets just the one-line `short` list
// in the footer, so interior pages stay about the surah you came for. Each
// entry is duplicated (deliberately) in the sibling repos' own cross-promo
// blocks; keep the wording in sync when one of them changes. Omits Learn Quran
// itself.
export const FAMILY = [
  {
    name: "Hayya — Prayer Alarm",
    short: "Hayya",
    url: "https://saiyedrushan.github.io/hayya-site/",
    icon: "📞",
    platform: "iPhone · Android",
    blurb:
      "Prayer times that ring like an incoming call — full-screen, with a real ringtone, calling back until you answer. Answering logs the prayer and grows a streak you have to earn.",
  },
  {
    name: "Lower Your Gaze",
    short: "Lower Your Gaze",
    url: "https://lower-your-gaze.vercel.app",
    icon: "🌿",
    platform: "Web",
    blurb:
      "A quiet companion for guarding your gaze — a daily reminder, a check-in streak, a library of practical tactics, and a full-screen refuge for the moment an urge hits.",
  },
  {
    name: "HadithBot",
    short: "HadithBot",
    url: "https://saiyedrushan.github.io/HadithBot/",
    icon: "💬",
    platform: "Discord",
    blurb:
      "A Discord bot that posts a hadith and one of Allah's 99 names to your server every day, with slash commands to pull one whenever you want.",
  },
  {
    name: "Marketplace Du'a",
    short: "Marketplace Du'a",
    url: "https://saiyedrushan.github.io/marketplace-dua/",
    icon: "🛒",
    platform: "Chrome extension",
    blurb:
      "A browser extension that gently reminds you of the du'a for entering the marketplace when you land on Amazon, eBay, or any shop you add yourself.",
  },
] as const;

/** Absolute URL for a site-relative path (e.g. "/blog/" → "https://…/blog/"). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
