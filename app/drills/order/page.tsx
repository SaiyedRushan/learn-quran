import type {Metadata} from "next";
import Link from "next/link";
import DrillSurahPicker from "@/components/DrillSurahPicker";
import {drillPickerGroups} from "@/lib/content";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Order the Verses — Pick a Surah",
  description:
    "Choose a surah, get its verses shuffled with decoys from other surahs mixed in, and arrange the real ones in order. Practise solo or challenge a friend with a link.",
  alternates: {canonical: "/drills/order/"},
  openGraph: {
    title: `Order the Verses · ${SITE.name}`,
    description: "Shuffled verses with decoys mixed in — put them back in order, solo or against a friend.",
    url: absoluteUrl("/drills/order/"),
  },
};

export default function OrderPickerPage() {
  return (
    <>
      <Link href='/drills/' className='back-link'>
        ← All drills
      </Link>
      <div className='top'>
        <div className='surah-name'>Order the Verses</div>
        <div className='meta'>Pick a surah — its verses arrive shuffled, with impostors mixed in</div>
      </div>
      <DrillSurahPicker hrefPattern='/drills/order/{slug}/' groups={drillPickerGroups()} />
    </>
  );
}
