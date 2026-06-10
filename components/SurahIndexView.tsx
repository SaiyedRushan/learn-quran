"use client";

import { useState } from "react";
import Link from "next/link";
import { useLearned, setLearned, useAllLearnedSectionKeys } from "@/lib/progress";
import { searchSurahs } from "@/lib/search";

export interface SurahListItem {
  number: number;
  slug: string;
  name: string;
  epithet: string;
  arabicName: string;
  verseCount: number;
  revelationType: "Makkan" | "Madinan";
  revelationOrdinal: string | null;
  status: "draft" | "reviewed";
  sectionCount: number;
}

const MAX_SEGMENTS = 8; // beyond this, fall back to a continuous bar

export default function SurahIndexView({ surahs }: { surahs: SurahListItem[] }) {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const filtered = searchSurahs(query, surahs);

  const learned = useLearned();
  const learnedSet = new Set(learned);

  // count learned sections per surah from the raw keys ("surah:index")
  const learnedSecBySurah = new Map<number, number>();
  for (const key of useAllLearnedSectionKeys()) {
    const colon = key.indexOf(":");
    if (colon < 0) continue;
    const surah = Number(key.slice(0, colon));
    learnedSecBySurah.set(surah, (learnedSecBySurah.get(surah) ?? 0) + 1);
  }
  const learnedHere = (s: SurahListItem) =>
    Math.min(learnedSecBySurah.get(s.number) ?? 0, s.sectionCount);

  const done = surahs.filter((s) => learnedSet.has(s.number)).length;
  const pct = surahs.length ? Math.round((done / surahs.length) * 100) : 0;
  const totalSections = surahs.reduce((a, s) => a + s.sectionCount, 0);
  const learnedSectionsTotal = surahs.reduce((a, s) => a + learnedHere(s), 0);

  return (
    <>
      <div className="progress-summary">
        <div className="ps-top">
          <span className="ps-label">Your progress</span>
          <span className="ps-count">
            <strong>{done}</strong> of {surahs.length} surahs
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
          <button
            className="search-clear"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            ×
          </button>
        )}
      </div>

      <div className="list-heading">
        {searching
          ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}`
          : `Juz 30 · Juz Amma — ${surahs.length} surahs`}
      </div>

      {filtered.length === 0 ? (
        <div className="search-empty">
          No surahs match “{query.trim()}”.
          <br />
          Try a different spelling, the meaning, or the Arabic name.
        </div>
      ) : (
        <div className="surah-list">
          {filtered.map((s) => {
          const isDone = learnedSet.has(s.number);
          const secLearned = learnedHere(s);
          const secComplete = s.sectionCount > 0 && secLearned === s.sectionCount;
          const secPct = s.sectionCount ? (secLearned / s.sectionCount) * 100 : 0;
          return (
            <Link href={`/surah/${s.slug}/`} className="surah-card" key={s.number}>
              <div className="sc-num">{s.number}</div>
              <div className="sc-main">
                <div className="sc-name">{s.name}</div>
                <div className="sc-epithet">{s.epithet}</div>
                <div className="sc-meta">
                  {s.verseCount} verses · {s.revelationType}
                  {s.revelationOrdinal ? ` · ${s.revelationOrdinal} revealed` : ""}
                </div>
                {s.sectionCount > 0 && (
                  <div className="sc-seg">
                    {s.sectionCount <= MAX_SEGMENTS ? (
                      <div className="sc-seg-bars">
                        {Array.from({ length: s.sectionCount }, (_, i) => (
                          <span
                            key={i}
                            className={`sc-seg-bar ${i < secLearned ? "on" : ""}`}
                          />
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
              {s.status === "draft" && <span className="sc-status draft">Draft</span>}
              <div className="sc-ar">{s.arabicName}</div>
              <button
                className={`sc-check ${isDone ? "done" : ""}`}
                aria-label={isDone ? "Mark as not learned" : "Mark as learned"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLearned(s.number, !isDone);
                }}
              >
                ✓
              </button>
            </Link>
          );
        })}
        </div>
      )}
    </>
  );
}
