import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex, getIndexBySlug, getGuide} from "@/lib/content";
import {getVerseData} from "@/lib/quran";
import OrderVersesGame, {type DecoyVerse} from "@/components/OrderVersesGame";
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
  const title = `Order the Verses — Surah ${entry.name}`;
  const description = `Verses of Surah ${entry.name} (${entry.epithet}) shuffled with decoys from other surahs — arrange the real ones in order. Play solo or challenge a friend with a link.`;
  const canonical = `/games/order/${entry.slug}/`;
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

/** Decoy verses per surah and in total — enough variety for a few rounds
 * without bloating the statically-exported page. */
const DECOYS_PER_SURAH = 6;
const DECOY_POOL_SIZE = 18;

/** Build the decoy pool from index neighbours (same juz, so similar style and
 * length — believable impostors). Deterministic at build time: both ends of a
 * challenge link ship the identical pool, so the seed reproduces the rounds. */
function buildDecoyPool(slug: string, target: VerseData): DecoyVerse[] {
  const idx = surahIndex.findIndex((s) => s.slug === slug);
  const targetArabic = new Set(target.ayahs.map((a) => a.arabic));
  const usedSurahs = new Set([surahIndex[idx].number]);
  const seen = new Set<string>();
  const pool: DecoyVerse[] = [];
  for (let step = 1; step < surahIndex.length && pool.length < DECOY_POOL_SIZE; step++) {
    const other = surahIndex[(idx + step) % surahIndex.length];
    if (usedSurahs.has(other.number)) continue;
    usedSurahs.add(other.number);
    const verses = versesForSlug(other.slug, getVerseData(other.number));
    let taken = 0;
    for (const a of verses.ayahs) {
      if (taken >= DECOYS_PER_SURAH || pool.length >= DECOY_POOL_SIZE) break;
      // Very long verses would dwarf the real cards and give themselves away;
      // exact duplicates of a passage verse (repeated refrains) would be unfair.
      if (a.arabic.length > 160 || targetArabic.has(a.arabic) || seen.has(a.arabic)) continue;
      seen.add(a.arabic);
      pool.push({
        arabic: a.arabic,
        transliteration: a.transliteration,
        translation: a.translation,
        source: other.name,
      });
      taken++;
    }
  }
  return pool;
}

export default async function OrderGamePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) notFound();

  const verses = versesForSlug(entry.slug, getVerseData(entry.number));
  const decoys = buildDecoyPool(entry.slug, verses);

  return (
    <>
      <Link href='/games/order/' className='back-link'>
        ← Pick another surah
      </Link>
      <div className='top'>
        <div className='surah-name'>{entry.name} — Order the Verses</div>
        <div className='meta'>
          Surah {entry.number} · {entry.passageRef ?? `${entry.verseCount} verses`}
        </div>
      </div>
      <OrderVersesGame slug={entry.slug} name={entry.name} verses={verses} decoys={decoys} />
    </>
  );
}
