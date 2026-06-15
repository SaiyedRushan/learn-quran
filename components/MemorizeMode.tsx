"use client";

import {useEffect, useMemo, useState} from "react";
import type {SurahGuide, VerseData, Ayah, PillColor} from "@/content/types";
import {setSectionLearned, useLearnedSections} from "@/lib/progress";

const PILL: Record<PillColor, string> = {
  teal: "tp-teal",
  purple: "tp-purple",
  amber: "tp-amber",
  coral: "tp-coral",
  slate: "tp-slate",
};

// The fading-crutches ladder. Each stage removes one support. Adapted to the
// available verified data (Arabic + English translation only — there is no
// per-ayah transliteration in the dataset).
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

export default function MemorizeMode({
  guide,
  verses,
  sectionIndex,
  onClose,
}: {
  guide: SurahGuide;
  verses: VerseData;
  sectionIndex: number;
  onClose: () => void;
}) {
  const section = guide.sections[sectionIndex];
  const slug = guide.meta.slug;
  const learnedSections = new Set(useLearnedSections(slug));
  const alreadyLearned = learnedSections.has(sectionIndex);

  const [stage, setStage] = useState(0);
  const [clozeLevel, setClozeLevel] = useState(0);
  // Generic set of revealed keys for the current stage. Reset on stage change.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  // Progressive peek cursor per ayah (grapheme clusters revealed from the start).
  const [peek, setPeek] = useState<Record<number, number>>({});

  const ayahs: Ayah[] = useMemo(
    () => verses.ayahs.filter((a) => a.number >= section.from && a.number <= section.to),
    [verses, section.from, section.to],
  );

  // Flatten words with a stable global index for deterministic cloze blanking,
  // and pre-segment each ayah into grapheme clusters for progressive peeking.
  const wordRows = useMemo(() => {
    let g = 0;
    return ayahs.map((a) => {
      const words = a.arabic.split(/\s+/).filter(Boolean).map((text) => ({text, g: g++}));
      return {ayah: a, words, graphemes: toGraphemes(a.arabic)};
    });
  }, [ayahs]);

  const graphemesByAyah = useMemo(() => {
    const m: Record<number, string[]> = {};
    wordRows.forEach((r) => (m[r.ayah.number] = r.graphemes));
    return m;
  }, [wordRows]);

  // Advance the peek cursor for one ayah by a single letter or to the end of
  // the next word (skipping any leading whitespace so a peek always reveals
  // something visible).
  function peekStep(ayahNum: number, unit: "letter" | "word") {
    const g = graphemesByAyah[ayahNum] ?? [];
    setPeek((prev) => {
      let i = Math.min(g.length, prev[ayahNum] ?? 0);
      while (i < g.length && g[i].trim() === "") i++;
      if (unit === "letter") i = Math.min(g.length, i + 1);
      else while (i < g.length && g[i].trim() !== "") i++;
      return {...prev, [ayahNum]: i};
    });
  }

  function setPeekVal(ayahNum: number, n: number) {
    setPeek((prev) => ({...prev, [ayahNum]: n}));
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

  function renderArabicFull(row: (typeof wordRows)[number]) {
    return <div className='mm-ar'>{row.ayah.arabic}</div>;
  }

  function renderArabicCloze(row: (typeof wordRows)[number]) {
    const density = CLOZE_LEVELS[clozeLevel].density;
    return (
      <div className='mm-ar'>
        {row.words.map((w, i) => {
          const blanked = wordHash(w.g) < density;
          const shown = !blanked || revealed.has(`w:${w.g}`);
          if (shown) {
            return (
              <span key={i}>
                {w.text}
                {i < row.words.length - 1 ? " " : ""}
              </span>
            );
          }
          return (
            <span key={i}>
              <button
                type='button'
                className='mm-blank'
                style={{minWidth: `${Math.max(2, Math.round(w.text.length * 0.85))}ch`}}
                onClick={() => reveal(`w:${w.g}`)}
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
    return (
      <>
        {cursor > 0 ? (
          <div className='mm-ar'>
            {g.slice(0, cursor).join("")}
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

    return (
      <div className='mm-verse' key={a.number}>
        <div className='mm-vnum'>Verse {a.number}</div>

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
    <div className='mm-overlay' role='dialog' aria-modal='true' aria-label={`Memorize ${section.title}`}>
      <div className='mm-shell'>
        {/* Header */}
        <div className='mm-header'>
          <div className='mm-head-titles'>
            <span className={`sec-badge ${PILL[section.color]}`}>{section.badge}</span>
            <span className='mm-head-title'>{section.title}</span>
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

          <div className='mm-verses'>{wordRows.map((row) => renderVerse(row))}</div>
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
                if (!alreadyLearned) setSectionLearned(slug, sectionIndex, true);
                onClose();
              }}
            >
              {alreadyLearned ? "Finish" : "✓ Mark learned"}
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
