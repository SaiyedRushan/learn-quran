// Is this chunk of mic audio speech, or is it the room?
//
// A fixed RMS threshold cannot work here: mic gain and ambient noise vary by
// orders of magnitude between machines, so any single number is either deaf on
// a quiet mic or permanently triggered on a noisy one — which is what had
// Whisper running (and hallucinating) through silence.
//
// The estimate is minimum statistics: the quietest chunk in the last few
// seconds is a good stand-in for the noise floor. During silence that is
// plainly the room, and even mid-recitation there are dips between words. The
// alternative — a running average that adapts during speech — pulls the floor
// up until speech stops clearing it, and one that only adapts during silence
// can never bootstrap on a noisy mic, because it starts out hearing speech
// everywhere.
//
// Pure module: no DOM, so it runs in tests under `node --test` (hence the
// explicit .ts extension, which Node's ESM resolver requires).

/**
 * Chunks kept for the floor estimate; ~30 s at the engine's 150 ms chunks.
 *
 * Long on purpose. The window has to contain a genuine pause — a breath, a gap
 * between ayahs — or the minimum is itself speech and the detector mutes
 * itself. The two directions are not symmetric: a new quiet chunk drops the
 * floor immediately, while raising it takes a full window as loud chunks age
 * out. That asymmetry is the safe way round, since a stale-low floor only
 * means running inference slightly too eagerly.
 */
const HISTORY = 200;
/** The window minimum sits below the true floor, so lift it a little. */
const FLOOR_SCALE = 1.5;
/** How far above the floor a chunk must sit to count as speech. */
const MARGIN = 2;
/** Digital-silence guard: below this nothing is speech, however quiet the room
 *  has been. Stops a perfectly silent input from making its own floor zero. */
const ABS_MIN = 0.0025;

export class VoiceDetector {
  private history = new Float32Array(HISTORY);
  private next = 0;
  private filled = 0;

  /** Feed one chunk's RMS. Returns whether it counts as speech. */
  push(level: number): boolean {
    this.history[this.next] = level;
    this.next = (this.next + 1) % HISTORY;
    if (this.filled < HISTORY) this.filled++;
    return level > this.threshold;
  }

  get floor(): number {
    if (this.filled === 0) return ABS_MIN;
    let min = Infinity;
    for (let i = 0; i < this.filled; i++) min = Math.min(min, this.history[i]);
    return min * FLOOR_SCALE;
  }

  get threshold(): number {
    return Math.max(ABS_MIN, this.floor * MARGIN);
  }

  reset(): void {
    this.history.fill(0);
    this.next = 0;
    this.filled = 0;
  }
}
