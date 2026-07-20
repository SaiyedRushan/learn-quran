"use client";

// Pointer-based tile dragging that works on touchscreens as well as mouse —
// HTML5 drag-and-drop never fires on touch. A tile opts in by calling
// startDrag from its onPointerDown; once the pointer moves past a small
// threshold the press becomes a drag: a floating ghost follows the pointer
// and the drop target underneath is resolved via document.elementFromPoint
// against [data-drop] attributes. A press that never crosses the threshold is
// left alone so taps keep working; consumers check didDrag to skip the click
// event that fires after a real drag.

import {useRef, useState} from "react";

export interface TileDrag {
  id: number;
  text: string;
  x: number;
  y: number;
}

/** Pixels of movement before a press becomes a drag instead of a tap. */
const THRESHOLD = 6;

export function useTileDrag(onDrop: (id: number, target: string | null) => void) {
  const [drag, setDrag] = useState<TileDrag | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const didDrag = useRef(false);

  function targetAt(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y);
    const hit = el?.closest?.("[data-drop]") as HTMLElement | null;
    return hit?.dataset.drop ?? null;
  }

  function startDrag(e: React.PointerEvent, id: number, text: string) {
    if (e.button !== 0) return;
    didDrag.current = false;
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const move = (ev: PointerEvent) => {
      if (!active && Math.hypot(ev.clientX - startX, ev.clientY - startY) < THRESHOLD) return;
      active = true;
      didDrag.current = true;
      setDrag({id, text, x: ev.clientX, y: ev.clientY});
      setOver(targetAt(ev.clientX, ev.clientY));
    };
    const finish = (ev: PointerEvent, drop: boolean) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (active && drop) onDrop(id, targetAt(ev.clientX, ev.clientY));
      setDrag(null);
      setOver(null);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }

  return {drag, over, startDrag, didDrag};
}
