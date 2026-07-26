"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import type {SurahGuide, VerseData, GuideNote, VerseGroup, PillColor} from "@/content/types";
import {
  useConfidence,
  setConfidence,
  CONFIDENCE,
  type ConfidenceLevel,
  useLearnedSections,
  setSectionLearned,
  setAllSectionsLearned,
  useWeakSpots,
  clearGuideWeakSpots,
} from "@/lib/progress";
import {useSettings} from "@/lib/settings";
import {pickArabic} from "@/lib/arabic";
import {MIN_ORDERABLE_SECTIONS} from "@/lib/content";
import {sectionAnchor, currentHash, flashScrollTo} from "@/lib/anchors";
import MemorizeMode, {type MemorizeScope} from "@/components/MemorizeMode";

// Confidence levels offered by the picker at the foot of the guide.
const CONF_LEVELS: {value: ConfidenceLevel; label: string}[] = [
  {value: 0, label: "Not started"},
  {value: 1, label: "Learning"},
  {value: 2, label: "Reviewing"},
  {value: 3, label: "Solid"},
];

const PILL: Record<PillColor, string> = {
  teal: "tp-teal",
  purple: "tp-purple",
  amber: "tp-amber",
  coral: "tp-coral",
  slate: "tp-slate",
};

const NOTE_CLASS: Record<GuideNote["kind"], {box: string; label: string; text: string}> = {
  core: {box: "theme-note", label: "tn-label", text: "tn-text"},
  memory: {box: "mem-tip", label: "mt-label", text: "mt-text"},
  extra: {box: "extra-note", label: "en-label", text: "en-text"},
  teal: {box: "teal-note", label: "tl-label", text: "tl-text"},
};

/** Render limited inline HTML (<em>, <strong>, and citation <a> links) from
 * trusted, build-time content. */
function Html({html, className}: {html: string; className?: string}) {
  return <div className={className} dangerouslySetInnerHTML={{__html: html}} />;
}

function rangeLabel(from: number, to: number): string {
  return from === to ? `${from}` : `${from}–${to}`;
}

