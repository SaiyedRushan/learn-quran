import type {Metadata} from "next";
import Link from "next/link";
import GameSurahPicker from "@/components/GameSurahPicker";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Guess the Translation — Pick a Surah",
  description:
    "Choose a surah, see the Arabic of its verses, and guess the English meaning. Forgiving word-by-word scoring, and challenge links to play against a friend.",
  alternates: {canonical: "/games/translate/"},
  openGraph: {
    title: `Guess the Translation · ${SITE.name}`,
    description: "See the Arabic, guess the English meaning — solo or against a friend.",
    url: absoluteUrl("/games/translate/"),
  },
};

export default function TranslatePickerPage() {
  return (
    <>
      <Link href='/games/' className='back-link'>
        ← All games
      </Link>
      <div className='top'>
        <div className='surah-name'>Guess the Translation</div>
        <div className='meta'>Pick a surah — you&apos;ll be shown its verses in Arabic</div>
      </div>
      <GameSurahPicker hrefPattern='/games/translate/{slug}/' />
    </>
  );
}
