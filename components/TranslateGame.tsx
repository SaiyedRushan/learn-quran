"use client";

// Guess-the-translation game. A round shows a verse's Arabic; the player
// either types the English meaning (scored as fuzzy token-F1 with a colored
// diff — see lib/games/scoring.ts) or rebuilds the real translation from
// shuffled word chips. Rounds are drawn deterministically from a seed, so a
// challenge link (lib/games/challenge.ts) gives a friend the same verses and
// carries scores back — async multiplayer with no backend.

import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import type {Ayah, VerseData} from "@/content/types";
import {mulberry32, newSeed, sampleIndices, shuffled} from "@/lib/games/random";
import {scoreGuess, scoreSequence, type GuessResult} from "@/lib/games/scoring";
import {decodeChallenge, challengeUrl, type RivalScore} from "@/lib/games/challenge";
import {useSettings} from "@/lib/settings";

type Mode = "type" | "build";
type Phase = "setup" | "play" | "done";

const ROUND_CHOICES = [5, 10];

export default function TranslateGame({
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
    if (c && c.game === "translate" && c.slug === slug) {
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
            : "Rebuild the exact translation by tapping its shuffled words into order (a few decoys mixed in)."}
        </p>
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
        <BuildRound key={`${seed}:${roundIdx}`} ayah={ayah} seed={seed + roundIdx} allAyahs={verses.ayahs} onDone={onRoundDone} />
      )}
    </div>
  );
}

// ── Shared verse header ──────────────────────────────────────────────────

function VersePrompt({ayah}: {ayah: Ayah}) {
  const {showTransliteration} = useSettings();
  return (
    <div className='gq-verse'>
      <div className='mm-ar'>{ayah.arabic}</div>
      {showTransliteration && <div className='gt-translit'>{ayah.transliteration}</div>}
    </div>
  );
}

// ── Type-it round ────────────────────────────────────────────────────────

function TypeRound({ayah, onDone}: {ayah: Ayah; onDone: (score: number) => void}) {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);

  function submit() {
    if (result || guess.trim() === "") return;
    setResult(scoreGuess(guess, ayah.translation));
  }

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
          <div className='gm-actions'>
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

interface Chip {
  id: number;
  text: string;
}

function BuildRound({
  ayah,
  seed,
  allAyahs,
  onDone,
}: {
  ayah: Ayah;
  seed: number;
  allAyahs: Ayah[];
  onDone: (score: number) => void;
}) {
  const refWords = useMemo(() => ayah.translation.split(/\s+/).filter(Boolean), [ayah]);

  const bank: Chip[] = useMemo(() => {
    const rand = mulberry32(seed);
    // Decoys: content-length words from other verses' translations.
    const own = new Set(refWords.map((w) => w.toLowerCase()));
    const pool = Array.from(
      new Set(
        allAyahs
          .filter((a) => a.number !== ayah.number)
          .flatMap((a) => a.translation.split(/\s+/))
          .filter((w) => w.length >= 4 && !own.has(w.toLowerCase())),
      ),
    );
    const decoys = shuffled(pool, rand).slice(0, Math.min(3, pool.length));
    return shuffled([...refWords, ...decoys].map((text, id) => ({id, text})), rand);
  }, [refWords, allAyahs, ayah, seed]);

  const [picked, setPicked] = useState<Chip[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const pickedIds = new Set(picked.map((c) => c.id));
  const done = score !== null;

  function check() {
    if (done || picked.length !== refWords.length) return;
    setScore(scoreSequence(picked.map((c) => c.text), refWords));
  }

  return (
    <>
      <VersePrompt ayah={ayah} />
      <div className='gt-build-line'>
        {picked.length === 0 && <span className='gm-meta'>Tap the words below in order…</span>}
        {picked.map((c, i) => {
          const cls = done ? (c.text.toLowerCase() === refWords[i]?.toLowerCase() ? " hit" : " miss") : "";
          return (
            <button
              key={c.id}
              type='button'
              className={`gq-tile en${cls}`}
              onClick={() => !done && setPicked((p) => p.filter((x) => x.id !== c.id))}
              disabled={done}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      <div className='gq-bank en'>
        {bank.map((c) => {
          const used = pickedIds.has(c.id);
          return (
            <button
              key={c.id}
              type='button'
              className={`gq-tile en${used ? " used" : ""}`}
              onClick={() => !done && !used && picked.length < refWords.length && setPicked((p) => [...p, c])}
              disabled={done || used}
            >
              {c.text}
            </button>
          );
        })}
      </div>
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
      game: "translate",
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
        The link contains these exact verses and your score — whoever opens it plays the same rounds and
        sees the comparison. No account needed.
      </p>
      <div className='gm-actions'>
        <button type='button' className='mm-nav' onClick={onRestart}>
          ↻ Play again (new verses)
        </button>
        <Link href={`/surah/${slug}/`} className='mm-nav gm-link-btn'>
          Study this surah
        </Link>
      </div>
    </div>
  );
}
