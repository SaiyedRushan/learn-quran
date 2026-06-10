import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 103,
    slug: "al-asr",
    name: "Al-Asr",
    epithet: "The Declining Day, Epoch",
    arabicName: "سُورَةُ العَصۡرِ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Early Makkan",
    verseCount: 3,
    rukus: 1,
    stats: [
      { label: "Verses", value: "3" },
      { label: "Revealed", value: "13th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Al-Asr is one of the shortest surahs in the Qur'an — just three verses — yet scholars have long regarded it as one of the most complete summaries of the path to salvation. Allah opens with an oath by <em>time</em> itself, then delivers a sweeping verdict on the human condition: every single person is in a state of loss. The exception that follows is the whole point of the surah.\n\nIn a single breath the surah names the four pillars that lift a person out of ruin: faith, righteous action, mutual counsel to truth, and mutual counsel to patience. The first two are personal — what you believe and what you do. The second two are communal — how you build others up. The genius of the surah is that it leaves no escape route: outside of these four, the default state of mankind is loss, and the clock is always running.",
  banners: [
    {
      label: "A famous remark",
      text:
        "Imam al-Shafi'i is well known for remarking that if people pondered only this surah, it would be enough to guide them — so completely does it map the path to success. It captures the esteem the early scholars held for these three verses.",
    },
  ],
  themes: [
    { text: "The oath by time", color: "amber" },
    { text: "Mankind in loss", color: "coral" },
    { text: "Faith & righteous deeds", color: "teal" },
    { text: "Mutual counsel — truth & patience", color: "purple" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "amber",
      title: "By Time — The Verdict and the Way Out",
      from: 1,
      to: 3,
      groups: [
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "Allah swears by <em>al-'asr</em> — time, the passing age — and then states the human condition with no exceptions: mankind is in loss. Verse 3 carves out the only exit: those who (1) believe, (2) do righteous deeds, (3) counsel one another to truth, and (4) counsel one another to patience. Two pillars are inward, two are outward — together they form a complete blueprint for a saved life.",
        },
        {
          kind: "memory",
          label: "Memory hook — the oath, the loss, the four",
          text:
            "Picture three steps. <strong>Step 1:</strong> a single oath — <em>wal-'asr</em> (by time). <strong>Step 2:</strong> the universal verdict — <em>innal-insana lafi khusr</em> (mankind is in loss). <strong>Step 3:</strong> the lone exception introduced by <em>illa</em> (except), followed by FOUR linked acts: <em>amanu</em> (believed), <em>'amilus-salihat</em> (did good), <em>tawasaw bil-haqq</em> (urged truth), <em>tawasaw bis-sabr</em> (urged patience). Notice <em>tawasaw</em> repeats — that doubled word is the anchor for the last two pillars.",
        },
        {
          kind: "extra",
          label: "Why an oath by time?",
          text:
            "Time is the one resource every human spends and can never recover. By swearing on <em>al-'asr</em>, Allah draws attention to the very thing slipping through our fingers — and then declares that without faith and good action, all of that time amounts to loss. The oath and the verdict are deliberately matched: the asset (time) and the danger of squandering it (khusr, loss).",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Al-Asr — the full surah (vv. 1–3)",
      items: [
        { arabic: "ٱلْعَصْرِ", roman: "al-'asr", english: "Time / the declining age / the epoch", where: "v.1 — the object of the oath; also linked to the late-afternoon time" },
        { arabic: "ٱلْإِنسَٰنَ", roman: "al-insan", english: "Mankind / the human being", where: "v.2 — the human race as a whole, given a sweeping verdict" },
        { arabic: "خُسْرٍ", roman: "khusr", english: "Loss / ruin", where: "v.2 — the default state of mankind without the four pillars" },
        { arabic: "ءَامَنُوا۟", roman: "amanu", english: "They believed", where: "v.3 — the first pillar: inward faith" },
        { arabic: "ٱلصَّٰلِحَٰتِ", roman: "as-salihat", english: "Righteous deeds", where: "v.3 — the second pillar: faith put into action" },
        { arabic: "وَتَوَاصَوْا۟", roman: "wa tawasaw", english: "And they advised one another", where: "v.3 — the verb behind both communal pillars; repeated twice" },
        { arabic: "ٱلْحَقِّ", roman: "al-haqq", english: "Truth / what is right", where: "v.3 — the third pillar: mutual counsel to truth" },
        { arabic: "ٱلصَّبْرِ", roman: "as-sabr", english: "Patience / steadfastness", where: "v.3 — the fourth pillar: mutual counsel to patience" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "A short surah, learned in minutes",
      text:
        "At only three verses, Al-Asr is among the easiest surahs to memorise and one of the most recited in daily prayer. Despite its brevity it carries a complete message, so it rewards slow, thoughtful recitation rather than haste.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–3 · a complete unit in one breath of meaning",
        rows: [
          "The whole surah fits naturally in a single rak'ah and takes only seconds to recite — ideal for the second rak'ah of an obligatory prayer or for teaching to children.",
          "Recite the oath <em>wal-'asr</em>, pause briefly, then deliver the verdict <em>innal-insana lafi khusr</em> with weight before opening the exception in verse 3.",
          "Verse 3 is the longest of the three. Keep the four pillars distinct — a small breath-grouping between <em>'amilus-salihat</em> and the two <em>tawasaw</em> clauses helps the listener feel the inward-then-outward structure.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.1", text: "<em>wal-'asr</em> — the opening oath. A brief, deliberate pause after the oath builds anticipation for the verdict that follows." },
      { verse: "v.2", text: "<em>innal-insana lafi khusr</em> — the universal verdict. A strong landing here lets the weight of “mankind is in loss” settle before the exception is unveiled." },
      { verse: "v.3", text: "the final verse ending on <em>tawasaw bis-sabr</em> — the surah closes on patience, the last of the four pillars. A complete, resolved ending before ruku'." },
    ],
  },
};

export default guide;
