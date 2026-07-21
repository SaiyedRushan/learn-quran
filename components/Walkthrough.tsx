"use client";

// First-run product tour. Opens once for new visitors (see lib/onboarding) and
// can be reopened anytime via the "Take the tour" button on the About page.
// Reuses the app's existing modal styling; each step pairs a short blurb with a
// small illustrative panel built from the app's own CSS tokens — no captured
// screenshots to drift out of date.

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import Link from "next/link";
import {hasOnboarded, markOnboarded, OPEN_TOUR_EVENT} from "@/lib/onboarding";

interface Step {
  title: string;
  body: string;
  panel: React.ReactNode;
  /** Widen the modal for this step (the games step tiles four previews). */
  wide?: boolean;
}

// The five-phase panel sweeps its highlight forward on a timer, marking each
// completed phase, then loops — a little demo of the fading-crutches ladder.
// Honours prefers-reduced-motion by holding on the first phase.
function PhasesPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % PHASES.length), 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="tour-phases">
      {PHASES.map((p, i) => {
        const state = i === active ? "active" : i < active ? "done" : "";
        return (
          <span key={p.label} className={`tour-phase ${state}`}>
            <span className="tour-phase-num">{state === "done" ? "✓" : i + 1}</span>
            <span className="tour-phase-copy">
              <span className="tour-phase-label">{p.label}</span>
              <span className="tour-phase-hint">{p.hint}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

// A mini round of the fill-in-the-blanks game: one word missing, a word bank
// beneath. On a timer the correct tile lights up, then lands in the blank —
// then it resets and loops. Honours prefers-reduced-motion by showing the
// solved state.
const GAME_TILES = [
  {text: "أَحَدٌ", correct: true},
  {text: "ٱلصَّمَدُ", correct: false},
  {text: "كُفُوًا", correct: false},
];

// The guess-the-translation half of the demo: the answer "types itself" one
// character at a time, then a score chip pops in — then it clears and loops.
// Honours prefers-reduced-motion by showing the finished answer and score.
const TYPE_DEMO_TEXT = "Say, He is Allah, One";
const TYPE_DEMO_HOLD = 8; // extra ticks the finished answer + score stay up

function TypeDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTick(TYPE_DEMO_TEXT.length);
      return;
    }
    const id = setInterval(
      () => setTick((t) => (t + 1) % (TYPE_DEMO_TEXT.length + TYPE_DEMO_HOLD)),
      110,
    );
    return () => clearInterval(id);
  }, []);

  const done = tick >= TYPE_DEMO_TEXT.length;
  return (
    <div className="tour-type">
      <span className="tour-type-line">
        {TYPE_DEMO_TEXT.slice(0, Math.min(tick, TYPE_DEMO_TEXT.length))}
        {!done && <span className="tour-type-caret" aria-hidden="true" />}
      </span>
      {done && <span className="tour-score-chip">✓ 94%</span>}
    </div>
  );
}

// The order-the-verses third of the demo: three cards toggle between shuffled
// and sorted — the real two (Al-Ikhlāṣ 1–2) gain their numbers and the decoy
// (An-Nās 1) is flagged and fades. Honours prefers-reduced-motion by holding
// the sorted state.
const ORDER_DEMO = [
  {ar: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", n: 1},
  {ar: "ٱللَّهُ ٱلصَّمَدُ", n: 2},
  {ar: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", n: null}, // decoy — An-Nās 1
];

function OrderDemo() {
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setSorted(true);
      return;
    }
    const id = setInterval(() => setSorted((s) => !s), 1800);
    return () => clearInterval(id);
  }, []);

  const cards = sorted ? ORDER_DEMO : [ORDER_DEMO[1], ORDER_DEMO[2], ORDER_DEMO[0]];
  return (
    <div className="tour-order">
      {cards.map((c) => (
        <span
          key={c.ar}
          className={`tour-order-card${sorted ? (c.n !== null ? " ok" : " out") : ""}`}
        >
          <span className="tour-order-num">{sorted && c.n !== null ? c.n : "?"}</span>
          <span className="tour-order-ar" dir="rtl" lang="ar">
            {c.ar}
          </span>
          {sorted && c.n === null && <span className="tour-order-tag">decoy</span>}
        </span>
      ))}
    </div>
  );
}

// Order-the-sections demo — a surah's thematic sections, out of order, snapping
// back into the sequence they unfold. Like OrderDemo but with English section
// titles and no decoys (every card belongs — it's purely the order).
const SECTIONS_DEMO = [
  {en: "The command to declare", n: 1},
  {en: "God's absolute oneness", n: 2},
  {en: "Beyond compare or kin", n: 3},
];

