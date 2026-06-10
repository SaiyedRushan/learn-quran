import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 105,
    slug: "al-fil",
    name: "Al-Fil",
    epithet: "The Elephant",
    arabicName: "سُورَةُ الفِيلِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Early Makkan",
    verseCount: 5,
    rukus: 1,
    stats: [
      { label: "Verses", value: "5" },
      { label: "Revealed", value: "19th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Fil recalls a momentous event the Arabs of Makkah knew well — the <em>Year of the Elephant</em>, around the time of the Prophet's birth. Abraha, a powerful ruler in Yemen, marched on Makkah with a vast army that included a war elephant, intending to demolish the Ka'bah. The surah does not narrate the story in detail; it assumes the audience already knows it, and instead asks a pointed question: have you not seen how your Lord dealt with the companions of the elephant?\n\nThe answer is a lesson in Allah's protection of His House and the futility of plotting against Him. The mighty army's scheme was turned to ruin; flocks of birds pelted them with stones of hard clay, and they were left like devoured chaff — stalks stripped bare and trampled. A force that seemed unstoppable was undone in a single, decisive act of divine power.",
  banners: [
    {
      label: "Historical context — the Year of the Elephant",
      text:
        "The surah refers to the well-documented expedition of Abraha against Makkah to destroy the Ka'bah, around the year of the Prophet's birth. His army, led by an elephant, was destroyed before reaching its goal. This event was so significant to the Arabs that the year itself became known as “the Year of the Elephant.”",
    },
  ],
  themes: [
    { text: "The Year of the Elephant", color: "amber" },
    { text: "Allah protects His House", color: "teal" },
    { text: "Plots turned to ruin", color: "coral" },
    { text: "Divine power over the mighty", color: "purple" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "amber",
      title: "How Your Lord Dealt with the Elephant Army",
      from: 1,
      to: 5,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 4 },
        { from: 5, to: 5 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "Allah addresses the Prophet — and through him every listener — with a rhetorical question: have you not considered how your Lord dealt with the companions of the elephant? Their scheme to destroy the Ka'bah was turned into utter misguidance and failure. Allah sent flocks of birds that struck them with stones of baked clay, reducing the mighty army to <em>'asfin ma'kul</em> — chewed-up straw. Sovereignty belongs to Allah, and no power can stand against His will.",
        },
        {
          kind: "memory",
          label: "Memory hook — two questions, then three actions",
          text:
            "The surah opens with two parallel questions, both starting <em>alam</em> (“did He not…?”): verse 1 <em>alam tara</em> (have you not seen) and verse 2 <em>alam yaj'al kaydahum fi tadlil</em> (did He not make their plot go astray). Then three swift divine actions: <em>arsala</em> (He sent) the birds → <em>tarmihim</em> (pelting them) with stones → <em>fa-ja'alahum</em> (so He made them) like eaten chaff. Two questions, then send-pelt-destroy: a tight five-verse sequence.",
        },
        {
          kind: "extra",
          label: "Connection to Surah Quraysh",
          text:
            "Many scholars read Al-Fil and the next surah, Quraysh (106), as closely linked. Al-Fil describes how Allah protected Makkah and its sanctuary; Quraysh then calls the people of Makkah to worship the Lord of that very House in gratitude for the security and provision they enjoyed because of it. The destruction of the elephant army is the backdrop for the favour Quraysh is told to be thankful for.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Al-Fil — the full surah (vv. 1–5)",
      items: [
        { arabic: "أَلَمْ تَرَ", roman: "alam tara", english: "Have you not seen / considered", where: "v.1 — rhetorical address drawing attention to a known event" },
        { arabic: "بِأَصْحَٰبِ ٱلْفِيلِ", roman: "bi-ashabil-fil", english: "The companions of the elephant", where: "v.1 — Abraha's army that marched on Makkah" },
        { arabic: "كَيْدَهُمْ", roman: "kaydahum", english: "Their plot / scheme", where: "v.2 — their plan to destroy the Ka'bah" },
        { arabic: "تَضْلِيلٍۢ", roman: "tadlil", english: "Misguidance / ruin / going astray", where: "v.2 — their scheme rendered futile" },
        { arabic: "طَيْرًا أَبَابِيلَ", roman: "tayran ababil", english: "Birds in flocks", where: "v.3 — the birds Allah sent against the army" },
        { arabic: "بِحِجَارَةٍۢ مِّن سِجِّيلٍۢ", roman: "bi-hijaratin min sijjil", english: "With stones of hard / baked clay", where: "v.4 — what the birds pelted them with" },
        { arabic: "كَعَصْفٍۢ مَّأْكُولٍۭ", roman: "ka-'asfin ma'kul", english: "Like eaten straw / chewed chaff", where: "v.5 — the army reduced to stripped, devoured stalks" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A short narrative surah",
      text:
        "Al-Fil tells a compact story in five verses and is among the most familiar surahs in daily prayer. It pairs naturally with Surah Quraysh, and some reciters join the two given their close thematic link.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–5 · the complete account in one unit",
        rows: [
          "The surah fits comfortably in a single rak'ah. Recite the two opening questions (vv.1–2) with the rising tone of a challenge before moving to the description of what Allah did.",
          "Verses 3–4 carry the action — the birds and the stones; a measured pace lets the imagery land.",
          "Some reciters follow Al-Fil with Surah Quraysh in the next rak'ah (or even continuously), reflecting the strong link many scholars draw between the two surahs.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.2", text: "<em>alam yaj'al kaydahum fi tadlil</em> — end of the opening questions. A pause here separates the rhetorical setup from the account of Allah's response." },
      { verse: "v.4", text: "<em>tarmihim bi-hijaratin min sijjil</em> — the climactic image of the stones. Pausing before the final verse heightens the contrast with the ruin described next." },
      { verse: "v.5", text: "<em>fa-ja'alahum ka-'asfin ma'kul</em> — the final verse. The picture of the mighty army left like chewed chaff is the surah's decisive close before ruku'." },
    ],
  },
};

export default guide;
