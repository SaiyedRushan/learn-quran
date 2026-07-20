import type {Metadata} from "next";
import Link from "next/link";
import {SITE, absoluteUrl} from "@/lib/site";

export const metadata: Metadata = {
  title: "Games — Learn Through Play",
  description:
    "Two ways to test your Quran knowledge: guess the English translation of a verse, or fill the missing Arabic words in any surah. Play solo or challenge a friend with a link.",
  alternates: {canonical: "/games/"},
  openGraph: {
    title: `Games · ${SITE.name}`,
    description: "Guess the translation or fill in the blanks — solo, or against a friend via a share link.",
    url: absoluteUrl("/games/"),
  },
};

export default function GamesPage() {
  return (
    <>
      <div className='top'>
        <div className='surah-name'>Games</div>
        <div className='meta'>Play with what you&apos;ve memorized — solo, or against a friend</div>
      </div>

      <div className='gm-cards'>
        <Link href='/games/translate/' className='gm-card'>
          <div className='gm-card-icon'>🗣️</div>
          <div className='gm-card-title'>Guess the Translation</div>
          <div className='gm-card-sub'>
            See the Arabic of a verse and give its English meaning — type it in your own words (forgiving,
            word-by-word scoring) or rebuild it from shuffled word tiles.
          </div>
        </Link>
        <Link href='/games/quiz/' className='gm-card'>
          <div className='gm-card-icon'>🧩</div>
          <div className='gm-card-title'>Fill in the Blanks</div>
          <div className='gm-card-sub'>
            Every verse of a surah with words missing — tap or drag the right Arabic words into place.
            Misses are flagged as weak spots for your memorization drill.
          </div>
        </Link>
      </div>

      <div className='gm-how'>
        <div className='gm-how-title'>Playing against a friend</div>
        <p>
          Finish a game and tap <strong>Challenge a friend</strong> — you get a link that contains the
          exact same puzzle and your score. Send it over WhatsApp, iMessage, anywhere. When your friend
          finishes, they can send a result link back. No accounts, nothing stored online.
        </p>
      </div>
    </>
  );
}
