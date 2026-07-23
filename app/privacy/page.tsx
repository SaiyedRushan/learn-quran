import type {Metadata} from "next";
import Link from "next/link";

const DESCRIPTION =
  "How Learn Quran handles your data on the web and in the Android & iOS apps: no accounts, no ads, progress stored only on your device, and privacy-friendly anonymous analytics.";

// Bump this when the substance of the policy changes.
const LAST_UPDATED = "July 21, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: {canonical: "/privacy/"},
  openGraph: {
    title: "Privacy Policy · Learn Quran",
    description: DESCRIPTION,
    url: "/privacy/",
    type: "website",
  },
  twitter: {card: "summary_large_image", title: "Privacy Policy · Learn Quran", description: DESCRIPTION},
};

export default function PrivacyPage() {
  return (
    <>
      <Link href='/' className='back-link'>
        ← All surahs
      </Link>

      <section className='hero'>
        <div className='hero-eyebrow'>Your data stays yours</div>
        <h1 className='hero-title'>Privacy Policy</h1>
        <p className='hero-text'>
          Learn Quran is a free, ad-free resource for reading, understanding, and memorizing the Quran. This policy covers
          both the website (<strong>learn-quran.app</strong>) and the <strong>Learn Quran</strong> Android and iOS apps. The
          short version: there are no accounts, we don&apos;t sell or share your data, and your learning progress never leaves
          your own device.
        </p>
        <p className='hero-text' style={{fontSize: "0.9em", opacity: 0.75}}>
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      {/* The short version */}
      <div className='overview'>
        <div className='ov-title'>The short version</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <ul>
              <li>
                <strong>No account, ever.</strong> You don&apos;t sign up or log in, and we never ask for your name, email, or
                any personal details to use the app.
              </li>
              <li>
                <strong>Your progress stays on your device.</strong> Learned sections, settings, and onboarding state are saved
                in your browser&apos;s (or the app&apos;s) local storage — they are never uploaded to us.
              </li>
              <li>
                <strong>The mobile app is fully offline.</strong> All Quran text, translations, guides, duas, and drills are
                bundled in the app and work with no internet connection.
              </li>
              <li>
                <strong>No ads, no tracking for advertising, no selling of data.</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What we store on your device */}
      <div className='overview'>
        <div className='ov-title'>Information stored on your device</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              To make the app useful, some information is saved <strong>locally on your own device</strong> using standard
              browser/WebView local storage. This never leaves your device and we can&apos;t see it:
            </p>
            <ul>
              <li>Which surahs and sections you&apos;ve marked as learned (your progress).</li>
              <li>Your settings, such as Arabic and English font sizes.</li>
              <li>Whether you&apos;ve completed the introductory walkthrough.</li>
              <li>Drill scores used to build challenge links you choose to share.</li>
            </ul>
            <p>
              You can clear all of this at any time by clearing your browser&apos;s site data, or — in the mobile app — by
              clearing the app&apos;s storage or uninstalling it.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className='overview'>
        <div className='ov-title'>Anonymous analytics</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              On the <strong>website</strong>, we use{" "}
              <a className='cite-link' href='https://vercel.com/docs/analytics/privacy-policy' target='_blank' rel='noreferrer'>
                Vercel Analytics
              </a>{" "}
              to measure anonymous, aggregate traffic — roughly how many people visit and which pages are popular — so we can
              tell whether the project is useful. It does <strong>not</strong> use cookies, does not build a profile of you,
              and does not collect data that personally identifies you.
            </p>
            <p>
              The <strong>mobile apps do not include any analytics or tracking</strong>. Because they run fully offline, no
              usage data is sent to us or to any third party.
            </p>
          </div>
        </div>
      </div>

      {/* When a connection is used */}
      <div className='overview'>
        <div className='ov-title'>When the app connects to the internet</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>The mobile app works entirely offline. The only times a connection is used are when you choose to:</p>
            <ul>
              <li>
                <strong>Send feedback</strong> through the contact form — in which case you provide whatever message and
                (optional) contact details you type, so we can reply. That&apos;s used only to respond to you.
              </li>
              <li>
                <strong>Open an external link</strong> (such as a hadith or Quran-source citation), which opens in your
                device&apos;s own browser and is governed by that site&apos;s privacy policy.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Children */}
      <div className='overview'>
        <div className='ov-title'>Children&apos;s privacy</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              Learn Quran is suitable for all ages and is safe for children. Because it requires no account and collects no
              personal information, it does not knowingly collect any data from children.
            </p>
          </div>
        </div>
      </div>

      {/* Changes & contact */}
      <div className='overview' id='contact'>
        <div className='ov-title'>Changes &amp; contact</div>
        <div className='ov-content'>
          <div className='ov-text'>
            <p>
              If this policy changes in a meaningful way, we&apos;ll update the date at the top of this page. If you have any
              question about your privacy or how the app works, please reach out — corrections and questions are always
              welcome.
            </p>
          </div>
          <div className='contact-row'>
            <Link className='contact-btn primary' href='/contact/'>
              ✉️ Contact me
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
