import type {Metadata} from "next";
import Link from "next/link";
import DrillSurahPicker from "@/components/DrillSurahPicker";
import {sectionsDrillPickerGroups} from "@/lib/content";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Order the Sections — Pick a Surah",
  description:
    "Choose a surah and put its thematic sections back into the order they unfold. A quick way to test whether you've grasped how a surah is structured.",
  alternates: {canonical: "/drills/sections/"},
  openGraph: {
    title: `Order the Sections · ${SITE.name}`,
    description: "Reorder a surah's thematic sections — test how well you know its structure.",
    url: absoluteUrl("/drills/sections/"),
  },
};

export default function SectionsPickerPage() {
  return (
    <>
      <Link href='/drills/' className='back-link'>
        ← All drills
      </Link>
      <div className='top'>
        <div className='surah-name'>Order the Sections</div>
        <div className='meta'>Pick a surah — its thematic sections arrive shuffled</div>
      </div>
      <DrillSurahPicker hrefPattern='/drills/sections/{slug}/' groups={sectionsDrillPickerGroups()} />
    </>
  );
}
