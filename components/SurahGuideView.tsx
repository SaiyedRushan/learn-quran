"use client";

import {useState} from "react";
import type {SurahGuide, VerseData, GuideNote, VerseGroup, PillColor} from "@/content/types";
import {useIsLearned, useToggleLearned, useLearnedSections, setSectionLearned} from "@/lib/progress";

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

/** Render limited inline HTML (<em>, <strong>) from trusted, build-time content. */
function Html({html, className}: {html: string; className?: string}) {
  return <div className={className} dangerouslySetInnerHTML={{__html: html}} />;
}

function rangeLabel(from: number, to: number): string {
  return from === to ? `${from}` : `${from}–${to}`;
}

export default function SurahGuideView({guide, verses}: {guide: SurahGuide; verses: VerseData}) {
  const [tab, setTab] = useState<"sections" | "vocab" | "recitation">("sections");
  const [open, setOpen] = useState<Set<number>>(new Set([0])); // first section open
  const learned = useIsLearned(guide.meta.number);
  const toggle = useToggleLearned(guide.meta.number);
  const learnedSections = new Set(useLearnedSections(guide.meta.number));

  const m = guide.meta;
  const sectionsTotal = guide.sections.length;
  const sectionsDone = guide.sections.filter((_, i) => learnedSections.has(i)).length;
  const secPct = sectionsTotal ? Math.round((sectionsDone / sectionsTotal) * 100) : 0;
  const metaLine = [`Surah ${m.number}`, `Juz ${m.juz}`, m.revelationDetail || m.revelationType, `${m.verseCount} verses`, m.rukus ? `${m.rukus} ruku'` : null]
    .filter(Boolean)
    .join(" · ");

  function toggleSection(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function renderGroup(g: VerseGroup, key: number) {
    const ayahs = verses.ayahs.filter((a) => a.number >= g.from && a.number <= g.to);
    const translation = ayahs.map((a) => a.translation).join(" ");
    return (
      <div className='vrow' key={key}>
        <div className='vnum'>{rangeLabel(g.from, g.to)}</div>
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
      {guide.reviewStatus === "draft" && (
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
        <div className='stats'>
          {m.stats.map((s) => (
            <div className='stat' key={s.label}>
              <div className='sl'>{s.label}</div>
              <div className='sv'>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview */}
      <div className='overview'>
        <div className='ov-title'>Overview</div>
        <div className='ov-text'>
          {guide.overview.split("\n\n").map((p, i) => (
            <Html key={i} html={p} className={i === 0 ? undefined : ""} />
          ))}
        </div>
        {guide.banners.map((b, i) => (
          <div className='hadith-banner' key={i} style={i > 0 ? {marginTop: 8} : undefined}>
            <div className='hb-label'>{b.label}</div>
            <Html className='hb-text' html={b.text} />
            {b.attribution && <div className='hb-attr'>{b.attribution}</div>}
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

      {/* Tabs */}
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

      {/* Sections */}
      <div className={`panel ${tab === "sections" ? "active" : ""}`}>
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
                  onClick={() => setSectionLearned(guide.meta.number, i, !secDone)}
                >
                  ✓
                </button>
              </div>
              {isOpen && (
                <div className='sec-body'>
                  {sec.notes
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
                  {sec.notes
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vocab */}
      <div className={`panel ${tab === "vocab" ? "active" : ""}`}>
        {guide.vocab.map((grp, gi) => (
          <div key={gi}>
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

      {/* Recitation */}
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

      {/* Mark as learned */}
      <button className={`mark-learned ${learned ? "done" : ""}`} onClick={toggle}>
        {learned ? "✓ Marked as learned" : "Mark this surah as learned"}
      </button>
    </>
  );
}
