import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {surahIndex, getIndexBySlug, getGuide, MIN_ORDERABLE_SECTIONS} from "@/lib/content";
import OrderSectionsGame, {type SectionCard} from "@/components/OrderSectionsGame";
import {SITE, absoluteUrl} from "@/lib/site";

/** Only surahs whose guide has enough sections to reorder get a game page. */
export function generateStaticParams() {
  return surahIndex
    .filter((s) => (getGuide(s.slug)?.sections.length ?? 0) >= MIN_ORDERABLE_SECTIONS)
    .map((s) => ({slug: s.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) return {title: "Surah not found"};
  const title = `Order the Sections — Surah ${entry.name}`;
  const description = `The thematic sections of Surah ${entry.name} (${entry.epithet}), shuffled — put them back into the order they unfold. Test how well you know the surah's structure.`;
  const canonical = `/games/sections/${entry.slug}/`;
  return {
    title,
    description,
    alternates: {canonical},
    openGraph: {title: `${title} · ${SITE.name}`, description, url: absoluteUrl(canonical)},
  };
}

export default async function SectionsGamePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const entry = getIndexBySlug(slug);
  if (!entry) notFound();

  const guide = getGuide(entry.slug);
  if (!guide || guide.sections.length < MIN_ORDERABLE_SECTIONS) notFound();

  // Trim to what the client game needs, in the surah's true order.
  const sections: SectionCard[] = guide.sections.map((s) => ({
    badge: s.badge,
    title: s.title,
    from: s.from,
    to: s.to,
    color: s.color,
  }));

  return (
    <>
      <Link href='/games/sections/' className='back-link'>
        ← Pick another surah
      </Link>
      <div className='top'>
        <div className='surah-name'>{entry.name} — Order the Sections</div>
        <div className='meta'>
          Surah {entry.number} · {sections.length} sections
        </div>
      </div>
      <OrderSectionsGame slug={entry.slug} name={entry.name} sections={sections} />
    </>
  );
}