function SectionsDemo() {
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setSorted(true);
      return;
    }
    const id = setInterval(() => setSorted((s) => !s), 1800);
    return () => clearInterval(id);
  }, []);

  const cards = sorted ? SECTIONS_DEMO : [SECTIONS_DEMO[2], SECTIONS_DEMO[0], SECTIONS_DEMO[1]];
  return (
    <div className="tour-order">
      {cards.map((c) => (
        <span key={c.en} className={`tour-order-card${sorted ? " ok" : ""}`}>
          <span className="tour-order-num">{sorted ? c.n : "?"}</span>
          <span className="tour-order-en">{c.en}</span>
        </span>
      ))}
    </div>
  );
}

function GamesPanel() {
  // 0 = blank waiting · 1 = correct tile highlighted · 2 = blank filled
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStage(2);
      return;
    }
    const id = setInterval(() => setStage((s) => (s + 1) % 3), 1200);
    return () => clearInterval(id);
  }, []);

  const filled = stage === 2;
  // Each game is wrapped in a .tour-game-item so the four previews stack on
  // phones but tile into a 2-column grid in the widened modal on larger screens.
  return (
    <div className="tour-game">
      <div className="tour-game-item">
        <span className="tour-game-eyebrow">🧩 Fill in the blanks</span>
        <div className="tour-cloze-ar" dir="rtl" lang="ar">
          <span className="tour-cloze-word">قُلْ</span>
          <span className="tour-cloze-word">هُوَ</span>
          <span className="tour-cloze-word">ٱللَّهُ</span>
          {filled ? (
            <span className="tour-cloze-word just-filled">أَحَدٌ</span>
          ) : (
            <span className="tour-cloze-blank" style={{width: "4ch"}} aria-hidden="true" />
          )}
        </div>
        <div className="tour-game-tiles" dir="rtl">
          {GAME_TILES.map((t) => (
            <span
              key={t.text}
              className={`tour-game-tile${t.correct && stage === 1 ? " hot" : ""}${t.correct && filled ? " used" : ""}`}
            >
              {t.text}
            </span>
          ))}
        </div>
      </div>
      <div className="tour-game-item">
        <span className="tour-game-eyebrow">🗣️ Guess the translation</span>
        <TypeDemo />
      </div>
      <div className="tour-game-item">
        <span className="tour-game-eyebrow">🔀 Order the verses</span>
        <OrderDemo />
      </div>
      <div className="tour-game-item">
        <span className="tour-game-eyebrow">🗂️ Order the sections</span>
        <SectionsDemo />
      </div>
      <span className="tour-cloze-cap">🔗 Solo — or send a friend the exact same puzzle</span>
    </div>
  );
}

// The five phases mirror the fading-crutches ladder in MemorizeMode — each
// phase removes one support until you can recite from a blank slate.
const PHASES: {label: string; hint: string}[] = [
  {label: "Read", hint: "Arabic and meaning together"},
  {label: "Arabic only", hint: "peek the meaning when stuck"},
  {label: "Recall", hint: "recite from the meaning"},
  {label: "Fill the gaps", hint: "words blanked out"},
  {label: "Blank slate", hint: "the whole section from memory"},
];

