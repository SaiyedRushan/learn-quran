import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  meta: {
    number: 114,
    slug: "an-naas",
    name: "An-Naas",
    epithet: "Mankind",
    arabicName: "سُورَةُ النَّاسِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Makkan — the second of the two surahs of refuge",
    verseCount: 6,
    rukus: 1,
    stats: [
      { label: "Verses", value: "6" },
      { label: "Revealed", value: "21st" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "An-Naas is the final surah of the Qur'an and the second of the two <em>mu'awwidhatan</em> — the surahs of refuge. Where Al-Falaq sought protection from external harms, An-Naas turns inward, to the most intimate threat of all: the whisper that slips into the human heart. It opens by invoking Allah under three of His relationships to mankind — their Lord, their Sovereign, their God — building a complete shelter before naming the danger.\n\nThat danger is <em>al-waswas al-khannas</em> — the whisperer who withdraws. It is the prompting of evil, urging wrong from within the breast, then retreating when a person turns to Allah, only to return again. The surah's closing verse reveals that this whispering comes from two sources — among the jinn and among mankind — reminding us that the subtlest enemy may wear a familiar face. Together with Al-Falaq, the Prophet ﷺ recited An-Naas nightly for protection.",
  banners: [
    {
      label: "One of the Mu'awwidhatan",
      text:
        "An-Naas and Al-Falaq (113) are together called the Mu'awwidhatan — the two surahs of seeking refuge. The Prophet ﷺ would recite them for protection, including each night before sleep, cupping his hands and reciting them over himself. An-Naas is the closing surah of the Qur'an.",
      attribution: "— Reported in <a class='cite-link' href='https://sunnah.com/bukhari:5017' target='_blank' rel='noopener noreferrer'>Sahih al-Bukhari</a>",
    },
  ],
  themes: [
    { text: "Refuge in Allah", color: "teal" },
    { text: "Three relationships to mankind", color: "purple" },
    { text: "The whisperer within", color: "coral" },
    { text: "Jinn and mankind", color: "slate" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "teal",
      title: "Refuge from the Whisperer",
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
            "The surah is a commanded prayer of refuge — <em>qul a'udhu</em> (say: I seek refuge). It builds its shelter on three names of Allah in relation to people: <em>Rabb an-nas</em> (Lord of mankind), <em>Malik an-nas</em> (Sovereign of mankind), and <em>Ilah an-nas</em> (God of mankind). Then it names the threat: <em>al-waswas al-khannas</em> — the whisperer who withdraws — who whispers evil into the breasts of people, and who comes from both jinn and mankind.",
        },
        {
          kind: "memory",
          label: "Memory hook — three names, then the one enemy",
          text:
            "The surah has two clear halves. The first three verses each end on <em>an-nas</em> and ascend through three relationships: <strong>Rabb</strong> (Lord) → <strong>Malik</strong> (Sovereign) → <strong>Ilah</strong> (God). The last three verses describe the single enemy: the <em>khannas</em> (one who retreats), <em>who whispers in the breasts</em>, coming <em>from jinn and mankind</em>. The repeated word <em>an-nas</em> threads through almost every verse — let that refrain carry the rhythm.",
        },
        {
          kind: "extra",
          label: "<em>al-khannas</em> — the one who slinks away",
          text:
            "The word <em>khannas</em> describes one who lurks and then withdraws. Scholars explain the pattern of the whisperer: it prompts toward evil, but when a person remembers Allah it shrinks back, then returns the moment heedlessness sets in. The cure is therefore built into the surah itself — the very act of seeking refuge in Allah drives the whisperer away.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "An-Naas — key words",
      items: [
        { arabic: "أَعُوذُ", roman: "a'udhu", english: "I seek refuge", where: "v.1 — the act of taking shelter in Allah" },
        { arabic: "رَبِّ", roman: "rabb", english: "Lord / Sustainer", where: "v.1 — the first relationship to mankind" },
        { arabic: "مَلِكِ", roman: "malik", english: "Sovereign / King", where: "v.2 — the second relationship to mankind" },
        { arabic: "إِلَٰهِ", roman: "ilah", english: "God / the One worshipped", where: "v.3 — the third relationship to mankind" },
        { arabic: "ٱلْوَسْوَاسِ", roman: "al-waswas", english: "The whisperer", where: "v.4 — the source of the inner prompting to evil" },
        { arabic: "ٱلْخَنَّاسِ", roman: "al-khannas", english: "The one who withdraws / slinks away", where: "v.4 — retreats when Allah is remembered" },
        { arabic: "ٱلْجِنَّةِ وَٱلنَّاسِ", roman: "al-jinnati wan-nas", english: "Jinn and mankind", where: "v.6 — the two sources of the whispering" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "The closing surah of the Qur'an",
      text:
        "An-Naas is six short verses and the final surah of the Qur'an, recited daily by many in the morning and evening remembrances and before sleep, together with Al-Falaq. The recurring word <em>an-nas</em> gives it a distinctive, gentle refrain.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–6 · often recited with Al-Falaq as the two surahs of refuge",
        rows: [
          "Recite all six verses in one rak'ah — the surah is short and is never split.",
          "Following the Prophetic practice, An-Nas and Al-Falaq (113) are recited together for protection, including each night before sleep.",
          "Mind the recurring <em>an-nas</em> ending across the verses — recite at a measured pace so the three names (Rabb, Malik, Ilah) stay clear and distinct.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.3", text: "<em>ilahi an-nas</em> — the third of the three names completes the shelter. A natural pause before the threat is named." },
      { verse: "v.5", text: "<em>alladhi yuwaswisu fi suduri an-nas</em> — the whisperer's work described. A natural breath before the closing verse." },
      { verse: "v.6", text: "<em>mina al-jinnati wan-nas</em> — the final verse of the Qur'an, naming the two sources of the whispering. A complete close before ruku'." },
    ],
  },
};

export default guide;
