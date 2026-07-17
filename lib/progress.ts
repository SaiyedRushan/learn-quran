"use client";

// localStorage-backed progress, shared across components via useSyncExternalStore.
// Keyed by guide SLUG (not surah number) because passages can share a number
// (e.g. ayat-al-kursi and al-baqarah-last-2 are both surah 2).
//   - learned guides    (string[] of slugs)        key: lq:learned:v2
//   - learned sections  (string[] "slug:index")    key: lq:sections:v2
// No backend, no login.

import { useSyncExternalStore, useCallback } from "react";

function createStore(key: string) {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  function read(): string[] {
    if (cache) return cache;
    if (typeof window === "undefined") return (cache = []);
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: string[]): void {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  function has(v: string): boolean {
    return read().includes(v);
  }

  function set(v: string, on: boolean): void {
    const cur = read();
    const present = cur.includes(v);
    if (on && !present) write([...cur, v]);
    else if (!on && present) write(cur.filter((x) => x !== v));
  }

  function update(fn: (cur: string[]) => string[]): void {
    write(fn(read()));
  }

  return { read, subscribe, has, set, update };
}

const EMPTY: string[] = [];

// ── Confidence per guide (by slug) ──────────────────────────────────────
// Replaces the old binary "learned" flag with a graded self-assessment:
//   0 none · 1 learning · 2 reviewing · 3 solid
// A surah counts as "learned/done" exactly when it reaches SOLID, so the
// existing learned API below is just a thin view over this store.
export const CONFIDENCE = {NONE: 0, LEARNING: 1, REVIEWING: 2, SOLID: 3} as const;
export type ConfidenceLevel = 0 | 1 | 2 | 3;

/** Display labels for each confidence level, indexed by level. */
export const CONFIDENCE_LABELS = ["Not started", "Learning", "Reviewing", "Solid"] as const;

const CONF_KEY = "lq:confidence:v1";
const LEGACY_LEARNED_KEY = "lq:learned:v2"; // pre-confidence binary store

function createConfidenceStore(key: string, legacyKey?: string) {
  let cache: Record<string, number> | null = null;
  const listeners = new Set<() => void>();

  function read(): Record<string, number> {
    if (cache) return cache;
    if (typeof window === "undefined") return (cache = {});
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return (cache = JSON.parse(raw) as Record<string, number>);
      // One-time migration: previously-learned items start at SOLID.
      const legacy = legacyKey ? window.localStorage.getItem(legacyKey) : null;
      const obj: Record<string, number> = {};
      if (legacy) {
        (JSON.parse(legacy) as string[]).forEach((id) => (obj[id] = CONFIDENCE.SOLID));
        window.localStorage.setItem(key, JSON.stringify(obj));
      }
      return (cache = obj);
    } catch {
      return (cache = {});
    }
  }

  function write(next: Record<string, number>): void {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  function get(slug: string): number {
    return read()[slug] ?? 0;
  }

  function set(slug: string, level: number): void {
    const cur = read();
    if ((cur[slug] ?? 0) === level) return;
    const next = {...cur};
    if (level <= 0) delete next[slug];
    else next[slug] = level;
    write(next);
  }

  return {read, subscribe, get, set};
}

const confStore = createConfidenceStore(CONF_KEY, LEGACY_LEARNED_KEY);
const EMPTY_CONF: Record<string, number> = {};

/** Every guide's confidence level, keyed by slug (reactive). */
export function useAllConfidence(): Record<string, number> {
  return useSyncExternalStore(confStore.subscribe, confStore.read, () => EMPTY_CONF);
}

export function useConfidence(slug: string): ConfidenceLevel {
  return (useAllConfidence()[slug] ?? 0) as ConfidenceLevel;
}

export function setConfidence(slug: string, level: ConfidenceLevel): void {
  confStore.set(slug, level);
}

// ── Learned guides — now a view over confidence (learned ⇔ SOLID) ────────
export function useLearned(): string[] {
  const all = useAllConfidence();
  return Object.keys(all).filter((slug) => all[slug] >= CONFIDENCE.SOLID);
}

export function useIsLearned(slug: string): boolean {
  return useConfidence(slug) >= CONFIDENCE.SOLID;
}

export function setLearned(slug: string, value: boolean): void {
  confStore.set(slug, value ? CONFIDENCE.SOLID : CONFIDENCE.NONE);
}

export function useToggleLearned(slug: string): () => void {
  return useCallback(
    () => confStore.set(slug, confStore.get(slug) >= CONFIDENCE.SOLID ? CONFIDENCE.NONE : CONFIDENCE.SOLID),
    [slug],
  );
}

// ── Intention: the reader's own "why", shown at the top of the home page ──
// A single free-text note the reader writes to remind themselves why they're
// learning — persisted like everything else, no backend.
function createTextStore(key: string) {
  let cache: string | null = null;
  const listeners = new Set<() => void>();

  function read(): string {
    if (cache !== null) return cache;
    if (typeof window === "undefined") return (cache = "");
    try {
      cache = window.localStorage.getItem(key) ?? "";
    } catch {
      cache = "";
    }
    return cache;
  }

  function write(next: string): void {
    cache = next;
    try {
      if (next) window.localStorage.setItem(key, next);
      else window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { read, write, subscribe };
}

const intentionStore = createTextStore("lq:intention:v1");

/** The reader's intention note (reactive). Empty string when unset. */
export function useIntention(): string {
  return useSyncExternalStore(intentionStore.subscribe, intentionStore.read, () => "");
}

export function setIntention(text: string): void {
  intentionStore.write(text.trim());
}

// ── Learned sections (by "slug:index") ──────────────────────────────────
const sectionStore = createStore("lq:sections:v2");
const secKey = (slug: string, index: number) => `${slug}:${index}`;

/** Every learned section key ("slug:index") across all guides (reactive). */
export function useAllLearnedSectionKeys(): string[] {
  return useSyncExternalStore(sectionStore.subscribe, sectionStore.read, () => EMPTY);
}

/** Learned section indices for one guide (reactive). */
export function useLearnedSections(slug: string): number[] {
  const all = useAllLearnedSectionKeys();
  const prefix = `${slug}:`;
  return all
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(k.slice(prefix.length)));
}

export function setSectionLearned(slug: string, index: number, value: boolean): void {
  sectionStore.set(secKey(slug, index), value);
}

/** Mark every section of a guide learned (or not) in a single write — used when
 * the whole surah is toggled from the list so its sections stay in sync. */
export function setAllSectionsLearned(slug: string, count: number, value: boolean): void {
  const prefix = `${slug}:`;
  const keys = Array.from({length: count}, (_, i) => secKey(slug, i));
  sectionStore.update((cur) => {
    const others = cur.filter((k) => !k.startsWith(prefix));
    return value ? [...others, ...keys] : others;
  });
}

// ── Weak spots: words you forgot, keyed by "slug:ayah:wordIndex" ─────────
// wordIndex is the word's position within its ayah (Arabic split on
// whitespace) — stable whether you're testing a section or the whole surah.
const weakStore = createStore("lq:weak:v1");
const weakKey = (slug: string, ayah: number, word: number) => `${slug}:${ayah}:${word}`;

export interface WeakSpot {
  ayah: number;
  word: number;
}

function useAllWeakKeys(): string[] {
  return useSyncExternalStore(weakStore.subscribe, weakStore.read, () => EMPTY);
}

/** Flagged word positions for one guide (reactive). */
export function useWeakSpots(slug: string): WeakSpot[] {
  const all = useAllWeakKeys();
  const prefix = `${slug}:`;
  return all
    .filter((k) => k.startsWith(prefix))
    .map((k) => {
      const parts = k.split(":");
      return {ayah: Number(parts[1]), word: Number(parts[2])};
    });
}

export function setWeakSpot(slug: string, ayah: number, word: number, value: boolean): void {
  weakStore.set(weakKey(slug, ayah, word), value);
}

/** Drop every weak-spot flag for one guide. */
export function clearGuideWeakSpots(slug: string): void {
  weakStore.update((cur) => cur.filter((k) => !k.startsWith(`${slug}:`)));
}

// ── Collapsed home-page collections (by collection key) ─────────────────
// Which surah groups the user has collapsed on the index. Default (absent) is
// expanded; a key present in the set means that group is collapsed. Persisted
// so the choice survives reloads.
const collapseStore = createStore("lq:collapsed:v1");

/** The set of collapsed collection keys (reactive). */
export function useCollapsedCollections(): string[] {
  return useSyncExternalStore(collapseStore.subscribe, collapseStore.read, () => EMPTY);
}

export function setCollectionCollapsed(key: string, collapsed: boolean): void {
  collapseStore.set(key, collapsed);
}

// ── Prayer dua confidence (by dua name) ─────────────────────────────────
// Same graded self-assessment as surahs; the old binary "learned" store
// (lq:duas:v1) migrates so previously-checked duas start at SOLID.
const duaConfStore = createConfidenceStore("lq:dua-confidence:v1", "lq:duas:v1");

/** Every dua's confidence level, keyed by dua name (reactive). */
export function useAllDuaConfidence(): Record<string, number> {
  return useSyncExternalStore(duaConfStore.subscribe, duaConfStore.read, () => EMPTY_CONF);
}

export function setDuaConfidence(id: string, level: ConfidenceLevel): void {
  duaConfStore.set(id, level);
}

/** Duas that count as learned (confidence ⩾ SOLID), reactive. */
export function useLearnedDuaKeys(): string[] {
  const all = useAllDuaConfidence();
  return Object.keys(all).filter((id) => all[id] >= CONFIDENCE.SOLID);
}
