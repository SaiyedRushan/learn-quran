"use client";

import Link from "next/link";
import { useLearnedDuaKeys } from "@/lib/progress";

export default function PrayerCta({ duaIds }: { duaIds: string[] }) {
  const learned = new Set(useLearnedDuaKeys());
  const done = duaIds.filter((id) => learned.has(id)).length;
  const total = duaIds.length;

  return (
    <Link href="/duas/" className="prayer-cta">
      <span className="prayer-cta-icon">🤲</span>
      <span className="prayer-cta-main">
        <span className="prayer-cta-title">Duas of the Prayer</span>
        <span className="prayer-cta-sub">
          The dua after the adhan, Tashahhud, the salah on the Prophet ﷺ,
          Duʿāʾ al-Qunūt and more — Arabic, transliteration &amp; meaning
        </span>
      </span>
      {done > 0 ? (
        <span className="prayer-cta-count">
          {done}/{total}
        </span>
      ) : (
        <span className="prayer-cta-arrow" aria-hidden="true">
          →
        </span>
      )}
    </Link>
  );
}
