import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex, getIndexBySlug, getGuide} from "@/lib/content";
import {getVerseData} from "@/lib/quran";
import ReciteMode from "@/components/ReciteMode";
import type {VerseData} from "@/content/types";

export function generateStaticParams() {
  return surahIndex.map((s) => ({slug: s.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) return {title: "Surah not found"};
  // Prototype page — kept out of search indexes and site navigation.
  return {
    title: `Recitation Practice — Surah ${entry.name}`,
    robots: {index: false},
  };
}

/** A surah's verse JSON can hold more than one guide's passage (surah 2 holds
 * both Ayat al-Kursi and the last two verses), so scope practice to the verses
 * this guide actually covers. */
function versesForSlug(slug: string, verses: VerseData): VerseData {
  const guide = getGuide(slug);
  if (!guide) return verses;
  const ayahs = verses.ayahs.filter((a) =>
    guide.sections.some((s) => a.number >= s.from && a.number <= s.to),
  );
  return {...verses, ayahs};
}

export default async function RecitePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) notFound();

  const verses = versesForSlug(entry.slug, getVerseData(entry.number));

  return (
    <>
      <Link href={`/surah/${entry.slug}/`} className='back-link'>
        ← Surah {entry.name} guide
      </Link>
      <div className='top'>
        <div className='surah-name'>{entry.name} — Recitation Practice</div>
        <div className='meta'>
          Surah {entry.number} · {entry.passageRef ?? `${entry.verseCount} verses`} · recite aloud
          and the text follows along
        </div>
      </div>
      <ReciteMode surahNumber={entry.number} verses={verses} />
    </>
  );
}
