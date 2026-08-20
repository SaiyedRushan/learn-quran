/// <reference lib="webworker" />
// Inference worker: runs Tarteel's Quranic Whisper fine-tune
// (tarteel-ai/whisper-base-ar-quran, ONNX) over a rolling window of mic audio
// and feeds each transcript to the alignment matcher.
//
// Unlike the previous FastConformer/tilawa setup, onnxruntime is not loaded by
// hand here — transformers.js owns that, and we only tell it where the model
// and wasm files live. That is deliberate: every "no available backend found"
// failure in this prototype came from hand-rolling ort's ESM/wasm loading.
import {
  AutoProcessor,
  AutoTokenizer,
  env,
  WhisperForConditionalGeneration,
  type PreTrainedModel,
  type PreTrainedTokenizer,
  type Processor,
} from "@huggingface/transformers";
import {RecitationMatcher} from "./matcher.ts";
import type {ReciteDevice, ReciteEvent, ReciteInbound} from "./types.ts";

const MODEL_BASE = "/models/";
const WASM_DIR = "/models/ort-tjs/";

const SAMPLE_RATE = 16000;
/**
 * Whisper's encoder always processes a 30 s window — short audio is padded, so
 * per-run cost is fixed no matter how much we feed it. That makes a *wide*
 * window nearly free (only the decoder grows) and it's what stops the cursor
 * falling behind: if one inference takes 6 s, the next window still has to
 * cover those 6 s of recitation or the words in between are never heard, and
 * the lag compounds. So the window tracks the measured run time.
 */
const MAX_WINDOW_SEC = 28;
const MIN_WINDOW_SEC = 8;
const WINDOW_SAMPLES = SAMPLE_RATE * MAX_WINDOW_SEC;
/** Don't bother running on less than this much audio. */
const MIN_RUN_SAMPLES = SAMPLE_RATE * 0.8;
/**
 * Whisper hallucinates confidently on silence, so we only run it when there is
 * fresh speech to transcribe. This is a hangover after the last voiced chunk
 * rather than a level check on the window: the window holds 8-28 s of audio, so
 * its average stays above any threshold for that long after a single word —
 * which had inference (and hallucinated transcripts) churning away in silence.
 */
const VOICE_HANGOVER_MS = 1200;
const MAX_NEW_TOKENS = 220;

/** Files that must exist before we hand off to transformers.js, so a missing
 *  download fails with a plain message instead of an opaque backend error. */
function requiredFiles(modelId: string, suffix: string) {
  return [
    `${MODEL_BASE}${modelId}/config.json`,
    `${MODEL_BASE}${modelId}/generation_config.json`,
    `${MODEL_BASE}${modelId}/preprocessor_config.json`,
    `${MODEL_BASE}${modelId}/tokenizer.json`,
    `${MODEL_BASE}${modelId}/onnx/encoder_model${suffix}.onnx`,
    `${MODEL_BASE}${modelId}/onnx/decoder_model_merged${suffix}.onnx`,
    `${WASM_DIR}ort-wasm-simd-threaded.jsep.mjs`,
    `${WASM_DIR}ort-wasm-simd-threaded.jsep.wasm`,
  ];
}

let matcher: RecitationMatcher | null = null;
let processor: Processor | null = null;
let tokenizer: PreTrainedTokenizer | null = null;
let model: PreTrainedModel | null = null;
let device: ReciteDevice = "wasm";
let windowSamples = SAMPLE_RATE * MIN_WINDOW_SEC;

const ring = new Float32Array(WINDOW_SAMPLES);
let ringLen = 0;
let running = false;
let failed = false;
/** performance.now() of the last chunk the engine judged to be speech. */
let lastVoicedAt = 0;

function post(msg: ReciteEvent) {
  self.postMessage(msg);
}

/** Append to the rolling window, dropping the oldest samples past the window. */
function pushAudio(samples: Float32Array) {
  const cap = Math.min(WINDOW_SAMPLES, windowSamples);
  if (samples.length >= cap) {
    ring.set(samples.subarray(samples.length - cap));
    ringLen = cap;
    return;
  }
  const keep = Math.min(ringLen, cap - samples.length);
  ring.copyWithin(0, ringLen - keep, ringLen);
  ring.set(samples, keep);
  ringLen = keep + samples.length;
}

async function preflight(files: string[]) {
  const missing: string[] = [];
  await Promise.all(
    files.map(async (url) => {
      try {
        const res = await fetch(url, {method: "HEAD"});
        if (!res.ok) missing.push(url);
      } catch {
        missing.push(url);
      }
    }),
  );
  if (missing.length) {
    throw new Error(
      `model files unreachable (${missing.slice(0, 2).join(", ")}${
        missing.length > 2 ? ` +${missing.length - 2} more` : ""
      }) — run \`npm run fetch:tarteel-model\``,
    );
  }
}

type ProgressInfo = {status: string; file?: string; loaded?: number; total?: number};

function makeProgressCallback() {
  const seen = new Map<string, {loaded: number; total: number}>();
  return (info: ProgressInfo) => {
    if (info.status === "initiate" && info.file) {
      post({type: "loading_status", message: `Downloading recognizer — ${info.file}`});
    } else if (info.status === "progress" && info.file && info.total) {
      seen.set(info.file, {loaded: info.loaded ?? 0, total: info.total});
      let loaded = 0;
      let total = 0;
      for (const v of seen.values()) {
        loaded += v.loaded;
        total += v.total;
      }
      if (total > 0) post({type: "loading", percent: Math.round((loaded / total) * 100)});
    }
  };
}

