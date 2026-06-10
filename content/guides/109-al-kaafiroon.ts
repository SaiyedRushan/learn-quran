import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 109,
    slug: "al-kaafiroon",
    name: "Al-Kaafiroon",
    epithet: "The Disbelievers",
    arabicName: "سُورَةُ الكَافِرُونَ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Makkan — a declaration of religious distinction",
    verseCount: 6,
    rukus: 1,
    stats: [
      { label: "Verses", value: "6" },
      { label: "Revealed", value: "18th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Kaafiroon is a surah of <em>bara'ah</em> — clean, principled disavowal. Revealed in Makkah, it answers attempts by the Prophet's ﷺ opponents to strike a compromise: they would worship his Lord for a time if he would worship their idols for a time. The surah refuses that bargain absolutely. There can be no mixing of pure monotheism with the worship of false gods.\n\nIts power lies in its repetition. Across five verses the surah draws a firm line between two paths of worship — present and future, theirs and the Prophet's ﷺ — and closes with a verse that has become a byword for clarity: <em>for you is your religion, and for me is mine</em>. This is not a verse of hostility but of definition: faith cannot be negotiated into a blend. The two worships are distinct, and they remain distinct.",
  banners: [
    {
      label: "A surah of disavowal",
      text:
        "Al-Kaafiroon disavows the worship of every false god. The Prophet ﷺ regularly recited Al-Kaafiroon and Al-Ikhlas together in the two sunnah rak'ahs before Fajr and after Maghrib — the two surahs together affirming pure devotion (Al-Ikhlas) and freedom from false worship (Al-Kaafiroon).",
      attribution: "— Reported in Muslim and Abu Dawud",
    },
  ],
  themes: [
    { text: "Disavowal of false worship", color: "coral" },
    { text: "Purity of tawhid", color: "amber" },
    { text: "No compromise in faith", color: "slate" },
    { text: "Coexistence with clarity", color: "teal" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "coral",
      title: "Two Worships, Firmly Distinguished",
      from: 1,
      to: 6,
      groups: [
        { from: 1, to: 3 },
        { from: 4, to: 6 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The surah is a commanded declaration — it opens with <em>qul</em> (say). The Prophet ﷺ is told to address the disbelievers directly and reject any blending of worship: <em>I do not worship what you worship, nor do you worship what I worship</em>. The point is not merely a difference of opinion but a difference of object: the One True God on one side, false gods on the other. The closing verse seals it — each party owns its own path, with no overlap.",
        },
        {
          kind: "memory",
          label: "Memory hook — four denials, then the seal",
          text:
            "The heart of the surah is two matched pairs. Verses 2–3 use present-tense forms (<em>a'budu</em> / <em>'abidun</em> — I worship / you worship). Verses 4–5 shift to a settled, ongoing sense (<em>'abidun ma 'abadtum</em> / <em>'abidun ma a'bud</em>). The trap for memorisers is verses 3 and 5, which read identically — <em>wa la antum 'abiduna ma a'bud</em>. Tag them in your mind as \"the twin verses,\" then let the final verse 6, <em>lakum dinukum wa liya din</em>, stand alone as the seal.",
        },
        {
          kind: "extra",
          label: "Not hostility — definition",
          text:
            "<em>Lakum dinukum wa liya din</em> — \"for you is your religion, and for me is mine\" — is often misread as either aggression or indifference. It is neither. It is a statement of <em>distinction</em>: the Prophet ﷺ would not purchase peace by diluting his faith, nor would he force theirs. Clarity about what one worships is the foundation; everything else follows from it.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Al-Kaafiroon — key words",
      items: [
        { arabic: "قُلْ", roman: "qul", english: "Say", where: "v.1 — the surah is a commanded declaration" },
        { arabic: "ٱلْكَٰفِرُونَ", roman: "al-kafirun", english: "The disbelievers", where: "v.1 — those addressed who rejected tawhid" },
        { arabic: "أَعْبُدُ", roman: "a'budu", english: "I worship", where: "v.2 — present-tense affirmation of the Prophet's ﷺ devotion" },
        { arabic: "تَعْبُدُونَ", roman: "ta'budun", english: "You worship", where: "v.2 — the false objects of their devotion" },
        { arabic: "عَابِدٌ", roman: "'abid", english: "A worshipper", where: "v.4 — a settled, ongoing sense of worship" },
        { arabic: "دِينُكُمْ", roman: "dinukum", english: "Your religion", where: "v.6 — their path, kept distinct" },
        { arabic: "دِينِ", roman: "din(i)", english: "My religion", where: "v.6 — the Prophet's ﷺ path, the seal of the surah" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A short, repetitive surah",
      text:
        "Al-Kaafiroon is six short verses built on tight repetition, which makes it quick to learn but easy to slip on — verses 3 and 5 are identical, and verses 2–3 and 4–5 are close cousins. Reciting it slowly and deliberately, hearing the matched pairs, is the key to keeping the order straight.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–6 · commonly paired with Al-Ikhlas in sunnah prayers",
        rows: [
          "Recite all six verses in one rak'ah — the surah is short and is never split.",
          "Following the Prophetic practice, it is often recited in the first of the two sunnah rak'ahs before Fajr (or after Maghrib), with Al-Ikhlas (112) in the second.",
          "Take care with the twin verses (3 and 5): both read <em>wa la antum 'abiduna ma a'bud</em>. Reciting at a measured pace prevents jumping or repeating.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.3", text: "<em>wa la antum 'abiduna ma a'bud</em> — end of the first matched pair. A natural breath before the surah shifts to the settled forms." },
      { verse: "v.5", text: "<em>wa la antum 'abiduna ma a'bud</em> — the twin of v.3, closing the second pair. Pause here before the final seal." },
      { verse: "v.6", text: "<em>lakum dinukum wa liya din</em> — the final verse stands alone as the conclusion. A firm, clear close before ruku'." },
    ],
  },
};

export default guide;
