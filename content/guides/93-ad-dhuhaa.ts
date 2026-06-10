import type { SurahGuide } from "@/content/types";

const guide: SurahGuide = {
  reviewStatus: "draft",
  meta: {
    number: 93,
    slug: "ad-dhuhaa",
    name: "Ad-Dhuhaa",
    epithet: "The Morning Hours",
    arabicName: "سُورَةُ الضُّحَىٰ",
    juz: 30,
    revelationType: "Makkan",
    revelationDetail: "Early Makkan",
    verseCount: 11,
    stats: [
      { label: "Verses", value: "11" },
      { label: "Revealed", value: "11th" },
      { label: "Period", value: "Makkan" },
      { label: "Juz", value: "30" },
    ],
  },
  overview:
    "Ad-Duha is one of the most tender and consoling surahs in the Qur'an. It is widely understood to have been revealed to comfort the Prophet ﷺ during a period when revelation had paused, reassuring him that his Lord had neither abandoned nor forsaken him. After swearing by the morning brightness and the stilling night, it delivers its gentle reassurance: <em>your Lord has not taken leave of you, nor does He hate you</em>.\n\nThe surah then lifts the gaze forward — the Hereafter is better for you than this first life, and your Lord will give you until you are pleased — and looks back at three concrete blessings already received: He found you an orphan and sheltered you, lost and guided you, in need and enriched you. It closes by turning that gratitude outward into action: do not oppress the orphan, do not repel the one who asks, and proclaim the favour of your Lord.",
  banners: [
    {
      label: "Context — Allah's consolation of the Prophet ﷺ",
      text:
        "Ad-Duha is widely understood by the scholars of tafsir to have been revealed after a pause in revelation, as a divine reassurance to the Prophet ﷺ that his Lord had not abandoned him. The surah moves from comfort (vv.3–5), to reminders of past blessings (vv.6–8), to gratitude in action (vv.9–11).",
    },
    {
      label: "Recitation pairing with Ash-Sharh",
      text:
        "Ad-Duha (93) and Ash-Sharh (94) share a closely related theme and tone of consolation, and many scholars regard them as a connected pair, with a number recommending they be recited together. Their reassurance flows naturally from one into the other.",
    },
  ],
  themes: [
    { text: "Divine consolation", color: "teal" },
    { text: "He has not forsaken you", color: "purple" },
    { text: "Three past blessings", color: "amber" },
    { text: "Gratitude in action", color: "coral" },
  ],
  sections: [
    {
      badge: "Section 1",
      color: "teal",
      title: "Reassurance — Your Lord Has Not Forsaken You",
      from: 1,
      to: 8,
      groups: [
        { from: 1, to: 2 },
        { from: 3, to: 3 },
        { from: 4, to: 5 },
        { from: 6, to: 8 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "Allah swears by the morning brightness (<em>aḍ-ḍuḥā</em>) and the night when it grows still to reassure His Prophet ﷺ: his Lord has neither left him nor come to hate him. The Hereafter will be better for him than this life, and his Lord will keep giving until he is pleased. As proof of this love, Allah recalls three blessings already granted: He sheltered the orphan, guided the lost, and enriched the one in need.",
        },
        {
          kind: "memory",
          label: "Memory hook — two oaths, the reassurance, then three blessings",
          text:
            "Structure the section as numbers: <strong>2 oaths</strong> (morning, night) → <strong>1 reassurance</strong> (<em>mā wadda'aka rabbuka wa mā qalā</em>) → <strong>2 promises</strong> (the Hereafter is better; your Lord will give until you are pleased) → <strong>3 blessings</strong>, each opening with the same rhythm: <em>alam yajidka yatīman</em> (orphan → sheltered), <em>wa wajadaka ḍāllan</em> (lost → guided), <em>wa wajadaka 'ā'ilan</em> (in need → enriched). The triple <em>wajadaka</em> pattern locks vv.6–8 in place.",
        },
        {
          kind: "extra",
          label: "The meaning of \"lost\" — v.7",
          text:
            "<em>Wa wajadaka ḍāllan fa-hadā</em> — \"He found you lost and guided you.\" Here <em>ḍāllan</em> does not mean misguided in belief; the scholars explain it as the Prophet ﷺ not yet knowing the details of revelation and law before prophethood, then being guided to them by Allah. It is a statement of Allah's grace, not of fault.",
        },
      ],
    },
    {
      badge: "Section 2",
      color: "coral",
      title: "Gratitude in Action — Three Commands",
      from: 9,
      to: 11,
      groups: [
        { from: 9, to: 9 },
        { from: 10, to: 10 },
        { from: 11, to: 11 },
      ],
      notes: [
        {
          kind: "core",
          label: "Core message",
          text:
            "Having recalled the three blessings, the surah turns them into three duties that mirror them. Because Allah sheltered you as an orphan — do not oppress the orphan. Because He answered your need — do not repel the one who asks. And because He enriched you with His favour — proclaim and speak of the favour of your Lord. Gratitude is not just felt; it is lived.",
        },
        {
          kind: "memory",
          label: "Memory hook — blessings become commands",
          text:
            "Each closing command answers a blessing from the previous section. Orphan sheltered → <em>fa-lā taqhar</em> (do not oppress the orphan). The needy enriched → <em>fa-lā tanhar</em> (do not repel the petitioner). The favour received → <em>fa-ḥaddith</em> (proclaim it). Notice the rhyme of the three verbs: <em>taqhar</em>, <em>tanhar</em>, <em>ḥaddith</em>. Map the blessing to its command and the section becomes self-reminding.",
        },
        {
          kind: "extra",
          label: "Proclaiming the favour — v.11",
          text:
            "<em>Wa ammā bi-ni'mati rabbika fa-ḥaddith</em> — speaking of Allah's favour is itself a form of gratitude, so long as it is to praise the Giver rather than to boast. Many take this verse as encouragement to share knowledge and good that Allah has granted, for the benefit of others.",
        },
      ],
    },
  ],
  vocab: [
    {
      title: "Section 1 — Reassurance and blessings (vv. 1–8)",
      items: [
        { arabic: "وَٱلضُّحَىٰ", roman: "waḍ-ḍuḥā", english: "By the morning brightness", where: "v.1 — the opening oath and the surah's title" },
        { arabic: "سَجَىٰ", roman: "sajā", english: "Grew still / settled into darkness", where: "v.2 — the night when it covers in calm" },
        { arabic: "وَدَّعَكَ", roman: "wadda'aka", english: "Has taken leave of / forsaken you", where: "v.3 — what your Lord has not done" },
        { arabic: "قَلَىٰ", roman: "qalā", english: "Detested / hated", where: "v.3 — nor has He come to hate you" },
        { arabic: "يَتِيمًا", roman: "yatīman", english: "An orphan", where: "v.6 — found and given refuge" },
        { arabic: "فَـَٔاوَىٰ", roman: "fa-āwā", english: "And He gave refuge / shelter", where: "v.6 — the first blessing" },
        { arabic: "ضَآلًّا", roman: "ḍāllan", english: "Lost / not yet guided to the details", where: "v.7 — found and then guided" },
        { arabic: "عَآئِلًا", roman: "'ā'ilan", english: "In need / poor", where: "v.8 — found and made self-sufficient" },
      ],
    },
    {
      title: "Section 2 — Three commands (vv. 9–11)",
      items: [
        { arabic: "ٱلْيَتِيمَ", roman: "al-yatīm", english: "The orphan", where: "v.9 — whom you must not oppress" },
        { arabic: "تَقْهَرْ", roman: "taqhar", english: "Oppress / treat harshly", where: "v.9 — so as for the orphan, do not (oppress)" },
        { arabic: "ٱلسَّآئِلَ", roman: "as-sā'il", english: "The petitioner / one who asks", where: "v.10 — whom you must not repel" },
        { arabic: "تَنْهَرْ", roman: "tanhar", english: "Repel / rebuke", where: "v.10 — so as for the petitioner, do not (repel)" },
        { arabic: "بِنِعْمَةِ", roman: "bi-ni'mati", english: "The favour / blessing", where: "v.11 — of your Lord" },
        { arabic: "فَحَدِّثْ", roman: "fa-ḥaddith", english: "Then proclaim / speak of it", where: "v.11 — the surah's closing command" },
      ],
    },
  ],
  recitation: {
    intro: {
      label: "On its consoling tone",
      text:
        "Ad-Duha is short, gentle, and intimate — reciters typically give it a warm, unhurried delivery that matches its reassuring content. It is frequently recited alongside Ash-Sharh (94), to which it is closely connected in theme, and the two together form a continuous message of comfort and uplift.",
    },
    cards: [
      {
        icon: "A",
        title: "Full surah — single rak'ah",
        sub: "Verses 1–11 · the natural way to recite it",
        rows: [
          "At 11 verses the surah is comfortably recited in a single rak'ah and is a common choice in the daily prayers.",
          "Let the reassurance of v.3 (<em>mā wadda'aka rabbuka wa mā qalā</em>) be the emotional centre, then move through the three blessings and into the three closing commands.",
        ],
      },
      {
        icon: "B",
        title: "Paired recitation with Ash-Sharh",
        sub: "Ad-Duha (93) then Ash-Sharh (94)",
        rows: [
          "Many scholars recommend reciting Ad-Duha and Ash-Sharh together because of their closely linked theme of divine consolation; the message flows continuously from one to the next.",
          "If pairing them, recite Ad-Duha first and continue straight into Ash-Sharh, treating the two as one extended passage of comfort.",
        ],
      },
    ],
    stopsLabel: "Natural stopping points",
    stops: [
      { verse: "v.3", text: "<em>mā wadda'aka rabbuka wa mā qalā</em> — the heart of the surah's reassurance; a complete, comforting statement on its own." },
      { verse: "v.5", text: "<em>wa la-sawfa yu'ṭīka rabbuka fa-tarḍā</em> — the close of the forward-looking promise before the recollection of past blessings begins." },
      { verse: "v.8", text: "<em>wa wajadaka 'ā'ilan fa-aghnā</em> — the end of the three blessings, before they are turned into three commands." },
      { verse: "v.11", text: "<em>wa ammā bi-ni'mati rabbika fa-ḥaddith</em> — the final verse, closing the surah on the command to proclaim Allah's favour." },
    ],
  },
};

export default guide;
