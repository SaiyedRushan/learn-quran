/// <reference lib="webworker" />
// "Where am I reciting from?" — the same Whisper fine-tune as the tracker, but
// its transcript goes to QuranLocator (all 114 surahs) instead of a matcher
// bound to one passage.
//
// The two workers are deliberately separate rather than one worker with a mode
// flag. This one runs on the home page, answers once, and then the page
// navigates away; the tracker runs for a whole practice session. Sharing a
// module would mean loading the whole-Quran index on every practice page for
// nothing.
import {
  AutoProcessor,
  AutoTokenizer,
  env,
  WhisperForConditionalGeneration,
  type PreTrainedModel,
  type PreTrainedTokenizer,
  type Processor,
} from "@huggingface/transformers";
import {normalizeArabicWords} from "./arabic.ts";
import {QuranLocator, type LocateIndexData} from "./locate.ts";
import type {LocateEvent, LocateInbound, ReciteDevice} from "./types.ts";

const MODEL_BASE = "/models/";
const WASM_DIR = "/models/ort-tjs/";
const INDEX_URL = "/recite/quran-locate.json";

const SAMPLE_RATE = 16000;
/** Whisper pads to 30 s regardless, so a wide window costs only decoder time,
 *  and recognition wants as much context as it can get. */
const WINDOW_SEC = 28;
const WINDOW_SAMPLES = SAMPLE_RATE * WINDOW_SEC;
const MIN_RUN_SAMPLES = SAMPLE_RATE * 2;
const VOICE_HANGOVER_MS = 1200;
const MAX_NEW_TOKENS = 220;

/**
 * How many recited words before we'll answer at all. Measured (npm run
 * eval:locate): 8 words identifies the exact ayah 91.5% of the time at 15%
 * recognizer error, 12 words 97.4%. Below 5 there simply isn't enough to go on.
 */
const MIN_WORDS = 8;
/** ...and this many before we'll act without asking. */
const AUTO_WORDS = 12;
/** Top hit must hold this share of the vote, and beat the runner-up by this
 *  factor, before we navigate on our own. Ar-Rahman's refrain occurs 31 times
 *  identically — there the right answer is to ask, not to guess. */
const AUTO_CONFIDENCE = 0.5;
const AUTO_MARGIN = 1.6;

let processor: Processor | null = null;
let tokenizer: PreTrainedTokenizer | null = null;
let model: PreTrainedModel | null = null;
let locator: QuranLocator | null = null;
let device: ReciteDevice = "wasm";

const ring = new Float32Array(WINDOW_SAMPLES);
let ringLen = 0;
let running = false;
let failed = false;
let done = false;
let lastVoicedAt = 0;

function post(msg: LocateEvent) {
  self.postMessage(msg);
}

function pushAudio(samples: Float32Array) {
  if (samples.length >= WINDOW_SAMPLES) {
    ring.set(samples.subarray(samples.length - WINDOW_SAMPLES));
    ringLen = WINDOW_SAMPLES;
    return;
  }
  const keep = Math.min(ringLen, WINDOW_SAMPLES - samples.length);
  ring.copyWithin(0, ringLen - keep, ringLen);
  ring.set(samples, keep);
  ringLen = keep + samples.length;
}

async function preflight(urls: string[]) {
  const missing: string[] = [];
  await Promise.all(
    urls.map(async (url) => {
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
      `files unreachable (${missing.slice(0, 2).join(", ")}) — run ` +
        `\`npm run fetch:tarteel-model\` and \`npm run build:recite-index\``,
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

async function loadIndex() {
  const res = await fetch(INDEX_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${INDEX_URL}`);
  const data = (await res.json()) as LocateIndexData;
  locator = new QuranLocator(data);
}

async function load(modelId: string, preferred: ReciteDevice) {
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.localModelPath = MODEL_BASE;
  const wasm = env.backends.onnx.wasm;
  if (wasm) {
    wasm.wasmPaths = WASM_DIR;
    wasm.numThreads = 1; // no COOP/COEP under output: "export"
  }

  const dtype = modelId === "tarteel-tiny" ? "q4" : "q8";
  const suffix = dtype === "q4" ? "_q4" : "_quantized";
  post({type: "loading_status", message: "Checking files…"});
  await preflight([
    `${MODEL_BASE}${modelId}/config.json`,
    `${MODEL_BASE}${modelId}/tokenizer.json`,
    `${MODEL_BASE}${modelId}/onnx/encoder_model${suffix}.onnx`,
    `${MODEL_BASE}${modelId}/onnx/decoder_model_merged${suffix}.onnx`,
    `${WASM_DIR}ort-wasm-simd-threaded.jsep.wasm`,
    INDEX_URL,
  ]);

  const progress_callback = makeProgressCallback();
  post({type: "loading_status", message: "Loading recognizer…"});

  // The index is a separate 184 KB download; overlap it with the model's.
  const indexReady = loadIndex();

  processor = await AutoProcessor.from_pretrained(modelId, {progress_callback});
  tokenizer = await AutoTokenizer.from_pretrained(modelId, {progress_callback});

  const errors: string[] = [];
  for (const attempt of preferred === "webgpu" ? ["webgpu", "wasm"] : ["wasm"]) {
    try {
      model = await WhisperForConditionalGeneration.from_pretrained(modelId, {
        dtype: {encoder_model: dtype, decoder_model_merged: dtype},
        device: attempt as ReciteDevice,
        progress_callback,
      });
      device = attempt as ReciteDevice;
      break;
    } catch (e) {
      errors.push(`${attempt}: ${e instanceof Error ? e.message : String(e)}`);
      model = null;
    }
  }
  if (!model) throw new Error(errors.join(" | "));

  await indexReady;

  post({type: "loading_status", message: "Warming up…"});
  const warmStart = performance.now();
  await transcribe(new Float32Array(SAMPLE_RATE), 1);
  post({type: "ready", device, warmMs: Math.round(performance.now() - warmStart)});
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
  return tokenizer.batch_decode(output as never, {skip_special_tokens: true})[0] ?? "";
}

async function pump() {
  if (running || failed || done || !model || !locator) return;
  if (ringLen < MIN_RUN_SAMPLES) return;
  if (performance.now() - lastVoicedAt > VOICE_HANGOVER_MS) return;

  running = true;
  try {
    const text = (await transcribe(ring.slice(0, ringLen))).trim();
    const words = normalizeArabicWords(text);
    post({type: "heard", text, words: words.length, needed: MIN_WORDS});
    if (words.length < MIN_WORDS) return;

    const hits = locator.locate(words, 3);
    if (!hits.length) return;

    // Act alone only when there's plenty of evidence AND the runner-up is well
    // behind. Otherwise hand the candidates to the UI and let the reciter pick.
    const margin = hits.length > 1 ? hits[0].votes / Math.max(1, hits[1].votes) : Infinity;
    const auto =
      words.length >= AUTO_WORDS &&
      hits[0].confidence >= AUTO_CONFIDENCE &&
      margin >= AUTO_MARGIN;

    if (auto) done = true; // stop transcribing; the page is about to navigate
    post({type: "found", hits, auto});
  } catch (e) {
    failed = true;
    post({type: "error", message: e instanceof Error ? e.message : String(e)});
  } finally {
    running = false;
  }
}

self.onmessage = async (event: MessageEvent<LocateInbound>) => {
  const msg = event.data;
  switch (msg.type) {
    case "init":
      try {
        await load(msg.model, msg.device);
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
    case "reset":
      ringLen = 0;
      done = false;
      break;
  }
};