const STEPS: Step[] = [
  {
    title: "Welcome to Learn Quran",
    body: "A free, section-by-section way to memorize and understand Juz 29 (Tabārak) and Juz 30 (Juz ʿAmma) — with verified Arabic and translation. No account, and your progress stays in your browser. Start by writing your intention — your niyyah — at the top of the home page; it greets you every time you return, so on the days motivation runs low you're reminded why you started.",
    panel: (
      <div className="tour-intention">
        <div className="tour-intention-head">
          <span className="tour-intention-label">My intention</span>
          <span className="tour-intention-edit">Edit</span>
        </div>
        <p className="tour-intention-text">
          To carry Allah&rsquo;s words in my heart, and let them steady me in
          prayer.
        </p>
      </div>
    ),
  },
  {
    title: "Your library — and Today's plan",
    body: "The home page lists every surah in collapsible collections. Mark each one Learning, Reviewing, or Solid as you go — the badges show at a glance where you stand, and they power the Today's plan panel, which tells you exactly what to study and review next, with rough time estimates.",
    panel: (
      <div className="tour-stack">
        <div className="tour-rows">
          {[
            {n: "112", name: "Al-Ikhlāṣ", ep: "Sincerity", badge: "Solid", tone: "solid"},
            {n: "114", name: "An-Nās", ep: "Mankind", badge: "Learning", tone: "learn"},
          ].map((r) => (
            <div className="tour-row" key={r.n}>
              <span className="tour-row-num">{r.n}</span>
              <span className="tour-row-main">
                <span className="tour-row-name">{r.name}</span>
                <span className="tour-row-ep">{r.ep}</span>
              </span>
              <span className={`tour-badge ${r.tone}`}>{r.badge}</span>
            </div>
          ))}
        </div>
        <div className="tour-plan">
          <span className="tour-plan-dot" />
          <span className="tour-plan-main">
            <span className="tour-plan-name">An-Naba</span>
            <span className="tour-plan-sub">2 of 4 sections left · next: §3</span>
          </span>
          <span className="tour-plan-time">~6 min</span>
        </div>
      </div>
    ),
  },
  {
    title: "How each guide is built",
    body: "Every surah is split into small, themed sections, and within each section the verses are grouped into short blocks — a few āyāt at a time — so you take them in as meaningful units rather than one long stream. Relevant hadith are embedded alongside, so you learn the context and virtue behind what you're reciting.",
    panel: (
      <div className="tour-guide">
        <div className="tour-guide-head">
          <span className="tour-guide-badge">Section 1</span>
          <span className="tour-guide-title">The oath by the dawn</span>
        </div>
        <div className="tour-blocks">
          <span className="tour-block">v.1–3</span>
          <span className="tour-block">v.4–5</span>
          <span className="tour-block">v.6–8</span>
        </div>
        <div className="tour-hadith">
          <span className="tour-hadith-mark" aria-hidden="true">
            📜
          </span>
          <span className="tour-hadith-text">
            Hadith · the context and virtue behind these verses
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Memorize a section in five phases",
    body: "When you're ready, Memorize mode drills one section at a time and removes a single crutch at each phase — read it with its meaning, then Arabic only, recall it from the meaning, fill in the gaps (words drop out and you fill each blank from memory, dialing them from light to heavy), and finally a blank slate. Letter and word peeks are there whenever you get stuck, and it quietly flags the words you keep forgetting.",
    panel: <PhasesPanel />,
  },
  {
    title: "Play the games — solo or against a friend",
    body: "Four games turn review into play. Fill in the Blanks drops words out of every verse of a surah and hands you a word bank — misses are flagged as weak spots for your drill. Guess the Translation shows the Arabic and asks for the meaning, typed in your own words or rebuilt from tiles. Order the Verses shuffles a run of verses with decoys from other surahs mixed in — put the real ones back in order. Order the Sections shuffles a surah's thematic sections and asks you to rebuild its structure. Finish a round and challenge a friend: the link carries the exact same puzzle and your score to beat. Find them in the Games tab or on any surah's guide.",
    panel: <GamesPanel />,
    wide: true,
  },
  {
    title: "Duas, and make it yours",
    body: "The Duas page collects the supplications of the salah and the adhan, with their own progress tracking. And from the settings gear you can resize the Arabic and English text, or switch on Zen mode for just the verses and their meaning.",
    panel: (
      <div className="tour-stack">
        <div className="tour-row">
          <span className="tour-dua-mark" aria-hidden="true">
            🤲
          </span>
          <span className="tour-row-main">
            <span className="tour-row-name">Opening duʿā</span>
            <span className="tour-row-ep">Duʿā · Beginning the prayer</span>
          </span>
          <span className="tour-badge learn">Learning</span>
        </div>
        <div className="tour-settings">
          <span className="tour-aa">
            A<span className="tour-aa-sm">a</span> Text size
          </span>
          <span className="tour-zen">
            Zen mode
            <span className="tour-switch on" aria-hidden="true">
              <span className="tour-switch-knob" />
            </span>
          </span>
        </div>
      </div>
    ),
  },
];

export default function Walkthrough() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Open automatically the first time, and whenever "Take the tour" fires.
  useEffect(() => {
    if (!hasOnboarded()) setOpen(true);
    const reopen = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_TOUR_EVENT, reopen);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, reopen);
  }, []);

  // Escape to close + lock body scroll while open (matches SettingsControl).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    markOnboarded();
    setOpen(false);
  }

  if (!open) return null;

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return createPortal(
    <div className="modal-overlay" onClick={close} role="presentation">
      <div
        className={`modal tour-modal${current.wide ? " tour-modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product tour"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="modal-title">{current.title}</span>
          <button className="icon-btn" aria-label="Close tour" onClick={close}>
            ✕
          </button>
        </div>

        <div className="tour-panel">{current.panel}</div>

        <p className="tour-body">{current.body}</p>

        <div className="tour-dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`tour-dot ${i === step ? "on" : ""}`} />
          ))}
        </div>

        <div className="modal-actions">
          {isFirst ? (
            <button className="btn" onClick={close}>
              Skip
            </button>
          ) : (
            <button className="btn" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {isLast ? (
            <button className="btn btn-primary" onClick={close}>
              Start learning
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
