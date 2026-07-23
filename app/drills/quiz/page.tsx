import type {Metadata} from "next";
import Link from "next/link";
import DrillSurahPicker from "@/components/DrillSurahPicker";
import {drillPickerGroups} from "@/lib/content";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Fill in the Blanks — Pick a Surah",
  description:
    "Choose a surah and fill the missing Arabic words in every verse. Tap or drag words into place, then challenge a friend with a share link.",
  alternates: {canonical: "/drills/quiz/"},
  openGraph: {
    title: `Fill in the Blanks · ${SITE.name}`,
    description: "Choose a surah and fill the missing Arabic words in every verse.",
    url: absoluteUrl("/drills/quiz/"),
  },
};

export default function QuizPickerPage() {
  return (
    <>
      <Link href='/drills/' className='back-link'>
        ← All drills
      </Link>
      <div className='top'>
        <div className='surah-name'>Fill in the Blanks</div>
        <div className='meta'>Pick a surah — every verse appears with words missing</div>
      </div>
      <DrillSurahPicker hrefPattern='/surah/{slug}/quiz/' groups={drillPickerGroups()} />
    </>
  );
}
