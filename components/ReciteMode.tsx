"use client";

// Recitation practice prototype: listens to the user recite, moves a cursor
// across the Arabic text as on-device ASR (Tarteel's Quranic Whisper) tracks
// their position, and after 5 seconds of silence plays the next few words in
// Mishari Rashid al-`Afasy's voice (word-level slices of quran.com ayah audio).
import {useEffect, useMemo, useRef, useState} from "react";
import type {VerseData} from "@/content/types";
import {isArabicWord} from "@/lib/drills/text";
import {
  ReciteEngine,
  type ReciteDevice,
  type ReciteEvent,
  type ReciteModel,
} from "@/lib/recite/engine";
import {buildTokens} from "@/lib/recite/matcher";

// Matching always runs against ayah.arabic (Uthmani) — the quran.com audio
// segments are relative to the same Quran.com text_uthmani tokenization. The
// IndoPak script setting is ignored here because it tokenizes differently.
type WordTok = {
  flat: number;
  ayah: number;
  display: string;
  matchable: boolean; // false for standalone waqf/pause marks
};

/** Per-ayah reciter audio: mp3 url + [wordNumber(1-based), startMs, endMs]. */
type AyahAudio = {url: string; segments: [number, number, number][]};

type Phase = "idle" | "loading" | "listening" | "denied" | "unsupported" | "error" | "done";

const HINT_WORDS = 5;
const SILENCE_MS = 5000;
/** Cap on a correction replay — one skipped verse is worth hearing back, three
 *  is a lecture. */
const CORRECTION_MAX_WORDS = 15;

