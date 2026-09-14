// Shared bits for the Themes stage of Memorize mode.
//
// Every guide carries a short `themes` list (content/types → Theme). The stage
// shuffles it and checks your answer against the authored order, so the
// constant and the trimmed card type live here — a leaf module with no content
// imports, safe for client components to pull in.
//
// KNOWN GAP — the authored order is *mostly* the order the surah introduces
// each idea, but that was never a rule the content was written to, and a few
// guides order by prominence instead. Confirmed divergences:
//
//   · Ya-Sin      — "the believing man of the town" is §3 (vv. 22–32) but is
//                   authored 4th, after "signs in creation" (§4, vv. 33–44).
//   · Al-Kahf     — "Protection from the Dajjal" is a recitation virtue with no
//                   position in the text at all, and "the four trials" is a
//                   meta-summary spanning §2, §4, §7 and §8.
//
// A keyword-alignment probe flagged ~12 of 52 guides as worth eyeballing; it
// over-flags, and only the two above were confirmed by reading. On those, a
// positionally-correct answer scores below 100%. Accepted for now: the stage is
// a soft structural checkpoint, not a graded test, and nothing else depends on
// the ordering. Fixing it means re-authoring those theme lists (and adding an
// order check to scripts/validate-guides.mjs so it can't regress) — content
// work, not code. The UI copy deliberately avoids promising surah order.

import type {PillColor} from "@/content/types";

/** One theme, trimmed from a guide for the ordering board. */
export interface ThemeCard {
  text: string;
  color: PillColor;
}

/** Fewest themes a guide needs before reordering them is a real test. Two is a
 * coin flip — same reasoning as MIN_ORDERABLE_SECTIONS. Below this the stage is
 * dropped from the ladder entirely. */
export const MIN_ORDERABLE_THEMES = 3;
