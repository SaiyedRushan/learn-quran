"use client";

// "Recite and we'll find you" — the home page entry into recitation practice.
//
// Listens, transcribes with the same on-device Quranic Whisper the practice
// page uses, and searches all 114 surahs for what it heard (lib/recite/locate).
// On a confident answer it navigates straight into practice at that ayah, so
// the reciter carries on from where they already were.
//
// Nothing loads until the button is pressed: the recognizer is a ~96 MB
// download, which is not something to spend on everyone who opens the home page.
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {LocateEngine, type LocateEvent, type LocateHit} from "@/lib/recite/engine";

type Phase =
  | "idle"
  | "loading"
  | "listening"
  | "choosing"
  | "denied"
  | "unsupported"
  | "error";

export default function FindMyPlace() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [heardText, setHeardText] = useState("");
  const [heardWords, setHeardWords] = useState(0);
  const [needed, setNeeded] = useState(8);
  const [hits, setHits] = useState<LocateHit[]>([]);

  const engineRef = useRef<LocateEngine | null>(null);
  const micRef = useRef<HTMLSpanElement | null>(null);
  const levelRef = useRef(0);
  const handleRef = useRef<(msg: LocateEvent) => void>(() => {});
  const goneRef = useRef(false);

  useEffect(() => {
    return () => {
      goneRef.current = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // Mic meter, written straight to a CSS variable — see ReciteMode for why this
  // never goes through React state.
  useEffect(() => {
    if (phase !== "listening") return;
    let raf = 0;
    let shown = 0;
    const tick = () => {
      shown += (levelRef.current - shown) * (levelRef.current > shown ? 0.45 : 0.11);
      micRef.current?.style.setProperty("--level", shown.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  function goTo(hit: LocateHit) {
    engineRef.current?.stopMic();
    // Into continuous mode, carrying the position we just recognized so they
    // aren't asked to recite the same ayah again. It runs on from there across
    // surah boundaries; /recite/[surah]/ stays for practising one surah.
    router.push(`/recite/?surah=${hit.surah}&ayah=${hit.ayah}`);
  }

  function handle(msg: LocateEvent) {
    if (goneRef.current) return;
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
        // Confident and unambiguous: just go. Otherwise show the candidates —
        // a verse that recurs verbatim (Ar-Rahman's refrain, 31 times) has no
        // single right answer, and guessing would drop them in the wrong place.
        if (msg.auto) goTo(msg.hits[0]);
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

  function stop() {
    engineRef.current?.stopMic();
    setPhase("idle");
  }

  const status = (() => {
    switch (phase) {
      case "idle":
        return "Recite any ayah and we'll find it, then carry on from there. First use downloads the recognizer (~96 MB, cached after that).";
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
    <div className='find-place'>
      <div className='find-place-head'>
        <h2 className='find-place-title'>Start where you already are</h2>
      </div>
      <p className='find-place-status'>{status}</p>

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
              <button className='find-place-hit' onClick={() => goTo(hit)}>
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

      <div className='find-place-controls'>
        {listening || phase === "loading" ? (
          <button className='recite-btn' onClick={stop} disabled={phase === "loading"}>
            ■ Stop
          </button>
        ) : (
          <button className='recite-btn' onClick={start}>
            ▶ {phase === "choosing" || phase === "error" ? "Try again" : "Recite to find your place"}
          </button>
        )}
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