async function loadModel(modelId: string, preferred: ReciteDevice) {
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.localModelPath = MODEL_BASE;
  const wasm = env.backends.onnx.wasm;
  if (wasm) {
    wasm.wasmPaths = WASM_DIR;
    // Single-threaded: `output: "export"` means we can't send COOP/COEP
    // headers, so SharedArrayBuffer (and ort's thread pool) isn't available.
    // This is exactly why WebGPU is tried first — one core is not enough.
    wasm.numThreads = 1;
  }

  // One weight format per model — see scripts/fetch-tarteel-model.mjs for why.
  // The device is what varies: GPU first, CPU only as a last resort.
  const dtype = modelId === "tarteel-tiny" ? "q4" : "q8";
  const attempts: ReciteDevice[] = preferred === "webgpu" ? ["webgpu", "wasm"] : ["wasm"];

  post({type: "loading_status", message: "Checking recognizer files…"});
  await preflight(requiredFiles(modelId, dtype === "q4" ? "_q4" : "_quantized"));

  const progress_callback = makeProgressCallback();
  post({type: "loading_status", message: "Loading recognizer…"});

  processor = await AutoProcessor.from_pretrained(modelId, {progress_callback});
  tokenizer = await AutoTokenizer.from_pretrained(modelId, {progress_callback});

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      model = await WhisperForConditionalGeneration.from_pretrained(modelId, {
        dtype: {encoder_model: dtype, decoder_model_merged: dtype},
        device: attempt,
        progress_callback,
      });
      device = attempt;
      if (errors.length) {
        post({type: "loading_status", message: `WebGPU unavailable — falling back to CPU`});
      }
      break;
    } catch (e) {
      errors.push(`${attempt}: ${e instanceof Error ? e.message : String(e)}`);
      model = null;
    }
  }
  if (!model) throw new Error(errors.join(" | "));

  // Warm-up so shader/kernel compilation doesn't stall the first real ayah.
  // max_new_tokens 1 keeps it to the encoder, which is the expensive part.
  post({type: "loading_status", message: "Warming up…"});
  const warmStart = performance.now();
  await transcribe(new Float32Array(SAMPLE_RATE), 1);
  const warmMs = Math.round(performance.now() - warmStart);

  post({type: "ready", device, warmMs});
}

async function transcribe(audio: Float32Array, maxTokens = MAX_NEW_TOKENS): Promise<string> {
  if (!processor || !model || !tokenizer) return "";
  const inputs = await processor(audio);
  const output = await model.generate({
    ...inputs,
    language: "ar",
    task: "transcribe",
    max_new_tokens: maxTokens,
    num_beams: 1,
    do_sample: false,
  });
  const decoded = tokenizer.batch_decode(output as never, {skip_special_tokens: true});
  return decoded[0] ?? "";
}

/** One inference at a time. Mic chunks arrive every ~150 ms and re-arm this, so
 *  a slow machine simply runs fewer, later inferences instead of piling up. */
async function pump() {
  if (running || failed || !model || !matcher || matcher.done) return;
  if (ringLen < MIN_RUN_SAMPLES) return;

  if (performance.now() - lastVoicedAt > VOICE_HANGOVER_MS) return;

  const audio = ring.slice(0, ringLen);

  running = true;
  try {
    const start = performance.now();
    const text = await transcribe(audio);
    const runMs = Math.round(performance.now() - start);

    // Widen the window to cover however long the last run took (plus slack), so
    // the audio recited *during* an inference is still in the next one. Without
    // this, a slow machine silently drops the words in between and the cursor
    // falls further behind every cycle instead of trailing by a fixed amount.
    const needSec = (runMs / 1000) * 1.6 + 4;
    windowSamples =
      SAMPLE_RATE * Math.min(MAX_WINDOW_SEC, Math.max(MIN_WINDOW_SEC, Math.ceil(needSec)));

    post({type: "perf", runMs, audioSec: +(audio.length / SAMPLE_RATE).toFixed(1), device});
    if (text.trim()) post({type: "transcript", text: text.trim()});

    const result = matcher.update(text);
    if (result) {
      // A rewind means the window still holds the pass we just backed out of;
      // leaving it in would drag the cursor straight forward again.
      if (result.repeated) ringLen = 0;
      post({
        type: "progress",
        flat: matcher.current ? matcher.current.flat : -1,
        matched: result.matched,
        total: matcher.total,
        skipped: result.skipped.map((i) => matcher!.tokenAt(i)?.flat ?? -1).filter((f) => f >= 0),
        repeated: result.repeated,
        lost: result.lost,
      });
    }
  } catch (e) {
    failed = true;
    post({type: "error", message: e instanceof Error ? e.message : String(e)});
  } finally {
    running = false;
  }
}

self.onmessage = async (event: MessageEvent<ReciteInbound>) => {
  const msg = event.data;
  switch (msg.type) {
    case "init":
      matcher = new RecitationMatcher(msg.tokens);
      try {
        await loadModel(msg.model, msg.device);
      } catch (e) {
        failed = true;
        post({type: "error", message: e instanceof Error ? e.message : String(e)});
      }
      break;
    case "audio":
      if (msg.voiced) lastVoicedAt = performance.now();
      pushAudio(msg.samples);
      void pump();
      break;
    case "seek":
      matcher?.seek(msg.index);
      ringLen = 0; // stale audio would only argue for the old position
      break;
    case "retarget": {
      // Same recitation, longer passage. Rebuild over the new tokens and
      // restore the cursor; the audio window is still valid, so it's kept.
      matcher = new RecitationMatcher(msg.tokens);
      matcher.seek(msg.index);
      break;
    }
    case "reset":
      matcher?.reset();
      ringLen = 0;
      break;
  }
};
