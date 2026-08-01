"use client";

// Dismissal for the "Get the app" banner on the home page — a one-time flag in
// localStorage (same no-backend pattern as lib/onboarding).
//
// The banner is rendered server-side and hidden with CSS rather than gated on a
// storage read, so it never flashes or shifts the page: the no-flash script in
// app/layout stamps DISMISSED_ATTR on <html> before paint, and globals.css
// hides .app-cta while that attribute is set. Dismissing sets both the flag and
// the attribute. The footer link stays put, so the app is never unreachable.

export const APP_CTA_DISMISSED_KEY = "lq:app-cta-dismissed:v1";
export const DISMISSED_ATTR = "data-app-cta";

export function dismissAppCta(): void {
  document.documentElement.setAttribute(DISMISSED_ATTR, "off");
  try {
    window.localStorage.setItem(APP_CTA_DISMISSED_KEY, "1");
  } catch {
    /* storage unavailable — the banner just returns on the next visit */
  }
}
