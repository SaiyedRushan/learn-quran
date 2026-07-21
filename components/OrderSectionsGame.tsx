"use client";

// Order-the-sections game. A surah is broken into a handful of thematic
// sections in its guide (content/types → GuideSection); there are rarely more
// than a few, so we show them all at once (up to SECTION_LIMIT), jumbled, and
// ask the player to put them back into the order they appear in the surah.
// Unlike the verses game there are no decoys — every card belongs, it's purely
// a reordering. Cards move by drag (touch-friendly, via useTileDrag) or the
// ▲ / ▼ buttons; checking reveals each section's verse range and marks the
// hits and misses.

import Link from "next/link";
import {useMemo, useState} from "react";
import type {PillColor} from "@/content/types";
import {mulberry32, newSeed, shuffled} from "@/lib/games/random";
import {useTileDrag} from "@/lib/games/useTileDrag";

/** One thematic section, trimmed from a guide for the game. */
export interface SectionCard {
  badge: string; // "Section 1"
  title: string;
  from: number; // first ayah
  to: number; // last ayah
  color: PillColor;
}

/** Most guides have 3–9 sections; cap a round so the board stays scannable.
 * Longer surahs get a random contiguous window of this many. */
const SECTION_LIMIT = 6;

type Phase = "setup" | "play" | "done";

interface SectionTile extends SectionCard {
  id: number; // stable within a round, for keys and drag
}

