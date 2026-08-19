// Offline bench for recitation mode. Runs a candidate ASR model against real
// recitation audio and reports what actually matters: how fast it is, how far
// behind the voice the cursor lands, and how often it accuses a flawless
// reciter of a mistake.
//
//   npm run eval:recite -- --surah 112
//   npm run eval:recite -- --surah 109 --model tarteel --dtype q8
//   npm run eval:recite -- --surah 112 --mode transcribe
//
// Ground truth is Mishari Rashid al-`Afasy's recitation plus quran.com's
// word-level timings (public/recite/audio/alafasy/), so every reported mistake
// is by definition a false positive — which is the number worth watching.
//
// This drives the real lib/recite/matcher.ts, and mirrors the worker's rolling
// window and single-flight loop, so results transfer. What it can't tell you is
// browser speed: onnxruntime-node uses every core, WebGPU is a different engine
// again. Use it to compare models against each other, not to predict latency.
import {createRequire} from "node:module";
import {mkdirSync, readFileSync, existsSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(ROOT, "package.json"));

const SR = 16000;
const CHUNK = 2400; // 150 ms, same as public/recite/audio-processor.js
const AYAH_GAP_SEC = 0.3;
const CACHE = path.join(ROOT, ".cache", "recite-audio");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const surah = arg("surah", "112");
const modelId = arg("model", "tarteel-tiny");
const dtype = arg("dtype", modelId === "tarteel-tiny" ? "q4" : "q8");
const windowSec = Number(arg("window", "8"));
const mode = arg("mode", "stream");
const verbose = process.argv.includes("--verbose");

const {env, AutoProcessor, AutoTokenizer, WhisperForConditionalGeneration} = await import(
  require.resolve("@huggingface/transformers")
).then((m) => (m.env ? m : m.default));
const {MPEGDecoder} = require("mpg123-decoder");
const {RecitationMatcher, buildTokens} = await import(path.join(ROOT, "lib/recite/matcher.ts"));
const {normalizeArabicWords} = await import(path.join(ROOT, "lib/recite/arabic.ts"));

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = path.join(ROOT, "public", "models");

/** Linear resample. The mp3s are 22-44 kHz; Whisper wants 16 kHz mono. */
function resample(input, from, to) {
  if (from === to) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const src = i * ratio;
    const lo = Math.floor(src);
    const hi = Math.min(lo + 1, input.length - 1);
    const f = src - lo;
    out[i] = input[lo] * (1 - f) + input[hi] * f;
  }
  return out;
}

async function loadMp3(url) {
  mkdirSync(CACHE, {recursive: true});
  const cached = path.join(CACHE, url.split("/").pop());
  let bytes;
  if (existsSync(cached)) {
    bytes = new Uint8Array(readFileSync(cached));
  } else {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    bytes = new Uint8Array(await res.arrayBuffer());
    writeFileSync(cached, bytes);
  }
  const decoder = new MPEGDecoder();
  await decoder.ready;
  const {channelData, sampleRate} = decoder.decode(bytes);
  decoder.free();
  return resample(channelData[0], sampleRate, SR);
}

const quran = JSON.parse(readFileSync(path.join(ROOT, `content/quran/${surah}.json`), "utf8"));
const timings = JSON.parse(
  readFileSync(path.join(ROOT, `public/recite/audio/alafasy/${surah}.json`), "utf8"),
);

const words = [];
for (const a of quran.ayahs) {
  for (const t of a.arabic.split(/\s+/).filter(Boolean)) {
    words.push({flat: words.length, ayah: a.number, display: t, matchable: /[ء-يٱ]/.test(t)});
  }
}
const tokens = buildTokens(words);

const label =
  modelId === "fastconformer"
    ? "fastconformer/ctc"
    : modelId === "nemotron"
      ? "nemotron/rnnt-int4"
      : `${modelId}/${dtype}`;
console.log(`model ${label} · ${quran.englishName} · ${tokens.length} words`);

/** @type {(audio: Float32Array) => Promise<string>} */
let transcribe;

