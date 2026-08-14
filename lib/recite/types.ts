// Wire protocol between ReciteMode → ReciteEngine → the inference worker.
import type {MatchToken} from "./matcher.ts";

export type ReciteDevice = "wasm" | "webgpu";
/** Directory under public/models/ — Tarteel's Whisper fine-tune, tiny or base. */
export type ReciteModel = "tarteel-tiny" | "tarteel";

export type ReciteInbound =
  /** Sent once: the expected words for this passage, so the worker can track
   *  position by alignment instead of searching the whole Quran. */
  | {type: "init"; tokens: MatchToken[]; device: ReciteDevice; model: ReciteModel}
  | {type: "audio"; samples: Float32Array}
  /** User tapped a word — move the matcher's cursor there. */
  | {type: "seek"; index: number}
  | {type: "reset"};

export type ReciteEvent =
  | {type: "loading"; percent: number}
  | {type: "loading_status"; message: string}
  | {type: "ready"; device: ReciteDevice; warmMs: number}
  | {type: "error"; message: string}
  /** Cursor moved. `flat` indexes the UI's word list; -1 means the passage is
   *  finished. `matched` of `total` expected words confirmed. */
  | {type: "progress"; flat: number; matched: number; total: number}
  /** Whatever the model heard in the last window — debug readout only. */
  | {type: "transcript"; text: string}
  | {type: "perf"; runMs: number; audioSec: number; device: string};
