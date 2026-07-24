"use client";

import {useEffect, useMemo, useState} from "react";
import type {SurahGuide, VerseData, Ayah, PillColor} from "@/content/types";
import {
  setSectionLearned,
  useLearnedSections,
  setLearned,
  useIsLearned,
  setWeakSpot,
  useWeakSpots,
} from "@/lib/progress";
import {useSettings} from "@/lib/settings";
import {pickArabic} from "@/lib/arabic";

const PILL: Record<PillColor, string> = {
  teal: "tp-teal",
  purple: "tp-purple",
  amber: "tp-amber",
  coral: "tp-coral",
  slate: "tp-slate",
};

// The fading-crutches ladder. Each stage removes one support. Memorization
// works from Arabic + meaning only; transliteration is deliberately left out of
// this flow so it never becomes a crutch, even though the dataset now carries it.
const STAGES = [
  {key: "read", label: "Read", hint: "Read the Arabic and its meaning together a few times until the flow feels familiar."},
  {key: "arabic", label: "Arabic only", hint: "Read the Arabic aloud. Tap a verse to check its meaning when you need it."},
  {key: "recall", label: "Recall Arabic", hint: "Read the meaning and recite the Arabic from memory. Stuck? Peek the next letter or word."},
  {key: "cloze", label: "Fill the gaps", hint: "Recite from memory and fill the blanks. Tap any blank to reveal that word."},
  {key: "blank", label: "Blank slate", hint: "Recite the whole section from memory. Peek a letter or word, or reveal the meaning, to check yourself."},
] as const;

const CLOZE_LEVELS = [
  {label: "Light", density: 0.3},
  {label: "Medium", density: 0.55},
  {label: "Heavy", density: 0.82},
];

/** Deterministic pseudo-random value in [0,1) for a word index. Stable across
 * renders, and raising the density always blanks a superset of words. */
function wordHash(n: number): number {
  return ((n * 1103515245 + 12345) % 2147483648) / 2147483648;
}

/** Split into grapheme clusters so Arabic diacritics stay attached to their
 * base letter when peeking one "letter" at a time. */
function toGraphemes(s: string): string[] {
  try {
    const Seg = (Intl as unknown as {Segmenter?: typeof Intl.Segmenter}).Segmenter;
    if (Seg) {
      const seg = new Seg("ar", {granularity: "grapheme"});
      return Array.from(seg.segment(s), (x) => x.segment);
    }
  } catch {
    /* fall through to code-point split */
  }
  return Array.from(s);
}

/** What the memorize/test overlay covers:
 *  - section: one section of the guide
 *  - surah:   every verse the guide includes (a subset, for passages)
 *  - weak:    a focused drill over only the verses you flagged as weak spots */
export type MemorizeScope =
  | {kind: "section"; index: number}
  | {kind: "surah"}
  | {kind: "weak"};

