import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 99,
    slug: "az-zalzala",
    name: "Az-Zalzala",
    epithet: "The Earthquake",
    arabicName: "سُورَةُ الزَّلۡزَلَةِ",
    juz: 30,
    revelationType: "Madinan",
    revelationDetail: "Commonly classed Madinan (some scholars: Makkan)",
    verseCount: 8,
    stats: [
      { label: "Verses", value: "8" },
      { label: "Revealed", value: "93rd" },
      { label: "Period", value: "Madinan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Az-Zalzala takes its name from its opening image: the earth convulsing in one final, total earthquake that signals the end of the world. In just eight verses it moves from a cosmic upheaval to the most intimate accounting imaginable. The ground itself is personified — it heaves out its buried dead and then <em>speaks</em>, bearing witness to everything that happened on its surface, because its Lord has commanded it to testify.\n\nThe surah's most famous lesson is its closing couplet: not one atom's weight of good or evil will be overlooked. The smallest hidden act — a kind word, a private cruelty — is seen, recorded, and returned to its doer on the Day people stream forth in scattered groups to be shown their deeds. It is a short surah with an enormous claim: nothing you do is too small to matter.",
  banners: [
    {
      label: "Why it is often classed Madinan",
      text:
        "Az-Zalzala is frequently grouped with the Madinan surahs in the standard mushaf ordering, though a number of scholars considered it Makkan. Its theme — total accountability for the smallest deeds — fits both the early warning of Makkah and the law-and-community focus of Madinah.",
    },
  ],
  themes: [
    { text: "The final earthquake", color: "slate" },
    { text: "The earth bears witness", color: "teal" },
    { text: "Resurrection in scattered groups", color: "amber" },
    { text: "Atom's-weight accountability", color: "coral" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "slate",
      title: "The Earth Convulses and Testifies",
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
            "The surah opens at the moment the world ends: the earth is shaken with its final, defining earthquake (<em>zilzalaha</em> — <em>its</em> earthquake, the one it was always destined to have) and casts out its <em>burdens</em> — the dead it has held and the treasures within it. Stunned, man asks, <em>ma laha</em> — “what is wrong with it?” The answer is staggering: on that Day the earth will <em>report its news</em>, testifying to every deed done upon it, because the Lord inspired and commanded it to speak.",
        },
        {
          kind: "memory",
          label: "Memory hook — three actors, three actions",
          text:
            "Trace the section by who acts: the <strong>earth</strong> shakes and discharges (vv.1–2), then <strong>man</strong> asks in shock (v.3), then the <strong>earth</strong> speaks back (vv.4–5). Notice the rhyme that carries you through — every verse end here lands on the long <em>-ha</em> sound (<em>zilzalaha, athqalaha, ma laha, akhbaraha, laha</em>). The repeated <em>-ha</em> is your memory rail.",
        },
        {
          kind: "teal",
          label: "The earth as a witness",
          text:
            "The idea that the very ground will testify connects to a broader Quranic theme: on the Day of Judgment, a person's own limbs, the earth, and time itself become witnesses. Nothing is truly private. The place where a deed was done remembers it.",
        },
      ],
    },
    {
      badge: "Section 2",
      color: "coral",
      title: "Scattered Groups and the Atom's Weight",
      from: 6,
      to: 8,
      groups: [
        { from: 6, to: 6 },
        { from: 7, to: 7 },
        { from: 8, to: 8 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "On that Day people will <em>depart in scattered groups</em> (<em>ashtatan</em>) — sorted by the nature of their deeds — to be shown what they did. Then comes the surah's celebrated conclusion, a perfectly balanced pair: whoever does an atom's weight (<em>mithqala dharratin</em>) of good will see it, and whoever does an atom's weight of evil will see it. Both halves are identical except for one word: <em>khayr</em> (good) versus <em>sharr</em> (evil).",
        },
        {
          kind: "memory",
          label: "Memory hook — the mirror couplet",
          text:
            "Verses 7 and 8 are twins. Same opening (<em>fa-man / wa-man ya'mal mithqala dharratin</em>), same closing (<em>yarah</em> — “he will see it”). Only the middle word flips: <em>khayran</em> → <em>sharran</em>. Learn one line and you almost have the other — just swap good for evil. This is one of the easiest verse-pairs in the Quran to memorize because of that single-word swap.",
        },
        {
          kind: "extra",
          label: "An atom's weight",
          text:
            "<em>Dharrah</em> is often rendered “atom,” but classically it evokes the tiniest speck — a mote of dust visible in a sunbeam, or the smallest ant. The point is absolute precision: there is no deed so small it slips beneath Allah's notice. This verse is frequently cited to encourage people never to belittle a small good deed, nor to dismiss a small sin.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Section 1 — The earth convulses and testifies (vv. 1–5)",
      items: [
        { arabic: "زُلْزِلَتِ", roman: "zulzilat", english: "Is shaken / convulsed", where: "v.1 — the passive verb that names the surah" },
        { arabic: "ٱلْأَرْضُ", roman: "al-ard", english: "The earth", where: "v.1 — the central actor of the opening" },
        { arabic: "زِلْزَالَهَا", roman: "zilzalaha", english: "Its earthquake", where: "v.1 — the final, definitive quake that was always destined" },
        { arabic: "أَثْقَالَهَا", roman: "athqalaha", english: "Its burdens / loads", where: "v.2 — the dead and treasures the earth held within" },
        { arabic: "مَا لَهَا", roman: "ma laha", english: "What is [wrong] with it?", where: "v.3 — man's stunned reaction" },
        { arabic: "تُحَدِّثُ", roman: "tuhaddithu", english: "It will report / narrate", where: "v.4 — the earth speaks, telling its news" },
        { arabic: "أَخْبَارَهَا", roman: "akhbaraha", english: "Its news / reports", where: "v.4 — testimony to every deed done upon it" },
        { arabic: "أَوْحَىٰ", roman: "awha", english: "Inspired / commanded", where: "v.5 — the Lord commands the earth to testify" },
      ],
    },
    {
      title: "Section 2 — Scattered groups and the atom's weight (vv. 6–8)",
      items: [
        { arabic: "يَصْدُرُ", roman: "yasduru", english: "They will depart / emerge", where: "v.6 — streaming forth from the graves" },
        { arabic: "ٱلنَّاسُ", roman: "an-nas", english: "The people / mankind", where: "v.6 — all of humanity, brought forth" },
        { arabic: "أَشْتَاتًا", roman: "ashtatan", english: "In scattered groups / separated", where: "v.6 — sorted into categories by their deeds" },
        { arabic: "أَعْمَٰلَهُمْ", roman: "a'malahum", english: "Their deeds", where: "v.6 — what they will be shown" },
        { arabic: "مِثْقَالَ ذَرَّةٍ", roman: "mithqala dharratin", english: "An atom's weight", where: "vv.7–8 — the smallest measurable amount" },
        { arabic: "خَيْرًا", roman: "khayran", english: "Good", where: "v.7 — the good deed, however small" },
        { arabic: "شَرًّا", roman: "sharran", english: "Evil", where: "v.8 — the evil deed, however small" },
        { arabic: "يَرَهُۥ", roman: "yarah", english: "He will see it", where: "vv.7–8 — the shared refrain of the closing couplet" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A short surah with a long echo",
      text:
        "At only eight verses, Az-Zalzala is easy to recite in a single rak'ah — well under a minute at a measured pace. Its consistent rhyme makes it one of the first surahs many learners memorize, yet its closing couplet on the atom's weight of good and evil is among the most quoted verses in the entire Quran.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–8 · the complete arc in one breath",
        rows: [
          "The surah divides naturally in two: the cosmic scene (vv.1–5) and the personal accounting (vv.6–8). Reciting both in one rak'ah keeps the journey from the shaking earth to the atom's weight intact.",
          "The unbroken rhyme makes the flow easy: vv.1–5 lean on the <em>-ha</em> ending, then vv.6–8 shift to the <em>-hu / -rah</em> ending — a subtle change that signals the move from the earth's testimony to the individual's reckoning.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.5", text: "<em>bi-anna rabbaka awha laha</em> — end of the earth's testimony. A complete movement closes here: the cause of the earth speaking is its Lord's command." },
      { verse: "v.6", text: "<em>li-yuraw a'malahum</em> — “to be shown their deeds.” A natural pause before the famous couplet that explains exactly what they will see." },
      { verse: "v.8", text: "<em>wa man ya'mal mithqala dharratin sharran yarah</em> — the final verse. The mirror of v.7; the surah needs no words after it." },
    ],
  },
};

export default guide;
