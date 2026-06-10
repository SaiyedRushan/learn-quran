"use client";

// localStorage-backed progress, shared across components via useSyncExternalStore.
// Two independent lists:
//   - learned surahs        (number[])         key: lq:learned:v1
//   - learned sections      (string[] "s:i")   key: lq:sections:v1
// No backend, no login.

import { useSyncExternalStore, useCallback } from "react";

function createStore<T extends string | number>(key: string) {
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();

  function read(): T[] {
    if (cache) return cache;
    if (typeof window === "undefined") return (cache = []);
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: T[]): void {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode) — keep in-memory only */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null; // re-read after another tab's write
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  function has(value: T): boolean {
    return read().includes(value);
  }

  function set(value: T, on: boolean): void {
    const cur = read();
    const present = cur.includes(value);
    if (on && !present) write([...cur, value]);
    else if (!on && present) write(cur.filter((v) => v !== value));
  }

  return { read, write, subscribe, has, set };
}

const EMPTY: never[] = [];

// ── Surahs ──────────────────────────────────────────────────────────────
const surahStore = createStore<number>("lq:learned:v1");

export function useLearned(): number[] {
  return useSyncExternalStore(surahStore.subscribe, surahStore.read, () => EMPTY);
}

export function useIsLearned(num: number): boolean {
  return useLearned().includes(num);
}

export function setLearned(num: number, value: boolean): void {
  surahStore.set(num, value);
}

export function useToggleLearned(num: number): () => void {
  return useCallback(() => surahStore.set(num, !surahStore.has(num)), [num]);
}

// ── Sections (within a surah) ───────────────────────────────────────────
const sectionStore = createStore<string>("lq:sections:v1");
const secKey = (surah: number, index: number) => `${surah}:${index}`;

/** All learned section indices for a surah (reactive). */
export function useLearnedSections(surah: number): number[] {
  const all = useSyncExternalStore(
    sectionStore.subscribe,
    sectionStore.read,
    () => EMPTY
  );
  const prefix = `${surah}:`;
  return all
    .filter((k) => k.startsWith(prefix))
    .map((k) => Number(k.slice(prefix.length)));
}

export function setSectionLearned(
  surah: number,
  index: number,
  value: boolean
): void {
  sectionStore.set(secKey(surah, index), value);
}
