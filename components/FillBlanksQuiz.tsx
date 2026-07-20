"use client";

// Fill-in-the-blank quiz over a surah's verified Arabic. One verse per round:
// blanked words + a word bank (correct words + same-surah distractors). Chips
// fill blanks by tap (Duolingo-style) or drag-and-drop. Deterministic from a
// seed, so a challenge link replays the identical puzzle for a friend; scores
// travel back inside a share link — no backend (see lib/games/challenge.ts).
// Wrong answers flag the word as a weak spot, feeding the guide's drill.

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import type {VerseData} from "@/content/types";
import {buildQuiz, totalBlanks, QUIZ_LEVELS, type QuizRound} from "@/lib/games/quiz";
import {newSeed} from "@/lib/games/random";
import {decodeChallenge, challengeUrl, type RivalScore} from "@/lib/games/challenge";
import {useTileDrag} from "@/lib/games/useTileDrag";
import {setWeakSpot} from "@/lib/progress";

type Phase = "setup" | "play" | "done";

export default function FillBlanksQuiz({
  slug,
  name,
  verses,
}: {
  slug: string;
  name: string;
  verses: VerseData;
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [seed, setSeed] = useState<number>(() => newSeed());
  const [level, setLevel] = useState(0);
  const [rival, setRival] = useState<RivalScore | null>(null);
  const [challenged, setChallenged] = useState(false);

  // Accept an incoming challenge link: same seed + level reproduce the exact
  // same puzzle the sender played.
  useEffect(() => {
    const c = decodeChallenge(window.location.hash);
    if (c && c.game === "quiz" && c.slug === slug) {
      setSeed(c.seed);
      setLevel(c.level);
      setRival(c.rival ?? null);
      setChallenged(true);
    }
  }, [slug]);

  const rounds = useMemo(() => buildQuiz(verses.ayahs, seed, level), [verses, seed, level]);
  const total = totalBlanks(rounds);

  const [roundIdx, setRoundIdx] = useState(0);
  const [correct, setCorrect] = useState(0);

  function start() {
    setRoundIdx(0);
    setCorrect(0);
    setPhase("play");
  }

  function restart() {
    setSeed(newSeed());
    setRival(null);
    setChallenged(false);
    setRoundIdx(0);
    setCorrect(0);
    setPhase("setup");
  }

  if (phase === "setup") {
    return (
      <div className='gm-panel'>
        <div className='gm-title'>Fill in the blanks — {name}</div>
        {challenged && (
          <div className='gm-rival-note'>
            🎯 {rival?.name ? `${rival.name} challenged you` : "A friend challenged you"}
            {rival ? ` — they scored ${rival.value}/${rival.outOf ?? total}. Beat it.` : " — same puzzle, their board."}
          </div>
        )}
        <p className='gm-sub'>
          Every verse appears once with words missing. Fill the blanks from the word bank, then check
          yourself — wrong picks are flagged as weak spots for your drill.
        </p>
        <ul className='gm-help'>
          <li>Tap a word to drop it into the next empty blank — or tap a blank first to aim at it.</li>
          <li>Drag works too: pull a word from the bank straight onto any blank.</li>
          <li>Tap a filled blank to take its word back.</li>
          <li>The translation is shown under each verse as a hint.</li>
          <li>
            <kbd>Enter</kbd> checks the verse once every blank is filled — and again moves to the next.
          </li>
        </ul>
        <div className='gm-row'>
          <span className='gm-row-label'>Difficulty</span>
          {QUIZ_LEVELS.map((lv, i) => (
            <button
              key={lv.label}
              type='button'
              className={`mm-chip ${i === level ? "active" : ""}`}
              onClick={() => {
                setLevel(i);
                // Changing difficulty makes it a different puzzle than the
                // challenge sent — drop the rival comparison.
                if (challenged && i !== level) {
                  setRival(null);
                  setChallenged(false);
                }
              }}
            >
              {lv.label}
            </button>
          ))}
        </div>
        <div className='gm-meta'>
          {verses.ayahs.length} verses · {total} blanks
        </div>
        <button type='button' className='mm-nav primary gm-start' onClick={start}>
          Start quiz →
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <QuizResult
        slug={slug}
        name={name}
        seed={seed}
        level={level}
        correct={correct}
        total={total}
        rival={rival}
        onRestart={restart}
      />
    );
  }

  const round = rounds[roundIdx];
  return (
    <QuizRoundView
      key={`${seed}:${level}:${roundIdx}`}
      slug={slug}
      round={round}
      roundIdx={roundIdx}
      roundCount={rounds.length}
      correctSoFar={correct}
      total={total}
      onDone={(gotRight) => {
        setCorrect((c) => c + gotRight);
        if (roundIdx + 1 < rounds.length) setRoundIdx(roundIdx + 1);
        else setPhase("done");
      }}
    />
  );
}

// ── One verse ────────────────────────────────────────────────────────────

function QuizRoundView({
  slug,
  round,
  roundIdx,
  roundCount,
  correctSoFar,
  total,
  onDone,
}: {
  slug: string;
  round: QuizRound;
  roundIdx: number;
  roundCount: number;
  correctSoFar: number;
  total: number;
  onDone: (gotRight: number) => void;
}) {
  // placed[slotIndex] = option id occupying that blank (slot i ↔ round.blanks[i]).
  const [placed, setPlaced] = useState<(number | null)[]>(() => round.blanks.map(() => null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const optionById = useMemo(() => new Map(round.options.map((o) => [o.id, o])), [round]);
  const usedIds = new Set(placed.filter((p): p is number => p !== null));
  const allFilled = placed.every((p) => p !== null);

  // Touch-friendly dragging (see lib/games/useTileDrag): bank chips drop onto
  // "slot:<i>" targets.
  const {drag, over, startDrag, didDrag} = useTileDrag((id, target) => {
    const m = /^slot:(\d+)$/.exec(target ?? "");
    if (m && !checked && optionById.has(id)) placeChipAt(id, Number(m[1]));
  });

  const slotOfWord = (wordIdx: number) => round.blanks.indexOf(wordIdx);

  function placeChip(optionId: number) {
    if (checked || usedIds.has(optionId)) return;
    const target = selectedSlot !== null && placed[selectedSlot] === null ? selectedSlot : placed.indexOf(null);
    if (target < 0) return;
    setPlaced((prev) => prev.map((p, i) => (i === target ? optionId : p)));
    setSelectedSlot(null);
  }

  function placeChipAt(optionId: number, slot: number) {
    if (checked) return;
    setPlaced((prev) => prev.map((p, i) => (i === slot ? optionId : p === optionId ? null : p)));
    setSelectedSlot(null);
  }

  function ejectSlot(slot: number) {
    if (checked) return;
    if (placed[slot] === null) {
      setSelectedSlot((s) => (s === slot ? null : slot));
      return;
    }
    setPlaced((prev) => prev.map((p, i) => (i === slot ? null : p)));
  }

  function check() {
    if (!allFilled || checked) return;
    setChecked(true);
    // Flag every miss as a weak spot so the guide's drill picks it up.
    round.blanks.forEach((wordIdx, slot) => {
      const chip = optionById.get(placed[slot]!);
      if (chip && chip.text !== round.words[wordIdx]) {
        setWeakSpot(slug, round.ayah.number, wordIdx, true);
      }
    });
  }

  const rightCount = round.blanks.reduce((s, wordIdx, slot) => {
    const chip = placed[slot] !== null ? optionById.get(placed[slot]!) : null;
    return s + (chip && chip.text === round.words[wordIdx] ? 1 : 0);
  }, 0);

  // Enter checks a fully-filled verse; Enter again advances. preventDefault
  // keeps a focused button from also firing its click on the same press.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (checked) {
        e.preventDefault();
        onDone(rightCount);
      } else if (allFilled) {
        e.preventDefault();
        check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className='gm-panel'>
      <div className='gm-play-head'>
        <span className='gm-meta'>
          Verse {roundIdx + 1} of {roundCount}
        </span>
        <span className='gm-meta'>
          Score {correctSoFar}
          {checked ? ` + ${rightCount}` : ""} / {total}
        </span>
      </div>
      <div className='gm-bar'>
        <div className='gm-bar-fill' style={{width: `${(roundIdx / roundCount) * 100}%`}} />
      </div>

      <div className='gq-verse'>
        <div className='mm-vnum' style={{marginBottom: 8}}>
          Verse {round.ayah.number}
        </div>
        <div className='mm-ar'>
          {round.words.map((word, wi) => {
            const slot = slotOfWord(wi);
            const sep = wi < round.words.length - 1 ? " " : "";
            if (slot < 0)
              return (
                <span key={wi}>
                  {word}
                  {sep}
                </span>
              );
            const chip = placed[slot] !== null ? optionById.get(placed[slot]!) : null;
            const isRight = chip?.text === word;
            const cls = checked
              ? isRight
                ? " right"
                : " wrong"
              : chip
                ? " filled"
                : selectedSlot === slot || over === `slot:${slot}`
                  ? " selected"
                  : "";
            return (
              <span key={wi}>
                <button
                  type='button'
                  className={`gq-slot${cls}`}
                  style={!chip ? {minWidth: `${Math.max(3, Math.round(word.length * 0.85))}ch`} : undefined}
                  data-drop={`slot:${slot}`}
                  onClick={() => ejectSlot(slot)}
                  aria-label={chip ? "Remove this word" : "Empty blank"}
                >
                  {checked && !isRight ? (
                    <>
                      {chip && <s>{chip.text}</s>} {word}
                    </>
                  ) : (
                    chip?.text ?? " "
                  )}
                </button>
                {sep}
              </span>
            );
          })}
        </div>
        <div className='mm-trans'>{round.ayah.translation}</div>
      </div>

      <div className='gq-bank' dir='rtl'>
        {round.options.map((o) => {
          const used = usedIds.has(o.id);
          return (
            <button
              key={o.id}
              type='button'
              className={`gq-tile${used ? " used" : ""}`}
              onPointerDown={checked || used ? undefined : (e) => startDrag(e, o.id, o.text)}
              onClick={() => {
                if (!didDrag.current) placeChip(o.id);
              }}
              disabled={checked || used}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      {drag && (
        <div className='gq-tile drag-ghost' style={{left: drag.x, top: drag.y}}>
          {drag.text}
        </div>
      )}

      <div className='gm-actions'>
        {checked ? (
          <>
            <span className={`gm-verdict ${rightCount === round.blanks.length ? "good" : "bad"}`}>
              {rightCount === round.blanks.length
                ? "✓ All correct"
                : `${rightCount}/${round.blanks.length} — misses flagged as weak spots`}
            </span>
            <button type='button' className='mm-nav primary' onClick={() => onDone(rightCount)}>
              {roundIdx + 1 < roundCount ? "Next verse →" : "See results →"}
            </button>
          </>
        ) : (
          <button type='button' className='mm-nav primary' onClick={check} disabled={!allFilled}>
            Check
          </button>
        )}
      </div>
    </div>
  );
}

// ── Results + challenge link ─────────────────────────────────────────────

function QuizResult({
  slug,
  name,
  seed,
  level,
  correct,
  total,
  rival,
  onRestart,
}: {
  slug: string;
  name: string;
  seed: number;
  level: number;
  correct: number;
  total: number;
  rival: RivalScore | null;
  onRestart: () => void;
}) {
  const [playerName, setPlayerName] = useState("");
  const [copied, setCopied] = useState(false);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  function copyChallenge() {
    const url = challengeUrl(window.location.pathname, {
      game: "quiz",
      slug,
      seed,
      level,
      rival: {value: correct, outOf: total, name: playerName.trim() || undefined},
    });
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => window.prompt("Copy this challenge link:", url));
  }

  const beat = rival ? correct - rival.value : 0;

  return (
    <div className='gm-panel'>
      <div className='gm-title'>Results — {name}</div>
      <div className='gm-score-big'>
        {correct}/{total} <span className='gm-score-pct'>({pct}%)</span>
      </div>
      {rival && (
        <div className={`gm-vs ${beat > 0 ? "win" : beat < 0 ? "lose" : "tie"}`}>
          {rival.name || "Your friend"} scored {rival.value}/{rival.outOf ?? total} —{" "}
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
        The link contains this exact puzzle and your score — whoever opens it plays the same blanks and
        sees the comparison. No account needed.
      </p>
      <div className='gm-actions'>
        <button type='button' className='mm-nav' onClick={onRestart}>
          ↻ Play again (new blanks)
        </button>
        <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
          Back to the guide
        </Link>
      </div>
    </div>
  );
}
