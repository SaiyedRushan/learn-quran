// Mic capture shared by the two recitation workers: the passage tracker
// (ReciteEngine) and the whole-Quran locator (LocateEngine). Both want exactly
// the same thing — 16 kHz mono chunks, a speech/noise verdict per chunk, and a
// meter level scaled against the room — so it lives here rather than twice.
//
// No parameter properties or enums anywhere in lib/recite: these modules run
// unbundled under `node --test`, which strips types but cannot transform them.
import {VoiceDetector} from "./vad.ts";

export class MicCapture {
  /** While true, chunks are dropped — set when reciter hint audio is playing so
   *  the recognizer doesn't transcribe al-`Afasy and follow him instead. */
  muted = false;

  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private vad = new VoiceDetector();
  private onChunk: (samples: Float32Array, voiced: boolean) => void;
  private onLevel?: (level: number, voiced: boolean) => void;

  constructor(
    onChunk: (samples: Float32Array, voiced: boolean) => void,
    /** Per chunk (skipped while muted): a 0..1 meter level scaled against the
     *  measured noise floor, and whether the chunk counts as speech. */
    onLevel?: (level: number, voiced: boolean) => void,
  ) {
    this.onChunk = onChunk;
    this.onLevel = onLevel;
  }

  /** Request the mic and start streaming. Throws (NotAllowedError etc.) if the
   *  user denies permission. */
  async start(): Promise<void> {
    if (this.stream) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        // Kept on: reciter hint audio plays through the speakers and we don't
        // want the recognizer tracking it.
        echoCancellation: true,
        // Off: noise suppression is tuned for telephony and smears the spectral
        // detail Whisper's mel front-end relies on.
        noiseSuppression: false,
        autoGainControl: true,
      },
    });
    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule("/recite/audio-processor.js");
    const source = audioCtx.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(audioCtx, "recite-audio-processor");
    node.port.onmessage = (e: MessageEvent) => {
      if (this.muted) return;
      const samples = new Float32Array(e.data as ArrayBuffer);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      const level = Math.sqrt(sum / samples.length);
      const voiced = this.vad.push(level);
      if (this.onLevel) {
        // Scaled against the room, not an absolute number, so the meter rests at
        // zero on a hot mic instead of sitting permanently lit.
        const floor = this.vad.floor;
        const span = Math.max(0.02, floor * 8);
        this.onLevel(Math.min(1, Math.sqrt(Math.max(0, level - floor) / span)), voiced);
      }
      this.onChunk(samples, voiced);
    };
    source.connect(node);
    if (audioCtx.state === "suspended") await audioCtx.resume();
    this.stream = stream;
    this.audioCtx = audioCtx;
    this.node = node;
  }

  stop(): void {
    this.vad.reset(); // a new session re-learns the room from scratch
    this.node?.port.close();
    this.node?.disconnect();
    this.node = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
  }
}
