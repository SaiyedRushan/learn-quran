// Server-rendered surah list for a game's landing page. `hrefPattern` contains
// "{slug}", e.g. "/games/translate/{slug}/" or "/surah/{slug}/quiz/".

import Link from "next/link";
import {juz29Index, juz30Index, virtuesIndex, type IndexEntry} from "@/lib/content";

const GROUPS: {title: string; list: IndexEntry[]}[] = [
  {title: "Juz 30 — Juz ʿAmma", list: juz30Index},
  {title: "Juz 29 — Tabārak", list: juz29Index},
  {title: "Recommended recitations", list: virtuesIndex},
];

export default function GameSurahPicker({hrefPattern}: {hrefPattern: string}) {
  return (
    <div className='gm-pick'>
      {GROUPS.map((g) => (
        <div key={g.title} className='gm-pick-group'>
          <div className='gm-pick-title'>{g.title}</div>
          <div className='gm-pick-list'>
            {g.list.map((s) => (
              <Link key={s.slug} href={hrefPattern.replace("{slug}", s.slug)} className='gm-pick-row'>
                <span className='gm-pick-num'>{s.number}</span>
                <span className='gm-pick-name'>
                  {s.name}
                  <span className='gm-pick-epithet'> — {s.epithet}</span>
                </span>
                <span className='gm-pick-count'>{s.verseCount} verses</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
