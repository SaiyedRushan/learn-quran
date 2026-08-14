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

const HINT_WORDS = 3;
const SILENCE_MS = 5000;
// Mic RMS above this counts as "the user is speaking" — the hint timer resets
// on real voice activity, not just on recognizer progress (which can lag).
const SPEECH_RMS = 0.008;

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      hintStopRef.current?.();
      audioRef.current?.pause();
      audioRef.current = null;
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
    hintStopRef.current?.();
  }

  /** Play [start of first hint word -> end of last] from the ayah recording,
   *  with the recognizer muted so it doesn't track the reciter's voice. */
  function playHintAudio(hint: number[]) {
    const engine = engineRef.current;
    const ayah = words[hint[0]].ayah;
    const entry = audioMapRef.current?.[ayah];
    const flats = ayahFlats.get(ayah);
    if (!engine || !entry || !flats) return false;

    const firstWord = flats.indexOf(hint[0]) + 1;
    const lastWord = flats.indexOf(hint[hint.length - 1]) + 1;
    const first = entry.segments.find((s) => s[0] === firstWord);
    const last = entry.segments.find((s) => s[0] === lastWord);
    if (!first || !last) return false;
    const startSec = first[1] / 1000;
    const endSec = last[2] / 1000;

    const audio = hintAudio();
    speakingRef.current = true;
    engine.muted = true;

    let fallback: ReturnType<typeof setTimeout> | null = null;
    const onTime = () => {
      if (audio.currentTime >= endSec) stop();
    };
    const onPlaying = () => {
      // Generous fallback in case timeupdate never crosses endSec.
      fallback = setTimeout(stop, (endSec - startSec) * 1000 + 600);
    };
    const stop = () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", stop);
      audio.removeEventListener("error", stop);
      if (fallback) clearTimeout(fallback);
      hintStopRef.current = null;
      speakingRef.current = false;
      engine.muted = false;
      resetSilenceTimer();
    };
    hintStopRef.current = stop;

    const begin = () => {
      audio.currentTime = startSec;
      audio.play().catch(stop);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", stop);
    audio.addEventListener("error", stop);
    if (audio.src !== entry.url) {
      audio.src = entry.url;
      audio.addEventListener("loadedmetadata", begin, {once: true});
    } else if (audio.readyState >= 1) {
      begin();
    } else {
      audio.addEventListener("loadedmetadata", begin, {once: true});
    }
    return true;
  }

  function fireHint() {
    if (cursorRef.current >= words.length) return;
    // Hint words come from the cursor's ayah only — an audio slice can't span
    // two mp3 files, so near the ayah end the hint is just shorter.
    const ayah = words[cursorRef.current]?.ayah;
    const hint: number[] = [];
    for (let i = cursorRef.current; i < words.length && hint.length < HINT_WORDS; i++) {
      if (words[i].ayah !== ayah) break;
      if (words[i].matchable) hint.push(i);
    }
    if (!hint.length) return;
    setHintFlats(hint);

    if (!playHintAudio(hint)) {
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
  function advanceTo(flat: number) {
    if (flat < 0) {
      finish();
      return;
    }
    if (flat > cursorRef.current) {
      cursorRef.current = flat;
      setCursor(flat);
      setHintFlats(null);
      preloadAyah(words[flat].ayah);
    }
    resetSilenceTimer();
  }

  function finish() {
    clearTimer();
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
        advanceTo(msg.flat);
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
        (rms) => {
          if (rms > SPEECH_RMS) onSpeechRef.current();
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
    clearTimer();
    stopHint();
    speakingRef.current = false;
    if (engineRef.current) engineRef.current.muted = false;
    engineRef.current?.stopMic();
    setPhase("idle");
    setHintFlats(null);
  }

  function restart() {
    stopHint();
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
