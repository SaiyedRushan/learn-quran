import Link from "next/link";
import { surahIndex, getGuide } from "@/lib/content";
import SurahIndexView, { type SurahListItem } from "@/components/SurahIndexView";
import IntentionBlock from "@/components/IntentionBlock";
import TodayDashboard, { type DashSurah, type DashDua } from "@/components/TodayDashboard";
import PrayerCta from "@/components/PrayerCta";
import duas from "@/content/duas";

export default function Home() {
  const surahs: SurahListItem[] = surahIndex.map((s) => {
    const guide = getGuide(s.slug);
    return {
      number: s.number,
      slug: s.slug,
      name: s.name,
      epithet: s.epithet,
      arabicName: s.arabicName,
      verseCount: s.verseCount,
      revelationType: s.revelationType,
      revelationOrdinal: s.revelationOrdinal,
      sectionCount: guide?.sections.length ?? 0,
      collection: s.collection,
      note: s.note,
      passageRef: s.passageRef,
    };
  });

  // The dashboard needs section titles/ranges to say *what* to learn next.
  const dashSurahs: DashSurah[] = surahIndex.map((s) => {
    const guide = getGuide(s.slug);
    return {
      slug: s.slug,
      name: s.name,
      verseCount: s.verseCount,
      collection: s.collection,
      sections:
        guide?.sections.map((sec) => ({
          title: sec.title,
          from: sec.from,
          to: sec.to,
        })) ?? [],
    };
  });

  const dashDuas: DashDua[] = duas.sections.flatMap((s) =>
    s.duas.map((d) => ({ name: d.name, section: s.title })),
  );

  return (
    <>
      <section className="home-intro">
        <h1 className="home-intro-title">Learn the Quran, Juz by Juz</h1>
        <p className="home-intro-text">
          Free, section-by-section guides for memorizing and understanding the Quran — Juz 29 (Tabārak)
          and Juz 30 (Juz ʿAmma). Verified Arabic and translation, key vocabulary, memory hooks, and
          recitation breakdowns. Pick a surah below to begin, and mark it learned as you go.
        </p>
      </section>

      <IntentionBlock />

      <TodayDashboard surahs={dashSurahs} duas={dashDuas} />

      <Link href="/games/" className="home-games-cta">
        <span className="hg-icon" aria-hidden="true">
          🎮
        </span>
        <span className="hg-main">
          <span className="hg-title">Test yourself with the games</span>
          <span className="hg-sub">
            Fill in the blanks on any surah, or guess the translation — solo, or send a friend a
            challenge link with your score to beat.
          </span>
        </span>
        <span className="hg-arrow" aria-hidden="true">
          →
        </span>
      </Link>

      <SurahIndexView surahs={surahs} />

      <div className="list-heading">Learn the Prayer</div>
      <PrayerCta duaIds={dashDuas.map((d) => d.name)} />
    </>
  );
}
