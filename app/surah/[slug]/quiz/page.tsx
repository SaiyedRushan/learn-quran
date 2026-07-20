import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex, getIndexBySlug, getGuide} from "@/lib/content";
import {getVerseData} from "@/lib/quran";
import FillBlanksQuiz from "@/components/FillBlanksQuiz";
import {SITE, absoluteUrl} from "@/lib/site";
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
  const title = `Fill-in-the-Blanks Quiz — Surah ${entry.name}`;
  const description = `Test your memorization of Surah ${entry.name} (${entry.epithet}): fill the missing Arabic words in every verse, then challenge a friend with a share link.`;
  const canonical = `/surah/${entry.slug}/quiz/`;
  return {
    title,
    description,
    alternates: {canonical},
    openGraph: {title: `${title} · ${SITE.name}`, description, url: absoluteUrl(canonical)},
  };
}

/** A surah's verse JSON can hold more than one guide's passage (surah 2 holds
 * both Ayat al-Kursi and the last two verses), so scope the quiz to the verses
 * this guide actually covers. */
function versesForSlug(slug: string, verses: VerseData): VerseData {
  const guide = getGuide(slug);
  if (!guide) return verses;
  const ayahs = verses.ayahs.filter((a) =>
    guide.sections.some((s) => a.number >= s.from && a.number <= s.to),
  );
  return {...verses, ayahs};
}

export default async function QuizPage({params}: {params: Promise<{slug: string}>}) {
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
        <div className='surah-name'>{entry.name} — Fill in the Blanks</div>
        <div className='meta'>
          Surah {entry.number} · {entry.passageRef ?? `${entry.verseCount} verses`} · every verse, missing
          words
        </div>
      </div>
      <FillBlanksQuiz slug={entry.slug} name={entry.name} verses={verses} />
    </>
  );
}
