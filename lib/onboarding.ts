"use client";

// First-run product tour: a one-time flag in localStorage (same no-backend
// pattern as lib/progress and lib/settings) plus a window event so any button
// — like "Take the tour" on the About page — can reopen the walkthrough that
// lives in the layout.

export const ONBOARDED_KEY = "lq:onboarded:v1";
export const OPEN_TOUR_EVENT = "lq:open-tour";

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return true; // storage blocked — don't nag on every visit
  }
}

export function markOnboarded(): void {
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    /* storage unavailable — the tour just won't be remembered */
  }
}

/** Reopen the tour on demand (from anywhere in the app). */
export function openTour(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_TOUR_EVENT));
}
