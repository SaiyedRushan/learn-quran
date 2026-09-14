"use client";

// The order-the-themes board — the Themes stage of MemorizeMode. A guide's
// `themes` list is authored in the order the surah's ideas unfold, so shuffling
// it and asking for the sequence back tests the arc of the surah rather than
// its wording, midway through the fading-crutches ladder.
//
// Deliberately shares the order-the-sections drill's markup (.go-line /
// .go-card / .gs-card) so the two boards feel identical: drag a card, or nudge
// it with the ▲ / ▼ buttons, then check.

import {useState, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {mulberry32, shuffled} from "@/lib/drills/random";
import {useTileDrag} from "@/lib/drills/useTileDrag";
import type {ThemeCard} from "@/lib/drills/themes";

const PILL: Record<ThemeCard["color"], string> = {
  teal: "tp-teal",
  purple: "tp-purple",
  amber: "tp-amber",
  coral: "tp-coral",
  slate: "tp-slate",
};

interface ThemeTile extends ThemeCard {
  id: number; // index in the true order — also the answer key
}

export default function OrderThemesBoard({
  themes,
  seed,
  name,
  onScore,
  children,
}: {
  /** The guide's themes, in their true (authored) order. */
  themes: ThemeCard[];
  /** Round seed — the caller remounts with `key={seed}` to deal a fresh shuffle. */
  seed: number;
  /** Surah name, for the answer-key caption. */
  name: string;
  /** Called once, with the percentage of themes that landed in place. */
  onScore?: (pct: number) => void;
  /** Actions rendered under the answer key once the round is checked. */
  children?: ReactNode;
}) {
  const answer: ThemeTile[] = themes.map((t, i) => ({...t, id: i}));
  const size = answer.length;

  // Start jumbled — reshuffle until it isn't already in the right order (three
  // cards shuffle back to identity often enough to hand over the round).
  const [order, setOrder] = useState<ThemeTile[]>(() => {
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
      <div className='gm-meta go-label'>Your order — the guide&apos;s first theme at the top</div>
      <div className={`go-line${over === "line:end" ? " drop-end" : ""}`} data-drop='line:end'>
        {order.map((t, i) => {
          const verdict = done ? (t.id === answer[i].id ? " hit" : " miss") : "";
          return (
            <div
              key={t.id}
              className={`go-card gs-card${verdict}${over === `line:${i}` ? " drop-before" : ""}`}
              data-drop={`line:${i}`}
              onPointerDown={done ? undefined : (e) => startDrag(e, t.id, t.text)}
            >
              <span className='go-num'>{i + 1}</span>
              <span className='go-card-body'>
                <span className={`gth-pill ${PILL[t.color]}`}>{t.text}</span>
              </span>
              {!done && (
                <span className='gs-controls'>
                  <button
                    type='button'
                    className='gs-move'
                    aria-label={`Move ${t.text} up`}
                    disabled={i === 0}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => nudge(i, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type='button'
                    className='gs-move'
                    aria-label={`Move ${t.text} down`}
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

      {done ? (
        <>
          <div className={`gm-verdict-big ${score >= 70 ? "good" : score >= 40 ? "mid" : "bad"}`}>{score}%</div>
          <div className='gt-diff'>
            <div className='gt-diff-label'>The themes of Surah {name}, in order:</div>
            <div className='gt-diff-ref'>
              {answer.map((t, i) => (
                <div key={t.id} className='go-answer-row'>
                  <span className='go-num'>{i + 1}</span>{" "}
                  <span className={`gth-pill ${PILL[t.color]}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
          {children}
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