export default function OrderSectionsGame({
  slug,
  name,
  sections,
}: {
  slug: string;
  name: string;
  /** All of the surah's sections, in their true (recited) order. */
  sections: SectionCard[];
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [seed, setSeed] = useState<number>(() => newSeed());

  // The answer: up to SECTION_LIMIT sections in true order. A longer surah
  // gets a random contiguous window so the run is always a real stretch of the
  // surah rather than a scattered pick.
  const answer: SectionTile[] = useMemo(() => {
    const rand = mulberry32(seed);
    const count = Math.min(SECTION_LIMIT, sections.length);
    const maxStart = sections.length - count;
    const start = maxStart > 0 ? Math.floor(rand() * (maxStart + 1)) : 0;
    return sections.slice(start, start + count).map((s, i) => ({...s, id: i}));
  }, [sections, seed]);

  function start() {
    setPhase("play");
  }

  function restart() {
    setSeed(newSeed());
    setPhase("setup");
  }

  if (phase === "setup") {
    return (
      <div className='gm-panel'>
        <div className='gm-title'>Order the sections — {name}</div>
        <p className='gm-sub'>
          Surah {name} is built from {answer.length} thematic sections. They arrive shuffled — put them back
          into the order they unfold in the surah. Only the section titles are shown; check when you&apos;re
          happy and see the verse ranges revealed.
        </p>
        <ul className='gm-help'>
          <li>Drag a card, or use its ▲ / ▼ buttons, to move it up or down.</li>
          <li>Every card belongs — there are no decoys here, it&apos;s purely about the order.</li>
          <li>Checking scores each section that landed in its correct place.</li>
        </ul>
        <button type='button' className='mm-nav primary gm-start' onClick={start}>
          Start →
        </button>
      </div>
    );
  }

  return (
    <div className='gm-panel'>
      <SectionRound key={seed} seed={seed} name={name} slug={slug} answer={answer} onRestart={restart} />
    </div>
  );
}

// ── One round ────────────────────────────────────────────────────────────

function SectionRound({
  seed,
  name,
  slug,
  answer,
  onRestart,
}: {
  seed: number;
  name: string;
  slug: string;
  answer: SectionTile[];
  onRestart: () => void;
}) {
  const size = answer.length;
  // Start jumbled — reshuffle until it isn't already in the right order (a
  // small surah can shuffle back to identity and hand over the round).
  const [order, setOrder] = useState<SectionTile[]>(() => {
    const rand = mulberry32(seed || 1);
    let out = shuffled(answer, rand);
    for (let tries = 0; tries < 8 && out.every((t, i) => t.id === answer[i].id); tries++) {
      out = shuffled(answer, rand);
    }
    return out;
  });
  const [score, setScore] = useState<number | null>(null);
  const done = score !== null;

  const {drag, over, startDrag} = useTileDrag((id, target) => {
    if (target === null || done) return;
    const m = /^line:(end|\d+)$/.exec(target);
    if (m) moveTo(id, m[1] === "end" ? order.length : Number(m[1]));
  });

  /** Move the card with `id` to `index` in the list. */
  function moveTo(id: number, index: number) {
    if (done) return;
    setOrder((p) => {
      const oldIdx = p.findIndex((x) => x.id === id);
      if (oldIdx < 0) return p;
      const without = p.filter((x) => x.id !== id);
      const at = oldIdx < index ? index - 1 : index;
      const next = [...without];
      next.splice(Math.max(0, Math.min(at, next.length)), 0, p[oldIdx]);
      return next;
    });
  }

  /** Swap a card with its neighbour (the ▲ / ▼ buttons). */
  function nudge(i: number, dir: -1 | 1) {
    if (done) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((p) => {
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function check() {
    if (done) return;
    const correct = order.filter((t, i) => t.id === answer[i].id).length;
    setScore(Math.round((100 * correct) / size));
  }

  return (
    <>
      <div className='gm-play-head'>
        <span className='gm-meta'>
          {name} · {size} sections
        </span>
        <span className='gm-meta'>{done ? "Checked" : "Arrange top → bottom"}</span>
      </div>

      <div className='gm-meta go-label'>Your order — first in the surah at the top</div>
      <div className={`go-line${over === "line:end" ? " drop-end" : ""}`} data-drop='line:end'>
        {order.map((t, i) => {
          const verdict = done ? (t.id === answer[i].id ? " hit" : " miss") : "";
          return (
            <div
              key={t.id}
              className={`go-card gs-card${verdict}${over === `line:${i}` ? " drop-before" : ""}`}
              data-drop={`line:${i}`}
              onPointerDown={done ? undefined : (e) => startDrag(e, t.id, t.title)}
            >
              <span className='go-num'>{i + 1}</span>
              <span className='go-card-body'>
                <span className='gs-title'>{t.title}</span>
                {done && <span className='go-card-en'>Verses {t.from === t.to ? t.from : `${t.from}–${t.to}`}</span>}
              </span>
              {!done && (
                <span className='gs-controls'>
                  <button
                    type='button'
                    className='gs-move'
                    aria-label={`Move ${t.title} up`}
                    disabled={i === 0}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => nudge(i, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type='button'
                    className='gs-move'
                    aria-label={`Move ${t.title} down`}
                    disabled={i === size - 1}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => nudge(i, 1)}
                  >
                    ▼
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {drag && (
        <div className='go-card gs-card drag-ghost' style={{left: drag.x, top: drag.y}}>
          <span className='gs-title'>{drag.text}</span>
        </div>
      )}

      {done ? (
        <>
          <div className={`gm-verdict-big ${score! >= 70 ? "good" : score! >= 40 ? "mid" : "bad"}`}>{score}%</div>
          <div className='gt-diff'>
            <div className='gt-diff-label'>The sections of Surah {name}, in order:</div>
            <div className='gt-diff-ref'>
              {answer.map((t, i) => (
                <div key={t.id} className='go-answer-row'>
                  <span className='go-num'>{i + 1}</span> {t.title}{" "}
                  <span className='gs-range'>(v.{t.from === t.to ? t.from : `${t.from}–${t.to}`})</span>
                </div>
              ))}
            </div>
          </div>
          <div className='gm-actions'>
            <button type='button' className='mm-nav primary' onClick={onRestart}>
              ↻ Play again
            </button>
            <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
              Study this surah
            </Link>
          </div>
        </>
      ) : (
        <div className='gm-actions'>
          <button type='button' className='mm-nav primary' onClick={check}>
            Check
          </button>
        </div>
      )}
    </>
  );
}
