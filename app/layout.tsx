import type {Metadata} from "next";
import Link from "next/link";
import SettingsControl from "@/components/SettingsControl";
import "./globals.css";

// Applies saved font-size settings before paint, avoiding a flash of default size.
const NO_FLASH = `(function(){try{var s=JSON.parse(localStorage.getItem('lq:settings:v1')||'{}');var d=document.documentElement;if(s.arabicScale)d.style.setProperty('--scale-ar',s.arabicScale);if(s.englishScale)d.style.setProperty('--scale-en',s.englishScale);}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "Learn Quran — Juz 30 Memorization Guides",
    template: "%s · Learn Quran",
  },
  description:
    "Structured, section-by-section guides for memorizing and understanding the Quran, starting with Juz Amma (Juz 30). Verified Arabic text, translation, vocabulary, memory hooks, and recitation guidance.",
  metadataBase: new URL("https://learn-quran.example"),
  openGraph: {
    title: "Learn Quran — Juz 30 Memorization Guides",
    description: "Structured, section-by-section guides for memorizing and understanding the Quran.",
    type: "website",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
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
                <span className='brand-sub' style={{display: "block"}}>
                  Juz 30 · Juz Amma
                </span>
              </span>
            </Link>
            <div className='header-actions'>
              <Link href='/' className='header-link'>
                All Surahs
              </Link>
              <SettingsControl />
            </div>
          </div>
        </header>
        <main className='wrap'>{children}</main>
        <footer className='site-footer'>
          Arabic text (Uthmani) and the Sahih International translation are sourced from the{" "}
          <a href='https://alquran.cloud/api' target='_blank' rel='noreferrer'>
            AlQuran Cloud API
          </a>
          . The teaching commentary (overviews, memory hooks, vocabulary notes, and recitation guidance) is an educational aid — guides marked “draft” are pending review by a
          qualified scholar. Please verify any point of religious ruling with a trusted teacher.
        </footer>
      </body>
    </html>
  );
}
