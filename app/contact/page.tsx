import type {Metadata} from "next";
import Link from "next/link";
import ContactView from "@/components/ContactView";

const DESCRIPTION =
  "Get in touch — report a bug or an error, share what you didn't like, request a feature, or just say salaam. No request is too small.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: {canonical: "/contact/"},
  openGraph: {
    title: "Contact · Learn Quran",
    description: DESCRIPTION,
    url: "/contact/",
    type: "website",
  },
  twitter: {card: "summary_large_image", title: "Contact · Learn Quran", description: DESCRIPTION},
};

const REASONS: {icon: string; title: string; text: string}[] = [
  {
    icon: "🐞",
    title: "Found a bug or an error",
    text: "A mistake in the Arabic, the translation, a broken button, a page that won't load — tell me and I'll fix it.",
  },
  {
    icon: "🎨",
    title: "Didn't like something",
    text: "The design, the wording, how a feature works — if something felt off or confusing, I want to know.",
  },
  {
    icon: "💡",
    title: "Have a feature request",
    text: "A surah you wish was covered, a tool that would help you memorise, anything you'd love to see — pitch it.",
  },
  {
    icon: "🤲",
    title: "Just want to say salaam",
    text: "A question, some encouragement, a dua, or a bit of feedback — no reason too small. Genuinely.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Link href='/' className='back-link'>
        ← All surahs
      </Link>

      <section className='hero'>
        <div className='hero-eyebrow'>I'd love to hear from you</div>
        <h1 className='hero-title'>Get in touch</h1>
        <p className='hero-text'>
          This is a personal project and very much a work in progress, so please don't be shy — your message genuinely makes
          it better. Whatever it is, big or small, half-formed or picky, I want to hear it. There's no wrong reason to reach
          out.
        </p>
      </section>

      {/* Reasons */}
      <div className='overview'>
        <div className='ov-title'>Reach out for anything</div>
        <div className='ov-content'>
          <div className='feature-grid'>
            {REASONS.map((r) => (
              <div className='feature-card' key={r.title}>
                <div className='fc-icon' aria-hidden='true'>
                  {r.icon}
                </div>
                <div className='fc-title'>{r.title}</div>
                <div className='fc-text'>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className='overview'>
        <div className='ov-title'>Send a message</div>
        <div className='ov-content'>
          <div className='ov-text' style={{marginBottom: 16}}>
            <p>
              It lands straight in my inbox. Leave your email if you'd like a reply — otherwise it's still very welcome. No
              account, no sign-in, and nothing is stored on this site.
            </p>
          </div>
          <ContactView />
        </div>
      </div>
    </>
  );
}
