import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 112,
    slug: "al-ikhlaas",
    name: "Al-Ikhlaas",
    epithet: "Sincerity",
    arabicName: "سُورَةُ الإِخۡلَاصِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Makkan — the pure declaration of tawhid",
    verseCount: 4,
    rukus: 1,
    stats: [
      { label: "Verses", value: "4" },
      { label: "Revealed", value: "22nd" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Ikhlaas is the Qur'an's most concentrated statement of <em>tawhid</em> — the absolute oneness of Allah. In four short verses it answers the most fundamental question a human being can ask: <em>who is your Lord?</em> It strips away every false notion — that God could be many, divisible, born, a parent, or like His creation — and leaves only the pure truth of His oneness.\n\nThe surah's name, <em>al-Ikhlaas</em> (sincerity, purity), captures its function: it purifies belief of every impurity of association. The Prophet ﷺ taught that this surah equals a third of the Qur'an — because the Qur'an's teachings divide broadly into law, stories, and creed, and Al-Ikhlaas captures the essence of creed in its purest form. Each verse closes a door to error and opens onto the same truth: <em>He is Allah, One</em>.",
  banners: [
    {
      label: "Equal to a third of the Qur'an",
      text:
        "The Prophet ﷺ taught that Al-Ikhlaas is equivalent to a third of the Qur'an. Scholars explain that the Qur'an's themes fall broadly into creed, law, and narrative — and this surah distils the whole of creed (tawhid) into four verses, making it weighty far beyond its length.",
      attribution: "— Reported in Sahih al-Bukhari",
    },
  ],
  themes: [
    { text: "Absolute oneness of Allah", color: "purple" },
    { text: "Purity of creed", color: "teal" },
    { text: "Nothing is like Him", color: "amber" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "purple",
      title: "Who Is Allah — Four Truths",
      from: 1,
      to: 4,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 4 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The surah is a commanded answer — it opens with <em>qul</em> (say) — declaring four truths about Allah. He is <em>Ahad</em> (One, utterly unique, indivisible). He is <em>as-Samad</em> (the Eternal Refuge, the One upon whom all depend while He depends on none). He <em>neither begets nor is born</em> — He has no offspring and no origin. And <em>there is none equal to Him</em> — nothing in creation resembles or rivals Him. Together these close off every avenue of <em>shirk</em> (association) and leave belief pure.",
        },
        {
          kind: "memory",
          label: "Memory hook — four \"no\"s around one \"yes\"",
          text:
            "The surah affirms one truth and then denies every alternative. The <strong>yes</strong>: <em>Allahu Ahad… Allahu as-Samad</em> (He is One; He is the Eternal Refuge). The <strong>no</strong>s: He does not beget (<em>lam yalid</em>), He is not begotten (<em>lam yulad</em>), and nothing is equal to Him (<em>lam yakun lahu kufuwan ahad</em>). Notice the bookend: the surah opens and closes on the word <em>Ahad</em> (One) — a frame around the whole.",
        },
        {
          kind: "extra",
          label: "<em>as-Samad</em> — the word that carries the surah",
          text:
            "<em>as-Samad</em> (v.2) is rich and hard to translate in a single word. It conveys the One who is self-sufficient and eternal, the One to whom all creation turns in need while He needs nothing — solid, complete, without hollow or want. It is the positive counterpart to the denials that follow: because He is <em>as-Samad</em>, He cannot beget, be born, or have an equal.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Al-Ikhlaas — key words",
      items: [
        { arabic: "قُلْ", roman: "qul", english: "Say", where: "v.1 — the surah is a commanded declaration" },
        { arabic: "أَحَدٌ", roman: "ahad", english: "One / utterly unique", where: "v.1 & v.4 — opens and closes the surah" },
        { arabic: "ٱلصَّمَدُ", roman: "as-samad", english: "The Eternal Refuge / Self-Sufficient", where: "v.2 — the One on whom all depend" },
        { arabic: "لَمْ يَلِدْ", roman: "lam yalid", english: "He does not beget", where: "v.3 — He has no offspring" },
        { arabic: "وَلَمْ يُولَدْ", roman: "wa lam yulad", english: "Nor is He born", where: "v.3 — He has no origin or parent" },
        { arabic: "كُفُوًا", roman: "kufuwan", english: "An equal / comparable", where: "v.4 — nothing in creation is like Him" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "Short but weighty",
      text:
        "Al-Ikhlaas is four short verses, among the first many believers memorise, yet the Prophet ﷺ taught it equals a third of the Qur'an. Its rhythm is calm and balanced, with the word <em>Ahad</em> opening and closing it — a frame worth feeling as you recite.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–4 · among the most frequently recited surahs in prayer",
        rows: [
          "Recite all four verses in one rak'ah — the surah is short and is never split.",
          "Following the Prophetic practice, it is often paired with Al-Kaafiroon (109) in the sunnah rak'ahs before Fajr and after Maghrib, and is a common choice in any rak'ah of prayer.",
          "Feel the bookend: the surah opens on <em>Ahad</em> (v.1) and closes on <em>Ahad</em> (v.4) — let the final word land with the same weight as the first.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.2", text: "<em>Allahu as-samad</em> — the great name that anchors the surah. A natural pause before the denials begin." },
      { verse: "v.3", text: "<em>lam yalid wa lam yulad</em> — the twin denial of begetting and being born. A natural breath before the final verse." },
      { verse: "v.4", text: "<em>wa lam yakun lahu kufuwan ahad</em> — the final verse, closing on <em>Ahad</em>. A complete, balanced close before ruku'." },
    ],
  },
};

export default guide;
