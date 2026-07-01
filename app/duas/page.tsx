import type { Metadata } from "next";
import Link from "next/link";
import duas from "@/content/duas";
import DuasView from "@/components/DuasView";

export const metadata: Metadata = {
  title: "Duas of the Prayer",
  description:
    "The essential duas of the Islamic prayer — answering the adhan and the dua after it, the opening supplication, rukūʿ and sujūd, the Tashahhud, the salah on the Prophet ﷺ, duas before the salām, and Duʿāʾ al-Qunūt — with Arabic, transliteration, and translation.",
};

export default function DuasPage() {
  return (
    <>
      <Link href="/" className="back-link">
        ← All surahs
      </Link>

      <div className="top">
        <div className="surah-name">Duas of the Prayer</div>
        <div className="meta">
          The supplications of the adhan and the salah — with transliteration and meaning
        </div>
        <div className="ar-title" dir="rtl">
          أَذْكَارُ الصَّلَاة
        </div>
      </div>

      <DuasView duas={duas} />
    </>
  );
}
