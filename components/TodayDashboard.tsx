"use client";

// "Today's plan" — the home dashboard. Reads the same confidence + section
// stores as the rest of the app and turns them into a small daily plan:
//   Keep learning — surahs at "Learning" (or with partial section progress),
//                   showing the next section(s) to study today
//   Review next   — surahs at "Reviewing"
//   Duas          — prayer duas at Learning/Reviewing, as a single row
// Time estimates are rough pacing guides, not promises.

import Link from "next/link";
import {
  useAllConfidence,
  useAllDuaConfidence,
  useAllLearnedSectionKeys,
  CONFIDENCE,
} from "@/lib/progress";
import { duaAnchor, sectionAnchor } from "@/lib/anchors";

export interface DashSection {
  title: string;
  from: number;
  to: number;
}

export interface DashSurah {
  slug: string;
  name: string;
  verseCount: number;
  collection: "juz30" | "juz29" | "virtues";
  sections: DashSection[];
}

export interface DashDua {
  name: string;
  section: string; // duas-page group it lives under, e.g. "Hearing the adhan"
}

// How much to put on today's plate.
const NEW_SECTIONS_PER_DAY = 2; // per learning surah
const MAX_REVIEWS_PER_DAY = 4;

// Rough pacing: memorizing ≈ 1.5 min/verse, reviewing ≈ 1 min per 8 verses.
const learnMinutes = (verses: number) => Math.max(3, Math.round(verses * 1.5));
const reviewMinutes = (verses: number) =>
  Math.min(10, Math.max(2, Math.round(verses / 8)));
const DUA_LEARN_MIN = 3;
const DUA_REVIEW_MIN = 1;

