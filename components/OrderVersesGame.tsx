"use client";

// Order-the-verses game. A round deals a contiguous run of verses from the
// passage plus a few decoys — verses from just before or after the run in the
// same passage (the trickiest impostors, since they read in the same voice),
// topped up with verses from neighbouring surahs — all shuffled into one bank
// of cards showing only Arabic (and transliteration). The player arranges the
// real verses in order and leaves the decoys behind; a hint button reveals the
// English translations at no penalty. Rounds are drawn deterministically from a
// seed, so a challenge link (lib/games/challenge.ts) gives a friend the same
// puzzle and carries scores back.

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import type {VerseData} from "@/content/types";
import {mulberry32, newSeed, shuffled} from "@/lib/games/random";
import {decodeChallenge, challengeUrl, type RivalScore} from "@/lib/games/challenge";
import {useTileDrag} from "@/lib/games/useTileDrag";
import {useSettings} from "@/lib/settings";

/** A verse from another surah, mixed into the bank to be spotted and left out. */
export interface DecoyVerse {
  arabic: string;
  transliteration: string;
  translation: string;
  /** Where it's actually from — revealed after checking. */
  source: string;
}

type Phase = "setup" | "play" | "done";

const ROUND_CHOICES = [3, 5];

interface OrderTile {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  /** Verse number within the surah — set for real verses AND nearby decoys. */
  ayahNumber: number | null;
  /** Decoy provenance; null for real verses. */
  source: string | null;
  /** True for a decoy drawn from just before/after the run in this passage. */
  nearby: boolean;
}

interface OrderRound {
  /** The bank, already shuffled. */
  tiles: OrderTile[];
  /** The true sequence, in order. */
  answer: OrderTile[];
}

/** How many verses before/after the run to pull same-passage decoys from. */
const NEARBY_WINDOW = 4;

/** Total decoys per round — one more on long sequences so the bank stays busy. */
const decoyTarget = (size: number) => (size >= 5 ? 3 : 2);

