"use client";

// Guess-the-translation drill. A round shows a verse's Arabic; the player
// either types the English meaning (scored as fuzzy token-F1 with a colored
// diff — see lib/drills/scoring.ts) or rebuilds the real translation from
// shuffled word chips. Rounds are drawn deterministically from a seed, so a
// challenge link (lib/drills/challenge.ts) gives a friend the same verses and
// carries scores back — async multiplayer with no backend.

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import type {Ayah, VerseData} from "@/content/types";
import {mulberry32, newSeed, sampleIndices} from "@/lib/drills/random";
import {scoreGuess, scoreSequence, type GuessResult} from "@/lib/drills/scoring";
import {decodeChallenge, challengeUrl, type RivalScore} from "@/lib/drills/challenge";
import {useTileDrag} from "@/lib/drills/useTileDrag";
import {isEnglishWord} from "@/lib/drills/text";
import {useSettings} from "@/lib/settings";
import {pickArabic} from "@/lib/arabic";

type Mode = "type" | "build";
type Phase = "setup" | "play" | "done";

const ROUND_CHOICES = [5, 10];

export default function TranslateDrill({
  slug,
  name,
  verses,
}: {
  slug: string;
  name: string;
  verses: VerseData;
}) {
  const ayahCount = verses.ayahs.length;
  const [phase, setPhase] = useState<Phase>("setup");
  const [seed, setSeed] = useState<number>(() => newSeed());
  const [mode, setMode] = useState<Mode>("type");
  const [rounds, setRounds] = useState(() => Math.min(5, ayahCount));
  const [rival, setRival] = useState<RivalScore | null>(null);
  const [challenged, setChallenged] = useState(false);

  useEffect(() => {
    const c = decodeChallenge(window.location.hash);
    if (c && c.drill === "translate" && c.slug === slug) {
      setSeed(c.seed);
      setMode(c.mode);
      setRounds(Math.min(c.rounds, ayahCount));
      setRival(c.rival ?? null);
      setChallenged(true);
    }
  }, [slug, ayahCount]);

  // The same seed must yield the same verses for both players.
  const roundAyahs: Ayah[] = useMemo(() => {
    const rand = mulberry32(seed);
    return sampleIndices(ayahCount, rounds, rand).map((i) => verses.ayahs[i]);
  }, [verses, seed, rounds, ayahCount]);

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
    const roundChoices = [...ROUND_CHOICES.filter((n) => n < ayahCount), ayahCount];
    return (
      <div className='gm-panel'>
        <div className='gm-title'>Guess the translation — {name}</div>
        {challenged && (
          <div className='gm-rival-note'>
            🎯 {rival?.name ? `${rival.name} challenged you` : "A friend challenged you"}
            {rival ? ` — they averaged ${rival.value}%. Beat it.` : " — same verses, same rules."}
          </div>
        )}
        <p className='gm-sub'>
          You&apos;ll see the Arabic of {rounds} {rounds === 1 ? "verse" : "verses"}.{" "}
          {mode === "type"
            ? "Type the English meaning in your own words — scoring is forgiving about word order, typos, and filler words, and shows you exactly which words you caught."
            : "Rebuild the translation word by word. Only the next few words are offered at a time, and the Arabic fades as you work through it."}
        </p>
        {mode === "type" ? (
          <ul className='gm-help'>
            <li>
              <kbd>Enter</kbd> submits your answer (and again moves to the next verse) ·{" "}
              <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line.
            </li>
            <li>💡 Peek reveals the translation word by word if you&apos;re stuck — no penalty.</li>
          </ul>
        ) : (
          <ul className='gm-help'>
            <li>
              Tap tiles in order — or type a few letters and press <kbd>Enter</kbd> or <kbd>Space</kbd> to
              grab the matching tile.
            </li>
            <li>
              <kbd>Backspace</kbd> in the empty box takes back your last word.
            </li>
            <li>Drag a tile between placed words to insert it; drag a placed word back to the bank to remove it.</li>
            <li>
              Once every word is placed, <kbd>Enter</kbd> checks — and again moves to the next verse.
            </li>
            <li>💡 Peek pulses the tile that belongs next.</li>
          </ul>
        )}
        {!challenged && (
          <>
            <div className='gm-row'>
              <span className='gm-row-label'>Mode</span>
              <button type='button' className={`mm-chip ${mode === "type" ? "active" : ""}`} onClick={() => setMode("type")}>
                ⌨️ Type it
              </button>
              <button type='button' className={`mm-chip ${mode === "build" ? "active" : ""}`} onClick={() => setMode("build")}>
                🧩 Build it
              </button>
            </div>
            <div className='gm-row'>
              <span className='gm-row-label'>Verses</span>
              {roundChoices.map((n) => (
                <button
                  key={n}
                  type='button'
                  className={`mm-chip ${rounds === n ? "active" : ""}`}
                  onClick={() => setRounds(n)}
                >
                  {n === ayahCount ? `All ${n}` : n}
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
      <TranslateResult
        slug={slug}
        name={name}
        seed={seed}
        mode={mode}
        rounds={rounds}
        avg={avg}
        scores={scores}
        rival={rival}
        onRestart={restart}
      />
    );
  }

  const ayah = roundAyahs[roundIdx];
  const onRoundDone = (score: number) => {
    setScores((s) => [...s, score]);
    if (roundIdx + 1 < roundAyahs.length) setRoundIdx(roundIdx + 1);
    else setPhase("done");
  };

  return (
    <div className='gm-panel'>
      <div className='gm-play-head'>
        <span className='gm-meta'>
          Round {roundIdx + 1} of {roundAyahs.length} · verse {ayah.number}
        </span>
        <span className='gm-meta'>
          {scores.length > 0 && `Avg ${Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)}%`}
        </span>
      </div>
      <div className='gm-bar'>
        <div className='gm-bar-fill' style={{width: `${(roundIdx / roundAyahs.length) * 100}%`}} />
      </div>
      {mode === "type" ? (
        <TypeRound key={`${seed}:${roundIdx}`} ayah={ayah} onDone={onRoundDone} />
      ) : (
        <BuildRound key={`${seed}:${roundIdx}`} ayah={ayah} seed={seed + roundIdx} onDone={onRoundDone} />
      )}
    </div>
  );
}

// ── Shared verse header ──────────────────────────────────────────────────

function VersePrompt({ayah}: {ayah: Ayah}) {
  const {showTransliteration, arabicFont} = useSettings();
  return (
    <div className='gq-verse'>
      <div className='mm-ar'>{pickArabic(ayah, arabicFont)}</div>
      {showTransliteration && <div className='gt-translit'>{ayah.transliteration}</div>}
    </div>
  );
}

// ── Type-it round ────────────────────────────────────────────────────────

function TypeRound({ayah, onDone}: {ayah: Ayah; onDone: (score: number) => void}) {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  // Struggling? Reveal the translation's opening words one at a time.
  const [hintCount, setHintCount] = useState(0);
  const refWords = useMemo(() => ayah.translation.split(/\s+/).filter(isEnglishWord), [ayah]);

  function submit() {
    if (result || guess.trim() === "") return;
    setResult(scoreGuess(guess, ayah.translation));
  }

  // After the score is shown, Enter advances to the next round. The listener
  // re-registers per render, so the Enter that submitted (closing over a null
  // result) never double-fires.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || !result) return;
      e.preventDefault();
      onDone(result.score);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <VersePrompt ayah={ayah} />
      {!result ? (
        <>
          <textarea
            className='gt-input'
            placeholder='What does this verse mean in English?'
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={3}
            autoFocus
          />
          {hintCount > 0 && (
            <div className='gt-hint'>
              💡 {refWords.slice(0, hintCount).join(" ")}
              {hintCount < refWords.length ? " …" : ""}
            </div>
          )}
          <div className='gm-actions'>
            <button
              type='button'
              className='mm-chip'
              onClick={() => setHintCount((c) => Math.min(refWords.length, c + 1))}
              disabled={hintCount >= refWords.length}
            >
              💡 Peek next word
            </button>
            <button type='button' className='mm-nav primary' onClick={submit} disabled={guess.trim() === ""}>
              Submit
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`gm-verdict-big ${result.score >= 70 ? "good" : result.score >= 40 ? "mid" : "bad"}`}>
            {result.score}%
          </div>
          <div className='gt-diff'>
            <div className='gt-diff-label'>The translation — green words you caught, gray you missed:</div>
            <div className='gt-diff-ref'>
              {result.ref.map((t, i) => (
                <span key={i} className={`tok ${t.matched ? "hit" : "miss"}${t.stop ? " stop" : ""}`}>
                  {t.text}{" "}
                </span>
              ))}
            </div>
            {result.extra.length > 0 && (
              <div className='gt-diff-extra'>Not in the translation: {result.extra.join(", ")}</div>
            )}
            <div className='gt-your-guess'>You wrote: “{guess}”</div>
          </div>
          <div className='gm-actions'>
            <button type='button' className='mm-nav primary' onClick={() => onDone(result.score)}>
              Next →
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ── Build-it round ───────────────────────────────────────────────────────
// Long verses used to dump every word of the translation into one huge bank.
// Now the bank is a sliding window: only the next few words of the sentence
// are offered, and new tiles slide in as you pick. A small typing box
// highlights matching tiles as you type — Enter/space grabs the match — and
// the Arabic fades word-by-word as your progress consumes it.

interface Chip {
  id: number;
  text: string;
  /** Position in the reference sentence. */
  pos: number;
  /** Deterministic display rank so tiles keep their spot as the window moves. */
  rank: number;
}

/** How many upcoming sentence words are offered at once. */
const BUILD_WINDOW = 6;

const normWord = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

function BuildRound({
  ayah,
  seed,
  onDone,
}: {
  ayah: Ayah;
  seed: number;
  onDone: (score: number) => void;
}) {
  const {showTransliteration, arabicFont} = useSettings();
  // Bare dashes / stray quotes in the translation are punctuation, not words —
  // they'd make baffling tiles, so both the tiles and the scoring skip them.
  const refWords = useMemo(() => ayah.translation.split(/\s+/).filter(isEnglishWord), [ayah]);
  const arWords = useMemo(() => pickArabic(ayah, arabicFont).split(/\s+/).filter(Boolean), [ayah, arabicFont]);

  const tiles: Chip[] = useMemo(() => {
    const rand = mulberry32(seed);
    return refWords.map((text, i) => ({id: i, text, pos: i, rank: rand()}));
  }, [refWords, seed]);

  const [picked, setPicked] = useState<Chip[]>([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState<number | null>(null);
  // Tile the peek button is currently pointing at (pulsing highlight).
  const [peekedId, setPeekedId] = useState<number | null>(null);
  const pickedIds = new Set(picked.map((c) => c.id));
  const done = score !== null;

  // Touch-friendly dragging (see lib/drills/useTileDrag). Drop targets:
  // "line:<i>" inserts before picked word i, "line:end" appends, "bank"
  // ejects a picked word back to the bank.
  const {drag, over, startDrag, didDrag} = useTileDrag((id, target) => {
    if (target === null || done) return;
    if (target === "bank") {
      setPicked((p) => p.filter((x) => x.id !== id));
      setPeekedId(null);
      return;
    }
    const m = /^line:(end|\d+)$/.exec(target);
    if (m) insertAt(id, m[1] === "end" ? picked.length : Number(m[1]));
  });

  // The window: the earliest unpicked sentence words, displayed in their fixed
  // rank order so tiles don't jump around on pick.
  const upcoming = tiles
    .filter((t) => !pickedIds.has(t.id))
    .sort((a, b) => a.pos - b.pos)
    .slice(0, BUILD_WINDOW);
  const visible = [...upcoming].sort((a, b) => a.rank - b.rank);
  const hiddenCount = refWords.length - picked.length - upcoming.length;

  const query = normWord(typed);
  const matches = query ? visible.filter((t) => normWord(t.text).startsWith(query)) : [];
  const matchIds = new Set(matches.map((t) => t.id));

  function pick(t: Chip) {
    if (done || picked.length >= refWords.length) return;
    setPicked((p) => [...p, t]);
    setTyped("");
    setPeekedId(null);
  }

  /** Drop handler: insert a bank tile at `index` (before that picked word), or
   * move an already-picked tile there — realizing mid-line you skipped a word
   * shouldn't mean tearing the whole tail down. */
  function insertAt(tileId: number, index: number) {
    const t = tiles.find((x) => x.id === tileId);
    if (!t || done) return;
    setPicked((p) => {
      const oldIdx = p.findIndex((x) => x.id === tileId);
      if (oldIdx < 0 && p.length >= refWords.length) return p; // line is full
      const without = p.filter((x) => x.id !== tileId);
      const at = oldIdx >= 0 && oldIdx < index ? index - 1 : index;
      const next = [...without];
      next.splice(Math.max(0, Math.min(at, next.length)), 0, t);
      return next;
    });
    setTyped("");
    setPeekedId(null);
  }

  // Point at the word that belongs in the next slot (scoring is positional, so
  // that's always the best pick — even after earlier mistakes). If that word
  // is already sitting in a wrong earlier slot, the pulse lands on it there
  // instead: "take this one back".
  function peek() {
    const exact = tiles.find((t) => t.pos === picked.length);
    setPeekedId(exact?.id ?? null);
  }

  function typedPick() {
    if (matches.length === 0) return;
    pick(matches.find((t) => normWord(t.text) === query) ?? matches[0]);
  }

  function check() {
    if (done || picked.length !== refWords.length) return;
    setScore(scoreSequence(picked.map((c) => c.text), refWords));
  }

  // Arabic progress: fade the portion of the verse your English has covered
  // (proportional — word alignment between the languages is only approximate).
  const frac = refWords.length > 0 ? picked.length / refWords.length : 0;
  const doneAr = done ? arWords.length : Math.round(frac * arWords.length);

  // Enter checks a fully-built line; Enter again advances. The typing box's
  // own Enter handler is a no-op once the bank is empty, so this listener
  // (re-registered per render, closures stay fresh) picks it up from there.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      if (done) {
        e.preventDefault();
        onDone(score!);
      } else if (picked.length === refWords.length) {
        e.preventDefault();
        check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <div className='gq-verse'>
        <div className='mm-ar'>
          {arWords.map((w, i) => (
            <span key={i} className={i < doneAr ? "gt-ar-done" : undefined}>
              {w}
              {i < arWords.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
        {showTransliteration && <div className='gt-translit'>{ayah.transliteration}</div>}
      </div>
      <div className={`gt-build-line${over === "line:end" ? " drop-end" : ""}`} data-drop='line:end'>
        {picked.length === 0 && (
          <span className='gm-meta'>Build the translation word by word — tap tiles, or drag them into place…</span>
        )}
        {picked.map((c, i) => {
          const cls = done ? (c.text.toLowerCase() === refWords[i]?.toLowerCase() ? " hit" : " miss") : "";
          return (
            <button
              key={c.id}
              type='button'
              className={`gq-tile en${cls}${peekedId === c.id ? " peek" : ""}${over === `line:${i}` ? " drop-before" : ""}`}
              data-drop={`line:${i}`}
              onPointerDown={done ? undefined : (e) => startDrag(e, c.id, c.text)}
              onClick={() => {
                if (done || didDrag.current) return;
                setPicked((p) => p.filter((x) => x.id !== c.id));
                setPeekedId(null);
              }}
              disabled={done}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      {!done && (
        <input
          className='gt-input gt-type'
          type='text'
          placeholder='Type to find the next word — Enter picks it (or just tap a tile)'
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              typedPick();
            } else if (e.key === "Backspace" && typed === "" && picked.length > 0) {
              e.preventDefault();
              setPicked((p) => p.slice(0, -1));
            }
          }}
        />
      )}
      <div className='gq-bank en' data-drop='bank'>
        {visible.map((t) => (
          <button
            key={t.id}
            type='button'
            className={`gq-tile en${matchIds.has(t.id) ? " match" : ""}${peekedId === t.id ? " peek" : ""}`}
            onPointerDown={done ? undefined : (e) => startDrag(e, t.id, t.text)}
            onClick={() => {
              if (!didDrag.current) pick(t);
            }}
            disabled={done || picked.length >= refWords.length}
          >
            {t.text}
          </button>
        ))}
        {hiddenCount > 0 && <span className='gt-more-tiles'>+{hiddenCount} more as you go</span>}
      </div>
      {drag && (
        <div className='gq-tile en drag-ghost' style={{left: drag.x, top: drag.y}}>
          {drag.text}
        </div>
      )}
      {done ? (
        <>
          <div className={`gm-verdict-big ${score! >= 70 ? "good" : score! >= 40 ? "mid" : "bad"}`}>{score}%</div>
          <div className='gt-diff'>
            <div className='gt-diff-label'>The translation:</div>
            <div className='gt-diff-ref'>{ayah.translation}</div>
          </div>
          <div className='gm-actions'>
            <button type='button' className='mm-nav primary' onClick={() => onDone(score!)}>
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className='gm-actions'>
          <span className='gm-meta'>
            {picked.length}/{refWords.length} words
          </span>
          <button type='button' className='mm-chip' onClick={peek} disabled={picked.length >= refWords.length}>
            💡 Peek next word
          </button>
          <button type='button' className='mm-nav primary' onClick={check} disabled={picked.length !== refWords.length}>
            Check
          </button>
        </div>
      )}
    </>
  );
}

// ── Results + challenge link ─────────────────────────────────────────────

function TranslateResult({
  slug,
  name,
  seed,
  mode,
  rounds,
  avg,
  scores,
  rival,
  onRestart,
}: {
  slug: string;
  name: string;
  seed: number;
  mode: Mode;
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
      drill: "translate",
      slug,
      seed,
      mode,
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
        {avg}% <span className='gm-score-pct'>average over {scores.length} verses</span>
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
        The link contains these exact verses and your score — whoever opens it gets the same rounds and
        sees the comparison. No account needed.
      </p>
      <div className='gm-actions'>
        <button type='button' className='mm-nav' onClick={onRestart}>
          ↻ Try again (new verses)
        </button>
        <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
          Study this surah
        </Link>
      </div>
    </div>
  );
}
