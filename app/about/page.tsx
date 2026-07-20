import type {Metadata} from "next";
import Link from "next/link";
import TakeTheTourButton from "@/components/TakeTheTourButton";

const DESCRIPTION =
  "What Learn Quran is, the features it offers, how its content is sourced, and how to send feedback or report a correction.";

export const metadata: Metadata = {
  title: "About & Contact",
  description: DESCRIPTION,
  alternates: {canonical: "/about/"},
  openGraph: {
    title: "About & Contact · Learn Quran",
    description: DESCRIPTION,
    url: "/about/",
    type: "website",
  },
  twitter: {card: "summary_large_image", title: "About & Contact · Learn Quran", description: DESCRIPTION},
};

// ── Contact details ─────────────────────────────────────────────────────────
// Uncomment / fill in any socials — they'll appear automatically below.
const CONTACT: {email: string; twitter?: string; instagram?: string} = {
  email: "rushan52@gmail.com",
  // twitter: "https://x.com/yourhandle",
  // instagram: "https://instagram.com/yourhandle",
};

const FEATURES: {icon: string; title: string; text: string}[] = [
  {
    icon: "📖",
    title: "Section-by-section guides",
    text: "Every surah is split into small, themed sections with a plain-English overview, the key themes, and a memory hook for each part.",
  },
  {
    icon: "🧠",
    title: "Memorize mode",
    text: "A guided drill that removes one crutch at a time — read, Arabic-only, recall from the meaning, fill in the blanks, then a blank slate — with letter and word peeks when you get stuck.",
  },
  {
    icon: "🔑",
    title: "Arabic vocabulary",
    text: "The key words of each surah with transliteration and meaning, so you understand what you're reciting — not just repeat it.",
  },
  {
    icon: "🎙️",
    title: "Recitation guide",
    text: "Natural stopping points and practical tips for reciting each surah, verse by verse.",
  },
  {
    icon: "🎮",
    title: "Games — solo or vs a friend",
    text: "A fill-in-the-blanks quiz on every surah, a guess-the-translation game, and an order-the-verses puzzle with decoy verses to spot — with challenge links that hand a friend the exact same puzzle and your score to beat. No account needed.",
  },
  {
    icon: "🤲",
    title: "Prayer duas",
    text: "The supplications of the salah — opening, rukūʿ and sujūd, the Tashahhud, and more — with transliteration and meaning in one place.",
  },
  {
    icon: "✅",
    title: "Progress that stays with you",
    text: "Mark sections and surahs as learned and watch your progress fill in. Saved right in your browser — no sign-in, ever.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Link href='/' className='back-link'>
        ← All surahs
      </Link>

      <section className='hero'>
        <div className='hero-eyebrow'>Memorize with understanding</div>
        <h1 className='hero-title'>Learn the Quran, Juz by Juz</h1>
        <div className='hero-ar' dir='rtl'>
          جُزْءُ عَمَّ
        </div>
        <p className='hero-text'>
          Section-by-section guides for every surah in Juz 29 (Tabārak) and Juz Amma — verified Arabic and translation, key vocabulary, memory hooks, and recitation breakdowns. Built to make
          memorization and reflection genuinely easier. Tap any surah to begin, and mark it learned as you go.
        </p>
      </section>

      {/* What is this */}
      <div className='overview'>
        <div className='ov-title'>What is this?</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              <strong>Learn Quran</strong> is a free web app for memorising and understanding the Quran, built around small,
              digestible sections rather than walls of text. It covers <strong>Juz 29 (Tabārak)</strong> and <strong>Juz 30
              (Juz ʿAmma)</strong> — the short surahs most of us recite every day — and is designed to grow from there.
            </p>
            <p>
              Instead of just showing you Arabic to repeat, each surah is broken into themed sections with a plain-English
              explanation and a memory hook, so what you memorise actually means something. There's no account to create and
              nothing to install — open it, start learning, and your progress is saved right in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className='overview'>
        <div className='ov-title'>What's inside</div>
        <div className='ov-content'>
          <div className='feature-grid'>
            {FEATURES.map((f) => (
              <div className='feature-card' key={f.title}>
                <div className='fc-icon' aria-hidden='true'>
                  {f.icon}
                </div>
                <div className='fc-title'>{f.title}</div>
                <div className='fc-text'>{f.text}</div>
              </div>
            ))}
          </div>
          <div className='contact-row' style={{marginTop: 16}}>
            <TakeTheTourButton />
          </div>
        </div>
      </div>

      {/* Sourcing & honesty */}
      <div className='overview'>
        <div className='ov-title'>Where the content comes from</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              The Arabic (Uthmani script) and the Sahih International translation come from the verified{" "}
              <a className='cite-link' href='https://alquran.cloud/api' target='_blank' rel='noreferrer'>
                AlQuran Cloud API
              </a>{" "}
              — never hand-typed or AI-generated.
            </p>
            <p>
              The teaching commentary — overviews, memory hooks, vocabulary notes, and recitation guidance — is an educational
              aid. Please confirm any point of religious ruling with a trusted teacher.
            </p>
            <p>
              The app is completely free and ad-free. There's no login and no account — your learning progress lives only in
              your own browser. The only data collected is anonymous, aggregate visit counts, to gauge whether people find it
              useful.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className='overview' id='contact'>
        <div className='ov-title'>Feedback &amp; contact</div>
        <div className='ov-content'>
          <div className='ov-text' style={{marginBottom: 14}}>
            <p>
              This is a personal project and very much a work in progress. If you spot a mistake in the Arabic, the
              translation, or the commentary — or if you have an idea to make it better — I'd genuinely love to hear from you.
              Corrections are especially welcome.
            </p>
          </div>
          <div className='contact-row'>
            <Link className='contact-btn primary' href='/contact/'>
              ✉️ Contact me
            </Link>
            {CONTACT.twitter && (
              <a className='contact-btn' href={CONTACT.twitter} target='_blank' rel='noreferrer'>
                𝕏 Twitter / X
              </a>
            )}
            {CONTACT.instagram && (
              <a className='contact-btn' href={CONTACT.instagram} target='_blank' rel='noreferrer'>
                📷 Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
