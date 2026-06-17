import { surahIndex, getGuide } from "@/lib/content";
import SurahIndexView, { type SurahListItem } from "@/components/SurahIndexView";
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
      status: guide?.reviewStatus ?? "draft",
      sectionCount: guide?.sections.length ?? 0,
      collection: s.collection,
      note: s.note,
      passageRef: s.passageRef,
    };
  });

  return (
    <>
      <SurahIndexView surahs={surahs} />

      <div className="list-heading">Learn the Prayer</div>
      <PrayerCta duaIds={duas.sections.flatMap((s) => s.duas.map((d) => d.name))} />
    </>
  );
}
