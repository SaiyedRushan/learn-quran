import type {Metadata} from "next";
import Link from "next/link";
import ContinuousRecite from "@/components/ContinuousRecite";

// Continuous recitation across the whole Quran. Unlike /recite/[surah]/ this
// page is bound to no surah at all: it starts empty, recognition decides where
// you are, and the passage grows from there across surah boundaries.

export const metadata: Metadata = {
  title: "Recite — find your place anywhere in the Quran",
  // Prototype page — kept out of search indexes and site navigation.
  robots: {index: false},
};

export default function ContinuousRecitePage() {
  return (
    <>
      <Link href='/' className='back-link'>
        ← Home
      </Link>
      <h1 className='page-title'>Recite</h1>
      <p className='page-subtitle'>
        Start anywhere in the Quran — we&rsquo;ll find the verse and follow along.
      </p>
      <ContinuousRecite />
    </>
  );
}