if (modelId === "nemotron") {
  // NVIDIA Nemotron 3.5 ASR Streaming 0.6B (RNNT). Not shippable here — 770 MB
  // of weights — but worth measuring, because the question is whether a general
  // multilingual model beats a Quran-fine-tuned one on recitation.
  //
  // Nothing off the shelf drives this: transformers.js only implements Parakeet
  // CTC, so the transducer loop below is ours. Contracts came from the export
  // script and genai_config.json, with the tensor layouts corrected against the
  // graphs themselves — several disagree with the published config.
  const ort = require("onnxruntime-node");
  const {ParakeetFeatureExtractor} = await import(
    require.resolve("@huggingface/transformers")
  ).then((m) => (m.env ? m : m.default));
  const dir = path.join(ROOT, "public", "models", "nemotron");
  const cfg = JSON.parse(readFileSync(path.join(dir, "genai_config.json"), "utf8")).model;
  const vocab = readFileSync(path.join(dir, "vocab.txt"), "utf8").split("\n");
  const [enc, pred, joint] = await Promise.all(
    ["encoder", "decoder", "joint"].map((n) =>
      ort.InferenceSession.create(path.join(dir, `${n}.onnx`)),
    ),
  );

  // Nemotron sets normalize:"NA", so use the raw fbank path — the public _call()
  // applies per-feature mean/variance normalisation this model wasn't trained
  // with, and the output is garbage if you let it.
  const fe = new ParakeetFeatureExtractor({
    n_fft: cfg.fft_size,
    feature_size: cfg.num_mels,
    hop_length: cfg.hop_length,
    win_length: cfg.win_length,
    sampling_rate: cfg.sample_rate,
    preemphasis: cfg.preemph,
  });

  const NEW = 56; // 8960 samples = one 560 ms chunk
  const CTX = cfg.pre_encode_cache_size ?? 9;
  const WIN = NEW + CTX;
  const ARABIC_PROMPT = 7; // prompt_dictionary: {"ar-AR": 7, "ar": 7}

  transcribe = async (audio) => {
    const mel = await fe._extract_fbank_features(audio); // [frames, mels]
    const [frames, nMel] = mel.dims;
    const zeros = (n, dims) => new ort.Tensor("float32", new Float32Array(n), dims);
    let cacheChannel = zeros(24 * 56 * 1024, [1, 24, 56, 1024]);
    let cacheTime = zeros(24 * 1024 * 8, [1, 24, 1024, 8]);
    let cacheLen = new ort.Tensor("int64", BigInt64Array.from([0n]), [1]);
    let h = zeros(2 * 640, [2, 1, 640]);
    let c = zeros(2 * 640, [2, 1, 640]);
    let lastToken = cfg.blank_id;
    let decOut = null;
    const emitted = [];

    for (let start = 0; start < frames; start += NEW) {
      const win = new Float32Array(WIN * nMel);
      for (let t = 0; t < WIN; t++) {
        const src = start - CTX + t;
        if (src < 0 || src >= frames) continue;
        win.set(mel.data.subarray(src * nMel, src * nMel + nMel), t * nMel);
      }
      const e = await enc.run({
        audio_signal: new ort.Tensor("float32", win, [1, WIN, nMel]),
        length: new ort.Tensor("int64", BigInt64Array.from([BigInt(WIN)]), [1]),
        cache_last_channel: cacheChannel,
        cache_last_time: cacheTime,
        cache_last_channel_len: cacheLen,
        lang_id: new ort.Tensor("int64", BigInt64Array.from([BigInt(ARABIC_PROMPT)]), [1]),
      });
      cacheChannel = e.cache_last_channel_next;
      cacheTime = e.cache_last_time_next;
      cacheLen = e.cache_last_channel_len_next;

      const encOut = e.outputs; // [1, T, hidden]
      const [, T, hidden] = encOut.dims;
      for (let t = 0; t < T; t++) {
        const encT = new ort.Tensor("float32", encOut.data.slice(t * hidden, (t + 1) * hidden), [
          1,
          1,
          hidden,
        ]);
        for (let sym = 0; sym < (cfg.max_symbols_per_step ?? 10); sym++) {
          if (!decOut) {
            const p = await pred.run({
              targets: new ort.Tensor("int64", BigInt64Array.from([BigInt(lastToken)]), [1, 1]),
              h_in: h,
              c_in: c,
            });
            decOut = p.decoder_output; // [1, 640, 1]
            h = p.h_out;
            c = p.c_out;
          }
          const j = await joint.run({
            encoder_output: encT,
            decoder_output: new ort.Tensor("float32", decOut.data, [1, 1, decOut.dims[1]]),
          });
          const logits = j.joint_output;
          let best = 0;
          let bestV = -Infinity;
          for (let v = 0; v < logits.data.length; v++) {
            if (logits.data[v] > bestV) {
              bestV = logits.data[v];
              best = v;
            }
          }
          if (best === cfg.blank_id) break;
          emitted.push(best);
          lastToken = best;
          decOut = null; // the prediction state only advances on a real emission
        }
      }
    }
    return emitted
      .map((i) => vocab[i] ?? "")
      .join("")
      .replace(/\u2581/g, " ")
      .trim();
  };
} else if (modelId === "fastconformer") {
  // A CTC alternative to Whisper, for comparison. Note the runtime: this export
  // uses ConvInteger, which onnxruntime-node's CPU kernels don't implement and
  // transformers.js's pinned ort (1.22) is too old for — hence the separate
  // top-level onnxruntime-web devDependency. Speed here is therefore NOT
  // comparable to the Whisper numbers, which run natively; compare WER.
  const ort = require("onnxruntime-web");
  ort.env.wasm.numThreads = Math.min(8, (await import("node:os")).cpus().length);
  const dir = path.join(ROOT, "public", "models", "fastconformer");
  const vocab = JSON.parse(readFileSync(path.join(dir, "vocab.json"), "utf8"));
  const meta = JSON.parse(readFileSync(path.join(dir, "export_metadata.json"), "utf8"));
  const blankId = Number(meta.blank_id ?? 1024);
  const {decodeGreedy} = await import(path.join(ROOT, "lib/recite/ctc.ts"));
  const session = await ort.InferenceSession.create(
    path.join(dir, "fastconformer_full_mixed.onnx"),
    {executionProviders: ["wasm"]},
  );
  transcribe = async (audio) => {
    const out = await session.run({
      audio_signal: new ort.Tensor("float32", audio, [1, audio.length]),
      length: new ort.Tensor("int64", BigInt64Array.from([BigInt(audio.length)]), [1]),
    });
    const logits = out[session.outputNames[0]];
    const [, timeSteps, vocabSize] = logits.dims;
    return decodeGreedy({data: logits.data, timeSteps, vocabSize}, vocab, blankId);
  };
} else {
  const processor = await AutoProcessor.from_pretrained(modelId);
  const tokenizer = await AutoTokenizer.from_pretrained(modelId);
  const model = await WhisperForConditionalGeneration.from_pretrained(modelId, {
    dtype: {encoder_model: dtype, decoder_model_merged: dtype},
    device: "cpu",
  });
  transcribe = async (audio) => {
    const inputs = await processor(audio);
    const out = await model.generate({
      ...inputs,
      language: "ar",
      task: "transcribe",
      max_new_tokens: 220,
      num_beams: 1,
      do_sample: false,
    });
    return tokenizer.batch_decode(out, {skip_special_tokens: true})[0] ?? "";
  };
}

