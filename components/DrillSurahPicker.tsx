"use client";

// Searchable surah list for a drill's landing page. `hrefPattern` contains
// "{slug}", e.g. "/drills/translate/{slug}/" or "/surah/{slug}/quiz/". The
// entries arrive as props from the server page so the client bundle doesn't
// drag in the guide content behind lib/content.

import Link from "next/link";
import {useState} from "react";
import {searchSurahs} from "@/lib/search";

export interface PickerEntry {
  number: number;
  slug: string;
  name: string;
  epithet: string;
  arabicName: string;
  verseCount: number;
  passageRef?: string;
}

export interface PickerGroup {
  title: string;
  items: PickerEntry[];
}

export default function DrillSurahPicker({
  hrefPattern,
  groups,
}: {
  hrefPattern: string;
  groups: PickerGroup[];
}) {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const filtered = searching ? searchSurahs(query, groups.flatMap((g) => g.items)) : [];

  function renderRow(s: PickerEntry) {
    return (
      <Link key={s.slug} href={hrefPattern.replace("{slug}", s.slug)} className='gm-pick-row'>
        <span className='gm-pick-num'>{s.number}</span>
        <span className='gm-pick-name'>
          {s.name}
          <span className='gm-pick-epithet'> — {s.epithet}</span>
        </span>
        <span className='gm-pick-count'>{s.passageRef ?? `${s.verseCount} verses`}</span>
      </Link>
    );
  }

  return (
    <div className='gm-pick'>
      <div className='search'>
        <svg
          className='search-icon'
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          aria-hidden='true'
        >
          <circle cx='11' cy='11' r='7' />
          <line x1='21' y1='21' x2='16.65' y2='16.65' />
        </svg>
        <input
          className='search-input'
          type='search'
          inputMode='search'
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search by name, meaning, or Arabic…'
          aria-label='Search surahs'
          autoComplete='off'
        />
        {searching && (
          <button className='search-clear' aria-label='Clear search' onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </div>

      {searching ? (
        filtered.length === 0 ? (
          <div className='search-empty'>
            No surahs match “{query.trim()}”.
            <br />
            Try a different spelling, the meaning, or the Arabic name.
          </div>
        ) : (
          <div className='gm-pick-list'>{filtered.map(renderRow)}</div>
        )
      ) : (
        groups.map((g) => (
          <div key={g.title} className='gm-pick-group'>
            <div className='gm-pick-title'>{g.title}</div>
            <div className='gm-pick-list'>{g.items.map(renderRow)}</div>
          </div>
        ))
      )}
    </div>
  );
}
