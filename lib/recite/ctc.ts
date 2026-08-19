// Greedy CTC decoding for the FastConformer backend.
//
// Why a second ASR path at all: Whisper's encoder always processes a padded
// 30-second window, so its cost is fixed however little was actually said. A
// CTC model's cost scales with the audio you give it, and decoding is argmax
// plus collapse rather than an autoregressive loop — which is the structural
// reason to expect it to be faster for a rolling window of a few seconds.
//
// Pure module: no DOM, no onnxruntime. The caller runs the session and hands
// the log-probs here, the same seam that lets this run in the worker, in the
// eval harness under onnxruntime-node, and in tests.

/** id -> SentencePiece piece, as published alongside the model. */
export type CtcVocab = Record<string, string>;

export type CtcLogits = {
  /** Row-major [timeSteps, vocabSize] log-probabilities. */
  data: Float32Array;
  timeSteps: number;
  vocabSize: number;
};

/**
 * Collapse a frame-wise argmax into text.
 *
 * CTC emits one label per frame, so the same word comes back repeated across
 * however many frames it spanned, separated by blanks. The standard collapse is
 * "drop repeats, then drop blanks" — in that order, because a blank between two
 * identical labels is what marks them as genuinely two.
 */
export function decodeGreedy(logits: CtcLogits, vocab: CtcVocab, blankId: number): string {
  const {data, timeSteps, vocabSize} = logits;
  const pieces: string[] = [];
  let previous = -1;

  for (let t = 0; t < timeSteps; t++) {
    const row = t * vocabSize;
    let best = 0;
    let bestScore = data[row];
    for (let v = 1; v < vocabSize; v++) {
      if (data[row + v] > bestScore) {
        bestScore = data[row + v];
        best = v;
      }
    }
    if (best !== previous && best !== blankId) {
      const piece = vocab[String(best)];
      if (piece) pieces.push(piece);
    }
    previous = best;
  }

  // SentencePiece marks a word start with U+2581; everything else joins on.
  return pieces
    .join("")
    .replace(/▁/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
