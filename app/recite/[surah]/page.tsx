import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex} from "@/lib/content";
import {getSurahText} from "@/lib/quran";
import ReciteMode from "@/components/ReciteMode";

// Recitation practice for any of the 114 surahs, keyed by number rather than
// slug: slugs belong to the guide layer, where some entries are passages rather
// than whole surahs (surah 2 appears as both Ayat al-Kursi and its last two
// verses), so there is no one slug per surah to key on.
//
// Where a memorization guide exists, /surah/[slug]/recite/ is still the better
// page — it scopes practice to the guide's passages and links back to them.
// This route exists so whole-Quran recognition has somewhere to land for the
// other 63 surahs.

export function generateStaticParams() {
  return Array.from({length: 114}, (_, i) => ({surah: String(i + 1)}));
}

function parse(surah: string): number | null {
  const n = Number(surah);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{surah: string}>;
}): Promise<Metadata> {
  const {surah} = await params;
  const n = parse(surah);
  if (!n) return {title: "Surah not found"};
  const text = getSurahText(n);
  // Prototype page — kept out of search indexes and site navigation.
  return {
    title: `Recitation Practice — Surah ${text.englishName}`,
    robots: {index: false},
  };
}

export default async function SurahRecitePage({params}: {params: Promise<{surah: string}>}) {
  const {surah} = await params;
  const n = parse(surah);
  if (!n) notFound();

  const text = getSurahText(n);
  // If this surah has a guide, offer it — the guide page is richer.
  const guide = surahIndex.find((s) => s.number === n && !s.passageRef);

  return (
    <>
      <Link href={guide ? `/surah/${guide.slug}/` : "/"} className='back-link'>
        {guide ? `← Surah ${guide.name} guide` : "← Home"}
      </Link>
      <h1 className='page-title'>
        {text.englishName} <span className='page-title-ar'>{text.arabicName}</span>
      </h1>
      <p className='page-subtitle'>
        {text.englishNameTranslation} · {text.numberOfAyahs} ayahs · {text.revelationType}
      </p>
      <ReciteMode surahNumber={n} verses={text} />
    </>
  );
}
