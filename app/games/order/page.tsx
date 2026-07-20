import type {Metadata} from "next";
import Link from "next/link";
import GameSurahPicker from "@/components/GameSurahPicker";
import {gamePickerGroups} from "@/lib/content";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Order the Verses — Pick a Surah",
  description:
    "Choose a surah, get its verses shuffled with decoys from other surahs mixed in, and arrange the real ones in order. Play solo or challenge a friend with a link.",
  alternates: {canonical: "/games/order/"},
  openGraph: {
    title: `Order the Verses · ${SITE.name}`,
    description: "Shuffled verses with decoys mixed in — put them back in order, solo or against a friend.",
    url: absoluteUrl("/games/order/"),
  },
};

export default function OrderPickerPage() {
  return (
    <>
      <Link href='/games/' className='back-link'>
        ← All games
      </Link>
      <div className='top'>
        <div className='surah-name'>Order the Verses</div>
        <div className='meta'>Pick a surah — its verses arrive shuffled, with impostors mixed in</div>
      </div>
      <GameSurahPicker hrefPattern='/games/order/{slug}/' groups={gamePickerGroups()} />
    </>
  );
}
