import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
    description:
      "Structured, section-by-section guides for memorizing and understanding the Quran.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">ق</span>
              <span>
                <span className="brand-text">Learn Quran</span>
                <span className="brand-sub" style={{ display: "block" }}>
                  Juz 30 · Juz Amma
                </span>
              </span>
            </Link>
            <Link href="/" className="header-link">
              All Surahs
            </Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          Arabic text (Uthmani) and the Sahih International translation are
          sourced from the{" "}
          <a href="https://alquran.cloud/api" target="_blank" rel="noreferrer">
            AlQuran Cloud API
          </a>
          . The teaching commentary (overviews, memory hooks, vocabulary notes,
          and recitation guidance) is an educational aid — guides marked “draft”
          are pending review by a qualified scholar. Please verify any point of
          religious ruling with a trusted teacher.
        </footer>
      </body>
    </html>
  );
}
