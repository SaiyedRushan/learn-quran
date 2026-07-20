"use client";

// User display settings (font scaling), persisted to localStorage and applied
// as CSS variables (--scale-ar / --scale-en) on <html>. A small inline script
// in the layout applies them before paint to avoid a flash; this store keeps
// them reactive and lets the settings dialog read/update them.

import {useSyncExternalStore} from "react";

export const STORAGE_KEY = "lq:settings:v1";
export const SCALE_MIN = 0.85;
export const SCALE_MAX = 1.6;
export const SCALE_STEP = 0.05;

export interface Settings {
  arabicScale: number;
  englishScale: number;
  // Zen mode: strip the teaching layer (overview, notes, tabs, vocab, etc.)
  // and show only the Arabic text with its English translation.
  zenMode: boolean;
  // Show the romanized (ALA-LC) transliteration line beneath each verse.
  showTransliteration: boolean;
  // Play a subtle click sound when tapping buttons, links, and other controls.
  clickSound: boolean;
}

export const DEFAULTS: Settings = {arabicScale: 1, englishScale: 1, zenMode: false, showTransliteration: true, clickSound: true};

let cache: Settings | null = null;
const listeners = new Set<() => void>();

const clamp = (n: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(n * 100) / 100));

function read(): Settings {
  if (cache) return cache;
  let value: Settings = DEFAULTS;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) value = {...DEFAULTS, ...JSON.parse(raw)};
    } catch {
      value = DEFAULTS;
    }
  }
  cache = value;
  return value;
}

function apply(s: Settings): void {
  if (typeof document === "undefined") return;
  const d = document.documentElement;
  d.style.setProperty("--scale-ar", String(s.arabicScale));
  d.style.setProperty("--scale-en", String(s.englishScale));
}

function write(next: Settings): void {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  apply(next);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      apply(read());
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  const next = typeof value === "number" ? clamp(value) : value;
  write({...read(), [key]: next});
}

export function resetSettings(): void {
  write(DEFAULTS);
}
