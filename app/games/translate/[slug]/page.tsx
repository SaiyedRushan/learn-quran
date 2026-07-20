import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex, getIndexBySlug, getGuide} from "@/lib/content";
import {getVerseData} from "@/lib/quran";
import TranslateGame from "@/components/TranslateGame";
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
  const title = `Guess the Translation — Surah ${entry.name}`;
  const description = `See the Arabic of Surah ${entry.name} (${entry.epithet}) verse by verse and guess the English meaning. Play solo or challenge a friend with a link.`;
  const canonical = `/games/translate/${entry.slug}/`;
  return {
    title,
    description,
    alternates: {canonical},
    openGraph: {title: `${title} · ${SITE.name}`, description, url: absoluteUrl(canonical)},
  };
}

/** Same passage scoping as the quiz page: a surah's verse JSON can hold more
 * than one guide's passage, so limit the game to this guide's verses. */
function versesForSlug(slug: string, verses: VerseData): VerseData {
  const guide = getGuide(slug);
  if (!guide) return verses;
  const ayahs = verses.ayahs.filter((a) =>
    guide.sections.some((s) => a.number >= s.from && a.number <= s.to),
  );
  return {...verses, ayahs};
}

export default async function TranslateGamePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) notFound();

  const verses = versesForSlug(entry.slug, getVerseData(entry.number));

  return (
    <>
      <Link href='/games/translate/' className='back-link'>
        ← Pick another surah
      </Link>
      <div className='top'>
        <div className='surah-name'>{entry.name} — Guess the Translation</div>
        <div className='meta'>
          Surah {entry.number} · {entry.passageRef ?? `${entry.verseCount} verses`}
        </div>
      </div>
      <TranslateGame slug={entry.slug} name={entry.name} verses={verses} />
    </>
  );
}
