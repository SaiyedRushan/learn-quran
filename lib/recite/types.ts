// Wire protocol between ReciteMode → ReciteEngine → the inference worker.
import type {MatchToken} from "./matcher.ts";
import type {LocateHit} from "./locate.ts";

export type ReciteDevice = "wasm" | "webgpu";
/** Directory under public/models/ — Tarteel's Whisper fine-tune, tiny or base. */
export type ReciteModel = "tarteel-tiny" | "tarteel";

export type ReciteInbound =
  /** Sent once: the expected words for this passage, so the worker can track
   *  position by alignment instead of searching the whole Quran. */
  | {type: "init"; tokens: MatchToken[]; device: ReciteDevice; model: ReciteModel}
  /** `voiced` is the engine's verdict on whether this chunk is speech rather
   *  than room noise — see ReciteEngine.detectVoice. */
  | {type: "audio"; samples: Float32Array; voiced: boolean}
  /** User tapped a word — move the matcher's cursor there. */
  | {type: "seek"; index: number}
  | {type: "reset"};

export type ReciteEvent =
  | {type: "loading"; percent: number}
  | {type: "loading_status"; message: string}
  | {type: "ready"; device: ReciteDevice; warmMs: number}
  | {type: "error"; message: string}
  /** Cursor moved. `flat` indexes the UI's word list; -1 means the passage is
   *  finished. `matched` of `total` expected words confirmed. `skipped` holds
   *  flat indices of whole verses passed without reciting; `repeated` means the
   *  cursor rewound because the reciter went back over earlier text; `lost`
   *  means what's being recited isn't in this passage at all. */
  | {
      type: "progress";
      flat: number;
      matched: number;
      total: number;
      skipped: number[];
      repeated: boolean;
      lost: boolean;
    }
  /** Whatever the model heard in the last window — debug readout only. */
  | {type: "transcript"; text: string}
  | {type: "perf"; runMs: number; audioSec: number; device: string};

// ── Whole-Quran recognition ("where am I reciting from?") ──────────────────
// A separate worker from the tracker above, because it answers a different
// question: the tracker follows a known passage, this one searches all 114
// surahs. It runs once, on the home page, and hands off by navigating.

export type LocateInbound =
  | {type: "init"; device: ReciteDevice; model: ReciteModel}
  | {type: "audio"; samples: Float32Array; voiced: boolean}
  | {type: "reset"};

export type LocateEvent =
  | {type: "loading"; percent: number}
  | {type: "loading_status"; message: string}
  | {type: "ready"; device: ReciteDevice; warmMs: number}
  | {type: "error"; message: string}
  /** Running transcript, so the UI can show it's hearing something and how
   *  close it is to having enough words to decide. */
  | {type: "heard"; text: string; words: number; needed: number}
  /** Candidates, best first. `auto` means the top hit is far enough ahead of
   *  the rest to act on without asking. */
  | {type: "found"; hits: LocateHit[]; auto: boolean};
