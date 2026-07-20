"use client";

// Small Web Audio helper for the UI click sound. The clip is decoded once into
// an AudioBuffer and replayed via short-lived BufferSource nodes, so rapid
// clicks can overlap without the stutter of a single reused <audio> element.
// Everything is best-effort: if the browser lacks Web Audio, or decoding /
// playback fails, we silently do nothing rather than surface an error.

const SRC = "/click-sound.wav";
const VOLUME = 0.35;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let decoding: Promise<void> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

// Fetch + decode the clip ahead of time. Safe to call repeatedly; the work
// only runs once. Creates the AudioContext (suspended until a user gesture).
export function preloadClick(): void {
  const c = getCtx();
  if (!c || buffer || decoding) return;
  decoding = fetch(SRC)
    .then((r) => r.arrayBuffer())
    .then((a) => c.decodeAudioData(a))
    .then((b) => {
      buffer = b;
    })
    .catch(() => {
      /* offline, missing file, or unsupported codec — stay silent */
    });
}

// Play one click. Must be called from within a user gesture so the browser
// permits audio; a click handler qualifies. Skips silently if not ready yet.
export function playClick(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  if (!buffer) {
    preloadClick();
    return;
  }
  try {
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.value = VOLUME;
    src.connect(gain).connect(c.destination);
    src.start();
  } catch {
    /* ignore transient playback errors */
  }
}
