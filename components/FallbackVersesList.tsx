"use client";

// Client island for the surah page's "guide in progress" fallback. The rest of
// that page is a server component, but the Arabic script is a client-only
// setting, so the verse list lives here to render the chosen script reactively.

import type {Ayah} from "@/content/types";
import {useSettings} from "@/lib/settings";
import {pickArabic} from "@/lib/arabic";

export default function FallbackVersesList({ayahs}: {ayahs: Ayah[]}) {
  const {arabicFont} = useSettings();
  return (
    <div className='verses' style={{marginBottom: 0, marginTop: 4}}>
      {ayahs.map((a) => (
        <div className='vrow' key={a.number}>
          <div className='vnum'>{a.number}</div>
          <div className='var'>{pickArabic(a, arabicFont)}</div>
          <div className='vtrans'>{a.translation}</div>
        </div>
      ))}
    </div>
  );
}
