import { surahIndex, getGuide } from "@/lib/content";
import SurahIndexView, { type SurahListItem } from "@/components/SurahIndexView";

export default function Home() {
  const surahs: SurahListItem[] = surahIndex.map((s) => {
    const guide = getGuide(s.number);
    return {
      number: s.number,
      slug: s.slug,
      name: s.name,
      epithet: s.epithet,
      arabicName: s.arabicName,
      verseCount: s.verseCount,
      revelationType: s.revelationType,
      revelationOrdinal: s.revelationOrdinal,
      status: guide?.reviewStatus ?? "draft",
      sectionCount: guide?.sections.length ?? 0,
    };
  });

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">Memorize with understanding</div>
        <h1 className="hero-title">Learn the Quran, Juz by Juz</h1>
        <div className="hero-ar" dir="rtl">
          جُزْءُ عَمَّ
        </div>
        <p className="hero-text">
          Section-by-section guides for every surah in Juz Amma — verified Arabic
          and translation, key vocabulary, memory hooks, and recitation
          breakdowns. Built to make memorization and reflection genuinely
          easier. Tap any surah to begin, and mark it learned as you go.
        </p>
      </section>
      <SurahIndexView surahs={surahs} />
    </>
  );
}
