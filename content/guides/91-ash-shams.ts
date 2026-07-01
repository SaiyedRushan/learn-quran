import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  meta: {
    number: 91,
    slug: "ash-shams",
    name: "Ash-Shams",
    epithet: "The Sun",
    arabicName: "سُورَةُ الشَّمۡسِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Early Makkan",
    verseCount: 15,
    stats: [
      { label: "Verses", value: "15" },
      { label: "Revealed", value: "26th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Ash-Shams opens with the longest run of oaths in the Qur'an — seven consecutive vows sworn by the great signs of creation: the sun and its brightness, the moon, the day, the night, the sky, the earth, and finally the human soul itself. These cosmic witnesses build toward a single, weighty conclusion about the soul and its destiny. The rhythm is hypnotic and the imagery vast, drawing the listener from the heavens down to the inner self.\n\nThe heart of the surah is its claim that every soul has been given an innate awareness of both <em>fujur</em> (its capacity for corruption) and <em>taqwa</em> (its capacity for God-consciousness) — and that success belongs to whoever purifies it. The surah then grounds this abstract principle in history: the people of Thamud, who knew right from wrong yet chose to hamstring the she-camel of Allah, and were utterly destroyed for it. The soul's two paths are not theory; they have real consequences.",
  banners: [],
  themes: [
    { text: "Seven cosmic oaths", color: "amber" },
    { text: "The soul: fujur & taqwa", color: "purple" },
    { text: "Purify the self to succeed", color: "teal" },
    { text: "The destruction of Thamud", color: "coral" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "amber",
      title: "The Seven Oaths and the Two Paths of the Soul",
      from: 1,
      to: 10,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 4 },
        { from: 5, to: 6 },
        { from: 7, to: 8 },
        { from: 9, to: 10 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "Allah swears by seven signs in pairs and singles — sun and moon, day and night, sky and earth — culminating in the seventh and greatest oath: the human <em>nafs</em> (soul) and the One who perfectly proportioned it. The point of all seven oaths arrives in vv.9–10: success belongs to whoever purifies the soul, and ruin to whoever corrupts and buries it.",
        },
        {
          kind: "memory",
          label: "Memory hook — every line ends in -hā",
          text:
            "This is one of the easiest sections in the Qur'an to memorise because almost every verse ends in the same rhyme: <em>-hā</em>. Sun (<em>duḥāhā</em>), moon (<em>talāhā</em>), day (<em>jallāhā</em>), night (<em>yaghshāhā</em>), sky (<em>banāhā</em>), earth (<em>ṭaḥāhā</em>), soul (<em>sawwāhā</em>), then (<em>fujūrahā wa taqwāhā</em>), (<em>zakkāhā</em>), (<em>dassāhā</em>). Lock in the rhyme and the order of creation — sky-things, then earth, then the soul — and the section flows on its own.",
        },
        {
          kind: "extra",
          label: "Fujur and taqwa — v.8",
          text:
            "Verse 8 teaches that the soul was <em>inspired</em> with awareness of both its wickedness and its righteousness. This is the Qur'anic basis for the universal moral conscience: no soul is created unable to tell right from wrong. The two later verbs — <em>zakkā</em> (to purify, cause to grow) and <em>dassā</em> (to bury, stunt) — describe what we then do with that conscience.",
        },
      ],
    },
    {
      badge: "Section 2",
      color: "coral",
      title: "Thamud — A Soul That Chose Corruption",
      from: 11,
      to: 15,
      groups: [
        { from: 11, to: 12 },
        { from: 13, to: 13 },
        { from: 14, to: 15 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The principle of vv.9–10 is now proven by history. Thamud, the people of the Prophet Salih, denied the truth out of <em>ṭaghwa</em> (transgression). Their most wretched man was incited to hamstring the she-camel that Allah had sent as a clear sign, despite Salih's warning to leave her and her drink alone. For this sin Allah levelled their entire society — and He has no fear of any consequence for His perfect justice.",
        },
        {
          kind: "memory",
          label: "Memory hook — the chain of destruction",
          text:
            "Picture the cause-and-effect chain in order: they <strong>denied</strong> (<em>kadhdhabat</em>) → the wretched one was <strong>sent forth</strong> (<em>imba'atha ashqāhā</em>) → Salih <strong>warned</strong> about the she-camel → they <strong>denied and hamstrung</strong> her (<em>fa-kadhdhabūhu fa-'aqarūhā</em>) → Allah brought <strong>destruction</strong> down on them (<em>fa-damdama</em>) and <strong>levelled</strong> it (<em>fa-sawwāhā</em>). The final <em>-hā</em> rhyme of Section 1 returns here, tying the two halves together.",
        },
        {
          kind: "extra",
          label: "Why the she-camel?",
          text:
            "The she-camel of Salih was a miraculous sign given to Thamud at their own request. Harming her was not merely cruelty to an animal — it was a direct, defiant rejection of a sign from Allah. The surah uses their story as the clearest illustration of a soul that knew its <em>taqwa</em> yet deliberately chose its <em>fujur</em>.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Section 1 — The oaths and the soul (vv. 1–10)",
      items: [
        { arabic: "ٱلشَّمْسِ", roman: "ash-shams", english: "The sun", where: "v.1 — the first and title oath" },
        { arabic: "ضُحَىٰهَا", roman: "ḍuḥāhā", english: "Its brightness / forenoon glow", where: "v.1 — the sun at its fullest light" },
        { arabic: "ٱلْقَمَرِ", roman: "al-qamar", english: "The moon", where: "v.2 — when it follows the sun" },
        { arabic: "سَوَّىٰهَا", roman: "sawwāhā", english: "He proportioned / perfected it", where: "v.7 — the soul shaped in perfect balance" },
        { arabic: "فَأَلْهَمَهَا", roman: "fa-alhamahā", english: "Then He inspired it", where: "v.8 — instilled moral awareness in the soul" },
        { arabic: "فُجُورَهَا", roman: "fujūrahā", english: "Its wickedness / capacity to corrupt", where: "v.8 — one of the soul's two awarenesses" },
        { arabic: "وَتَقْوَىٰهَا", roman: "wa taqwāhā", english: "And its righteousness / God-consciousness", where: "v.8 — the soul's other awareness" },
        { arabic: "زَكَّىٰهَا", roman: "zakkāhā", english: "Purifies / causes it to grow", where: "v.9 — the path of the successful" },
      ],
    },
    {
      title: "Section 2 — Thamud's destruction (vv. 11–15)",
      items: [
        { arabic: "كَذَّبَتْ", roman: "kadhdhabat", english: "They denied / rejected", where: "v.11 — Thamud's rejection of the truth" },
        { arabic: "ثَمُودُ", roman: "thamūd", english: "Thamud — the people of Salih", where: "v.11 — the historical example" },
        { arabic: "بِطَغْوَىٰهَآ", roman: "bi-ṭaghwāhā", english: "Through its transgression", where: "v.11 — the root cause of their denial" },
        { arabic: "أَشْقَىٰهَا", roman: "ashqāhā", english: "Its most wretched one", where: "v.12 — the man who struck the she-camel" },
        { arabic: "نَاقَةَ", roman: "nāqata", english: "She-camel", where: "v.13 — the she-camel of Allah, a clear sign" },
        { arabic: "فَعَقَرُوهَا", roman: "fa-'aqarūhā", english: "So they hamstrung her", where: "v.14 — their crime against the sign" },
        { arabic: "فَدَمْدَمَ", roman: "fa-damdama", english: "So He brought down destruction", where: "v.14 — Allah's overwhelming punishment" },
        { arabic: "عُقْبَٰهَا", roman: "'uqbāhā", english: "Its consequence / aftermath", where: "v.15 — which Allah does not fear" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "On the relentless rhyme",
      text:
        "Ash-Shams is built almost entirely on a single rhyme — the long <em>-hā</em> ending — which gives it a driving, drum-like cadence. This makes it a favourite for both memorisation and recitation, but reciters should be careful to give each oath its own weight and not rush through the list, so the seventh oath about the soul lands with full force.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–15 · the natural way to recite a short surah",
        rows: [
          "The full surah is short enough to recite comfortably in one rak'ah and is commonly used in the obligatory and voluntary prayers.",
          "Let the seven oaths build steadily; the conclusion in vv.9–10 (<em>qad aflaḥa man zakkāhā wa qad khāba man dassāhā</em>) is the hinge of the whole surah and deserves a clear pause-worthy delivery.",
          "The Thamud passage (vv.11–15) can be slowed slightly as a narrative, before the firm closing line <em>wa lā yakhāfu 'uqbāhā</em>.",
        ],
      },
      {
        icon: "B",
        title: "Two-part split — across two rak'ahs",
        sub: "Split at v.10",
        rows: [
          "<strong>Rak'ah 1 — vv.1–10:</strong> the seven oaths and the principle of the two paths, ending on the clear contrast between the one who purifies the soul and the one who corrupts it.",
          "<strong>Rak'ah 2 — vv.11–15:</strong> the historical proof in the story of Thamud, ending on Allah's fearless, perfect justice.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.8", text: "<em>fa-alhamahā fujūrahā wa taqwāhā</em> — end of the oaths and the statement of the soul's twin awareness; a complete thought before the conclusion." },
      { verse: "v.10", text: "<em>wa qad khāba man dassāhā</em> — the climax of the principle and the most common mid-surah stop, dividing the universal truth from the historical example." },
      { verse: "v.15", text: "<em>wa lā yakhāfu 'uqbāhā</em> — the final verse, closing the surah on the absolute justice of Allah, who fears no consequence." },
    ],
  },
};

export default guide;
