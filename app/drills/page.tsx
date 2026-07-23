import type {Metadata} from "next";
import Link from "next/link";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Drills — Test What You've Memorized",
  description:
    "Four ways to test your Quran knowledge: guess the English translation of a verse, fill the missing Arabic words in any surah, put shuffled verses back in order past the decoys, or reorder a surah's thematic sections. Practise solo or challenge a friend with a link.",
  alternates: {canonical: "/drills/"},
  openGraph: {
    title: `Drills · ${SITE.name}`,
    description:
      "Guess the translation, fill in the blanks, order the verses, or reorder a surah's sections — on your own, or with a friend via a share link.",
    url: absoluteUrl("/drills/"),
  },
};

export default function DrillsPage() {
  return (
    <>
      <div className='top'>
        <div className='surah-name'>Drills</div>
        <div className='meta'>Strengthen what you&apos;ve memorized — on your own, or with a friend</div>
      </div>

      <div className='gm-cards'>
        <Link href='/drills/translate/' className='gm-card'>
          <div className='gm-card-icon'>🗣️</div>
          <div className='gm-card-title'>Guess the Translation</div>
          <div className='gm-card-sub'>
            See the Arabic of a verse and give its English meaning — type it in your own words (forgiving,
            word-by-word scoring) or rebuild it from shuffled word tiles.
          </div>
        </Link>
        <Link href='/drills/quiz/' className='gm-card'>
          <div className='gm-card-icon'>🧩</div>
          <div className='gm-card-title'>Fill in the Blanks</div>
          <div className='gm-card-sub'>
            Every verse of a surah with words missing — tap or drag the right Arabic words into place.
            Misses are flagged as weak spots for your memorization review.
          </div>
        </Link>
        <Link href='/drills/order/' className='gm-card'>
          <div className='gm-card-icon'>🔀</div>
          <div className='gm-card-title'>Order the Verses</div>
          <div className='gm-card-sub'>
            A run of verses from a surah, shuffled — with decoy verses from nearby and other surahs mixed in.
            Arrange the real ones in recitation order and leave the impostors behind. Stuck? A hint shows the
            passage&apos;s English in order.
          </div>
        </Link>
        <Link href='/drills/sections/' className='gm-card'>
          <div className='gm-card-icon'>🗂️</div>
          <div className='gm-card-title'>Order the Sections</div>
          <div className='gm-card-sub'>
            A surah&apos;s thematic sections, shuffled — put them back into the order they unfold. A quick
            test of whether you&apos;ve grasped how a surah is structured, not just its words.
          </div>
        </Link>
      </div>

      <div className='gm-how'>
        <div className='gm-how-title'>Challenging a friend</div>
        <p>
          Finish a drill and tap <strong>Challenge a friend</strong> — you get a link that contains the
          exact same puzzle and your score. Send it over WhatsApp, iMessage, anywhere. When your friend
          finishes, they can send a result link back. No accounts, nothing stored online.
        </p>
      </div>
    </>
  );
}
