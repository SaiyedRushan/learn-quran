import type {Metadata} from "next";
import Link from "next/link";
import GameSurahPicker from "@/components/GameSurahPicker";
import {sectionsGamePickerGroups} from "@/lib/content";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Order the Sections — Pick a Surah",
  description:
    "Choose a surah and put its thematic sections back into the order they unfold. A quick way to test whether you've grasped how a surah is structured.",
  alternates: {canonical: "/games/sections/"},
  openGraph: {
    title: `Order the Sections · ${SITE.name}`,
    description: "Reorder a surah's thematic sections — test how well you know its structure.",
    url: absoluteUrl("/games/sections/"),
  },
};

export default function SectionsPickerPage() {
  return (
    <>
      <Link href='/games/' className='back-link'>
        ← All games
      </Link>
      <div className='top'>
        <div className='surah-name'>Order the Sections</div>
        <div className='meta'>Pick a surah — its thematic sections arrive shuffled</div>
      </div>
      <GameSurahPicker hrefPattern='/games/sections/{slug}/' groups={sectionsGamePickerGroups()} />
    </>
  );
}
