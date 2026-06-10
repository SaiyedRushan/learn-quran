import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 97,
    slug: "al-qadr",
    name: "Al-Qadr",
    epithet: "The Power, Fate",
    arabicName: "سُورَةُ القَدۡرِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Makkan",
    verseCount: 5,
    rukus: 1,
    stats: [
      { label: "Verses", value: "5" },
      { label: "Revealed", value: "25th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Qadr is a five-verse celebration of <em>Laylat al-Qadr</em> — the Night of Decree — the night on which the Qur'an began to be sent down. In just a few lines it establishes the immense rank of this night: it is <em>better than a thousand months</em>, a span longer than most human lifetimes, so that the worship of a single night can outweigh more than eighty years of devotion.\n\nThe surah then describes what happens on this night: the angels and the Spirit (Jibril) descend by the permission of their Lord with every decreed matter, and the night is pure <em>peace</em> until the break of dawn. Short as it is, the surah has shaped the spiritual rhythm of the believing community, who seek out this night in the last ten days of Ramadan in hope of its boundless reward.",
  banners: [
    {
      label: "Context — the night the Qur'an descended",
      text:
        "This surah commemorates Laylat al-Qadr, the night on which the Qur'an began to be revealed. The believing community seeks it especially in the odd nights of the last ten days of Ramadan, devoting them to prayer and supplication in hope of its great reward.",
    },
  ],
  themes: [
    { text: "The Night of Decree", color: "purple" },
    { text: "Better than a thousand months", color: "amber" },
    { text: "Descent of angels & the Spirit", color: "teal" },
    { text: "Peace until dawn", color: "slate" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "purple",
      title: "The Night of Decree — Better Than a Thousand Months",
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
            "Allah announces that He sent the Qur'an down on the <em>Night of Decree</em>, then magnifies the night with a rhetorical question — <em>what can make you know what it is?</em> The answer follows: it is <em>better than a thousand months</em>. On this night the angels and the Spirit (Jibril) descend by their Lord's permission carrying every decreed matter, and the night is unbroken <em>peace</em> until the dawn breaks. A single surah captures the night's origin, its rank, its visitors, and its character.",
        },
        {
          kind: "memory",
          label: "Memory hook — the night named three times, then peace",
          text:
            "The phrase <em>laylatul-qadr</em> repeats three times across verses 1–3 — once to announce it, once in the question, once to weigh it against a thousand months. Lock onto that triple naming. Then verse 4 brings the descent (<em>tanazzalul-mala'ikatu war-ruh</em>) and verse 5 the close: <em>salamun hiya hatta matla'il-fajr</em> — peace, until dawn.",
        },
        {
          kind: "extra",
          label: "\"Better than a thousand months\"",
          text:
            "A thousand months is roughly eighty-three years — longer than a typical lifetime. The verse means the worship and good done on this one night outweighs that of a lifetime without it: an extraordinary mercy compressed into a single night, which is why believers pursue it so earnestly in the last ten nights of Ramadan.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Section 1 — The Night of Decree (vv. 1–5)",
      items: [
        { arabic: "أَنزَلْنَٰهُ", roman: "anzalnahu", english: "We sent it down", where: "v.1 — \"it\" being the Qur'an, begun on this night" },
        { arabic: "لَيْلَةِ ٱلْقَدْرِ", roman: "laylatil-qadr", english: "The Night of Decree / Power", where: "v.1 — the night named; repeated in vv.2 and 3" },
        { arabic: "أَدْرَىٰكَ", roman: "adraka", english: "Make you know", where: "v.2 — a question magnifying the night's immense rank" },
        { arabic: "خَيْرٌۭ", roman: "khayrun", english: "Better", where: "v.3 — better than a thousand months in reward" },
        { arabic: "أَلْفِ شَهْرٍۢ", roman: "alfi shahr", english: "A thousand months", where: "v.3 — roughly eighty-three years; the measure of its worth" },
        { arabic: "تَنَزَّلُ", roman: "tanazzalu", english: "Descend", where: "v.4 — the angels coming down throughout the night" },
        { arabic: "ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ", roman: "al-mala'ikatu war-ruh", english: "The angels and the Spirit", where: "v.4 — the Spirit understood as Jibril" },
        { arabic: "سَلَٰمٌ", roman: "salamun", english: "Peace", where: "v.5 — the night is pure peace until the dawn" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A short, much-loved surah",
      text:
        "Al-Qadr is five short verses, recited in well under a minute. Its gentle, repeating rhythm — especially the threefold <em>laylatul-qadr</em> — makes it one of the easiest surahs to memorise and a frequent choice in the nightly prayers of Ramadan.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–5 · the natural way to recite Al-Qadr",
        rows: [
          "With only five verses, Al-Qadr is recited complete in a single rak'ah. The whole arc — the descent of the Qur'an, the night's rank, the descending angels, and the peace until dawn — belongs together.",
          "It is especially favoured during the last ten nights of Ramadan, when believers seek Laylat al-Qadr, and pairs naturally with the surrounding short surahs across the two rak'ahs of a prayer.",
          "The closing verse — <em>salamun hiya hatta matla'il-fajr</em> — fades into a serene final cadence, a fitting note to end on before ruku'.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.1", text: "<em>inna anzalnahu fi laylatil-qadr</em> — the opening declaration. A complete statement on its own: the Qur'an was sent down on the Night of Decree." },
      { verse: "v.3", text: "<em>laylatul-qadri khayrum-min alfi shahr</em> — \"better than a thousand months.\" The night's immense worth, a natural place to pause and reflect." },
      { verse: "v.5", text: "<em>salamun hiya hatta matla'il-fajr</em> — the final verse. \"Peace it is, until the break of dawn\" — a tranquil close, perfect before ruku'." },
    ],
  },
};

export default guide;
