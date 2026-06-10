import type { SurahGuide } from "@/content/types";

// Flagship reference guide — the gold-standard structure all other guides follow.
const guide: SurahGuide = {
  reviewStatus: "reviewed",
  meta: {
    number: 83,
    slug: "al-mutaffifin",
    name: "Al-Mutaffifin",
    epithet: "The Defrauders",
    arabicName: "سُورَةُ الْمُطَفِّفِين",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Transitional (late Makkan / early Madinan)",
    verseCount: 36,
    rukus: 1,
    stats: [
      { label: "Verses", value: "36" },
      { label: "Words", value: "169" },
      { label: "Letters", value: "742" },
      { label: "Revelation order", value: "86th" },
    ],
  },
  overview:
    "Al-Mutaffifin is the longest surah in Juz Amma and stands apart from its neighbours. Most scholars classify it as the last Makkan surah or the first Madinan surah — revealed at the transitional moment of Hijrah. This gives it a unique character: it opens with the concrete, street-level sin of short-changing in trade, then rapidly expands to cosmic proportions, covering the record books of the wicked and righteous, the visions of Paradise, and a remarkable reversal scene where the tables are turned on the mockers.\n\nThe surah's genius is its structure: it begins with a very specific, almost mundane social evil — cheating in weights and measures — and reveals it as a symptom of the deepest spiritual disease: disbelief in the Day of Recompense. If you truly believed you would stand before Allah, you would never shortchange anyone by even a grain. The economic crime and the theological crime are the same crime.",
  banners: [
    {
      label: "Historical context",
      text:
        "“When the Prophet ﷺ came to Madinah, they were the worst people in weights and measures. Then Allah revealed: ‘Woe to Al-Mutaffifin.’ After that, they became well-known for their honesty in weighing and measuring.”",
      attribution: "— Reported by al-Hakim, al-Nasa'i, and Ibn Majah with a sound chain",
    },
    {
      label: "Sunnah pairing — Ibn Mas'ud (ra)",
      text:
        "“The Prophet ﷺ used to recite Al-Mutaffifin and Surah Abasa together in a single rak'ah of qiyam al-layl.”",
      attribution: "— Abu Dawud 1396, authenticated by al-Albani",
    },
  ],
  themes: [
    { text: "Fraud in weights & measures", color: "amber" },
    { text: "Sijjin — record of the wicked", color: "coral" },
    { text: "Illiyyun — record of the righteous", color: "teal" },
    { text: "Delights of Paradise", color: "purple" },
    { text: "The great reversal — mockers mocked", color: "slate" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "amber",
      title: "Woe to the Defrauders — The Crime Defined",
      from: 1,
      to: 6,
      groups: [
        { from: 1, to: 1 },
        { from: 2, to: 3 },
        { from: 4, to: 6 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The surah opens with one of the Qur'an's most direct condemnations: <em>waylun lil-mutaffifin</em> — woe, destruction, to those who defraud. The crime is precisely defined: they demand full measure when receiving but short-change others when giving. Then comes the cure — don't they think they will stand before Allah on a momentous Day?",
        },
        {
          kind: "memory",
          label: "Memory hook — the crime in two verses",
          text:
            "Verses 2–3 are a perfect before/after pair: <em>idha aktalu 'alan-nas yastawfun</em> (when they take — full) vs. <em>idha kaluhum aw wazanuhum yukhsirun</em> (when they give — short). One action, two standards. Then vv.4–6 answer with three escalating lines: resurrection → tremendous Day → standing before the Lord of all worlds. Learn the escalation: <em>mab'uthun → yawmin 'azim → rabbil 'alamin</em>.",
        },
        {
          kind: "extra",
          label: "Broader meaning of tatfif",
          text:
            "Scholars extend the meaning of <em>tatfif</em> (short-changing) beyond trade: any relationship where you demand your full rights but withhold what others are owed — in time, attention, trust, fairness — is a form of tatfif. The surah is as relevant to modern workplaces and families as it was to Madinan markets.",
        },
      ],
    },
    {
      badge: "Section 2",
      color: "coral",
      title: "Sijjin — The Record of the Wicked",
      from: 7,
      to: 17,
      groups: [
        { from: 7, to: 9 },
        { from: 10, to: 12 },
        { from: 13, to: 14 },
        { from: 15, to: 17 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "The record of the wicked is in <em>Sijjin</em> — a word whose exact nature scholars have debated, but which conveys something lowly, confined, and permanent. The surah then names the root sin behind all wrongdoing: <em>ran 'ala qalbih</em> — their hearts have been sealed by the accumulation of their own sins. Then comes the devastating punishment: they will be veiled from seeing their Lord.",
        },
        {
          kind: "memory",
          label: "Memory hook — Sijjin, Ran, Hijab (three key concepts)",
          text:
            "Three concepts anchor this section: <strong>Sijjin</strong> (the lowly record — vv.7–9), <strong>Ran</strong> (the seal on the heart — v.14), and <strong>Hijab</strong> (being veiled from Allah — v.15). They form a cause-and-effect chain: sins accumulate → heart is sealed → unable to believe → veiled from Allah on the Day. Learn it as a three-step descent.",
        },
        {
          kind: "teal",
          label: "The concept of Ran — v.14",
          text:
            "The Prophet ﷺ said: “When a believer commits a sin, a black dot appears on his heart. If he repents, it is polished away. But if he persists, it spreads until his heart is completely covered — that is the <em>ran</em> that Allah mentions.” <em>(Tirmidhi 3334, hasan sahih)</em> — This is the only verse in the Qur'an where the word <em>ran</em> appears.",
        },
        {
          kind: "extra",
          label: "The greatest punishment — v.15",
          text:
            "Imam Shafi'i took v.15 as proof that believers will see Allah in the Hereafter — the logic being: if being veiled from Allah is the punishment for the wicked, then seeing Him must be the reward of the righteous. This verse is one of the key proofs for the ru'yatullah (vision of Allah) doctrine in Sunni theology.",
        },
      ],
    },
    {
      badge: "Section 3",
      color: "teal",
      title: "Illiyyun — The Record of the Righteous",
      from: 18,
      to: 28,
      groups: [
        { from: 18, to: 21 },
        { from: 22, to: 24 },
        { from: 25, to: 28 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "In direct contrast to Sijjin, the record of the righteous is in <em>Illiyyun</em> — exalted, elevated, witnessed by the close angels. The surah then paints a lush portrait of Paradise: the righteous reclining on thrones, gazing at the beauty around them, drinking sealed wine whose seal is musk, blended with the spring of Tasnim from which only the nearest to Allah drink.",
        },
        {
          kind: "memory",
          label: "Memory hook — Sijjin vs Illiyyun mirror structure",
          text:
            "Verses 7–9 (Sijjin) and 18–21 (Illiyyun) are almost word-for-word mirrors: <em>inna kitabal-fujjar lafi sijjin</em> / <em>inna kitabal-abrar lafi 'illiyyin</em>. Then both ask: <em>wa ma adra-ka ma…?</em> Then both answer: <em>kitabun marqum</em>. Once you know one block, you know both — just swap Sijjin for Illiyyun and fujjar for abrar. The mirror structure is the memory tool.",
        },
        {
          kind: "teal",
          label: "Key phrase — v.26",
          text:
            "<em>Wa fi dhalika falyatanafasil-mutanafisun</em> — “and for this let the competitors compete.” This verse is often quoted by scholars on the topic of competing in good deeds. The word <em>tanafus</em> (competition/rivalry) is used — but here, healthy, praiseworthy competition for the akhirah. Not for dunya.",
        },
      ],
    },
    {
      badge: "Section 4",
      color: "slate",
      title: "The Mockers — and Their Reversal",
      from: 29,
      to: 36,
      groups: [
        { from: 29, to: 33 },
        { from: 34, to: 36 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "In Makkah, the disbelievers would mock the believers openly — laughing, winking, calling them “the misguided ones.” This section names that behaviour precisely, then announces its total reversal: on the Day of Judgment, the believers will be on elevated thrones laughing at the disbelievers as they enter Hell. The last verse closes with a challenge: haven't the wrongdoers been paid back for what they used to do?",
        },
        {
          kind: "memory",
          label: "Memory hook — four scenes of mockery, then the flip",
          text:
            "Verses 29–33 paint four snapshots of the mockers: (1) they laughed publicly, (2) they winked as believers passed, (3) they went home celebrating, (4) they called believers “misguided.” Four scenes of humiliation. Then v.34 flips everything: <em>fal-yawma</em> — SO TODAY — the believers laugh. The word <em>yad-hakun</em> (they laugh) appears in both v.29 and v.34, creating a deliberate echo that is the memory key.",
        },
        {
          kind: "extra",
          label: "Note — v.33 “they were not sent as guardians”",
          text:
            "This short phrase is a powerful rebuke: who appointed the mockers as arbiters of who is guided or misguided? They had no authority over the believers. Today this verse speaks to anyone who dismisses or ridicules the religious commitments of others — the Qur'an says: you were never appointed their guardian.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Section 1 — The crime and the cure (vv. 1–6)",
      items: [
        { arabic: "وَيْلٌ", roman: "waylun", english: "Woe / destruction", where: "v.1 — one of the Qur'an's strongest condemnations; appears again in v.10" },
        { arabic: "ٱلْمُطَفِّفِينَ", roman: "al-mutaffifin", english: "The defrauders / those who give short measure", where: "v.1 — from tatfif: skimping small amounts fraudulently" },
        { arabic: "ٱكْتَالُوا۟", roman: "aktalu", english: "They took by measure", where: "v.2 — when receiving for themselves" },
        { arabic: "يَسْتَوْفُونَ", roman: "yastawfun", english: "They take in full", where: "v.2 — demand every last drop of what is owed to them" },
        { arabic: "يُخْسِرُونَ", roman: "yukhsirun", english: "They cause loss / give short", where: "v.3 — when giving to others" },
        { arabic: "مَبْعُوثُونَ", roman: "mab'uthun", english: "They will be resurrected", where: "v.4 — the belief that would cure their fraud" },
        { arabic: "يَوْمٍ عَظِيمٍ", roman: "yawmin 'azim", english: "A Tremendous Day", where: "v.5 — the scale of what awaits" },
        { arabic: "رَبِّ ٱلْعَٰلَمِينَ", roman: "rabb al-'alamin", english: "Lord of all the worlds", where: "v.6 — before Whom all mankind will stand" },
      ],
    },
    {
      title: "Section 2 — Sijjin and the sealed heart (vv. 7–17)",
      items: [
        { arabic: "سِجِّينٌ", roman: "sijjin", english: "Sijjin — the lowly record", where: "v.7 — from sijn (prison); the low, confined register of the wicked" },
        { arabic: "كِتَٰبٌ مَّرْقُومٌ", roman: "kitabun marqum", english: "A register inscribed / clearly written", where: "v.9 — permanently recorded, cannot be altered" },
        { arabic: "ٱلْمُكَذِّبِينَ", roman: "al-mukaththibin", english: "The deniers / those who reject", where: "v.10 — those who deny the Day of Recompense" },
        { arabic: "مُعْتَدٍ أَثِيمٍ", roman: "mu'tadin athim", english: "Sinful transgressor", where: "v.12 — the character profile of every denier" },
        { arabic: "أَسَٰطِيرُ ٱلْأَوَّلِينَ", roman: "asatir al-awwalin", english: "Legends / myths of the ancients", where: "v.13 — their dismissal of the Qur'an" },
        { arabic: "رَانَ", roman: "rana", english: "Has sealed / covered / rusted over", where: "v.14 — unique word in the Qur'an; the sin-seal on the heart" },
        { arabic: "مَحْجُوبُونَ", roman: "mahjubun", english: "Veiled / screened from", where: "v.15 — veiled from seeing Allah — the greatest punishment" },
        { arabic: "لَصَالُوا۟ ٱلْجَحِيمِ", roman: "la-salu al-jahim", english: "They will burn in the blaze", where: "v.16 — consequence after the veil" },
      ],
    },
    {
      title: "Section 3 — Illiyyun and Paradise (vv. 18–28)",
      items: [
        { arabic: "عِلِّيُّونَ", roman: "'illiyyun", english: "Illiyyun — the exalted record", where: "v.18 — from 'ala (high); the elevated register of the righteous" },
        { arabic: "ٱلْمُقَرَّبُونَ", roman: "al-muqarrabun", english: "Those brought near / the closest to Allah", where: "v.21 & v.28 — the highest rank of angels and believers" },
        { arabic: "ٱلْأَرَآئِكِ", roman: "al-ara'ik", english: "Thrones / raised couches", where: "v.23 — the resting place of the righteous in Paradise" },
        { arabic: "نَضْرَةَ ٱلنَّعِيمِ", roman: "nadrat al-na'im", english: "The radiance / glow of bliss", where: "v.24 — visible on their faces; joy made luminous" },
        { arabic: "رَحِيقٍ مَّخْتُومٍ", roman: "rahiqin makhtum", english: "Pure sealed wine", where: "v.25 — the finest drink of Paradise, sealed for them" },
        { arabic: "خِتَٰمُهُۥ مِسْكٌ", roman: "khitamuhu misk", english: "Its seal is musk", where: "v.26 — fragrance of the seal; opposite of worldly wine's smell" },
        { arabic: "فَلْيَتَنَافَسِ ٱلْمُتَنَٰفِسُونَ", roman: "falyatanafas al-mutanafisun", english: "Let the competitors compete", where: "v.26 — the famous call to race for the akhirah" },
        { arabic: "تَسْنِيمٍ", roman: "tasnim", english: "Tasnim — the highest spring in Paradise", where: "v.27 — drunk pure by the muqarrabun; blended for others" },
      ],
    },
    {
      title: "Section 4 — Mockers and the reversal (vv. 29–36)",
      items: [
        { arabic: "أَجْرَمُوا۟", roman: "ajramu", english: "Were guilty / committed crimes", where: "v.29 — the Makkan disbelievers who mocked" },
        { arabic: "يَضْحَكُونَ", roman: "yadhakun", english: "They laugh", where: "v.29 & v.34 — appears twice; the key echo of the reversal" },
        { arabic: "يَتَغَامَزُونَ", roman: "yataghamizun", english: "They wink / signal mockingly", where: "v.30 — subtle mockery as believers passed by" },
        { arabic: "فَكِهِينَ", roman: "fakihin", english: "Rejoicing / delighted", where: "v.31 — they went home pleased with their mockery" },
        { arabic: "ضَآلُّونَ", roman: "dallun", english: "Those who have gone astray", where: "v.32 — their label for the believers; reversed on the Day" },
        { arabic: "حَٰفِظِينَ", roman: "hafidhin", english: "Guardians / overseers", where: "v.33 — they were never appointed to judge the believers" },
        { arabic: "فَٱلْيَوْمَ", roman: "fal-yawma", english: "So today / but on this Day", where: "v.34 — the pivot word of the great reversal" },
        { arabic: "هَلْ ثُوِّبَ", roman: "hal thuwwiba", english: "Have they not been repaid / rewarded", where: "v.36 — the surah's closing rhetorical question" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "Important note on length",
      text:
        "At 36 verses, Al-Mutaffifin is the longest surah in Juz Amma — roughly 2.5–3 minutes at a measured pace. It is almost always split across two rak'ahs in Tarawih and Tahajjud. The Prophet ﷺ paired it with Surah Abasa (80) in a single rak'ah during qiyam al-layl, making both together one extended rak'ah.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–36 · following the Prophetic practice with Surah Abasa",
        rows: [
          "The Prophet ﷺ recited Al-Mutaffifin and Abasa (80) together in one rak'ah. If following this sunnah, recite Abasa first then Al-Mutaffifin in the same rak'ah — the combined length is manageable for Tahajjud.",
          "Reciting the full surah alone in one rak'ah is also valid and gives the complete thematic arc its full impact: social crime → spiritual disease → record books → Paradise → the great reversal.",
          "The closing verse — <em>hal thuwwibal-kuffaru ma kanu yaf'alun</em> — is a rhetorical question that lands powerfully before ruku'.",
        ],
      },
      {
        icon: "B",
        title: "Two-part split — most common Tarawih division",
        sub: "Split at v.17 or v.28",
        rows: [
          "<strong>Option 1 — split at v.17 (recommended):</strong> Rak'ah 1 covers vv.1–17 — the crime, Sijjin, the sealed heart, and the punishment of being veiled from Allah, ending on <em>hadha alladhi kuntum bihi tukaththibun</em> — a devastating close. Rak'ah 2 covers vv.18–36 — Illiyyun, Paradise, and the reversal.",
          "<strong>Option 2 — split at v.28:</strong> Rak'ah 1 covers vv.1–28 — everything up to and including the Tasnim spring. Rak'ah 2 covers vv.29–36 — the mockery passage and the reversal. Shorter second rak'ah but a powerful one.",
        ],
      },
      {
        icon: "C",
        title: "Three-part split — extended qiyam nights",
        sub: "Breaks at v.6, v.17, and v.28",
        rows: [
          "<strong>Rak'ah 1 — vv.1–6:</strong> The crime defined and the cure. Short and punchy — ends on <em>yawma yaqumun-nasu li-rabbil-'alamin</em>.",
          "<strong>Rak'ah 2 — vv.7–17:</strong> Sijjin, the sealed heart, the veil from Allah. The darkest section of the surah — powerful as its own rak'ah.",
          "<strong>Rak'ah 3 — vv.18–36:</strong> Illiyyun, Paradise, and the full reversal. Starts with the mirror image of rak'ah 2 and ends on a triumphant rhetorical question.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points used by reciters",
    stops: [
      { verse: "v.6", text: "<em>yawma yaqumun-nasu li-rabbil-'alamin</em> — end of the opening section. The escalation to “Lord of all the worlds” makes a strong, complete landing before ruku'." },
      { verse: "v.9", text: "<em>kitabun marqum</em> — end of the Sijjin description. Short but resonant — the permanently inscribed register is a complete thought." },
      { verse: "v.17", text: "<em>hadha alladhi kuntum bihi tukaththibun</em> — most popular mid-surah stop. The taunt “this is what you used to deny” — delivered to the wicked in Hellfire — is one of the most powerful verse-endings in this surah." },
      { verse: "v.21", text: "<em>yashhaduhu al-muqarrabun</em> — end of the Illiyyun description. Stopping here creates a tight Sijjin/Illiyyun rak'ah (vv.7–21) for those who prefer the two record-books together." },
      { verse: "v.28", text: "<em>'aynan yashabu bihal-muqarrabun</em> — end of the Paradise description. Leaving the mockery reversal for its own rak'ah gives it full weight and impact." },
      { verse: "v.36", text: "<em>hal thuwwibal-kuffaru ma kanu yaf'alun</em> — the final verse. A rhetorical question that needs no answer — and therefore needs no more words. Perfect before ruku'." },
    ],
  },
};

export default guide;