/** Levenshtein over word arrays, for word error rate. */
function wordErrors(ref, hyp) {
  const d = Array.from({length: ref.length + 1}, (_, i) =>
    Array.from({length: hyp.length + 1}, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= ref.length; i++) {
    for (let j = 1; j <= hyp.length; j++) {
      d[i][j] =
        ref[i - 1] === hyp[j - 1]
          ? d[i - 1][j - 1]
          : 1 + Math.min(d[i - 1][j - 1], d[i - 1][j], d[i][j - 1]);
    }
  }
  return d[ref.length][hyp.length];
}

// --- accuracy: one clean pass per ayah ---------------------------------------

async function runTranscribe() {
  let errors = 0;
  let refWords = 0;
  let ms = 0;
  for (const a of quran.ayahs) {
    const entry = timings[String(a.number)];
    if (!entry) continue;
    const audio = await loadMp3(entry.url);
    const t0 = Date.now();
    const heard = await transcribe(audio);
    ms += Date.now() - t0;
    const ref = normalizeArabicWords(a.arabic);
    const hyp = normalizeArabicWords(heard);
    errors += wordErrors(ref, hyp);
    refWords += ref.length;
    if (verbose) console.log(`  ayah ${a.number}\n    want: ${a.arabic}\n    got : ${heard}`);
  }
  console.log(`\nWER ${((errors / refWords) * 100).toFixed(1)}%  (${errors}/${refWords} words)`);
  console.log(`mean ${Math.round(ms / quran.ayahs.length)}ms per ayah`);
}

// --- tracking: the worker's rolling-window loop ------------------------------

async function runStream() {
  const parts = [];
  const ayahStart = new Map();
  let total = 0;
  for (const a of quran.ayahs) {
    const entry = timings[String(a.number)];
    if (!entry) continue;
    const audio = await loadMp3(entry.url);
    ayahStart.set(a.number, total / SR);
    parts.push(audio, new Float32Array(SR * AYAH_GAP_SEC));
    total += audio.length + SR * AYAH_GAP_SEC;
  }
  const track = new Float32Array(total);
  let off = 0;
  for (const p of parts) {
    track.set(p, off);
    off += p.length;
  }

  // When each word actually ends, from quran.com's segments.
  const truth = [];
  for (const a of quran.ayahs) {
    const entry = timings[String(a.number)];
    if (!entry) continue;
    const base = ayahStart.get(a.number);
    for (const [, startMs, endMs] of entry.segments) {
      truth.push({at: base + startMs / 1000, end: base + endMs / 1000});
    }
  }

  const matcher = new RecitationMatcher(tokens);
  const windowSamples = SR * windowSec;
  const ring = new Float32Array(windowSamples);
  let ringLen = 0;
  const arrival = new Array(tokens.length).fill(null);
  const falseEvents = [];
  let audioPos = 0;
  let freeAt = 0;
  let runs = 0;
  let runMsTotal = 0;

  while (audioPos < track.length) {
    const chunk = track.subarray(audioPos, Math.min(audioPos + CHUNK, track.length));
    const keep = Math.min(ringLen, windowSamples - chunk.length);
    ring.copyWithin(0, ringLen - keep, ringLen);
    ring.set(chunk, keep);
    ringLen = keep + chunk.length;
    audioPos += CHUNK;

    const clock = audioPos / SR;
    if (clock < freeAt || ringLen < SR * 0.8) continue;

    const audio = ring.slice(0, ringLen);
    const t0 = Date.now();
    const heard = await transcribe(audio);
    const runMs = Date.now() - t0;
    runs++;
    runMsTotal += runMs;
    // A result only becomes visible once the inference finishes.
    const visibleAt = clock + runMs / 1000;
    freeAt = visibleAt;

    const before = matcher.matched;
    const res = matcher.update(heard);
    if (res?.skipped.length) falseEvents.push(`skipped verse at ${res.skipped[0]}: "${heard}"`);
    if (res?.lost) falseEvents.push(`lost: "${heard}"`);
    if (res?.repeated) falseEvents.push(`rewind to ${res.matched}: "${heard}"`);
    for (let i = before; i < matcher.matched; i++) if (arrival[i] === null) arrival[i] = visibleAt;
    if (verbose) {
      console.log(
        `  t=${clock.toFixed(1)}s run=${runMs}ms cursor=${matcher.matched}/${tokens.length} ${heard.slice(-48)}`,
      );
    }
  }

  const lags = [];
  let overshoot = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (arrival[i] === null || !truth[i]) continue;
    const lag = arrival[i] - truth[i].end;
    lags.push(lag);
    if (lag < -0.25) overshoot++;
  }
  lags.sort((a, b) => a - b);
  const pct = (q) => lags[Math.min(lags.length - 1, Math.floor(q * lags.length))];

  console.log(
    `\n--- ${modelId}/${dtype}, ${windowSec}s window, ${(total / SR).toFixed(0)}s audio ---`,
  );
  console.log(`inference:      ${runs} runs, mean ${Math.round(runMsTotal / runs)}ms`);
  console.log(`words reached:  ${arrival.filter(Boolean).length}/${tokens.length}`);
  if (lags.length) {
    console.log(
      `cursor lag:     median ${pct(0.5).toFixed(2)}s  p90 ${pct(0.9).toFixed(2)}s  max ${pct(1).toFixed(2)}s`,
    );
    console.log(`ran ahead:      ${overshoot} words`);
  }
  console.log(`false alarms:   ${falseEvents.length}   (perfect recitation — any is one too many)`);
  for (const e of falseEvents.slice(0, 5)) console.log(`  · ${e}`);
}

// Deliberately not process.exit(): tearing down with live onnxruntime sessions
// aborts the process with a mutex error after the results have printed.
if (mode === "transcribe") await runTranscribe();
else await runStream();