export default function TodayDashboard({
  surahs,
  duas,
}: {
  surahs: DashSurah[];
  duas: DashDua[];
}) {
  const conf = useAllConfidence();
  const duaConf = useAllDuaConfidence();
  const levelOf = (slug: string) => conf[slug] ?? 0;

  // learned section indices per guide, from the raw "slug:index" keys
  const learnedSecs = new Map<string, Set<number>>();
  for (const key of useAllLearnedSectionKeys()) {
    const colon = key.lastIndexOf(":");
    if (colon < 0) continue;
    const slug = key.slice(0, colon);
    let set = learnedSecs.get(slug);
    if (!set) learnedSecs.set(slug, (set = new Set()));
    set.add(Number(key.slice(colon + 1)));
  }
  const doneSections = (slug: string) => learnedSecs.get(slug) ?? new Set<number>();

  // Learning = explicitly marked, or partial section progress with no level set.
  const learning = surahs.filter((s) => {
    const lv = levelOf(s.slug);
    if (lv === CONFIDENCE.LEARNING) return true;
    const done = doneSections(s.slug).size;
    return lv === CONFIDENCE.NONE && done > 0 && done < s.sections.length;
  });
  const reviewing = surahs.filter((s) => levelOf(s.slug) === CONFIDENCE.REVIEWING);

  const learnItems = learning.map((s) => {
    const done = doneSections(s.slug);
    const remaining = s.sections
      .map((sec, index) => ({ ...sec, index }))
      .filter((sec) => !done.has(sec.index));
    const today = remaining.slice(0, NEW_SECTIONS_PER_DAY);
    const minutes = s.sections.length
      ? today.reduce((a, sec) => a + learnMinutes(sec.to - sec.from + 1), 0)
      : Math.min(15, learnMinutes(s.verseCount));
    return { s, remaining, today, minutes };
  });

  const reviewToday = reviewing.slice(0, MAX_REVIEWS_PER_DAY);
  const reviewOverflow = reviewing.length - reviewToday.length;

  const duaLearning = duas.filter((d) => duaConf[d.name] === CONFIDENCE.LEARNING);
  const duaReviewing = duas.filter((d) => duaConf[d.name] === CONFIDENCE.REVIEWING);
  const duaMinutes = duaLearning.length * DUA_LEARN_MIN + duaReviewing.length * DUA_REVIEW_MIN;

  const totalMinutes =
    learnItems.reduce((a, i) => a + i.minutes, 0) +
    reviewToday.reduce((a, s) => a + reviewMinutes(s.verseCount), 0) +
    duaMinutes;

  const sectionsToday = learnItems.reduce((a, i) => a + (i.today.length || 1), 0);
  const hasWork =
    learnItems.length > 0 || reviewing.length > 0 || duaLearning.length > 0 || duaReviewing.length > 0;

  // Empty state: suggest the first untouched juz surah to start with (mushaf
  // order puts Juz 29 ahead of Juz 30).
  const suggestion = surahs.find(
    (s) =>
      s.collection !== "virtues" &&
      levelOf(s.slug) === CONFIDENCE.NONE &&
      doneSections(s.slug).size === 0,
  );

  const summaryParts: string[] = [];
  if (sectionsToday > 0)
    summaryParts.push(`${sectionsToday} section${sectionsToday === 1 ? "" : "s"} to learn`);
  if (reviewing.length > 0)
    summaryParts.push(`${reviewing.length} surah${reviewing.length === 1 ? "" : "s"} to review`);
  const duaCount = duaLearning.length + duaReviewing.length;
  if (duaCount > 0) summaryParts.push(`${duaCount} dua${duaCount === 1 ? "" : "s"}`);

  return (
    <section className="today-dash">
      <div className="td-head">
        <span className="td-title">Today&rsquo;s plan</span>
        {hasWork && <span className="td-time">≈ {totalMinutes} min</span>}
      </div>
      {hasWork && summaryParts.length > 0 && (
        <div className="td-summary">{summaryParts.join(" · ")}</div>
      )}

      {!hasWork && (
        <>
          <p className="td-empty">
            Nothing in progress yet. Pick a surah below and set it to
            <em> Learning</em>, or start with a short one:
          </p>
          {suggestion && (
            <Link href={`/surah/${suggestion.slug}/`} className="td-item">
              <span className="td-dot start" />
              <span className="td-item-main">
                <span className="td-item-name">{suggestion.name}</span>
                <span className="td-item-sub">
                  {suggestion.verseCount} verses
                  {suggestion.sections.length > 0 &&
                    ` · ${suggestion.sections.length} section${suggestion.sections.length === 1 ? "" : "s"}`}
                </span>
              </span>
              <span className="td-item-time">
                ~{Math.min(15, learnMinutes(suggestion.verseCount))} min
              </span>
            </Link>
          )}
        </>
      )}

      {(learnItems.length > 0 || duaLearning.length > 0) && (
        <div className="td-group">
          <div className="td-group-label">Keep learning</div>
          {learnItems.map(({ s, remaining, today, minutes }) => {
            // Jump straight to the next section to study (falls back to the top
            // once every section has been studied).
            const nextIndex = today[0]?.index;
            const href =
              nextIndex != null
                ? `/surah/${s.slug}/#${sectionAnchor(nextIndex)}`
                : `/surah/${s.slug}/`;
            return (
            <Link href={href} className="td-item" key={s.slug}>
              <span className="td-dot learn" />
              <span className="td-item-main">
                <span className="td-item-name">{s.name}</span>
                {s.sections.length > 0 ? (
                  <span className="td-item-sub">
                    {remaining.length === 0
                      ? "All sections studied — test yourself, then mark it Reviewing"
                      : `${remaining.length} of ${s.sections.length} section${s.sections.length === 1 ? "" : "s"} left · next: ${today
                          .map((sec) => `§${sec.index + 1} ${sec.title} (v.${sec.from}–${sec.to})`)
                          .join(", ")}`}
                  </span>
                ) : (
                  <span className="td-item-sub">{s.verseCount} verses</span>
                )}
              </span>
              {minutes > 0 && <span className="td-item-time">~{minutes} min</span>}
            </Link>
            );
          })}
          {duaLearning.map((d) => (
            <Link href={`/duas/#${duaAnchor(d.name)}`} className="td-item" key={d.name}>
              <span className="td-dot learn" />
              <span className="td-item-main">
                <span className="td-item-name">{d.name}</span>
                <span className="td-item-sub">Dua · {d.section}</span>
              </span>
              <span className="td-item-time">~{DUA_LEARN_MIN} min</span>
            </Link>
          ))}
        </div>
      )}

      {(reviewToday.length > 0 || duaReviewing.length > 0) && (
        <div className="td-group">
          <div className="td-group-label">Review next</div>
          {reviewToday.map((s) => (
            <Link href={`/surah/${s.slug}/`} className="td-item" key={s.slug}>
              <span className="td-dot review" />
              <span className="td-item-main">
                <span className="td-item-name">{s.name}</span>
                <span className="td-item-sub">
                  {s.verseCount} verses — recite from memory, peek where needed
                </span>
              </span>
              <span className="td-item-time">~{reviewMinutes(s.verseCount)} min</span>
            </Link>
          ))}
          {duaReviewing.map((d) => (
            <Link href={`/duas/#${duaAnchor(d.name)}`} className="td-item" key={d.name}>
              <span className="td-dot review" />
              <span className="td-item-main">
                <span className="td-item-name">{d.name}</span>
                <span className="td-item-sub">Dua · {d.section}</span>
              </span>
              <span className="td-item-time">~{DUA_REVIEW_MIN} min</span>
            </Link>
          ))}
          {reviewOverflow > 0 && (
            <div className="td-more">
              +{reviewOverflow} more marked Reviewing — spread them over the week
            </div>
          )}
        </div>
      )}
    </section>
  );
}
