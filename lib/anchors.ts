// Stable DOM ids shared between Today's-plan links and the pages they scroll
// to, so a plan item can deep-link straight to the section it refers to.
// The link carries the id as a hash (/duas/#dua-…, /surah/slug/#sec-2); the
// destination page reads it on mount and scrolls the matching element into view.

/** Anchor id for a dua card, keyed on its (unique) name. */
export const duaAnchor = (name: string): string =>
  "dua-" +
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Anchor id for a surah-guide section, keyed on its index in the guide. */
export const sectionAnchor = (index: number): string => `sec-${index}`;

/** The `#…` fragment (without the `#`) of the current URL, or "" if none. */
export function currentHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}

/**
 * Scroll the element with the given id into view and briefly highlight it so
 * the reader can see where a plan link dropped them. Returns false if no such
 * element exists (e.g. the hash points nowhere on this page).
 */
export function flashScrollTo(id: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("scroll-flash");
  window.setTimeout(() => el.classList.remove("scroll-flash"), 1600);
  return true;
}