export default function OrderVersesGame({
  slug,
  name,
  verses,
  decoys,
}: {
  slug: string;
  name: string;
  verses: VerseData;
  decoys: DecoyVerse[];
}) {
  const ayahCount = verses.ayahs.length;
  // Sequence lengths that fit this passage; tiny passages get one "all of it".
  const sizeChoices = useMemo(() => {
    const fits = [3, 4, 5].filter((n) => n <= ayahCount);
    return fits.length > 0 ? fits : [ayahCount];
  }, [ayahCount]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [seed, setSeed] = useState<number>(() => newSeed());
  const [size, setSize] = useState(() => (sizeChoices.includes(4) ? 4 : sizeChoices[sizeChoices.length - 1]));
  const [rounds, setRounds] = useState(ROUND_CHOICES[0]);
  const [rival, setRival] = useState<RivalScore | null>(null);
  const [challenged, setChallenged] = useState(false);

  useEffect(() => {
    const c = decodeChallenge(window.location.hash);
    if (c && c.game === "order" && c.slug === slug) {
      setSeed(c.seed);
      setSize(Math.max(1, Math.min(c.size, ayahCount)));
      setRounds(c.rounds);
      setRival(c.rival ?? null);
      setChallenged(true);
    }
  }, [slug, ayahCount]);

  // The same seed must yield the same runs, decoys, and shuffle for both
  // players, so everything random is drawn from one PRNG in a fixed order.
  const roundsData: OrderRound[] = useMemo(() => {
    const rand = mulberry32(seed);
    const starts = shuffled(
      Array.from({length: ayahCount - size + 1}, (_, i) => i),
      rand,
    );
    let nextId = 0;
    return Array.from({length: rounds}, (_, r) => {
      const start = starts[r % starts.length];
      const answer: OrderTile[] = verses.ayahs.slice(start, start + size).map((a) => ({
        id: nextId++,
        arabic: a.arabic,
        transliteration: a.transliteration,
        translation: a.translation,
        ayahNumber: a.number,
        source: null,
        nearby: false,
      }));
      // A decoy identical to a real verse (repeated refrains) would be
      // unfair — and two identical decoys just look broken.
      const seen = new Set(answer.map((t) => t.arabic));

      // Nearby decoys: verses just before/after the run within this same
      // passage. They read in the same register as the answer, so they're the
      // sharpest impostors — the point of this variant.
      const nearbyPool: OrderTile[] = [];
      const lo = Math.max(0, start - NEARBY_WINDOW);
      const hi = Math.min(ayahCount, start + size + NEARBY_WINDOW);
      for (let i = lo; i < hi; i++) {
        if (i >= start && i < start + size) continue; // inside the run itself
        const a = verses.ayahs[i];
        if (seen.has(a.arabic)) continue;
        seen.add(a.arabic);
        nearbyPool.push({
          id: 0, // real id assigned once the draw order is fixed, below
          arabic: a.arabic,
          transliteration: a.transliteration,
          translation: a.translation,
          ayahNumber: a.number,
          source: name,
          nearby: true,
        });
      }

      // Cross-surah decoys — believable impostors from other surahs (the pool
      // built at the page level).
      const crossPool = decoys.filter((d) => {
        if (seen.has(d.arabic)) return false;
        seen.add(d.arabic);
        return true;
      });

      // Draw both pools from the PRNG in a fixed order (so a challenge link
      // reproduces the exact bank), then fill the decoy slots nearby-first and
      // top up with cross-surah decoys.
      const nearbyShuffled = shuffled(nearbyPool, rand);
      const crossShuffled = shuffled(crossPool, rand);
      const want = Math.min(decoyTarget(size), nearbyShuffled.length + crossShuffled.length);
      const picked: OrderTile[] = [];
      for (const t of nearbyShuffled) {
        if (picked.length >= want) break;
        picked.push({...t, id: nextId++});
      }
      for (const d of crossShuffled) {
        if (picked.length >= want) break;
        picked.push({id: nextId++, ...d, ayahNumber: null, source: d.source, nearby: false});
      }
      return {tiles: shuffled([...answer, ...picked], rand), answer};
    });
  }, [verses, decoys, seed, rounds, size, ayahCount, name]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  function start() {
    setRoundIdx(0);
    setScores([]);
    setPhase("play");
  }

  function restart() {
    setSeed(newSeed());
    setRival(null);
    setChallenged(false);
    setPhase("setup");
  }

  if (phase === "setup") {
    return (
      <div className='gm-panel'>
        <div className='gm-title'>Order the verses — {name}</div>
        {challenged && (
          <div className='gm-rival-note'>
            🎯 {rival?.name ? `${rival.name} challenged you` : "A friend challenged you"}
            {rival ? ` — they averaged ${rival.value}%. Beat it.` : " — same verses, same rules."}
          </div>
        )}
        <p className='gm-sub'>
          Each round deals {size === 1 ? "a verse" : `${size} consecutive verses`} of this passage, shuffled —
          with a couple of decoy verses mixed in, some drawn from just before or after the run in this same
          surah and some from other surahs. Arrange the real ones in the order they are recited, and leave the
          impostors in the bank. Only the Arabic and transliteration are shown.
        </p>
        <ul className='gm-help'>
          <li>Tap a card to add it as the next verse — or drag cards to reorder or insert between others.</li>
          <li>Tap a placed card (or drag it back down) to return it to the bank.</li>
          <li>
            💡 Hint shows the passage&apos;s English translation in the correct order — if you know some of
            the Arabic words, match the cards against it. No penalty.
          </li>
          <li>
            Once the sequence is full, <kbd>Enter</kbd> checks — and again moves to the next round.
          </li>
        </ul>
        {!challenged && (
          <>
            {sizeChoices.length > 1 && (
              <div className='gm-row'>
                <span className='gm-row-label'>Sequence</span>
                {sizeChoices.map((n) => (
                  <button
                    key={n}
                    type='button'
                    className={`mm-chip ${size === n ? "active" : ""}`}
                    onClick={() => setSize(n)}
                  >
                    {n} verses
                  </button>
                ))}
              </div>
            )}
            <div className='gm-row'>
              <span className='gm-row-label'>Rounds</span>
              {ROUND_CHOICES.map((n) => (
                <button
                  key={n}
                  type='button'
                  className={`mm-chip ${rounds === n ? "active" : ""}`}
                  onClick={() => setRounds(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        <button type='button' className='mm-nav primary gm-start' onClick={start}>
          Start →
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;
    return (
      <OrderResult
        slug={slug}
        name={name}
        seed={seed}
        size={size}
        rounds={rounds}
        avg={avg}
        scores={scores}
        rival={rival}
        onRestart={restart}
      />
    );
  }

  const round = roundsData[roundIdx];
  const onRoundDone = (score: number) => {
    setScores((s) => [...s, score]);
    if (roundIdx + 1 < roundsData.length) setRoundIdx(roundIdx + 1);
    else setPhase("done");
  };

  return (
    <div className='gm-panel'>
      <div className='gm-play-head'>
        <span className='gm-meta'>
          Round {roundIdx + 1} of {roundsData.length} · {round.answer.length}{" "}
          {round.answer.length === 1 ? "verse" : "verses"} + {round.tiles.length - round.answer.length} decoys
        </span>
        <span className='gm-meta'>
          {scores.length > 0 && `Avg ${Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)}%`}
        </span>
      </div>
      <div className='gm-bar'>
        <div className='gm-bar-fill' style={{width: `${(roundIdx / roundsData.length) * 100}%`}} />
      </div>
      <OrderRoundView key={`${seed}:${roundIdx}`} round={round} surahName={name} onDone={onRoundDone} />
    </div>
  );
}

// ── One round ────────────────────────────────────────────────────────────

function OrderRoundView({
  round,
  surahName,
  onDone,
}: {
  round: OrderRound;
  surahName: string;
  onDone: (score: number) => void;
}) {
  const {showTransliteration} = useSettings();
  const {tiles, answer} = round;
  const size = answer.length;

  const [picked, setPicked] = useState<OrderTile[]>([]);
  // Hint: the passage's English in the true order — not per-card labels,
  // which would hand over the decoys for free. Knowing a few Arabic words is
  // enough to match cards against it.
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const done = score !== null;
  const pickedIds = new Set(picked.map((t) => t.id));
  const bank = tiles.filter((t) => !pickedIds.has(t.id));

  // Touch-friendly dragging (see lib/games/useTileDrag). Drop targets:
  // "line:<i>" inserts before placed verse i, "line:end" appends, "bank"
  // ejects a placed verse back to the bank.
  const {drag, over, startDrag, didDrag} = useTileDrag((id, target) => {
    if (target === null || done) return;
    if (target === "bank") {
      setPicked((p) => p.filter((x) => x.id !== id));
      return;
    }
    const m = /^line:(end|\d+)$/.exec(target);
    if (m) insertAt(id, m[1] === "end" ? picked.length : Number(m[1]));
  });

  function pick(t: OrderTile) {
    if (done || picked.length >= size) return;
    setPicked((p) => [...p, t]);
  }

  /** Insert a bank card at `index`, or move an already-placed card there. */
  function insertAt(tileId: number, index: number) {
    const t = tiles.find((x) => x.id === tileId);
    if (!t || done) return;
    setPicked((p) => {
      const oldIdx = p.findIndex((x) => x.id === tileId);
      if (oldIdx < 0 && p.length >= size) return p; // sequence is full
      const without = p.filter((x) => x.id !== tileId);
      const at = oldIdx >= 0 && oldIdx < index ? index - 1 : index;
      const next = [...without];
      next.splice(Math.max(0, Math.min(at, next.length)), 0, t);
      return next;
    });
  }

  function check() {
    if (done || picked.length !== size) return;
    // Compare Arabic text, not tile identity: repeated refrains within a
    // passage are interchangeable and must not be marked wrong.
    const correct = picked.filter((t, i) => t.arabic === answer[i].arabic).length;
    setScore(Math.round((100 * correct) / size));
  }

  // Enter checks a full sequence; Enter again advances. Re-registered per
  // render so the closures stay fresh.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      if (done) {
        e.preventDefault();
        onDone(score!);
      } else if (picked.length === size) {
        e.preventDefault();
        check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const card = (t: OrderTile, opts: {slot?: number; drop?: string; ghost?: boolean}) => {
    const verdict =
      done && opts.slot !== undefined ? (t.arabic === answer[opts.slot].arabic ? " hit" : " miss") : "";
    const isDecoyRevealed = done && t.source !== null;
    return (
      <button
        key={t.id}
        type='button'
        className={`go-card${verdict}${isDecoyRevealed ? " decoy" : ""}${over === opts.drop ? " drop-before" : ""}${opts.ghost ? " drag-ghost" : ""}`}
        data-drop={opts.drop}
        onPointerDown={done ? undefined : (e) => startDrag(e, t.id, t.arabic)}
        onClick={() => {
          if (done || didDrag.current) return;
          if (opts.slot !== undefined) setPicked((p) => p.filter((x) => x.id !== t.id));
          else pick(t);
        }}
        disabled={done || (opts.slot === undefined && picked.length >= size)}
      >
        {opts.slot !== undefined && (
          <span className='go-num'>{done && t.ayahNumber !== null ? `v.${t.ayahNumber}` : opts.slot + 1}</span>
        )}
        <span className='go-card-body'>
          <span className='go-card-ar' dir='rtl' lang='ar'>
            {t.arabic}
          </span>
          {showTransliteration && <span className='go-card-tr'>{t.transliteration}</span>}
          {done && <span className='go-card-en'>{t.translation}</span>}
          {isDecoyRevealed && (
            <span className='go-card-src'>
              {t.nearby
                ? `🕵️ Decoy — verse ${t.ayahNumber} of Surah ${surahName}, just outside this run`
                : `🕵️ Decoy — this is from Surah ${t.source}`}
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <>
      {showHint && !done && (
        <div className='gt-hint go-hint'>
          <div className='go-hint-title'>💡 The passage in English, in the right order:</div>
          {answer.map((t, i) => (
            <div key={t.id} className='go-answer-row'>
              {i + 1}. {t.translation}
            </div>
          ))}
        </div>
      )}
      <div className='gm-meta go-label'>
        Your sequence — first recited at the top ({picked.length}/{size})
      </div>
      <div className={`go-line${over === "line:end" ? " drop-end" : ""}`} data-drop='line:end'>
        {picked.length === 0 && (
          <span className='gm-meta'>Tap the verse that comes first, or drag cards up here…</span>
        )}
        {picked.map((t, i) => card(t, {slot: i, drop: `line:${i}`}))}
      </div>
      <div className='gm-meta go-label'>Verse bank{done ? "" : " — some of these don't belong"}</div>
      <div className='go-bank' data-drop='bank'>
        {bank.length === 0 && <span className='gm-meta'>Empty — every card is placed.</span>}
        {bank.map((t) => card(t, {}))}
      </div>
      {drag && (
        <div className='go-card drag-ghost' style={{left: drag.x, top: drag.y}}>
          <span className='go-card-ar' dir='rtl' lang='ar'>
            {drag.text}
          </span>
        </div>
      )}
      {done ? (
        <>
          <div className={`gm-verdict-big ${score! >= 70 ? "good" : score! >= 40 ? "mid" : "bad"}`}>{score}%</div>
          <div className='gt-diff'>
            <div className='gt-diff-label'>
              The real sequence — verses {answer[0].ayahNumber}–{answer[size - 1].ayahNumber} of Surah{" "}
              {surahName}:
            </div>
            <div className='gt-diff-ref'>
              {answer.map((t) => (
                <div key={t.id} className='go-answer-row'>
                  <span className='go-num'>v.{t.ayahNumber}</span> {t.translation}
                </div>
              ))}
            </div>
          </div>
          <div className='gm-actions'>
            <button type='button' className='mm-nav primary' onClick={() => onDone(score!)}>
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className='gm-actions'>
          <button type='button' className='mm-chip' onClick={() => setShowHint((s) => !s)}>
            💡 {showHint ? "Hide hint" : "Hint: English in order"}
          </button>
          <button type='button' className='mm-nav primary' onClick={check} disabled={picked.length !== size}>
            Check
          </button>
        </div>
      )}
    </>
  );
}

// ── Results + challenge link ─────────────────────────────────────────────

function OrderResult({
  slug,
  name,
  seed,
  size,
  rounds,
  avg,
  scores,
  rival,
  onRestart,
}: {
  slug: string;
  name: string;
  seed: number;
  size: number;
  rounds: number;
  avg: number;
  scores: number[];
  rival: RivalScore | null;
  onRestart: () => void;
}) {
  const [playerName, setPlayerName] = useState("");
  const [copied, setCopied] = useState(false);

  function copyChallenge() {
    const url = challengeUrl(window.location.pathname, {
      game: "order",
      slug,
      seed,
      size,
      rounds,
      rival: {value: avg, name: playerName.trim() || undefined},
    });
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => window.prompt("Copy this challenge link:", url));
  }

  const beat = rival ? avg - rival.value : 0;

  return (
    <div className='gm-panel'>
      <div className='gm-title'>Results — {name}</div>
      <div className='gm-score-big'>
        {avg}% <span className='gm-score-pct'>average over {scores.length} rounds</span>
      </div>
      <div className='gm-round-scores'>
        {scores.map((s, i) => (
          <span key={i} className={`gm-round-pill ${s >= 70 ? "good" : s >= 40 ? "mid" : "bad"}`}>
            {s}%
          </span>
        ))}
      </div>
      {rival && (
        <div className={`gm-vs ${beat > 0 ? "win" : beat < 0 ? "lose" : "tie"}`}>
          {rival.name || "Your friend"} averaged {rival.value}% —{" "}
          {beat > 0 ? "you won! 🏆" : beat < 0 ? "they're ahead. Rematch?" : "it's a tie."}
        </div>
      )}
      <div className='gm-share'>
        <input
          className='gm-name-input'
          type='text'
          placeholder='Your name (optional, shown to your friend)'
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={24}
        />
        <button type='button' className='mm-nav primary' onClick={copyChallenge}>
          {copied ? "✓ Link copied" : rival ? "Send your result back" : "🔗 Challenge a friend"}
        </button>
      </div>
      <p className='gm-sub'>
        The link contains these exact rounds and your score — whoever opens it plays the same puzzle and sees
        the comparison. No account needed.
      </p>
      <div className='gm-actions'>
        <button type='button' className='mm-nav' onClick={onRestart}>
          ↻ Play again (new rounds)
        </button>
        <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
          Study this surah
        </Link>
      </div>
    </div>
  );
}