export default function MemorizeMode({
  guide,
  verses,
  scope,
  onClose,
}: {
  guide: SurahGuide;
  verses: VerseData;
  scope: MemorizeScope;
  onClose: () => void;
}) {
  const slug = guide.meta.slug;
  const isSurah = scope.kind === "surah";
  const isWeakDrill = scope.kind === "weak";
  const section = scope.kind === "section" ? guide.sections[scope.index] : null;

  // Weak spots you flagged (auto on peek, or by tapping a word). Reactive.
  const weakSpots = useWeakSpots(slug);
  const weakSet = useMemo(() => new Set(weakSpots.map((s) => `${s.ayah}:${s.word}`)), [weakSpots]);
  const isWeak = (ayah: number, w: number) => weakSet.has(`${ayah}:${w}`);

  // A "whole surah" test covers exactly the verses the guide includes. For full
  // surahs that's everything; for passages (e.g. Ayat al-Kursi) it's the
  // verified subset, so we never invent a 1..numberOfAyahs range.
  const isFullSurah = verses.ayahs.length === verses.numberOfAyahs;
  const scopeTitle = isWeakDrill ? "Weak spots" : isSurah ? guide.meta.name : section!.title;
  const scopeBadge = isWeakDrill
    ? "Drill"
    : isSurah
      ? isFullSurah
        ? "Whole surah"
        : "Full passage"
      : section!.badge;
  const scopeColor: PillColor = isWeakDrill ? "amber" : isSurah ? "purple" : section!.color;

  const surahLearned = useIsLearned(slug);
  const learnedSections = new Set(useLearnedSections(slug));
  const alreadyLearned =
    scope.kind === "surah"
      ? surahLearned
      : scope.kind === "section"
        ? learnedSections.has(scope.index)
        : false;

  // The whole-surah test and weak-spot drill open as tests: start on "Recall
  // Arabic" (meaning shown as a prompt, recite from memory, peek when stuck).
  // The full stepper stays available for easier/harder crutch levels.
  const [stage, setStage] = useState(() => (isSurah || isWeakDrill ? 2 : 0));

  // Snapshot the weak verses at open time so the drill set doesn't shrink out
  // from under you as you clear flags mid-session.
  const [drillAyahs] = useState<Set<number>>(() => new Set(weakSpots.map((s) => s.ayah)));
  const [clozeLevel, setClozeLevel] = useState(0);
  // Generic set of revealed keys for the current stage. Reset on stage change.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // Progressive peek cursor per ayah (grapheme clusters revealed from the start).
  const [peek, setPeek] = useState<Record<number, number>>({});

  const {arabicFont} = useSettings();

  const ayahs: Ayah[] = useMemo(() => {
    if (isWeakDrill) return verses.ayahs.filter((a) => drillAyahs.has(a.number));
    if (isSurah || !section) return verses.ayahs;
    return verses.ayahs.filter((a) => a.number >= section.from && a.number <= section.to);
  }, [verses, isSurah, isWeakDrill, drillAyahs, section]);

  // Flatten words with a stable global index for deterministic cloze blanking,
  // and pre-segment each ayah into grapheme clusters for progressive peeking.
  // Segmentation follows the chosen script (IndoPak spaces words differently),
  // so the cloze/peek mechanics act on the text actually shown.
  const wordRows = useMemo(() => {
    let g = 0;
    return ayahs.map((a) => {
      const text = pickArabic(a, arabicFont);
      const words = text.split(/\s+/).filter(Boolean).map((t) => ({text: t, g: g++}));
      return {ayah: a, words, graphemes: toGraphemes(text)};
    });
  }, [ayahs, arabicFont]);

  const graphemesByAyah = useMemo(() => {
    const m: Record<number, string[]> = {};
    wordRows.forEach((r) => (m[r.ayah.number] = r.graphemes));
    return m;
  }, [wordRows]);

  // For each ayah, the [start, end) grapheme span of each word (in order),
  // so the progressive peek can map its cursor to whole words — both to render
  // word-by-word and to auto-flag the word you just peeked.
  const wordSpansByAyah = useMemo(() => {
    const m: Record<number, {start: number; end: number}[]> = {};
    wordRows.forEach((r) => {
      const spans: {start: number; end: number}[] = [];
      const g = r.graphemes;
      let i = 0;
      while (i < g.length) {
        while (i < g.length && g[i].trim() === "") i++;
        if (i >= g.length) break;
        const start = i;
        while (i < g.length && g[i].trim() !== "") i++;
        spans.push({start, end: i});
      }
      m[r.ayah.number] = spans;
    });
    return m;
  }, [wordRows]);

  // Advance the peek cursor for one ayah by a single letter or to the end of
  // the next word (skipping any leading whitespace so a peek always reveals
  // something visible). Peeking is a stumble, so the word you uncover is
  // auto-flagged as a weak spot.
  function peekStep(ayahNum: number, unit: "letter" | "word") {
    const g = graphemesByAyah[ayahNum] ?? [];
    let i = Math.min(g.length, peek[ayahNum] ?? 0);
    while (i < g.length && g[i].trim() === "") i++;
    if (unit === "letter") i = Math.min(g.length, i + 1);
    else while (i < g.length && g[i].trim() !== "") i++;
    const next = i;
    setPeek((prev) => ({...prev, [ayahNum]: Math.max(next, prev[ayahNum] ?? 0)}));
    if (next > 0) {
      const spans = wordSpansByAyah[ayahNum] ?? [];
      const wi = spans.findIndex((s) => next - 1 >= s.start && next - 1 < s.end);
      if (wi >= 0) setWeakSpot(slug, ayahNum, wi, true);
    }
  }

  function setPeekVal(ayahNum: number, n: number) {
    setPeek((prev) => ({...prev, [ayahNum]: n}));
  }

  function toggleWeak(ayahNum: number, w: number) {
    setWeakSpot(slug, ayahNum, w, !isWeak(ayahNum, w));
  }

  // Flag/unflag a whole verse: if any of its words are flagged, clear them all;
  // otherwise flag them all.
  function toggleVerseWeak(row: (typeof wordRows)[number]) {
    const anyFlagged = row.words.some((_, i) => isWeak(row.ayah.number, i));
    row.words.forEach((_, i) => setWeakSpot(slug, row.ayah.number, i, !anyFlagged));
  }

  const stageDef = STAGES[stage];

  // Reset reveals when the stage or cloze density changes.
  useEffect(() => {
    setRevealed(new Set());
    setPeek({});
  }, [stage, clozeLevel]);

  // Lock body scroll + Escape / arrow-key navigation while the overlay is open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setStage((s) => Math.min(STAGES.length - 1, s + 1));
      else if (e.key === "ArrowLeft") setStage((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function reveal(key: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function revealAllWords() {
    setRevealed((prev) => {
      const next = new Set(prev);
      wordRows.forEach((r) => r.words.forEach((w) => next.add(`w:${w.g}`)));
      return next;
    });
  }

  const isLast = stage === STAGES.length - 1;

  // A single tappable Arabic word. Tapping toggles its weak-spot flag;
  // flagged words show an amber underline wherever they appear.
  function renderWord(ayahNum: number, i: number, text: string, sep: boolean) {
    const flagged = isWeak(ayahNum, i);
    return (
      <span key={i}>
        <button
          type='button'
          className={`mm-word${flagged ? " flagged" : ""}`}
          onClick={() => toggleWeak(ayahNum, i)}
          title={flagged ? "Tap to clear this weak spot" : "Tap if you forgot this word"}
        >
          {text}
        </button>
        {sep ? " " : ""}
      </span>
    );
  }

  function renderArabicFull(row: (typeof wordRows)[number]) {
    return (
      <div className='mm-ar'>
        {row.words.map((w, i) => renderWord(row.ayah.number, i, w.text, i < row.words.length - 1))}
      </div>
    );
  }

  function renderArabicCloze(row: (typeof wordRows)[number]) {
    const density = CLOZE_LEVELS[clozeLevel].density;
    // Words blanked by density. Short (or unlucky) verses can end up with every
    // word above the threshold — that would leave nothing to fill in, which is
    // the whole point of this stage. So guarantee at least one blank per verse
    // by force-blanking the verse's lowest-hash word. That word is also the
    // first this verse blanks as density rises, so the superset invariant across
    // levels still holds.
    const blankedSet = new Set<number>();
    row.words.forEach((w) => {
      if (wordHash(w.g) < density) blankedSet.add(w.g);
    });
    if (blankedSet.size === 0 && row.words.length > 0) {
      const pick = row.words.reduce((lo, w) => (wordHash(w.g) < wordHash(lo.g) ? w : lo));
      blankedSet.add(pick.g);
    }
    return (
      <div className='mm-ar'>
        {row.words.map((w, i) => {
          const blanked = blankedSet.has(w.g);
          const shown = !blanked || revealed.has(`w:${w.g}`);
          if (shown) {
            return renderWord(row.ayah.number, i, w.text, i < row.words.length - 1);
          }
          return (
            <span key={i}>
              <button
                type='button'
                className='mm-blank'
                style={{minWidth: `${Math.max(2, Math.round(w.text.length * 0.85))}ch`}}
                onClick={() => {
                  // First tap only reveals the word. Once shown it renders as a
                  // normal tappable word, so a second tap is what flags it shaky
                  // if the peek means you didn't really have it.
                  reveal(`w:${w.g}`);
                }}
                aria-label='Reveal hidden word'
              />
              {i < row.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    );
  }

  // Progressive reveal of the Arabic from its start — used by the two
  // recall-from-memory stages. Peek the next letter or word when stuck.
  function renderArabicPeek(row: (typeof wordRows)[number]) {
    const a = row.ayah;
    const g = row.graphemes;
    const total = g.length;
    const cursor = Math.min(total, peek[a.number] ?? 0);
    const full = cursor >= total;
    const spans = wordSpansByAyah[a.number] ?? [];
    return (
      <>
        {cursor > 0 ? (
          <div className='mm-ar'>
            {row.words.map((w, i) => {
              const span = spans[i];
              if (!span) return null;
              const revealedCount = Math.max(0, Math.min(span.end, cursor) - span.start);
              if (revealedCount <= 0) return null; // not yet reached by the cursor
              const wordGs = g.slice(span.start, span.end);
              const shownText = wordGs.slice(0, revealedCount).join("");
              const wordFull = revealedCount >= wordGs.length;
              return renderWord(a.number, i, shownText, wordFull);
            })}
            {!full && <span className='mm-ar-more'> …</span>}
          </div>
        ) : (
          <div className='mm-ar-empty'>Recite from memory — peek if you get stuck</div>
        )}
        <div className='mm-peek'>
          {!full && (
            <>
              <button type='button' className='mm-chip' onClick={() => peekStep(a.number, "letter")}>
                + letter
              </button>
              <button type='button' className='mm-chip' onClick={() => peekStep(a.number, "word")}>
                + word
              </button>
              <button type='button' className='mm-chip mm-chip-ghost' onClick={() => setPeekVal(a.number, total)}>
                Reveal all
              </button>
            </>
          )}
          {cursor > 0 && (
            <button type='button' className='mm-chip mm-chip-ghost' onClick={() => setPeekVal(a.number, 0)}>
              Hide
            </button>
          )}
        </div>
      </>
    );
  }

  function renderVerse(row: (typeof wordRows)[number]) {
    const a = row.ayah;
    const key = stageDef.key;
    const showTrans = key === "read" || key === "recall";
    const revealTrans = key === "arabic" || key === "cloze" || key === "blank";
    const transRevealed = revealed.has(`t:${a.number}`);
    const verseFlagged = row.words.some((_, i) => isWeak(a.number, i));

    return (
      <div className={`mm-verse${verseFlagged ? " has-weak" : ""}`} key={a.number}>
        <div className='mm-vhead'>
          <span className='mm-vnum'>Verse {a.number}</span>
          <button
            type='button'
            className={`mm-vflag${verseFlagged ? " active" : ""}`}
            onClick={() => toggleVerseWeak(row)}
            title={verseFlagged ? "Clear this verse's weak spots" : "Mark this whole verse as shaky"}
          >
            {verseFlagged ? "⚑ Shaky" : "⚐ Mark shaky"}
          </button>
        </div>

        {key === "cloze"
          ? renderArabicCloze(row)
          : key === "recall" || key === "blank"
            ? renderArabicPeek(row)
            : renderArabicFull(row)}

        {showTrans && <div className='mm-trans'>{a.translation}</div>}
        {revealTrans &&
          (transRevealed ? (
            <div className='mm-trans'>{a.translation}</div>
          ) : (
            <button type='button' className='mm-reveal-trans' onClick={() => reveal(`t:${a.number}`)}>
              Tap to reveal meaning
            </button>
          ))}
      </div>
    );
  }

  return (
    <div
      className='mm-overlay'
      role='dialog'
      aria-modal='true'
      aria-label={`${isSurah ? "Test" : "Memorize"} ${scopeTitle}`}
    >
      <div className='mm-shell'>
        {/* Header */}
        <div className='mm-header'>
          <div className='mm-head-titles'>
            <span className={`sec-badge ${PILL[scopeColor]}`}>{scopeBadge}</span>
            <span className='mm-head-title'>{scopeTitle}</span>
          </div>
          <button type='button' className='mm-close' onClick={onClose} aria-label='Close memorize mode'>
            ✕
          </button>
        </div>

        {/* Stage stepper */}
        <div className='mm-steps'>
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type='button'
              className={`mm-step ${i === stage ? "active" : ""} ${i < stage ? "done" : ""}`}
              onClick={() => setStage(i)}
            >
              <span className='mm-step-dot'>{i < stage ? "✓" : i + 1}</span>
              <span className='mm-step-label'>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='mm-body'>
          {isWeakDrill && (
            <div className='mm-drill-note'>
              Drilling only the verses you flagged. Tap a word to clear it once it sticks.
            </div>
          )}
          <div className='mm-hint'>{stageDef.hint}</div>

          {stageDef.key === "cloze" && (
            <div className='mm-cloze-ctl'>
              <span className='mm-cloze-ctl-label'>Blanks</span>
              {CLOZE_LEVELS.map((lv, i) => (
                <button
                  key={lv.label}
                  type='button'
                  className={`mm-chip ${i === clozeLevel ? "active" : ""}`}
                  onClick={() => setClozeLevel(i)}
                >
                  {lv.label}
                </button>
              ))}
              <button type='button' className='mm-chip mm-chip-ghost' onClick={revealAllWords}>
                Reveal all
              </button>
            </div>
          )}

          {wordRows.length === 0 ? (
            <div className='mm-ar-empty'>No weak spots flagged — you&apos;re all clear here.</div>
          ) : (
            <div className='mm-verses'>{wordRows.map((row) => renderVerse(row))}</div>
          )}
        </div>

        {/* Footer controls */}
        <div className='mm-footer'>
          <button
            type='button'
            className='mm-nav'
            onClick={() => setStage((s) => Math.max(0, s - 1))}
            disabled={stage === 0}
          >
            ← Back
          </button>
          <span className='mm-progress'>
            Stage {stage + 1} / {STAGES.length}
          </span>
          {isLast ? (
            <button
              type='button'
              className='mm-nav primary'
              onClick={() => {
                if (!alreadyLearned) {
                  if (scope.kind === "surah") setLearned(slug, true);
                  else if (scope.kind === "section") setSectionLearned(slug, scope.index, true);
                }
                onClose();
              }}
            >
              {isWeakDrill ? "Done" : alreadyLearned ? "Finish" : isSurah ? "✓ Mark surah learned" : "✓ Mark learned"}
            </button>
          ) : (
            <button type='button' className='mm-nav primary' onClick={() => setStage((s) => s + 1)}>
              Next stage →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
