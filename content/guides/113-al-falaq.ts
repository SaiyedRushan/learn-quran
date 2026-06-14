import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 113,
    slug: "al-falaq",
    name: "Al-Falaq",
    epithet: "The Dawn",
    arabicName: "سُورَةُ الفَلَقِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Makkan — the first of the two surahs of refuge",
    verseCount: 5,
    rukus: 1,
    stats: [
      { label: "Verses", value: "5" },
      { label: "Revealed", value: "20th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Falaq is the first of the two <em>mu'awwidhatan</em> — the \"two surahs of refuge\" — taught as a shield against every kind of harm. It begins by seeking protection in <em>the Lord of the daybreak</em>: the One who splits the darkness and brings forth the dawn has power over everything within His creation, including all that threatens us. From that single, strong shelter, the surah then names the harms we seek refuge from.\n\nThe progression is deliberate. It moves from the broadest threat — the evil of all created things — to the gathering dark of night, then to harm worked through hidden means, and finally to the corrosive evil of envy. Together with An-Nas, the Prophet ﷺ recited Al-Falaq nightly for protection, making these two surahs a daily practice of seeking Allah's refuge.",
  banners: [
    {
      label: "One of the Mu'awwidhatan",
      text:
        "Al-Falaq and An-Nas (114) are together called the Mu'awwidhatan — the two surahs of seeking refuge. The Prophet ﷺ would recite them for protection, including each night before sleep, cupping his hands and reciting them over himself. They form a daily shield against harm.",
      attribution: "— Reported in <a class='cite-link' href='https://sunnah.com/bukhari:5017' target='_blank' rel='noopener noreferrer'>Sahih al-Bukhari</a>",
    },
  ],
  themes: [
    { text: "Seeking refuge in Allah", color: "teal" },
    { text: "Lord of the daybreak", color: "amber" },
    { text: "Protection from every evil", color: "purple" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "teal",
      title: "Refuge in the Lord of Daybreak",
      from: 1,
      to: 5,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 3 },
        { from: 4, to: 5 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The surah is a commanded prayer of refuge — <em>qul a'udhu</em> (say: I seek refuge). The shelter sought is <em>the Lord of al-falaq</em>, the daybreak — the One who cleaves the darkness to bring the dawn, and so holds power over all that lies in darkness. From there it lists four evils to be sheltered from: the evil of all He created, the evil of darkness when it gathers, the evil of those who blow on knots (hidden, sorcerous harm), and the evil of an envier when he envies.",
        },
        {
          kind: "memory",
          label: "Memory hook — one refuge, then \"from the evil of…\" four times",
          text:
            "After the opening refuge (vv.1), the surah repeats a single frame: <em>min sharri…</em> (from the evil of…). Count the four: (1) <em>ma khalaq</em> — all that He created; (2) <em>ghasiqin idha waqab</em> — darkness when it settles; (3) <em>an-naffathati fi al-'uqad</em> — those who blow on knots; (4) <em>hasidin idha hasad</em> — an envier when he envies. Track it from broad to specific: <strong>all creation → night → hidden harm → envy</strong>.",
        },
        {
          kind: "extra",
          label: "Why \"the daybreak\"?",
          text:
            "Seeking refuge in the <em>Lord of the daybreak</em> is fitting for a surah about escaping darkness and harm. The One who can split the dense dark of night and bring a new dawn can just as surely bring relief from every evil named here. The image sets a tone of hope: however heavy the darkness, light is in His hands.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Al-Falaq — key words",
      items: [
        { arabic: "أَعُوذُ", roman: "a'udhu", english: "I seek refuge", where: "v.1 — the act of taking shelter in Allah" },
        { arabic: "ٱلْفَلَقِ", roman: "al-falaq", english: "The daybreak / dawn", where: "v.1 — the splitting of darkness; the surah's namesake" },
        { arabic: "شَرِّ", roman: "sharr", english: "Evil / harm", where: "v.2 — repeated as the frame for each threat" },
        { arabic: "غَاسِقٍ", roman: "ghasiq", english: "Darkness (of night)", where: "v.3 — the gathering night when it settles" },
        { arabic: "ٱلنَّفَّٰثَٰتِ", roman: "an-naffathat", english: "Those who blow (on knots)", where: "v.4 — hidden, sorcerous harm" },
        { arabic: "حَاسِدٍ", roman: "hasid", english: "An envier", where: "v.5 — the one whose envy works harm" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "One of the two surahs of refuge",
      text:
        "Al-Falaq is five short verses, recited daily by many as part of the morning and evening remembrances and before sleep, together with An-Nas. Its repeated <em>min sharri</em> (from the evil of) gives it a steady, protective rhythm.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–5 · often recited with An-Nas as the two surahs of refuge",
        rows: [
          "Recite all five verses in one rak'ah — the surah is short and is never split.",
          "Following the Prophetic practice, Al-Falaq and An-Nas (114) are recited together for protection, including each night before sleep.",
          "Let the repeated frame guide your pace: a clear opening refuge, then four measured lines each beginning <em>wa min sharri…</em>.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.1", text: "<em>qul a'udhu bi-rabbi al-falaq</em> — the refuge declared in the Lord of daybreak. A natural pause before the harms are listed." },
      { verse: "v.3", text: "<em>wa min sharri ghasiqin idha waqab</em> — the evil of gathering darkness. A natural breath midway through the list." },
      { verse: "v.5", text: "<em>wa min sharri hasidin idha hasad</em> — the final evil, that of the envier. A complete close before ruku'." },
    ],
  },
};

export default guide;
