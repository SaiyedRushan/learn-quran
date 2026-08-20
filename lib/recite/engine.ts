// Client-side wrapper around the recitation ASR worker + mic capture, so the UI
// component only deals with cursor events.
import type {MatchToken} from "./matcher.ts";
import {MicCapture} from "./mic.ts";
import type {
  LocateEvent,
  LocateInbound,
  ReciteDevice,
  ReciteEvent,
  ReciteInbound,
  ReciteModel,
} from "./types.ts";

export type {ReciteEvent, ReciteDevice, ReciteModel, LocateEvent} from "./types.ts";
export type {LocateHit} from "./locate.ts";

export class ReciteEngine {
  private worker: Worker | null = null;
  private mic: MicCapture;
  private onEvent: (msg: ReciteEvent) => void;

  constructor(
    onEvent: (msg: ReciteEvent) => void,
    /** Per mic chunk (skipped while muted): a 0..1 meter level scaled against
     *  the measured noise floor, and whether the chunk counts as speech. */
    onLevel?: (level: number, voiced: boolean) => void,
  ) {
    this.onEvent = onEvent;
    this.mic = new MicCapture(
      (samples, voiced) => this.send({type: "audio", samples, voiced}, [samples.buffer]),
      onLevel,
    );
  }

  /** While true, mic chunks are dropped — used so the recognizer doesn't hear
   *  the reciter hint speaking the next words and advance the cursor itself. */
  get muted(): boolean {
    return this.mic.muted;
  }
  set muted(value: boolean) {
    this.mic.muted = value;
  }

  /** Spawn the inference worker and start loading the model. `tokens` are the
   *  expected words of this passage — the worker tracks position by aligning
   *  what it hears against them. */
  init(
    tokens: MatchToken[],
    device: ReciteDevice = "webgpu",
    model: ReciteModel = "tarteel-tiny",
  ): void {
    if (this.worker) return;
    const worker = new Worker(new URL("./whisper.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e: MessageEvent<ReciteEvent>) => this.onEvent(e.data);
    worker.onerror = (e) => this.onEvent({type: "error", message: e.message || "Worker failed"});
    this.worker = worker;
    this.send({type: "init", tokens, device, model});
  }

  private send(msg: ReciteInbound, transfer?: Transferable[]) {
    if (transfer) this.worker?.postMessage(msg, transfer);
    else this.worker?.postMessage(msg);
  }

  /** Request the mic and start streaming 16 kHz chunks to the worker.
   *  Throws (NotAllowedError etc.) if the user denies permission. */
  async startMic(): Promise<void> {
    await this.mic.start();
  }

  stopMic(): void {
    this.mic.stop();
  }

  /** Move the matcher's cursor (user tapped a word). */
  seek(tokenIndex: number): void {
    this.send({type: "seek", index: tokenIndex});
  }

  /** The passage grew — track against the longer token list, resuming at
   *  `tokenIndex` (which indexes the NEW list). */
  retarget(tokens: MatchToken[], tokenIndex: number): void {
    this.send({type: "retarget", tokens, index: tokenIndex});
  }

  /** Reset the matcher for a fresh recitation. */
  reset(): void {
    this.send({type: "reset"});
  }

  dispose(): void {
    this.stopMic();
    this.worker?.terminate();
    this.worker = null;
  }
}

/**
 * The same plumbing pointed at the whole-Quran locator instead of the tracker:
 * listen, and report where in the mushaf this recitation comes from.
 *
 * Used once, from the home page, to answer "start me where I already am".
 */
export class LocateEngine {
  private worker: Worker | null = null;
  private mic: MicCapture;
  private onEvent: (msg: LocateEvent) => void;

  constructor(
    onEvent: (msg: LocateEvent) => void,
    onLevel?: (level: number, voiced: boolean) => void,
  ) {
    this.onEvent = onEvent;
    this.mic = new MicCapture((samples, voiced) => {
      if (this.worker) this.worker.postMessage({type: "audio", samples, voiced}, [samples.buffer]);
    }, onLevel);
  }

  init(device: ReciteDevice = "webgpu", model: ReciteModel = "tarteel-tiny"): void {
    if (this.worker) return;
    const worker = new Worker(new URL("./locate.worker.ts", import.meta.url), {type: "module"});
    worker.onmessage = (e: MessageEvent<LocateEvent>) => this.onEvent(e.data);
    worker.onerror = (e) => this.onEvent({type: "error", message: e.message || "Worker failed"});
    this.worker = worker;
    worker.postMessage({type: "init", device, model} satisfies LocateInbound);
  }

  async startMic(): Promise<void> {
    await this.mic.start();
  }

  stopMic(): void {
    this.mic.stop();
  }

  reset(): void {
    this.worker?.postMessage({type: "reset"} satisfies LocateInbound);
  }

  dispose(): void {
    this.stopMic();
    this.worker?.terminate();
    this.worker = null;
  }
}
