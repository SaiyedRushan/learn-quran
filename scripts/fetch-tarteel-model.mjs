// Downloads the Quranic ASR model used by the recitation-practice prototype
// (/surah/[slug]/recite/) into public/models/tarteel/, and copies the
// onnxruntime WASM runtime out of transformers.js's own node_modules so the
// versions can never drift apart.
//
// The model is tarteel-ai/whisper-base-ar-quran — Whisper base fine-tuned on
// Quranic recitation — via an ONNX export laid out for transformers.js
// (encoder + merged decoder, int8). ~78 MB. public/models/ is gitignored, so
// rerun after a fresh clone.
//
// Run: npm run fetch:tarteel-model

import { writeFile, mkdir, copyFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ORT_DIR = join(ROOT, "public", "models", "ort-tjs");

const SHARED_FILES = [
  "config.json",
  "generation_config.json",
  "preprocessor_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "added_tokens.json",
  "vocab.json",
  "merges.txt",
  "normalizer.json",
];

// Two sizes. `tarteel-tiny` is the default: Whisper's encoder always processes
// a padded 30 s window, so per-run cost is fixed regardless of how much you
// actually said, and base is simply too heavy for a browser without
// cross-origin isolation (one WASM thread).
//
// Weight formats are chosen per model, not per device. Tiny gets q4 — block
// quantization that maps to onnxruntime's MatMulNBits kernel, which is the
// format the WebGPU backend is fastest on. (Tiny's `_fp16` export is broken —
// its merged decoder returns an outer-scope value directly and ORT rejects it —
// and its `_quantized` decoder is 110 MB, i.e. barely quantized at all.)
const MODELS = {
  "tarteel-tiny": {
    // config.json records `_name_or_path: "tarteel-ai/whisper-tiny-ar-quran"`.
    repo: "omartariq612/tarteel-ai-whisper-tiny-ar-quran-onnx",
    files: [...SHARED_FILES, "onnx/encoder_model_q4.onnx", "onnx/decoder_model_merged_q4.onnx"],
  },
  // FastConformer CTC (general Arabic, not Quran-tuned). Kept as a comparison
  // point for `npm run eval:recite -- --model fastconformer`: its cost scales
  // with the audio you give it, where Whisper always pays for a padded 30 s.
  // MIT code, CC-BY-4.0 model, from nvidia/stt_ar_fastconformer_hybrid_large.
  fastconformer: {
    evalOnly: true,
    base: "https://github.com/yazinsai/tilawa/releases/download/v0.2.0",
    files: ["fastconformer_full_mixed.onnx", "vocab.json", "export_metadata.json"],
  },
  tarteel: {
    // config.json records `_name_or_path: "tarteel-ai/whisper-base-ar-quran"`,
    // and generation_config.json keeps the `alignment_heads` needed if we ever
    // want word-level timestamps. int8 only. Reachable with ?model=base.
    repo: "An0xity/whisper-base-ar-quran-onnx-timestamped",
    files: [
      ...SHARED_FILES,
      "onnx/encoder_model_quantized.onnx",
      "onnx/decoder_model_merged_quantized.onnx",
    ],
  },
};

// transformers.js loads onnxruntime itself; it only needs to be told where the
// jsep runtime lives (jsep serves both the wasm and webgpu execution providers).
const ORT_FILES = ["ort-wasm-simd-threaded.jsep.mjs", "ort-wasm-simd-threaded.jsep.wasm"];

async function exists(path) {
  return stat(path).then(
    (s) => s.size > 0,
    () => false,
  );
}

async function download(dir, repo, name, base) {
  const dest = join(ROOT, "public", "models", dir, name);
  if (await exists(dest)) {
    console.log(`skip ${dir}/${name} (already present)`);
    return;
  }
  const url = base ? `${base}/${name}` : `https://huggingface.co/${repo}/resolve/main/${name}`;
  console.log(`fetch ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  console.log(`  -> public/models/${dir}/${name} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
}

async function main() {
  await mkdir(ORT_DIR, { recursive: true });

  // The eval-only models aren't shipped, so don't make everyone download them.
  const wantEval = process.argv.includes("--eval-models");
  for (const [dir, {repo, files, base, evalOnly}] of Object.entries(MODELS)) {
    if (evalOnly && !wantEval) {
      console.log(`skip ${dir} (eval only — pass --eval-models to fetch)`);
      continue;
    }
    await mkdir(join(ROOT, "public", "models", dir, "onnx"), { recursive: true });
    for (const name of files) await download(dir, repo, name, base);
  }

  const ortDist = join(ROOT, "node_modules", "@huggingface", "transformers", "dist");
  for (const name of ORT_FILES) {
    await copyFile(join(ortDist, name), join(ORT_DIR, name));
    console.log(`copy ${name} -> public/models/ort-tjs/`);
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
