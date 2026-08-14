// Client-side wrapper around the recitation ASR worker + mic capture, so the UI
// component only deals with cursor events.
import type {MatchToken} from "./matcher.ts";
import type {ReciteDevice, ReciteEvent, ReciteInbound, ReciteModel} from "./types.ts";

export type {ReciteEvent, ReciteDevice, ReciteModel} from "./types.ts";

export class ReciteEngine {
  /** While true, mic chunks are dropped — used so the recognizer doesn't hear
   *  the reciter hint speaking the next words and advance the cursor itself. */
  muted = false;

  private worker: Worker | null = null;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private onEvent: (msg: ReciteEvent) => void;
  private onLevel?: (rms: number) => void;

  constructor(
    onEvent: (msg: ReciteEvent) => void,
    /** Called with the RMS level of each mic chunk (skipped while muted), so
     *  the UI can tell "user is speaking" apart from "recognizer advanced". */
    onLevel?: (rms: number) => void,
  ) {
    this.onEvent = onEvent;
    this.onLevel = onLevel;
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
    if (this.stream) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        // Kept on: the reciter hint plays through the speakers and we don't
        // want the recognizer tracking al-`Afasy's voice.
        echoCancellation: true,
        // Off: noise suppression is tuned for telephony and smears the
        // spectral detail Whisper's mel front-end relies on.
        noiseSuppression: false,
        autoGainControl: true,
      },
    });
    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule("/recite/audio-processor.js");
    const source = audioCtx.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(audioCtx, "recite-audio-processor");
    node.port.onmessage = (e: MessageEvent) => {
      if (this.muted || !this.worker) return;
      const samples = new Float32Array(e.data as ArrayBuffer);
      if (this.onLevel) {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        this.onLevel(Math.sqrt(sum / samples.length));
      }
      this.send({type: "audio", samples}, [samples.buffer]);
    };
    source.connect(node);
    if (audioCtx.state === "suspended") await audioCtx.resume();
    this.stream = stream;
    this.audioCtx = audioCtx;
    this.node = node;
  }

  stopMic(): void {
    this.node?.port.close();
    this.node?.disconnect();
    this.node = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
  }

  /** Move the matcher's cursor (user tapped a word). */
  seek(tokenIndex: number): void {
    this.send({type: "seek", index: tokenIndex});
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
