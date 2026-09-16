"use client";

// The order-the-sections board: a surah's sections arrive jumbled and you put
// them back into the order they appear. Cards move by drag (touch-friendly, via
// useTileDrag) or the ▲ / ▼ buttons; checking reveals each section's verse range
// and marks the hits and misses. There are no decoys — every card belongs, it's
// purely a reordering.
//
// Shared by two callers, which is why the board takes its actions as children
// rather than owning them: the standalone drill (OrderSectionsDrill) and the
// Sections stage of MemorizeMode.

import {useState, type ReactNode} from "react";
import {createPortal} from "react-dom";
import type {PillColor} from "@/content/types";
import {mulberry32, shuffled} from "@/lib/drills/random";
import {useTileDrag} from "@/lib/drills/useTileDrag";

/** One thematic section, trimmed from a guide for the board. */
export interface SectionCard {
  badge: string; // "Section 1"
  title: string;
  from: number; // first ayah
  to: number; // last ayah
  color: PillColor;
}

export interface SectionTile extends SectionCard {
  id: number; // stable within a round, for keys and drag
}

export default function OrderSectionsBoard({
  seed,
  answer,
  name,
  onScore,
  children,
}: {
  /** Round seed — the caller remounts with `key={seed}` to deal a fresh shuffle. */
  seed: number;
  /** The sections in play, in their true (recited) order. */
  answer: SectionTile[];
  /** Surah name, for the answer-key caption. */
  name: string;
  /** Called once, with the percentage of sections that landed in place. */
  onScore?: (pct: number) => void;
  /** Actions rendered under the answer key once the round is checked. */
  children?: ReactNode;
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
    const pct = Math.round((100 * correct) / size);
    setScore(pct);
    onScore?.(pct);
  }

  return (
    <>
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
                {done && (
                  <span className='go-card-en'>Verses {t.from === t.to ? t.from : `${t.from}–${t.to}`}</span>
                )}
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

      {/* Portalled to <body>: inside Memorize mode this board sits in a
          scrolling, backdrop-filtered overlay, which would otherwise clip a
          position:fixed ghost to the overlay's scroll box. */}
      {drag &&
        createPortal(
          <div className='go-card gs-card drag-ghost' style={{left: drag.x, top: drag.y}}>
            <span className='gs-title'>{drag.text}</span>
          </div>,
          document.body,
        )}

      {done && (
        <>
          <div className={`gm-verdict-big ${score >= 70 ? "good" : score >= 40 ? "mid" : "bad"}`}>{score}%</div>
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
          {children}
        </>
      )}

      {!done && (
        <div className='gm-actions'>
          <button type='button' className='mm-nav primary' onClick={check}>
            Check
          </button>
        </div>
      )}
    </>
  );
}
