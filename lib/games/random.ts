// Seeded, deterministic randomness for the games. A challenge link carries a
// seed; both players' clients must derive the exact same rounds, blanks, and
// option order from it, so nothing here may use Math.random().

/** mulberry32 — tiny seeded PRNG, uniform in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh random 31-bit seed for starting a new game (not deterministic). */
export function newSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/** Fisher–Yates shuffle into a new array, driven by the given PRNG. */
export function shuffled<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `take` distinct indices out of [0, count), in ascending order. */
export function sampleIndices(count: number, take: number, rand: () => number): number[] {
  const all = Array.from({length: count}, (_, i) => i);
  return shuffled(all, rand)
    .slice(0, Math.min(take, count))
    .sort((a, b) => a - b);
}
