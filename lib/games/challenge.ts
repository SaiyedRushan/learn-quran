// Async multiplayer with no backend: a challenge is a small JSON object
// carried in the URL hash (#c=base64url). Whoever opens the link replays the
// exact same rounds (same seed), and the result screen offers a share-back
// link that additionally carries the sender's score, so the two can compare.
// The hash never reaches the server — fine for a fully static export.

/** Score attached to a shared link: what the sender got, to beat. */
export interface RivalScore {
  /** Percent 0..100 (translate) or correct-blank count (quiz). */
  value: number;
  /** For the quiz: total blanks, so "12/15" renders faithfully. */
  outOf?: number;
  /** Optional display name the sender typed. */
  name?: string;
}

export interface QuizChallenge {
  game: "quiz";
  slug: string;
  seed: number;
  /** Difficulty index into QUIZ_LEVELS. */
  level: number;
  rival?: RivalScore;
}

export interface TranslateChallenge {
  game: "translate";
  slug: string;
  seed: number;
  rounds: number;
  mode: "type" | "build";
  rival?: RivalScore;
}

export interface OrderChallenge {
  game: "order";
  slug: string;
  seed: number;
  rounds: number;
  /** Verses per round (length of the sequence to arrange). */
  size: number;
  rival?: RivalScore;
}

export type Challenge = QuizChallenge | TranslateChallenge | OrderChallenge;

function toBase64Url(json: string): string {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeChallenge(c: Challenge): string {
  return toBase64Url(JSON.stringify(c));
}

/** Parse a challenge out of a location.hash ("#c=..."). Null on anything
 * malformed — a bad link should degrade to a normal solo game, never crash. */
export function decodeChallenge(hash: string): Challenge | null {
  const m = /[#&]c=([A-Za-z0-9_-]+)/.exec(hash);
  if (!m) return null;
  try {
    const obj = JSON.parse(fromBase64Url(m[1])) as Challenge;
    if (typeof obj !== "object" || obj === null) return null;
    if (typeof obj.slug !== "string" || !Number.isFinite(obj.seed)) return null;
    if (obj.game === "quiz" && Number.isFinite(obj.level)) return obj;
    if (
      obj.game === "translate" &&
      Number.isFinite(obj.rounds) &&
      (obj.mode === "type" || obj.mode === "build")
    )
      return obj;
    if (obj.game === "order" && Number.isFinite(obj.rounds) && Number.isFinite(obj.size)) return obj;
    return null;
  } catch {
    return null;
  }
}

/** Absolute URL for a challenge on the current origin (client only). */
export function challengeUrl(pathname: string, c: Challenge): string {
  return `${window.location.origin}${pathname}#c=${encodeChallenge(c)}`;
}
