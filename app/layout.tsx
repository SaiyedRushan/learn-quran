import type {Metadata} from "next";
import Link from "next/link";
import SettingsControl from "@/components/SettingsControl";
import PrimaryNav from "@/components/PrimaryNav";
import Walkthrough from "@/components/Walkthrough";
import JsonLd from "@/components/JsonLd";
import {SITE} from "@/lib/site";
import {Analytics} from "@vercel/analytics/next";
import "./globals.css";

// Applies saved font-size settings before paint, avoiding a flash of default size.
const NO_FLASH = `(function(){try{var s=JSON.parse(localStorage.getItem('lq:settings:v1')||'{}');var d=document.documentElement;if(s.arabicScale)d.style.setProperty('--scale-ar',s.arabicScale);if(s.englishScale)d.style.setProperty('--scale-en',s.englishScale);}catch(e){}})();`;

const HOME_TITLE = `${SITE.name} — Juz 29 & 30 Memorization Guides`;

export const metadata: Metadata = {
  title: {
    default: HOME_TITLE,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  alternates: {canonical: "/"},
  keywords: ["memorize Quran", "Juz Amma", "Juz 30", "Juz 29", "Tabarak", "Quran memorization", "hifz", "Quran translation", "learn Quran online"],
  applicationName: SITE.name,
  openGraph: {
    title: HOME_TITLE,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE.description,
  },
};

// Site-wide identity for search engines: the site itself and the publisher.
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en",
      publisher: {"@id": `${SITE.url}/#organization`},
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.tagline,
      logo: {"@type": "ImageObject", url: `${SITE.url}/icon.svg`},
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <JsonLd data={SITE_JSON_LD} />
        <script dangerouslySetInnerHTML={{__html: NO_FLASH}} />
        <header className='site-header'>
          <div className='site-header-inner'>
            <Link href='/' className='brand'>
              <span className='brand-mark' aria-hidden='true'>
                <svg className='brand-glyph' viewBox='0 0 64 64'>
                  <text x='32.2' y='42.6'>
                    ق
                  </text>
                </svg>
              </span>
              <span>
                <span className='brand-text'>Learn Quran</span>
              </span>
            </Link>
            <div className='header-actions'>
              <PrimaryNav />
              <SettingsControl />
            </div>
          </div>
        </header>
        <main className='wrap'>{children}</main>
        <Walkthrough />
        <footer className='site-footer'>
          A free, open resource for reading, understanding, and memorizing the Quran.
          <div style={{marginTop: 10}}>
            <Link href='/about/'>About</Link> · <Link href='/contact/'>Contact</Link>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
