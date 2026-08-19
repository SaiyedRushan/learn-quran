// Run with: npm run test:recite
//
// The failure this guards against: Whisper running through silence, producing
// hallucinated transcripts, because a fixed RMS threshold sat below the room.
import assert from "node:assert/strict";
import {test} from "node:test";
import {VoiceDetector} from "./vad.ts";

/** Feed n chunks at a level, returning what fraction were called speech. */
function feed(vad: VoiceDetector, level: number, n: number, jitter = 0.15): number {
  let voiced = 0;
  for (let i = 0; i < n; i++) {
    // Real levels wobble; alternate above and below so the run isn't flat.
    const wobble = 1 + (i % 2 === 0 ? jitter : -jitter);
    if (vad.push(level * wobble)) voiced++;
  }
  return voiced / n;
}

test("digital silence is never speech", () => {
  const vad = new VoiceDetector();
  assert.equal(feed(vad, 0, 200), 0);
});

test("a quiet room is not speech, and normal recitation over it is", () => {
  const vad = new VoiceDetector();
  assert.equal(feed(vad, 0.001, 200), 0, "room tone alone");
  assert.ok(feed(vad, 0.05, 20) > 0.9, "reciting over it");
});

test("a noisy mic is not speech either — the floor adapts up to it", () => {
  const vad = new VoiceDetector();
  // 0.01 would have sailed past the old fixed 0.004 threshold and kept
  // inference running forever.
  assert.equal(feed(vad, 0.01, 200), 0, "room tone on a hot mic");
  assert.ok(feed(vad, 0.06, 20) > 0.9, "reciting over it");
});

test("long recitation does not mute itself", () => {
  const vad = new VoiceDetector();
  feed(vad, 0.001, 200);
  // Two minutes of reciting, breathing every ~4 s. The floor must not creep up
  // to the speech level and start calling it silence. This is what the history
  // window is sized for: it has to span at least one of those pauses.
  let voiced = 0;
  let total = 0;
  for (let block = 0; block < 30; block++) {
    for (let i = 0; i < 24; i++, total++) if (vad.push(0.05)) voiced++;
    for (let i = 0; i < 3; i++, total++) if (vad.push(0.0012)) voiced++;
  }
  assert.ok(voiced / total > 0.85, `only ${((voiced / total) * 100) | 0}% registered`);
});

test("dips between words stay speech, and real silence does not", () => {
  const vad = new VoiceDetector();
  feed(vad, 0.001, 200);
  // Alternating loud syllables and inter-word dips an order of magnitude down.
  let voiced = 0;
  for (let i = 0; i < 60; i++) if (vad.push(i % 3 === 2 ? 0.006 : 0.05)) voiced++;
  assert.ok(voiced > 30, "the loud chunks still register");
  // Then they stop: within a couple of seconds nothing is speech.
  assert.equal(feed(vad, 0.001, 200), 0);
});

test("falling quiet after speech drops the floor back down", () => {
  const vad = new VoiceDetector();
  feed(vad, 0.001, 200);
  feed(vad, 0.05, 40);
  feed(vad, 0.001, 200);
  // Back to room tone, so a quieter reciter is still heard.
  assert.ok(feed(vad, 0.02, 20) > 0.9);
});

test("reset forgets the room", () => {
  const vad = new VoiceDetector();
  feed(vad, 0.01, 200);
  const noisy = vad.threshold;
  vad.reset();
  assert.ok(vad.threshold < noisy);
});
