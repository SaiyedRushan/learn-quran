"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  useAllConfidence,
  setConfidence,
  CONFIDENCE,
  CONFIDENCE_LABELS,
  type ConfidenceLevel,
  setAllSectionsLearned,
  useAllLearnedSectionKeys,
  useCollapsedCollections,
  setCollectionCollapsed,
} from "@/lib/progress";
import { searchSurahs } from "@/lib/search";
import type { Collection } from "@/content/types";

export interface SurahListItem {
  number: number;
  slug: string;
  name: string;
  epithet: string;
  arabicName: string;
  verseCount: number;
  revelationType: "Makkan" | "Madinan";
  revelationOrdinal?: string | null;
  sectionCount: number;
  collection: Collection;
  note?: string;
  passageRef?: string;
}

const MAX_SEGMENTS = 8; // beyond this, fall back to a continuous bar

export default function SurahIndexView({ surahs }: { surahs: SurahListItem[] }) {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const filtered = searchSurahs(query, surahs);

  const conf = useAllConfidence();
  const levelOf = (slug: string) => (conf[slug] ?? 0) as ConfidenceLevel;

  const collapsed = useCollapsedCollections();
  const isCollapsed = (key: string) => collapsed.includes(key);

  // count learned sections per guide from the raw keys ("slug:index")
  const learnedSecBySlug = new Map<string, number>();
  for (const key of useAllLearnedSectionKeys()) {
    const colon = key.lastIndexOf(":");
    if (colon < 0) continue;
    const slug = key.slice(0, colon);
    learnedSecBySlug.set(slug, (learnedSecBySlug.get(slug) ?? 0) + 1);
  }
  const learnedHere = (s: SurahListItem) =>
    Math.min(learnedSecBySlug.get(s.slug) ?? 0, s.sectionCount);

  const juz29 = surahs.filter((s) => s.collection === "juz29");
  const juz30 = surahs.filter((s) => s.collection === "juz30");
  const virtues = surahs.filter((s) => s.collection === "virtues");

  // progress summary tracks the memorization goal across both juz (Solid = done)
  const memorization = [...juz29, ...juz30];
  const done = memorization.filter((s) => levelOf(s.slug) >= CONFIDENCE.SOLID).length;
  const pct = memorization.length ? Math.round((done / memorization.length) * 100) : 0;
  const totalSections = memorization.reduce((a, s) => a + s.sectionCount, 0);
  const learnedSectionsTotal = memorization.reduce((a, s) => a + learnedHere(s), 0);

  function renderCard(s: SurahListItem) {
    const level = levelOf(s.slug);
    const secLearned = learnedHere(s);
    const secComplete = s.sectionCount > 0 && secLearned === s.sectionCount;
    const secPct = s.sectionCount ? (secLearned / s.sectionCount) * 100 : 0;
    const meta =
      s.collection === "virtues"
        ? s.passageRef || `${s.verseCount} verse${s.verseCount === 1 ? "" : "s"}`
        : `${s.verseCount} verses`;
    return (
      <Link href={`/surah/${s.slug}/`} className="surah-card" key={s.slug}>
        <div className="sc-num">{s.number}</div>
        <div className="sc-main">
          <div className="sc-name">{s.name}</div>
          <div className="sc-epithet">{s.epithet}</div>
          <div className="sc-meta">{meta}</div>
          {s.note && <div className="sc-note">{s.note}</div>}
          {s.sectionCount > 0 && (
            <div className="sc-seg">
              {s.sectionCount <= MAX_SEGMENTS ? (
                <div className="sc-seg-bars">
                  {Array.from({ length: s.sectionCount }, (_, i) => (
                    <span key={i} className={`sc-seg-bar ${i < secLearned ? "on" : ""}`} />
                  ))}
                </div>
              ) : (
                <div className="sc-seg-track">
                  <div className="sc-seg-fill" style={{ width: `${secPct}%` }} />
                </div>
              )}
              <span className={`sc-seg-label ${secComplete ? "complete" : ""}`}>
                {secComplete
                  ? `All ${s.sectionCount} sections`
                  : `${secLearned}/${s.sectionCount} sections`}
              </span>
            </div>
          )}
        </div>
        <div className="sc-ar">{s.arabicName}</div>
        <div className="sc-conf-wrap">
          <button
            className={`sc-conf conf-${level}`}
            style={{ "--conf-frac": level / 3 } as CSSProperties}
            aria-label={`Confidence: ${CONFIDENCE_LABELS[level]}. Tap to change.`}
            title={`Confidence: ${CONFIDENCE_LABELS[level]} — tap to change`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const next = ((level + 1) % 4) as ConfidenceLevel;
              setConfidence(s.slug, next);
              // Choosing "Solid" fills in the sections; lower levels leave the
              // section study untouched so it's never wiped by a downgrade.
              if (next === CONFIDENCE.SOLID && level !== CONFIDENCE.SOLID) {
                setAllSectionsLearned(s.slug, s.sectionCount, true);
              }
            }}
          >
            {level === CONFIDENCE.SOLID && <span className="sc-conf-check">✓</span>}
          </button>
          {level > 0 && <span className={`sc-conf-label conf-${level}`}>{CONFIDENCE_LABELS[level]}</span>}
        </div>
      </Link>
    );
  }

  function renderGroup(
    key: string,
    heading: string,
    items: SurahListItem[],
    note?: React.ReactNode,
  ) {
    const open = !isCollapsed(key);
    return (
      <>
        <button
          type="button"
          className="list-heading list-heading-toggle"
          aria-expanded={open}
          onClick={() => setCollectionCollapsed(key, open)}
        >
          <svg
            className={`lh-chevron ${open ? "open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
          <span className="lh-label">{heading}</span>
        </button>
        {open && (
          <>
            {note}
            <div className="surah-list">{items.map(renderCard)}</div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <div className="progress-summary">
        <div className="ps-top">
          <span className="ps-label">Your progress</span>
          <span className="ps-count">
            <strong>{done}</strong> of {memorization.length} surahs
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {totalSections > 0 && (
          <div className="ps-sub">
            <strong>{learnedSectionsTotal}</strong> of {totalSections} sections studied
          </div>
        )}
      </div>

      <div className="search">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, meaning, or Arabic…"
          aria-label="Search surahs"
          autoComplete="off"
        />
        {searching && (
          <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>

      {searching ? (
        <>
          <div className="list-heading">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
          {filtered.length === 0 ? (
            <div className="search-empty">
              No surahs match “{query.trim()}”.
              <br />
              Try a different spelling, the meaning, or the Arabic name.
            </div>
          ) : (
            <div className="surah-list">{filtered.map(renderCard)}</div>
          )}
        </>
      ) : (
        <>
          {renderGroup("juz29", `Juz 29 · Tabārak — ${juz29.length} surahs`, juz29)}

          {renderGroup("juz30", `Juz 30 · Juz Amma — ${juz30.length} surahs`, juz30)}

          {virtues.length > 0 &&
            renderGroup(
              "virtues",
              "Recommended Recitations",
              virtues,
              <p className="group-note">
                Surahs and verses the Sunnah encourages reciting regularly — for
                protection, provision, and reward.
              </p>,
            )}
        </>
      )}
    </>
  );
}
