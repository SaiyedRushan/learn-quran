"use client";

// Order-the-sections drill — the page-level wrapper around OrderSectionsBoard.
// A surah is broken into a handful of thematic sections in its guide
// (content/types → GuideSection); there are rarely more than a few, so we show
// them all at once (up to SECTION_LIMIT), jumbled, and ask the player to put
// them back into the order they appear in the surah.

import Link from "next/link";
import {useMemo, useState} from "react";
import OrderSectionsBoard, {type SectionCard, type SectionTile} from "@/components/OrderSectionsBoard";
import {mulberry32, newSeed} from "@/lib/drills/random";

export type {SectionCard};

/** Most guides have 3–9 sections; cap a round so the board stays scannable.
 * Longer surahs get a random contiguous window of this many. */
const SECTION_LIMIT = 6;

export default function OrderSectionsDrill({
  slug,
  name,
  sections,
}: {
  slug: string;
  name: string;
  /** All of the surah's sections, in their true (recited) order. */
  sections: SectionCard[];
}) {
  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [seed, setSeed] = useState<number>(() => newSeed());
  const [score, setScore] = useState<number | null>(null);

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

  function restart() {
    setSeed(newSeed());
    setScore(null);
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
        <button type='button' className='mm-nav primary gm-start' onClick={() => setPhase("play")}>
          Start →
        </button>
      </div>
    );
  }

  return (
    <div className='gm-panel'>
      <div className='gm-play-head'>
        <span className='gm-meta'>
          {name} · {answer.length} sections
        </span>
        <span className='gm-meta'>{score !== null ? "Checked" : "Arrange top → bottom"}</span>
      </div>
      <OrderSectionsBoard key={seed} seed={seed} name={name} answer={answer} onScore={setScore}>
        <div className='gm-actions'>
          <button type='button' className='mm-nav primary' onClick={restart}>
            ↻ Try again
          </button>
          <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
            Study this surah
          </Link>
        </div>
      </OrderSectionsBoard>
    </div>
  );
}
