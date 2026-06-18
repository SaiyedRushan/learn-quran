"use client";

import {useState} from "react";
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
  const {zenMode} = useSettings();

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
              {a.arabic}
            </span>
          ))}
        </div>
        <div className='vtrans'>{translation}</div>
      </div>
    );
  }

  return (
    <>
      {!zenMode && guide.reviewStatus === "draft" && (
        <div className='review-banner'>
          <span className='rb-icon'>⚠️</span>
          <div className='rb-text'>
            <strong>Draft — pending scholarly review.</strong> The Arabic and translation below are from verified sources, but the commentary (overview, memory hooks, vocabulary
            notes, recitation guidance) is an AI-assisted draft and has not yet been checked by a qualified scholar. Verify any point of ruling with a trusted teacher.
          </div>
        </div>
      )}

      {/* Top banner */}
      <div className='top'>
        <div className='surah-name'>
          {m.name} — {m.epithet}
        </div>
        <div className='meta'>{metaLine}</div>
        <div className='ar-title'>{m.arabicName}</div>
        {!zenMode && (
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
      {!zenMode && (
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
                <div className='hb-label'>{b.label}</div>
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

      {/* Before you begin — make dua */}
      {!zenMode && (
      <div className='dua-tip'>
        <div className='dua-tip-head'>
          <span className='dua-tip-icon'>🤲</span>
          <span className='dua-tip-label'>Before you begin</span>
        </div>
        <div className='dua-tip-text'>
          Start with sincerity — ask Allah to make this easy for you and to let what you learn benefit you. A short dua to begin with:
        </div>
        <div className='dua-tip-ar'>رَبِّ زِدْنِي عِلْمًا</div>
        <div className='dua-tip-en'>
          <em>Rabbi zidni ‘ilma</em> — “My Lord, increase me in knowledge.” (
          <a className='cite-link' href='https://quran.com/20/114' target='_blank' rel='noopener noreferrer'>
            Qur'an 20:114
          </a>
          )
        </div>
      </div>
      )}

      {/* Tabs */}
      {!zenMode && (
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
      <div className={`panel ${zenMode || tab === "sections" ? "active" : ""}`}>
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
        <button className='test-surah-btn' onClick={() => setMemorizeScope({kind: "surah"})}>
          🎯 Test myself on {wholeLabel}
        </button>
        {weakCount > 0 && (
          <div className='weak-bar'>
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
        )}
        {guide.sections.map((sec, i) => {
          const isOpen = open.has(i);
          const secDone = learnedSections.has(i);
          return (
            <div className='sec-card' key={i}>
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
                  {!zenMode &&
                    sec.notes
                      .filter((n) => n.kind === "core")
                      .map((n, ni) => {
                        const c = NOTE_CLASS[n.kind];
                        return (
                          <div className={c.box} key={`core-${ni}`}>
                            <div className={c.label}>{n.label}</div>
                            <Html className={c.text} html={n.text} />
                          </div>
                        );
                      })}
                  <div className='verses'>{sec.groups.map((g, gi) => renderGroup(g, gi))}</div>
                  {!zenMode &&
                    sec.notes
                      .filter((n) => n.kind !== "core")
                      .map((n, ni) => {
                        const c = NOTE_CLASS[n.kind];
                        return (
                          <div className={c.box} key={`note-${ni}`}>
                            <div className={c.label}>{n.label}</div>
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
      {!zenMode && (
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
      {!zenMode && (
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
      <div className='conf-picker'>
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

      {memorizeScope && (
        <MemorizeMode
          guide={guide}
          verses={verses}
          scope={memorizeScope}
          onClose={() => setMemorizeScope(null)}
        />
      )}
    </>
  );
}
