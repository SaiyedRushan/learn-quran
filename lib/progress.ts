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

  return { read, subscribe, has, set };
}

const EMPTY: string[] = [];

// ── Learned guides (by slug) ────────────────────────────────────────────
const guideStore = createStore("lq:learned:v2");

export function useLearned(): string[] {
  return useSyncExternalStore(guideStore.subscribe, guideStore.read, () => EMPTY);
}

export function useIsLearned(slug: string): boolean {
  return useLearned().includes(slug);
}

export function setLearned(slug: string, value: boolean): void {
  guideStore.set(slug, value);
}

export function useToggleLearned(slug: string): () => void {
  return useCallback(() => guideStore.set(slug, !guideStore.has(slug)), [slug]);
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
