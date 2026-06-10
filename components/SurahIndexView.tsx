"use client";

import Link from "next/link";
import { useLearned, setLearned } from "@/lib/progress";

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
}

export default function SurahIndexView({ surahs }: { surahs: SurahListItem[] }) {
  const learned = useLearned();
  const learnedSet = new Set(learned);
  const done = surahs.filter((s) => learnedSet.has(s.number)).length;
  const pct = surahs.length ? Math.round((done / surahs.length) * 100) : 0;

  return (
    <>
      <div className="progress-summary">
        <div className="ps-top">
          <span className="ps-label">Your progress</span>
          <span className="ps-count">
            <strong>{done}</strong> of {surahs.length} learned
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="list-heading">Juz 30 · Juz Amma — {surahs.length} surahs</div>
      <div className="surah-list">
        {surahs.map((s) => {
          const isDone = learnedSet.has(s.number);
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
    </>
  );
}
