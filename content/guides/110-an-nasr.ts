import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 110,
    slug: "an-nasr",
    name: "An-Nasr",
    epithet: "Divine Support",
    arabicName: "سُورَةُ النَّصۡرِ",
    juz: 30,
    revelationType: "Madinan",
    revelationDetail: "Madinan — among the last revelations",
    verseCount: 3,
    rukus: 1,
    stats: [
      { label: "Verses", value: "3" },
      { label: "Revealed", value: "114th" },
      { label: "Period", value: "Madinan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "An-Nasr was among the last surahs revealed, coming near the end of the Prophet's ﷺ life when the mission was reaching completion. It speaks of the moment of triumph — the victory of Allah and the conquest, when people would enter Islam in great waves. Yet the surah's most striking feature is what it commands <em>at</em> that moment of success: not celebration, but glorification, praise, and seeking forgiveness.\n\nIn just three verses the surah reframes victory. Worldly conquest is not the goal in itself; it is a sign of Allah's help, and the response it calls for is humility before Him. Many of the Companions understood this surah as a quiet signal that the Prophet's ﷺ work was nearly done — that the completion of the mission was also a herald of his return to his Lord.",
  banners: [
    {
      label: "Signalling the completion of the mission",
      text:
        "An-Nasr was among the final revelations and is widely understood to have signalled that the Prophet's ﷺ mission was nearing its completion. The command to glorify, praise, and seek forgiveness at the height of victory was read by many of the Companions as a gentle announcement that his work on earth was almost finished.",
    },
  ],
  themes: [
    { text: "Victory as a gift from Allah", color: "teal" },
    { text: "Humility at the peak", color: "amber" },
    { text: "Glorify, praise, seek forgiveness", color: "purple" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "teal",
      title: "When Victory Comes — Turn to Allah",
      from: 1,
      to: 3,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 3 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The surah sets a scene and then gives a command. The scene: <em>when the help of Allah and the conquest come, and you see people entering Allah's religion in crowds</em>. The command: <em>then glorify your Lord with praise and seek His forgiveness</em>. Victory is attributed entirely to Allah (<em>nasrullah</em> — the help of Allah), and the proper response to it is <em>tasbih</em> (glorification), <em>hamd</em> (praise), and <em>istighfar</em> (seeking forgiveness) — not pride. The surah closes by naming Allah <em>Tawwab</em> — ever-accepting of repentance.",
        },
        {
          kind: "memory",
          label: "Memory hook — \"when… then…\"",
          text:
            "The structure is a simple condition and response. Verses 1–2 are the <strong>when</strong> (<em>idha ja'a</em> — when there comes…, with two signs: the victory, and the people entering in waves). Verse 3 is the <strong>then</strong> (<em>fasabbih</em> — so glorify…), carrying three commands in a row: glorify, praise, seek forgiveness. Lock the trio in order — <em>sabbih → bihamdi → istaghfir</em> — and the verse falls into place.",
        },
        {
          kind: "extra",
          label: "Forgiveness at the moment of success",
          text:
            "Why seek forgiveness when victory has just been granted? Because the surah teaches that even our best moments fall short of fully honouring Allah, and that turning back to Him in humility — rather than basking in achievement — is the mark of the believer. The closing name <em>Tawwab</em> reassures that this turning is always met with acceptance.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "An-Nasr — key words",
      items: [
        { arabic: "نَصْرُ", roman: "nasru", english: "Help / victory", where: "v.1 — the help of Allah, the source of all triumph" },
        { arabic: "ٱلْفَتْحُ", roman: "al-fath", english: "The conquest / opening", where: "v.1 — the decisive opening granted by Allah" },
        { arabic: "أَفْوَاجًۭا", roman: "afwaja", english: "In multitudes / crowds", where: "v.2 — people entering the religion wave upon wave" },
        { arabic: "فَسَبِّحْ", roman: "fasabbih", english: "So glorify", where: "v.3 — the first command of the response" },
        { arabic: "بِحَمْدِ", roman: "bihamdi", english: "With the praise of", where: "v.3 — glorification joined with praise" },
        { arabic: "ٱسْتَغْفِرْهُ", roman: "istaghfirhu", english: "Seek His forgiveness", where: "v.3 — the third command, humility at the peak" },
        { arabic: "تَوَّابًۢا", roman: "tawwaba", english: "Ever-accepting of repentance", where: "v.3 — the divine name that closes the surah" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A brief, late-revealed surah",
      text:
        "At three verses, An-Nasr is short and quickly memorised. Its rhythm is gentle and reflective rather than dramatic — fitting for a surah whose theme is humility at the moment of success. Many reciters give the closing three commands a measured, deliberate delivery.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–3 · suitable for any rak'ah of fard or nafl prayer",
        rows: [
          "Recite all three verses in one rak'ah — the surah is short and is never split.",
          "Let the first two verses set the scene calmly (<em>idha ja'a nasrullahi wal-fath…</em>), then deliver the three commands of verse 3 with care — glorify, praise, seek forgiveness — landing on the name <em>Tawwaba</em>.",
          "Its brevity makes it a natural companion to a slightly longer surah in the paired rak'ah.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.1", text: "<em>idha ja'a nasrullahi wal-fath</em> — the first sign of victory. A light pause is natural before the second sign." },
      { verse: "v.2", text: "<em>wa ra'aytan-nasa yadkhuluna fi dinillahi afwaja</em> — the scene complete. A natural breath before the command." },
      { verse: "v.3", text: "<em>fasabbih bihamdi rabbika wastaghfirhu innahu kana tawwaba</em> — the final verse, carrying the response and the closing name. A reflective close before ruku'." },
    ],
  },
};

export default guide;
