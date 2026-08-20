"use client";

// Continuous recitation: press the mic, recite from anywhere in the Quran, and
// the page finds you and follows from there — across surah boundaries, with the
// same dimming of what you've already recited as the per-surah pages.
//
// The whole Quran is not rendered at once, and can't be: 77,433 words is far
// too many DOM nodes. Instead the passage starts as the surah recognition
// landed in, and the next surah is appended as the reciter approaches it, so it
// reads as one continuous run of text. Surahs behind stay rendered, which is
// what makes scrolling back over what you recited work.
import {useCallback, useEffect, useRef, useState} from "react";
import ReciteMode, {type RecitePassage} from "@/components/ReciteMode";
import {LocateEngine, type LocateEvent, type LocateHit} from "@/lib/recite/engine";

type Phase = "idle" | "loading" | "listening" | "choosing" | "denied" | "unsupported" | "error";

type SurahFile = {
  number: number;
  englishName: string;
  arabicName: string;
  ayahs: {number: number; arabic: string}[];
};

export default function ContinuousRecite() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [heardText, setHeardText] = useState("");
  const [heardWords, setHeardWords] = useState(0);
  const [needed, setNeeded] = useState(8);
  const [hits, setHits] = useState<LocateHit[]>([]);

  /** Null until recognition lands; then the growing passage being tracked. */
  const [passage, setPassage] = useState<RecitePassage | null>(null);
  const [startAt, setStartAt] = useState<{surah: number; ayah: number} | null>(null);
  const [names, setNames] = useState<{n: number; english: string; arabic: string}[]>([]);

  const engineRef = useRef<LocateEngine | null>(null);
  const micRef = useRef<HTMLSpanElement | null>(null);
  const levelRef = useRef(0);
  const handleRef = useRef<(msg: LocateEvent) => void>(() => {});
  /** Surahs already in the passage, ascending. */
  const loadedRef = useRef<number[]>([]);
  const loadingRef = useRef(new Set<number>());

  async function fetchSurah(n: number): Promise<SurahFile | null> {
    try {
      const res = await fetch(`/quran/${n}.json`);
      return res.ok ? ((await res.json()) as SurahFile) : null;
    } catch {
      return null;
    }
  }

  /** Append a surah to the end of the passage. Words are only ever added after
   *  those already there, so every flat index the tracker holds stays valid. */
  async function append(n: number) {
    if (n < 1 || n > 114) return;
    if (loadedRef.current.includes(n) || loadingRef.current.has(n)) return;
    loadingRef.current.add(n);
    const data = await fetchSurah(n);
    loadingRef.current.delete(n);
    if (!data) return;
    loadedRef.current = [...loadedRef.current, n].sort((a, b) => a - b);
    setNames((prev) => [...prev, {n, english: data.englishName, arabic: data.arabicName}]);
    setPassage((prev) => ({
      ayahs: [...(prev?.ayahs ?? []), ...data.ayahs.map((a) => ({...a, surah: n}))],
    }));
  }

  /** As the cursor moves: once the reciter is inside the last surah we hold,
   *  pull in the following one so they never run out of text mid-breath. */
  const onAdvance = useCallback((surah: number) => {
    const last = loadedRef.current[loadedRef.current.length - 1];
    if (surah === last) void append(last + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function locatedAt(hit: LocateHit) {
    // Recognition is done; free its worker before the tracker loads its own
    // copy of the model, rather than holding two on the GPU at once.
    engineRef.current?.dispose();
    engineRef.current = null;

    loadedRef.current = [];
    const first = await fetchSurah(hit.surah);
    if (!first) {
      setErrorMsg(`Couldn't load surah ${hit.surah}`);
      setPhase("error");
      return;
    }
    loadedRef.current = [hit.surah];
    setNames([{n: hit.surah, english: first.englishName, arabic: first.arabicName}]);
    setPassage({ayahs: first.ayahs.map((a) => ({...a, surah: hit.surah}))});
    setStartAt({surah: hit.surah, ayah: hit.ayah});
    void append(hit.surah + 1); // runway, so the first boundary isn't a stall
  }

  // Arriving from the home page, which already did the recognition with the
  // model it had loaded: skip straight to tracking rather than asking them to
  // recite the same ayah a second time.
  const handoffRef = useRef(false);
  useEffect(() => {
    if (handoffRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const surah = Number(params.get("surah"));
    const ayah = Number(params.get("ayah"));
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) return;
    if (!Number.isInteger(ayah) || ayah < 1) return;
    handoffRef.current = true;
    void locatedAt({surah, ayah} as LocateHit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handle(msg: LocateEvent) {
    switch (msg.type) {
      case "loading":
        setLoadPct(msg.percent);
        break;
      case "loading_status":
        setLoadMsg(msg.message);
        break;
      case "ready":
        void begin();
        break;
      case "heard":
        setHeardText(msg.text.slice(-140));
        setHeardWords(msg.words);
        setNeeded(msg.needed);
        break;
      case "found":
        setHits(msg.hits);
        if (msg.auto) void locatedAt(msg.hits[0]);
        else setPhase("choosing");
        break;
      case "error":
        setErrorMsg(msg.message);
        setPhase("error");
        break;
    }
  }
  handleRef.current = handle;

  async function begin() {
    try {
      await engineRef.current?.startMic();
      setPhase("listening");
      const tick = () => {
        micRef.current?.style.setProperty("--level", levelRef.current.toFixed(3));
        if (engineRef.current) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      setPhase("denied");
    }
  }

  function start() {
    if (phase === "loading" || phase === "listening") return;
    if (
      typeof window === "undefined" ||
      typeof AudioWorkletNode === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof Worker === "undefined"
    ) {
      setPhase("unsupported");
      return;
    }
    setHits([]);
    setHeardText("");
    setHeardWords(0);
    if (engineRef.current) {
      engineRef.current.reset();
      void begin();
      return;
    }
    setPhase("loading");
    setLoadMsg("Starting…");
    engineRef.current = new LocateEngine(
      (msg) => handleRef.current(msg),
      (level) => {
        levelRef.current = level;
      },
    );
    const params = new URLSearchParams(window.location.search);
    engineRef.current.init(params.get("device") === "wasm" ? "wasm" : "webgpu");
  }

  // Once located, the tracker takes over the page entirely.
  if (passage && startAt) {
    return (
      <>
        <p className='continuous-where'>
          {names.map((s) => (
            <span key={s.n} className='continuous-where-surah'>
              {s.n}. {s.english}{" "}
              <span dir='rtl' lang='ar'>
                {s.arabic}
              </span>
            </span>
          ))}
        </p>
        <ReciteMode
          surahNumber={startAt.surah}
          verses={passage}
          startAt={startAt}
          autoStart
          onAdvance={onAdvance}
        />
      </>
    );
  }

  const status = (() => {
    switch (phase) {
      case "idle":
        return "Press the mic and recite from anywhere in the Quran. We'll find the verse and follow you from there. First use downloads the recognizer (~96 MB, cached after that).";
      case "loading":
        return loadPct > 0 && loadPct < 100 ? `${loadMsg} ${loadPct}%` : loadMsg;
      case "listening":
        return heardWords >= needed
          ? "Listening — keep going…"
          : `Listening — recite about ${needed} words so we can place it.`;
      case "choosing":
        return hits.length
          ? "That appears in more than one place — which one?"
          : "Didn't catch that — try again.";
      case "denied":
        return "Microphone access was denied — allow it in your browser settings and try again.";
      case "unsupported":
        return "This browser doesn't support the audio features needed for recitation.";
      case "error":
        return `Something went wrong: ${errorMsg}`;
    }
  })();

  const listening = phase === "listening";

  return (
    <div className='continuous'>
      <p className='recite-status'>{status}</p>

      {phase === "loading" && loadPct > 0 && (
        <div className='recite-progress'>
          <div className='recite-progress-fill' style={{width: `${loadPct}%`}} />
        </div>
      )}

      {listening && (
        <div className='recite-heard'>
          <span className='recite-heard-label'>Heard</span>
          <span className='recite-heard-text' dir='rtl' lang='ar'>
            {heardText || <span className='recite-heard-idle'>…</span>}
          </span>
        </div>
      )}

      {phase === "choosing" && (
        <ul className='find-place-hits'>
          {hits.map((hit) => (
            <li key={`${hit.surah}:${hit.ayah}`}>
              <button className='find-place-hit' onClick={() => void locatedAt(hit)}>
                <span className='find-place-hit-name'>
                  {hit.surahName} {hit.surah}:{hit.ayah}
                </span>
                <span className='find-place-hit-ar' dir='rtl' lang='ar'>
                  {hit.arabicName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className='recite-controls'>
        <button className='recite-btn' onClick={start} disabled={phase === "loading"}>
          ▶ {phase === "choosing" || phase === "error" ? "Try again" : "Recite to begin"}
        </button>
        {listening && (
          <>
            <span className='recite-mic' ref={micRef} aria-hidden='true'>
              <span className='recite-mic-ring' />
              <svg className='recite-mic-icon' viewBox='0 0 24 24'>
                <rect x='9' y='2.5' width='6' height='11' rx='3' />
                <path d='M5.5 11a6.5 6.5 0 0 0 13 0' />
                <path d='M12 17.5V21' />
              </svg>
            </span>
            <span className='find-place-count'>
              {Math.min(heardWords, needed)}/{needed} words
            </span>
          </>
        )}
      </div>
    </div>
  );
}
