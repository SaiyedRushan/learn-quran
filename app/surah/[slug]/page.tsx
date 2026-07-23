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
import JsonLd from "@/components/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";
import type { IndexEntry } from "@/lib/content";
import type { VerseData } from "@/content/types";

export function generateStaticParams() {
  return surahIndex.map((s) => ({ slug: s.slug }));
}

function surahDescription(entry: IndexEntry): string {
  return `Memorize and understand Surah ${entry.name} (${entry.epithet}) — surah ${entry.number}, Juz ${entry.juz}, ${entry.verseCount} verses. Verified Arabic, English translation, key vocabulary, memory hooks, and a recitation breakdown.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) return { title: "Surah not found" };
  const title = `Surah ${entry.name} (${entry.epithet}) — Memorization Guide & Meaning`;
  const description = surahDescription(entry);
  const canonical = `/surah/${entry.slug}/`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: absoluteUrl(canonical),
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
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
  const guide = getGuide(entry.slug);
  const { prev, next } = neighbours(entry.slug);
  const canonical = absoluteUrl(`/surah/${entry.slug}/`);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Surah ${entry.name} (${entry.epithet}) — Memorization Guide & Meaning`,
        description: surahDescription(entry),
        url: canonical,
        mainEntityOfPage: canonical,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE.url}/#website` },
        publisher: { "@id": `${SITE.url}/#organization` },
        about: {
          "@type": "CreativeWork",
          name: `Surah ${entry.name}`,
          alternateName: entry.arabicName,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: `Surah ${entry.name}`,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Link href="/" className="back-link">
        ← All surahs
      </Link>

      {guide ? (
        <SurahGuideView guide={guide} verses={verses} />
      ) : (
        <FallbackVerses entry={entry} verses={verses} />
      )}

      {/* Fixed page-turn arrows at the screen edges (wide viewports only —
          below the breakpoint the pager below handles prev/next). Positioned
          just outside the section/practice rails so they never overlap. */}
      {prev && (
        <Link
          href={`/surah/${prev.slug}/`}
          className="surah-side-nav prev"
          aria-label={`Previous surah: ${prev.name}`}
          title={`${prev.number}. ${prev.name}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      )}
      {next && (
        <Link
          href={`/surah/${next.slug}/`}
          className="surah-side-nav next"
          aria-label={`Next surah: ${next.name}`}
          title={`${next.number}. ${next.name}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
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