export default function SurahGuideView({guide, verses}: {guide: SurahGuide; verses: VerseData}) {
  const [tab, setTab] = useState<"sections" | "vocab" | "recitation">("sections");
  const [open, setOpen] = useState<Set<number>>(new Set([0])); // first section open
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [memorizeScope, setMemorizeScope] = useState<MemorizeScope | null>(null);
  const confidence = useConfidence(guide.meta.slug);
  const learnedSections = new Set(useLearnedSections(guide.meta.slug));
  const {zenMode, zenHide, showTransliteration, arabicFont} = useSettings();
  // Zen mode hides the teaching layer, but which pieces is now user-configurable
  // (see settings → Zen mode). Each flag only bites while zen mode is on.
  const hideOverview = zenMode && zenHide.overview;
  const hideStats = zenMode && zenHide.stats;
  const hideNotes = zenMode && zenHide.notes;
  const hideTabs = zenMode && zenHide.tabs;
  // Section currently at the top of the viewport — highlighted in the side nav.
  const [activeSec, setActiveSec] = useState(0);

  // A "next section" link from Today's plan arrives as /surah/slug/#sec-N —
  // open that section (so its verses are visible) and scroll to it on mount.
  useEffect(() => {
    const hash = currentHash();
    const match = /^sec-(\d+)$/.exec(hash);
    if (!match) return;
    const i = Number(match[1]);
    if (i < 0 || i >= guide.sections.length) return;
    setOpen((prev) => new Set(prev).add(i));
    // Wait a frame so the just-opened section has laid out before we scroll.
    const raf = requestAnimationFrame(() => flashScrollTo(hash));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-spy for the section navigator (wide screens only; harmless on
  // narrow, where the rail is hidden). Tracks which section headers sit in the
  // top band of the viewport and marks the topmost one active.
  useEffect(() => {
    if (guide.sections.length <= 1) return;
    const els = guide.sections
      .map((_, i) => document.getElementById(sectionAnchor(i)))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.secIndex);
          if (e.isIntersecting) visible.add(i);
          else visible.delete(i);
        }
        if (visible.size) setActiveSec(Math.min(...visible));
      },
      {rootMargin: "-80px 0px -65% 0px", threshold: 0},
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = guide.meta;
  const sectionsTotal = guide.sections.length;
  const sectionsDone = guide.sections.filter((_, i) => learnedSections.has(i)).length;
  const secPct = sectionsTotal ? Math.round((sectionsDone / sectionsTotal) * 100) : 0;
  // Passages (e.g. Ayat al-Kursi) carry only a subset of their surah's verses.
  const isFullSurah = verses.ayahs.length === verses.numberOfAyahs;
  const wholeLabel = isFullSurah ? "the whole surah" : "the full passage";

  // Weak spots flagged while testing — counts and the set of affected ayahs.
  const weakSpots = useWeakSpots(guide.meta.slug);
  const weakCount = weakSpots.length;
  const weakAyahs = new Set(weakSpots.map((s) => s.ayah));

  // Confidence is now set explicitly (here and on the list), so completing the
  // sections no longer auto-promotes the surah — the two signals are kept
  // independent. Choosing "Solid" still fills the sections (see selectLevel).
  function selectLevel(next: ConfidenceLevel) {
    setConfidence(guide.meta.slug, next);
    if (next === CONFIDENCE.SOLID && confidence !== CONFIDENCE.SOLID) {
      setAllSectionsLearned(guide.meta.slug, sectionsTotal, true);
    }
  }

  const verseWord = `${m.verseCount} verse${m.verseCount === 1 ? "" : "s"}`;
  const metaLine = (
    m.collection === "virtues"
      ? [m.passageRef || `Surah ${m.number}`, m.revelationDetail || m.revelationType, verseWord]
      : [
          `Surah ${m.number}`,
          `Juz ${m.juz}`,
          m.revelationDetail || m.revelationType,
          verseWord,
          m.rukus ? `${m.rukus} ruku'` : null,
        ]
  )
    .filter(Boolean)
    .join(" · ");

  function toggleSection(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleSectionCheck(i: number, currentlyDone: boolean) {
    const turningOn = !currentlyDone;
    setSectionLearned(guide.meta.slug, i, turningOn);
    if (!turningOn) return;
    // When checking a section off, collapse it and open the next one.
    const next = i + 1;
    setOpen((prev) => {
      const set = new Set(prev);
      set.delete(i);
      if (next < sectionsTotal) set.add(next);
      return set;
    });
  }

  function renderGroup(g: VerseGroup, key: number) {
    const ayahs = verses.ayahs.filter((a) => a.number >= g.from && a.number <= g.to);
    const translation = ayahs.map((a) => a.translation).join(" ");
    const hasWeak = ayahs.some((a) => weakAyahs.has(a.number));
    return (
      <div className={`vrow${hasWeak ? " has-weak" : ""}`} key={key}>
        <div className='vnum'>
          {rangeLabel(g.from, g.to)}
          {hasWeak && <span className='vnum-flag' title='You flagged a weak spot here'>⚑</span>}
        </div>
        <div className='var'>
          {ayahs.map((a, idx) => (
            <span key={a.number}>
              {idx > 0 && <span className='var-sep'>•</span>}
              {pickArabic(a, arabicFont)}
            </span>
          ))}
        </div>
        {showTransliteration && (
          <div className='vtranslit'>
            {ayahs.map((a, idx) => (
              <span key={a.number}>
                {idx > 0 && <span className='var-sep'>•</span>}
                {a.transliteration}
              </span>
            ))}
          </div>
        )}
        <div className='vtrans'>{translation}</div>
      </div>
    );
  }

  // Open a section (switching to the Sections tab first) and scroll to it —
  // used by the side navigator on wide screens.
  function goToSection(i: number) {
    setTab("sections");
    setOpen((prev) => new Set(prev).add(i));
    requestAnimationFrame(() => flashScrollTo(sectionAnchor(i)));
  }

  // The practice controls render both in the normal flow (mobile / narrow) and
  // in the right rail (wide). Rail copies carry `rail-only` so the wide-screen
  // CSS can hide the in-flow originals without touching them.
  const testButton = (railCopy: boolean) => (
    <button
      className={`test-surah-btn${railCopy ? " rail-only" : ""}`}
      onClick={() => setMemorizeScope({kind: "surah"})}
    >
      🎯 Test myself on {wholeLabel}
    </button>
  );

  const drillsBlock = (railCopy: boolean) => (
    <div className={`guide-drills${railCopy ? " rail-only" : ""}`}>
      <Link href={`/surah/${guide.meta.slug}/quiz/`} className='quiz-link-btn'>
        🧩 Fill-in-the-blanks quiz
      </Link>
      <Link href={`/drills/translate/${guide.meta.slug}/`} className='quiz-link-btn'>
        🗣️ Guess the translation
      </Link>
      <Link href={`/drills/order/${guide.meta.slug}/`} className='quiz-link-btn'>
        🔀 Order the verses
      </Link>
      {sectionsTotal >= MIN_ORDERABLE_SECTIONS && (
        <Link href={`/drills/sections/${guide.meta.slug}/`} className='quiz-link-btn'>
          🗂️ Order the sections
        </Link>
      )}
    </div>
  );

  const weakBlock = (railCopy: boolean) => (
    <div className={`weak-bar${railCopy ? " rail-only" : ""}`}>
      <span className='weak-bar-count'>
        ⚑ {weakCount} weak {weakCount === 1 ? "spot" : "spots"} flagged
      </span>
      <button className='weak-bar-drill' onClick={() => setMemorizeScope({kind: "weak"})}>
        Drill these
      </button>
      <button className='weak-bar-clear' onClick={() => clearGuideWeakSpots(guide.meta.slug)}>
        Clear all
      </button>
    </div>
  );

  const confPicker = (railCopy: boolean) => (
    <div className={`conf-picker${railCopy ? " rail-only" : ""}`}>
      <div className='conf-picker-label'>How well do you know this surah?</div>
      <div className='conf-picker-row'>
        {CONF_LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            className={`conf-opt conf-${lvl.value} ${confidence === lvl.value ? "active" : ""}`}
            aria-pressed={confidence === lvl.value}
            onClick={() => selectLevel(lvl.value)}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className='guide-shell'>
      {/* Section navigator — sticky left rail on wide screens. */}
      {sectionsTotal > 1 && (
        <aside className='guide-toc' aria-label='Section navigator'>
          <div className='toc-title'>Sections</div>
          <div className='toc-progress'>
            <span className='toc-progress-label'>
              <strong>{sectionsDone}</strong>/{sectionsTotal} learned
            </span>
            <div className='progress-track'>
              <div className='progress-fill' style={{width: `${secPct}%`}} />
            </div>
          </div>
          <nav className='toc-list'>
            {guide.sections.map((sec, i) => {
              const done = learnedSections.has(i);
              return (
                <button
                  key={i}
                  className={`toc-item${activeSec === i ? " active" : ""}${done ? " done" : ""}`}
                  onClick={() => goToSection(i)}
                >
                  <span className={`toc-badge ${PILL[sec.color]}`}>{i + 1}</span>
                  <span className='toc-item-title'>{sec.title}</span>
                  {done && <span className='toc-check'>✓</span>}
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Practice tools — sticky right rail on wide screens. */}
      <aside className='guide-rail' aria-label='Practice tools'>
        <div className='rail-title'>Practice</div>
        {testButton(true)}
        {drillsBlock(true)}
        {weakCount > 0 && weakBlock(true)}
        {confPicker(true)}
      </aside>

      {/* Top banner */}
      <div className='top'>
        <div className='surah-name'>
          {m.name} — {m.epithet}
        </div>
        <div className='meta'>{metaLine}</div>
        <div className='ar-title'>{m.arabicName}</div>
        {!hideStats && (
          <div className='stats'>
            {m.stats.map((s) => (
              <div className='stat' key={s.label}>
                <div className='sl'>{s.label}</div>
                <div className='sv'>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overview */}
      {!hideOverview && (
      <div className='overview'>
        <button
          className='ov-toggle'
          onClick={() => setOverviewOpen((v) => !v)}
          aria-expanded={overviewOpen}
        >
          <span className='ov-title'>Overview</span>
          <span className={`chev ${overviewOpen ? "open" : ""}`}>▶</span>
        </button>
        {overviewOpen && (
          <div className='ov-content'>
            <div className='ov-text'>
              {guide.overview.split("\n\n").map((p, i) => (
                <Html key={i} html={p} className={i === 0 ? undefined : ""} />
              ))}
            </div>
            {guide.banners.map((b, i) => (
              <div className='hadith-banner' key={i} style={i > 0 ? {marginTop: 8} : undefined}>
                <Html className='hb-label' html={b.label} />
                <Html className='hb-text' html={b.text} />
                {b.attribution && (
                  <div className='hb-attr' dangerouslySetInnerHTML={{__html: b.attribution}} />
                )}
              </div>
            ))}
            {guide.themes.length > 0 && (
              <div className='theme-row'>
                {guide.themes.map((t, i) => (
                  <span className={`theme-pill ${PILL[t.color]}`} key={i}>
                    {t.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Tabs */}
      {!hideTabs && (
      <div className='tabs'>
        <button className={`tab ${tab === "sections" ? "active" : ""}`} onClick={() => setTab("sections")}>
          Sections
        </button>
        <button className={`tab ${tab === "vocab" ? "active" : ""}`} onClick={() => setTab("vocab")}>
          Arabic Vocab
        </button>
        <button className={`tab ${tab === "recitation" ? "active" : ""}`} onClick={() => setTab("recitation")}>
          Recitation Guide
        </button>
      </div>
      )}

      {/* Sections */}
      <div className={`panel ${hideTabs || tab === "sections" ? "active" : ""}`}>
        {sectionsTotal > 1 && (
          <div className='sec-progress'>
            <span className='sp-label'>
              <strong>{sectionsDone}</strong>/{sectionsTotal} sections learned
            </span>
            <div className='progress-track'>
              <div className='progress-fill' style={{width: `${secPct}%`}} />
            </div>
          </div>
        )}
        {testButton(false)}
        {drillsBlock(false)}
        {weakCount > 0 && weakBlock(false)}
        {guide.sections.map((sec, i) => {
          const isOpen = open.has(i);
          const secDone = learnedSections.has(i);
          return (
            <div className='sec-card' id={sectionAnchor(i)} data-sec-index={i} key={i}>
              <div className='sec-hdr'>
                <button className='sec-hdr-main' onClick={() => toggleSection(i)} aria-expanded={isOpen}>
                  <span className={`sec-badge ${PILL[sec.color]}`}>{sec.badge}</span>
                  <span className='sec-title'>{sec.title}</span>
                  <span className='sec-range'>vv. {rangeLabel(sec.from, sec.to)}</span>
                  <span className={`chev ${isOpen ? "open" : ""}`}>▶</span>
                </button>
                <button
                  className={`sec-check ${secDone ? "done" : ""}`}
                  aria-label={secDone ? "Mark section as not learned" : "Mark section as learned"}
                  onClick={() => handleSectionCheck(i, secDone)}
                >
                  ✓
                </button>
              </div>
              {isOpen && (
                <div className='sec-body'>
                  {!hideNotes &&
                    sec.notes
                      .filter((n) => n.kind === "core")
                      .map((n, ni) => {
                        const c = NOTE_CLASS[n.kind];
                        return (
                          <div className={c.box} key={`core-${ni}`}>
                            <Html className={c.label} html={n.label} />
                            <Html className={c.text} html={n.text} />
                          </div>
                        );
                      })}
                  <div className='verses'>{sec.groups.map((g, gi) => renderGroup(g, gi))}</div>
                  {!hideNotes &&
                    sec.notes
                      .filter((n) => n.kind !== "core")
                      .map((n, ni) => {
                        const c = NOTE_CLASS[n.kind];
                        return (
                          <div className={c.box} key={`note-${ni}`}>
                            <Html className={c.label} html={n.label} />
                            <Html className={c.text} html={n.text} />
                          </div>
                        );
                      })}
                  <button className='memorize-btn' onClick={() => setMemorizeScope({kind: "section", index: i})}>
                    🧠 Memorize this section
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vocab */}
      {!hideTabs && (
      <div className={`panel ${tab === "vocab" ? "active" : ""}`}>
        <div className='vocab-list'>
          {guide.vocab.map((grp, gi) => (
            <div className='vocab-group' key={gi}>
              <div className='vocab-section-title'>{grp.title}</div>
              <div className='vocab-grid'>
                {grp.items.map((v, vi) => (
                  <div className='vcard' key={vi}>
                    <div className='vc-ar'>{v.arabic}</div>
                    <div className='vc-roman'>{v.roman}</div>
                    <div className='vc-en'>{v.english}</div>
                    <div className='vc-where'>{v.where}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Recitation */}
      {!hideTabs && (
      <div className={`panel ${tab === "recitation" ? "active" : ""}`}>
        {guide.recitation.intro && (
          <div className='rec-card' style={{background: "#0d2e24", borderColor: "#1D9E75"}}>
            <div className='hb-label' style={{marginBottom: 6}}>
              {guide.recitation.intro.label}
            </div>
            <Html className='hb-text' html={guide.recitation.intro.text} />
          </div>
        )}
        {guide.recitation.cards.map((card, ci) => (
          <div className='rec-card' key={ci}>
            <div className='rc-header'>
              <div className='rc-icon'>{card.icon}</div>
              <div>
                <div className='rc-title'>{card.title}</div>
                <div className='rc-sub'>{card.sub}</div>
              </div>
            </div>
            {card.rows.map((row, ri) => (
              <div className='rc-row' key={ri}>
                <div className='rc-dot' />
                <Html className='rc-text' html={row} />
              </div>
            ))}
          </div>
        ))}
        {guide.recitation.stops.length > 0 && (
          <>
            <hr className='divider' />
            <div className='sub-label'>{guide.recitation.stopsLabel || "Natural stopping points"}</div>
            {guide.recitation.stops.map((s, si) => (
              <div className='stop-row' key={si}>
                <div className='stop-v'>{s.verse}</div>
                <Html className='stop-text' html={s.text} />
              </div>
            ))}
          </>
        )}
      </div>
      )}

      {/* Confidence */}
      {confPicker(false)}

      {memorizeScope && (
        <MemorizeMode
          guide={guide}
          verses={verses}
          scope={memorizeScope}
          onClose={() => setMemorizeScope(null)}
        />
      )}
    </div>
  );
}
