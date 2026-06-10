import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  surahIndex,
  getIndexBySlug,
  getGuide,
  neighbours,
} from "@/lib/content";
import { getVerseData } from "@/lib/quran";
import SurahGuideView from "@/components/SurahGuideView";
import type { IndexEntry } from "@/lib/content";
import type { VerseData } from "@/content/types";

export function generateStaticParams() {
  return surahIndex.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) return { title: "Surah not found" };
  return {
    title: `${entry.name} — ${entry.epithet}`,
    description: `Memorization and study guide for Surah ${entry.name} (${entry.epithet}), surah ${entry.number} of the Quran.`,
  };
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) notFound();

  const verses = getVerseData(entry.number);
  const guide = getGuide(entry.number);
  const { prev, next } = neighbours(entry.number);

  return (
    <>
      <Link href="/" className="back-link">
        ← All surahs
      </Link>

      {guide ? (
        <SurahGuideView guide={guide} verses={verses} />
      ) : (
        <FallbackVerses entry={entry} verses={verses} />
      )}

      <div className="pager">
        {prev ? (
          <Link href={`/surah/${prev.slug}/`} className="pager-btn">
            <span className="pager-dir">← Previous</span>
            <span className="pager-name">
              {prev.number}. {prev.name}
            </span>
          </Link>
        ) : (
          <span className="pager-btn" style={{ visibility: "hidden" }} />
        )}
        {next ? (
          <Link href={`/surah/${next.slug}/`} className="pager-btn next">
            <span className="pager-dir">Next →</span>
            <span className="pager-name">
              {next.number}. {next.name}
            </span>
          </Link>
        ) : (
          <span className="pager-btn" style={{ visibility: "hidden" }} />
        )}
      </div>
    </>
  );
}

/** Shown when a surah's authored guide hasn't been added yet — still useful:
 *  the verified Arabic + translation render in full. */
function FallbackVerses({
  entry,
  verses,
}: {
  entry: IndexEntry;
  verses: VerseData;
}) {
  return (
    <>
      <div className="top">
        <div className="surah-name">
          {entry.name} — {entry.epithet}
        </div>
        <div className="meta">
          Surah {entry.number} · Juz {entry.juz} · {entry.revelationType} ·{" "}
          {entry.verseCount} verses
        </div>
        <div className="ar-title">{entry.arabicName}</div>
      </div>
      <div className="review-banner">
        <span className="rb-icon">📝</span>
        <div className="rb-text">
          <strong>Study guide in progress.</strong> The full guide (sections,
          memory hooks, vocabulary, and recitation breakdown) for this surah is
          being prepared. The verified Arabic and translation are shown below in
          the meantime.
        </div>
      </div>
      <div className="overview">
        <div className="ov-title">Verses</div>
        <div className="verses" style={{ marginBottom: 0, marginTop: 4 }}>
          {verses.ayahs.map((a) => (
            <div className="vrow" key={a.number}>
              <div className="vnum">{a.number}</div>
              <div className="var">{a.arabic}</div>
              <div className="vtrans">{a.translation}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