export default function ReciteMode({
  surahNumber,
  verses,
}: {
  surahNumber: number;
  verses: VerseData;
}) {
  const {words, ayahFlats, firstFlat, tokens, tokenByFlat} = useMemo(() => {
    const words: WordTok[] = [];
    // ayah number -> flat indices of its matchable words, in recitation order
    const ayahFlats = new Map<number, number[]>();
    for (const a of verses.ayahs) {
      const flats: number[] = [];
      for (const t of a.arabic.split(/\s+/).filter(Boolean)) {
        const matchable = isArabicWord(t);
        if (matchable) flats.push(words.length);
        words.push({flat: words.length, ayah: a.number, display: t, matchable});
      }
      ayahFlats.set(a.number, flats);
    }
    const firstFlat = words.findIndex((w) => w.matchable);
    // The matcher works on the same words, minus the unmatchable ones.
    const tokens = buildTokens(words);
    const tokenByFlat = new Map(tokens.map((t, i) => [t.flat, i]));
    return {words, ayahFlats, firstFlat, tokens, tokenByFlat};
  }, [verses]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cursor, setCursor] = useState(firstFlat);
  const [hintFlats, setHintFlats] = useState<number[] | null>(null);
  const [missed, setMissed] = useState<ReadonlySet<number>>(() => new Set<number>());
  const [heard, setHeard] = useState("");
  const [matched, setMatched] = useState("");
  const [perf, setPerf] = useState("");

  const engineRef = useRef<ReciteEngine | null>(null);
  const readyRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const cursorRef = useRef(firstFlat);
  const speakingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintStopRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioMapRef = useRef<Record<string, AyahAudio> | null>(null);
  const handleEventRef = useRef<(msg: ReciteEvent) => void>(() => {});
  const onSpeechRef = useRef<() => void>(() => {});
  const micRef = useRef<HTMLSpanElement | null>(null);
  const levelRef = useRef(0);
  const missedRef = useRef<Set<number>>(new Set());
  const correctionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toneCtxRef = useRef<AudioContext | null>(null);

  phaseRef.current = phase;
  onSpeechRef.current = resetSilenceTimer;

  // Reciter audio timings for this surah; hints stay visual-only if missing.
  useEffect(() => {
    let cancelled = false;
    fetch(`/recite/audio/alafasy/${surahNumber}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) audioMapRef.current = json;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  // Mic meter. The level is written straight into a CSS variable on the icon
  // instead of React state: chunks arrive ~7×/s and the word list can be 1500+
  // spans (Al-Kahf), so re-rendering on each one would visibly stutter.
  useEffect(() => {
    if (phase !== "listening") return;
    let raf = 0;
    let shown = 0;
    const tick = () => {
      const target = speakingRef.current ? 0 : levelRef.current;
      // Fast attack, slow release — jumps on a syllable, eases back down.
      shown += (target - shown) * (target > shown ? 0.45 : 0.11);
      const el = micRef.current;
      if (el) {
        el.style.setProperty("--level", shown.toFixed(3));
        el.dataset.muted = speakingRef.current ? "1" : "";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    return () => {
      // Stop playback first, then clear timers: tearing a hint down re-arms the
      // silence timer, so clearing in the other order leaves one live on an
      // unmounted component — which then starts reciting on whatever page the
      // user navigated to.
      hintStopRef.current?.();
      if (correctionTimerRef.current) clearTimeout(correctionTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
      void toneCtxRef.current?.close();
      toneCtxRef.current = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetSilenceTimer() {
    clearTimer();
    if (phaseRef.current !== "listening" || speakingRef.current) return;
    timerRef.current = setTimeout(fireHint, SILENCE_MS);
  }

  function hintAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  }

  /** Keep the current ayah's mp3 warm so the first hint doesn't wait on it. */
  function preloadAyah(ayah: number) {
    const entry = audioMapRef.current?.[ayah];
    if (!entry || speakingRef.current) return;
    const audio = hintAudio();
    if (audio.src !== entry.url) audio.src = entry.url;
  }

  function stopHint() {
    if (correctionTimerRef.current) {
      clearTimeout(correctionTimerRef.current);
      correctionTimerRef.current = null;
    }
    hintStopRef.current?.();
    // Tearing a hint down re-arms the silence timer (see `finish`), which is
    // right when the hint ends on its own and wrong whenever we're stopping it
    // deliberately. Callers that mean to keep listening re-arm it themselves.
    clearTimer();
  }

  /** Short descending two-tone. Synthesised rather than shipped as an asset —
   *  it's two oscillators, and the page already can't work offline anyway. */
  function playErrorChime() {
    let ctx = toneCtxRef.current;
    if (!ctx) {
      try {
        ctx = new AudioContext();
        toneCtxRef.current = ctx;
      } catch {
        return;
      }
    }
    void ctx.resume();
    const now = ctx.currentTime;
    [440, 330].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const at = now + i * 0.13;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.13, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.14);
    });
  }

  function markMissed(next: Set<number>) {
    missedRef.current = next;
    setMissed(next);
  }

  /** Chime, then play the passage back from `from`. Shared by the two things
   *  we trust ourselves to detect: a verse passed over, and a recitation that
   *  isn't in this passage at all. */
  function correctFrom(from: number, atLeast: number) {
    // Don't talk over a hint or a correction already in flight.
    if (speakingRef.current || correctionTimerRef.current) return;
    clearTimer();
    playErrorChime();

    // Replay contiguously from where they went wrong. Hearing isolated words
    // out of context is no use; this carries them back into the passage.
    const want = Math.min(CORRECTION_MAX_WORDS, Math.max(HINT_WORDS, atLeast));
    const range: number[] = [];
    for (let i = from; i < words.length && range.length < want; i++) {
      if (words[i].matchable) range.push(i);
    }
    if (!range.length) return;
    setHintFlats(range);

    correctionTimerRef.current = setTimeout(() => {
      correctionTimerRef.current = null;
      if (!playWordRange(range)) resetSilenceTimer();
    }, 420);
  }

  /** A whole verse went by without being recited. */
  function reportSkips(flats: number[]) {
    const fresh = flats.filter((f) => !missedRef.current.has(f) && words[f]?.matchable);
    if (!fresh.length) return;
    markMissed(new Set([...missedRef.current, ...fresh]));
    correctFrom(fresh[0], fresh.length);
  }

  /** They're reciting something that isn't in this passage — another surah, or
   *  a verse from somewhere else. Put them back at the cursor. */
  function reportLost() {
    correctFrom(cursorRef.current, HINT_WORDS);
  }

  /** The ayah recordings that cover `range`, in order. One clip per ayah: a
   *  range spanning a verse boundary spans two mp3 files, so it has to be
   *  played as a sequence rather than a single slice. */
  function clipsFor(range: number[]): {url: string; startSec: number; endSec: number}[] {
    const clips: {url: string; startSec: number; endSec: number}[] = [];
    for (let i = 0; i < range.length; ) {
      const ayah = words[range[i]].ayah;
      const group: number[] = [];
      while (i < range.length && words[range[i]].ayah === ayah) group.push(range[i++]);
      const entry = audioMapRef.current?.[ayah];
      const flats = ayahFlats.get(ayah);
      if (!entry || !flats) continue;
      const first = entry.segments.find((s) => s[0] === flats.indexOf(group[0]) + 1);
      const last = entry.segments.find((s) => s[0] === flats.indexOf(group[group.length - 1]) + 1);
      if (!first || !last) continue;
      clips.push({url: entry.url, startSec: first[1] / 1000, endSec: last[2] / 1000});
    }
    return clips;
  }

  /** Play the given words in al-`Afasy's voice, with the recognizer muted so it
   *  doesn't track him. Used for both silence hints and skip corrections. */
  function playWordRange(range: number[]) {
    const engine = engineRef.current;
    const clips = clipsFor(range);
    if (!engine || !clips.length) return false;

    const audio = hintAudio();
    speakingRef.current = true;
    engine.muted = true;
    // Nothing may be pending while we hold the audio element: a second call
    // would attach its own listeners to the same element and seek it back to
    // the first clip. `finish` re-arms it when playback is really over.
    clearTimer();

    let index = 0;
    let stopped = false;
    let switching = false;
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (stopped) return;
      stopped = true;
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", advance);
      audio.removeEventListener("error", finish);
      if (fallback) clearTimeout(fallback);
      hintStopRef.current = null;
      speakingRef.current = false;
      engine.muted = false;
      resetSilenceTimer();
    };

    function advance() {
      if (stopped || switching) return;
      switching = true;
      if (++index >= clips.length) {
        finish();
        return;
      }
      begin();
    }

    const onTime = () => {
      if (!switching && audio.currentTime >= clips[index].endSec) advance();
    };
    const onPlaying = () => {
      // Generous fallback in case timeupdate never crosses endSec.
      if (fallback) clearTimeout(fallback);
      const clip = clips[index];
      fallback = setTimeout(advance, (clip.endSec - clip.startSec) * 1000 + 600);
    };

    function begin() {
      const clip = clips[index];
      const play = () => {
        audio.currentTime = clip.startSec;
        switching = false;
        audio.play().catch(finish);
      };
      if (audio.src !== clip.url) {
        audio.src = clip.url;
        audio.addEventListener("loadedmetadata", play, {once: true});
      } else if (audio.readyState >= 1) {
        play();
      } else {
        audio.addEventListener("loadedmetadata", play, {once: true});
      }
    }

    hintStopRef.current = finish;
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", advance);
    audio.addEventListener("error", finish);
    begin();
    return true;
  }

  function fireHint() {
    // A timer can outlive the state that armed it — a correction, for one,
    // schedules playback 420 ms out, and a progress event landing in that gap
    // re-arms silence. Firing then restarts the clip from the top part-way
    // through, so the hint is heard twice.
    if (phaseRef.current !== "listening" || speakingRef.current) return;
    if (cursorRef.current >= words.length) return;
    // Runs on past the end of the ayah — stopping there meant a hint on the
    // last word of a verse played that one word and nothing else, which is
    // exactly when you most need to hear what comes next.
    const hint: number[] = [];
    for (let i = cursorRef.current; i < words.length && hint.length < HINT_WORDS; i++) {
      if (words[i].matchable) hint.push(i);
    }
    if (!hint.length) return;
    setHintFlats(hint);

    if (!playWordRange(hint)) {
      resetSilenceTimer(); // visual hint only; refresh in another 5s
    }
  }

  function nextMatchableAfter(flat: number): number | null {
    for (let i = flat + 1; i < words.length; i++) {
      if (words[i].matchable) return i;
    }
    return null;
  }

  /** Move the cursor to a flat word index (the next word expected), or finish
   *  the passage when the matcher reports -1. Forward-only — the matcher is
   *  already monotonic, but a stray event must never pull the cursor back. */
  /** Follow the matcher's cursor. Moves both ways: forward as they recite,
   *  backward when they go back over earlier text. */
  function moveTo(flat: number) {
    if (flat < 0) {
      finish();
      return;
    }
    if (flat !== cursorRef.current) {
      // Anything at or after the new cursor hasn't been recited yet, so a word
      // previously flagged as skipped is fair game again.
      if (flat < cursorRef.current && missedRef.current.size) {
        markMissed(new Set([...missedRef.current].filter((f) => f < flat)));
      }
      cursorRef.current = flat;
      setCursor(flat);
      setHintFlats(null);
      preloadAyah(words[flat].ayah);
    }
    resetSilenceTimer();
  }

  function finish() {
    phaseRef.current = "done";
    stopHint();
    cursorRef.current = words.length;
    setCursor(words.length);
    setHintFlats(null);
    setPhase("done");
    engineRef.current?.stopMic();
  }

  async function beginListening() {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      await engine.startMic();
      setPhase("listening");
      phaseRef.current = "listening";
      preloadAyah(words[cursorRef.current]?.ayah ?? verses.ayahs[0].number);
      resetSilenceTimer();
    } catch {
      setPhase("denied");
    }
  }

  function handleEvent(msg: ReciteEvent) {
    switch (msg.type) {
      case "loading":
        setLoadPct(msg.percent);
        break;
      case "loading_status":
        setLoadMsg(msg.message);
        break;
      case "ready":
        readyRef.current = true;
        setPerf(`${msg.device} · warm ${msg.warmMs}ms`);
        void beginListening();
        break;
      case "error":
        setErrorMsg(msg.message);
        setPhase("error");
        break;
      case "progress":
        setMatched(`${msg.matched}/${msg.total}`);
        if (msg.skipped.length) reportSkips(msg.skipped);
        else if (msg.lost) reportLost();
        moveTo(msg.flat);
        break;
      case "transcript":
        setHeard(msg.text.slice(-60));
        break;
      case "perf":
        setPerf(`${msg.device} · run ${msg.runMs}ms/${msg.audioSec}s`);
        break;
    }
  }
  handleEventRef.current = handleEvent;

  async function start() {
    if (phase === "listening" || phase === "loading") return;
    if (
      typeof window === "undefined" ||
      typeof AudioWorkletNode === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof Worker === "undefined"
    ) {
      setPhase("unsupported");
      return;
    }
    if (cursorRef.current >= words.length) restart();
    if (!engineRef.current) {
      setPhase("loading");
      setLoadMsg("Starting…");
      engineRef.current = new ReciteEngine(
        (msg) => handleEventRef.current(msg),
        (level, voiced) => {
          levelRef.current = level;
          if (voiced) onSpeechRef.current();
        },
      );
      // WebGPU by default: without COOP/COEP we only get one WASM thread, and
      // Whisper's encoder always chews through a padded 30 s window, so CPU
      // fallback is a last resort (the worker falls back on its own).
      // ?device=wasm and ?model=base force the slower paths for comparison.
      const params = new URLSearchParams(window.location.search);
      const device: ReciteDevice = params.get("device") === "wasm" ? "wasm" : "webgpu";
      const model: ReciteModel = params.get("model") === "base" ? "tarteel" : "tarteel-tiny";
      engineRef.current.init(tokens, device, model);
    } else if (readyRef.current) {
      setPhase("loading");
      void beginListening();
    }
  }

  function stop() {
    // Ahead of the re-render, so anything still in flight sees that we've quit.
    phaseRef.current = "idle";
    stopHint();
    speakingRef.current = false;
    if (engineRef.current) engineRef.current.muted = false;
    engineRef.current?.stopMic();
    setPhase("idle");
    setHintFlats(null);
  }

  function restart() {
    stopHint();
    markMissed(new Set());
    cursorRef.current = firstFlat;
    setCursor(firstFlat);
    setHintFlats(null);
    setHeard("");
    setMatched("");
    engineRef.current?.reset();
    if (phaseRef.current === "done") setPhase("idle");
    resetSilenceTimer();
  }

  function seekTo(flat: number) {
    const target = words[flat].matchable ? flat : nextMatchableAfter(flat);
    if (target === null) return;
    stopHint();
    markMissed(new Set([...missedRef.current].filter((f) => f < target)));
    cursorRef.current = target;
    setCursor(target);
    setHintFlats(null);
    // Point the matcher at the same word so it resumes from here rather than
    // re-anchoring wherever it last heard us.
    engineRef.current?.seek(tokenByFlat.get(target) ?? 0);
    preloadAyah(words[target].ayah);
    resetSilenceTimer();
  }

  const listening = phase === "listening";
  const status = (() => {
    switch (phase) {
      case "idle":
        return "Press Start and recite — the text follows your voice. First start downloads the recognizer (~75 MB, cached after that).";
      case "loading":
        return loadPct > 0 && loadPct < 100 ? `${loadMsg} ${loadPct}%` : loadMsg;
      case "listening":
        return cursor === firstFlat
          ? "Listening — recite from the first ayah (the bismillah isn't tracked)."
          : "Listening…";
      case "denied":
        return "Microphone access was denied — allow it in your browser settings and try again.";
      case "unsupported":
        return "This browser doesn't support the audio features needed for recitation practice.";
      case "error":
        return `Something went wrong: ${errorMsg}`;
      case "done":
        return "Finished — the whole passage was recited.";
    }
  })();

  return (
    <div className='recite'>
      <div className='recite-controls'>
        {listening || phase === "loading" ? (
          <button className='recite-btn' onClick={stop} disabled={phase === "loading"}>
            ■ Stop
          </button>
        ) : (
          <button className='recite-btn' onClick={start}>
            ▶ Start reciting
          </button>
        )}
        <button className='recite-btn recite-btn-secondary' onClick={restart}>
          ↺ Restart
        </button>
        {listening && (
          // Decorative: `.recite-status` already announces listening state in
          // text, and a live region firing on every frame would be unusable.
          <span className='recite-mic' ref={micRef} aria-hidden='true'>
            <span className='recite-mic-ring' />
            <svg className='recite-mic-icon' viewBox='0 0 24 24'>
              <rect x='9' y='2.5' width='6' height='11' rx='3' />
              <path d='M5.5 11a6.5 6.5 0 0 0 13 0' />
              <path d='M12 17.5V21' />
            </svg>
          </span>
        )}
      </div>

      <div className='recite-status'>
        {status}
        {matched && (listening || phase === "done") && (
          <span className='recite-debug'> · ↦ {matched}</span>
        )}
        {perf && (listening || phase === "loading") && (
          <span className='recite-debug'> · {perf}</span>
        )}
        {heard && listening && (
          <span className='recite-debug' dir='rtl' lang='ar'>
            {" "}
            · {heard}
          </span>
        )}
      </div>
      {phase === "loading" && loadPct > 0 && (
        <div className='recite-progress'>
          <div className='recite-progress-fill' style={{width: `${loadPct}%`}} />
        </div>
      )}

      <p className='recite-ar' dir='rtl' lang='ar'>
        {words.map((w, i) => {
          const cls = [
            "recite-word",
            w.flat < cursor ? "done" : "",
            w.flat === cursor ? "current" : "",
            hintFlats?.includes(w.flat) ? "hint" : "",
            missed.has(w.flat) ? "missed" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const ayahEnds = i === words.length - 1 || words[i + 1].ayah !== w.ayah;
          return (
            <span key={w.flat}>
              <span className={cls} onClick={() => seekTo(w.flat)}>
                {w.display}
              </span>{" "}
              {ayahEnds && <span className='recite-ayah-num'>﴿{w.ayah}﴾ </span>}
            </span>
          );
        })}
      </p>
    </div>
  );
}
