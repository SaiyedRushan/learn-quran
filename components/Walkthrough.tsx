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

const CONFIDENCE_CHIPS = ["Not started", "Learning", "Reviewing", "Solid"];

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
    body: "A free, section-by-section way to memorize and understand Juz 29 (Tabārak) and Juz 30 (Juz ʿAmma) — with verified Arabic and translation. No account, and your progress stays in your browser.",
    panel: (
      <div className="tour-hero">
        <span className="tour-glyph" aria-hidden="true">
          ق
        </span>
        <span className="tour-hero-tag">Juz 29 & 30 · 40+ surahs</span>
      </div>
    ),
  },
  {
    title: "Browse the library",
    body: "The home page lists every surah, grouped into collapsible collections. Each shows its confidence badge, so you can see at a glance what you've started and what's solid.",
    panel: (
      <div className="tour-rows">
        {[
          {n: "112", name: "Al-Ikhlāṣ", ep: "Sincerity", badge: "Solid", tone: "solid"},
          {n: "114", name: "An-Nās", ep: "Mankind", badge: "Learning", tone: "learn"},
          {n: "94", name: "Ash-Sharḥ", ep: "The Relief", badge: null, tone: "none"},
        ].map((r) => (
          <div className="tour-row" key={r.n}>
            <span className="tour-row-num">{r.n}</span>
            <span className="tour-row-main">
              <span className="tour-row-name">{r.name}</span>
              <span className="tour-row-ep">{r.ep}</span>
            </span>
            {r.badge && <span className={`tour-badge ${r.tone}`}>{r.badge}</span>}
          </div>
        ))}
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
    body: "When you're ready, Memorize mode drills one section at a time and removes a single crutch at each phase — read it with its meaning, then Arabic only, recall it from the meaning, fill in the blanks, and finally a blank slate. Letter and word peeks are there whenever you get stuck, and it quietly flags the words you keep forgetting.",
    panel: <PhasesPanel />,
  },
  {
    title: "Set your confidence — build Today's plan",
    body: "Mark each surah and dua as Learning, Reviewing, or Solid. Your choices power the Today's plan panel on the home page, which tells you exactly what to study and review next, with rough time estimates.",
    panel: (
      <div className="tour-stack">
        <div className="tour-chips">
          {CONFIDENCE_CHIPS.map((c, i) => (
            <span key={c} className={`tour-chip ${i === 1 ? "on" : ""}`}>
              {c}
            </span>
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
        className="modal tour-modal"
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
