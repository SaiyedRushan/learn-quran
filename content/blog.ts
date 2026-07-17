// Blog content model. Posts are authored as an ordered list of typed blocks so
// they render inside the app's design system (no raw HTML or markdown files).
// Inline emphasis is written with **double asterisks** and rendered as <strong>.

export type BlogBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "callout";
      label: string;
      text: string;
      attribution?: string;
    };

export interface BlogPost {
  slug: string;
  title: string;
  /** One-line summary shown on the index card and used for SEO. */
  summary: string;
  /** ISO date (YYYY-MM-DD) the post was published. */
  date: string;
  /** Whole-minute estimate shown on the card, e.g. 6. */
  readingMinutes: number;
  /** A short Arabic phrase shown under the title, matching the app's headers. */
  arabic?: string;
  /** Pinned posts always sort ahead of the rest, regardless of date. */
  pinned?: boolean;
  body: BlogBlock[];
}

const posts: BlogPost[] = [
  {
    slug: "reading-the-ala-lc-transliteration",
    title:
      "Reading the transliteration: what those dots, lines, and half-circles mean",
    summary:
      "The romanized text under each verse uses ALA-LC — a precise system where every symbol maps to one Arabic sound. Here's how to read ā, ḥ, ṣ, ʿ, ʾ and the rest, so the transliteration actually helps you.",
    date: "2026-07-17",
    readingMinutes: 6,
    arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ",
    body: [
      {
        type: "paragraph",
        text: "Under every verse in this app you'll find the Arabic written out in Latin letters — *bismi-llāhi-r-raḥmāni-r-raḥīm*. But look closely and you'll see it's not ordinary English spelling. There are lines over some vowels (**ā ī ū**), dots under some letters (**ḥ ṣ ḍ ṭ ẓ**), and two odd little half-circles (**ʾ** and **ʿ**). These aren't typos or decoration. They're a precise system, and once you can read them, the transliteration becomes a genuinely reliable guide to pronunciation.",
      },
      {
        type: "paragraph",
        text: "The system is called **ALA-LC** — the romanization standard of the American Library Association and Library of Congress. Its whole purpose is to be *unambiguous*: every Arabic letter maps to exactly one symbol, and every symbol means exactly one sound. Ordinary English spelling can't do that — think how many ways English writes the 'oo' sound. ALA-LC removes the guesswork.",
      },
      {
        type: "callout",
        label: "One thing to keep in mind",
        text: "Transliteration is a bridge, not a destination. It gets you remarkably close, but a few Arabic sounds have no English equivalent at all — so pair this guide with listening to a reciter, and aim to read the Arabic script itself over time.",
      },
      {
        type: "heading",
        text: "The two half-circles: ʾ and ʿ",
      },
      {
        type: "paragraph",
        text: "These trip up almost everyone, and they're two completely different sounds. Getting them right matters — they're full consonants in Arabic, not silent marks.",
      },
      {
        type: "list",
        items: [
          "**ʾ** (a small raised comma, opening to the right) is the **hamza** (ء) — a *glottal stop*. It's the tiny catch in your throat in the middle of *uh-oh*. In *ʾiman* or *masʾalah*, you briefly stop the airflow.",
          "**ʿ** (a small raised comma, opening to the left) is **ʿayn** (ع) — a deep, tightened sound from low in the throat, with no English equivalent. It's the sound at the start of *ʿAbd* and *ʿilm*. Think of a gentle throat-tightening, almost a swallowed vowel; the only real way to learn it is to hear it.",
        ],
      },
      {
        type: "heading",
        text: "Dots underneath: the heavy (emphatic) letters",
      },
      {
        type: "paragraph",
        text: "A dot under a letter marks an **emphatic** consonant — a heavier, fuller version made further back in the mouth than its plain cousin. English has only the light versions, so the dot is your reminder to 'weigh it down.'",
      },
      {
        type: "list",
        items: [
          "**ḥ** (ح) — a strong, breathy *h* from deep in the throat, as if fogging a mirror. Different from the plain **h** (ه).",
          "**ṣ** (ص) — a heavy *s*, versus the light **s** (س) in *sun*.",
          "**ḍ** (ض) — a heavy *d*, the letter so distinctive that Arabic is called 'the language of the ḍād.'",
          "**ṭ** (ط) — a heavy *t*, versus the light **t** (ت).",
          "**ẓ** (ظ) — a heavy version of the *th* in *this*, pronounced fuller and further back.",
        ],
      },
      {
        type: "heading",
        text: "Two letters written as pairs",
      },
      {
        type: "paragraph",
        text: "Some Arabic letters are written with two Latin letters because they're single sounds English spells that way. Read each pair as *one* sound, never two:",
      },
      {
        type: "list",
        items: [
          "**th** (ث) — the *th* in *think* (voiceless).",
          "**dh** (ذ) — the *th* in *this* (voiced).",
          "**kh** (خ) — like the *ch* in Scottish *loch* or German *Bach*; a raspy sound from the back of the mouth.",
          "**sh** (ش) — the *sh* in *ship*.",
          "**gh** (غ) — like a gargled French *r*; a guttural sound close to ʿayn but rougher.",
        ],
      },
      {
        type: "paragraph",
        text: "One more single letter worth flagging: **q** (ق) is not the English *k*. It's a *k* made right at the very back of the throat, deeper and heavier — as in *Qurʾān* itself.",
      },
      {
        type: "heading",
        text: "Lines over vowels: hold them longer",
      },
      {
        type: "paragraph",
        text: "The line over a vowel is a **macron**, and it means one simple thing: *stretch it*. A long vowel is held about twice as long as a short one, and mixing them up can change a word's meaning entirely.",
      },
      {
        type: "list",
        items: [
          "**a i u** — short vowels: a quick *a* as in *cup*, *i* as in *sit*, *u* as in *put*.",
          "**ā** — a long *a* as in *father* (*qāla*, 'he said').",
          "**ī** — a long *ee* as in *see* (*raḥīm*).",
          "**ū** — a long *oo* as in *moon* (*nūr*, 'light').",
          "**aw / ay** — diphthongs (two vowels gliding together), as in *how* and *hay* (*yawm*, 'day'; *khayr*, 'good').",
        ],
      },
      {
        type: "heading",
        text: "Doubled letters and the 'al-'",
      },
      {
        type: "paragraph",
        text: "Two last patterns you'll see constantly:",
      },
      {
        type: "list",
        items: [
          "**A doubled consonant** (as in *raḥmānir-raḥīm* or *rabb*) marks the Arabic *shadda* — you dwell on the letter, pressing it firmly rather than saying it once quickly.",
          "**al-** is the definite article ('the'). Before most letters it stays *al-* (*al-ḥamd*), but before the 'sun letters' it blends into the next sound and doubles it: *ash-shams* (not *al-shams*), *ar-raḥmān* (not *al-raḥmān*). The transliteration shows you exactly how it's actually recited, with the words linked by hyphens the way they flow in recitation.",
        ],
      },
      {
        type: "heading",
        text: "Put it together",
      },
      {
        type: "paragraph",
        text: "Take *ar-raḥmāni-r-raḥīm*. Now you can read it precisely: the article blended into a doubled *r*; the heavy, breathy **ḥ**; the long, held **ā** and **ī**. That's a world away from guessing at 'rahman raheem,' and it's the difference the dots and lines are there to make.",
      },
      {
        type: "paragraph",
        text: "Use the transliteration as training wheels, not a crutch. Let it guide your tongue while your eyes slowly learn the Arabic above it — and let a teacher's voice correct the sounds no writing can fully capture. The goal, always, is to leave the romanization behind and read the Book in the letters it was revealed in.",
      },
    ],
  },
  {
    slug: "the-qiraat-different-recitations-of-the-quran",
    title:
      "Why reciters sound different: the qirāʾāt of the Qur'an, and how they came to be",
    summary:
      "One Qur'an, several authentic ways to recite it. A short guide to the ten canonical qirāʾāt, the imams they're named after, and the history behind them — from the seven aḥruf to Ḥafṣ and Warsh today.",
    date: "2026-07-17",
    readingMinutes: 6,
    arabic: "فَٱقْرَءُوا۟ مَا تَيَسَّرَ مِنَ ٱلْقُرْءَانِ",
    body: [
      {
        type: "paragraph",
        text: "If you've ever listened closely to reciters from different parts of the world, you may have noticed something. A qāriʾ from Morocco can sound subtly different from one in Egypt or Saudi Arabia — a vowel stretched differently here, a word pronounced with a slightly different sound there. You're not imagining it, and it isn't a mistake. You're hearing the **qirāʾāt**: the different authentic ways the Qur'an has been recited since it was first revealed.",
      },
      {
        type: "paragraph",
        text: "This surprises many people, so let's be clear from the start: these are not different Qur'ans, and they are not errors that crept in. They are all part of how the Qur'an was taught by the Prophet ﷺ himself, preserved with extraordinary care and passed down through unbroken chains of teachers for fourteen centuries.",
      },
      {
        type: "heading",
        text: "It began with the seven aḥruf",
      },
      {
        type: "paragraph",
        text: "The story starts in the Prophet's own lifetime. The Companions came from different Arab tribes, each with its own dialect and way of speaking. To ease the burden of recitation, Allah revealed the Qur'an in **seven aḥruf** — seven 'modes' or forms.",
      },
      {
        type: "callout",
        label: "Hadith",
        text: "\"This Qur'an has been revealed in seven aḥruf, so recite whichever of them is easy for you.\"",
        attribution: "The Prophet ﷺ — Sahih al-Bukhari 4992 & Sahih Muslim 819 (ʿUmar ibn al-Khaṭṭāb)",
      },
      {
        type: "paragraph",
        text: "Scholars have discussed exactly what the seven aḥruf were, but the essential point is that this variety came *from* the Prophet ﷺ, not from later confusion. It was a mercy — a way for a whole people to carry the Book on their tongues.",
      },
      {
        type: "heading",
        text: "How the readings were preserved and organised",
      },
      {
        type: "paragraph",
        text: "During the caliphate of **ʿUthmān ibn ʿAffān**, as Islam spread and generations changed, he had an official written text (the *muṣḥaf*) compiled and copies sent to the major cities. This standardised the skeleton of the text while still allowing the authentic ways of reciting it to remain. Great scholars of recitation then arose in those cities, each mastering the readings taught in their region and passing them to students.",
      },
      {
        type: "paragraph",
        text: "Centuries later, the scholar **Ibn Mujāhid** (d. 324 AH) documented **seven** of the most rigorously transmitted readings, each named after a famous imam of recitation. Later, **Ibn al-Jazarī** (d. 833 AH) added three more of equal authenticity, giving the **ten canonical qirāʾāt** (*al-qirāʾāt al-ʿashr*) recognised today. All ten are *mutawātir* — transmitted by so many reliable people at every link that error is impossible.",
      },
      {
        type: "heading",
        text: "Qirāʾah, riwāyah — the names you'll hear",
      },
      {
        type: "paragraph",
        text: "There's a small vocabulary worth knowing, because it explains the labels on recordings and printed muṣḥafs:",
      },
      {
        type: "list",
        items: [
          "A **qirāʾah** is a reading, named after its **imam** (e.g. the qirāʾah of ʿĀṣim).",
          "A **riwāyah** is that reading as passed down by one of the imam's two main **transmitters** (*rāwīs*). So when you see **Ḥafṣ ʿan ʿĀṣim**, it means 'the riwāyah of Ḥafṣ, from the qirāʾah of ʿĀṣim.'",
        ],
      },
      {
        type: "heading",
        text: "The ten imams and their transmitters",
      },
      {
        type: "paragraph",
        text: "Each imam is tied to the city where his reading flourished, and each has two celebrated transmitters:",
      },
      {
        type: "list",
        items: [
          "**Nāfiʿ al-Madanī** (Medina) — transmitters **Qālūn** and **Warsh**.",
          "**Ibn Kathīr al-Makkī** (Mecca) — transmitters **al-Bazzī** and **Qunbul**.",
          "**Abū ʿAmr al-Baṣrī** (Basra) — transmitters **al-Dūrī** and **al-Sūsī**.",
          "**Ibn ʿĀmir al-Shāmī** (Damascus) — transmitters **Hishām** and **Ibn Dhakwān**.",
          "**ʿĀṣim al-Kūfī** (Kufa) — transmitters **Ḥafṣ** and **Shuʿbah**.",
          "**Ḥamzah al-Kūfī** (Kufa) — transmitters **Khalaf** and **Khallād**.",
          "**al-Kisāʾī al-Kūfī** (Kufa) — transmitters **Abū al-Ḥārith** and **al-Dūrī**.",
          "**Abū Jaʿfar al-Madanī** (Medina) — transmitters **Ibn Wardān** and **Ibn Jammāz**.",
          "**Yaʿqūb al-Ḥaḍramī** (Basra) — transmitters **Ruways** and **Rawḥ**.",
          "**Khalaf al-ʿĀshir** (Kufa) — transmitters **Isḥāq** and **Idrīs**.",
        ],
      },
      {
        type: "heading",
        text: "Which ones you'll actually hear today",
      },
      {
        type: "paragraph",
        text: "Although all ten are studied and recited, a few dominate different regions of the Muslim world:",
      },
      {
        type: "list",
        items: [
          "**Ḥafṣ ʿan ʿĀṣim** — by far the most widespread. It's the reading in most printed muṣḥafs and the one you'll hear from the imams of the Ḥaramayn and nearly every famous Egyptian and Gulf qāriʾ.",
          "**Warsh ʿan Nāfiʿ** — the reading of Morocco, Algeria, and much of West Africa. Step into a masjid there and this is what you'll hear.",
          "**Qālūn ʿan Nāfiʿ** — common in Libya and Tunisia.",
          "**al-Dūrī ʿan Abī ʿAmr** — widespread in Sudan and parts of West Africa.",
        ],
      },
      {
        type: "paragraph",
        text: "This is why the reciters most of us grew up hearing — from ʿAbd al-Bāsiṭ ʿAbd al-Ṣamad and al-Ḥuṣarī to the imams of Makkah and Madīnah — sound so familiar to one another: they're nearly all reciting in Ḥafṣ. Some masters, like al-Ḥuṣarī, recorded the whole Qur'an in several qirāʾāt, and hearing the same sūrah in Warsh or Qālūn is a beautiful way to *feel* the differences.",
      },
      {
        type: "heading",
        text: "The differences are small — and that's the point",
      },
      {
        type: "paragraph",
        text: "The variations between qirāʾāt are minor: lengths of elongation, certain vowels, the pronunciation of a few letters, and occasionally a word given in a complementary form. They never contradict one another; more often they *add* richness, each preserving a facet of how the Qur'an was revealed. That such fine details have been transmitted intact across fourteen centuries and three continents is itself a sign of how carefully Allah has guarded His Book.",
      },
      {
        type: "callout",
        label: "Qur'an",
        text: "\"Indeed, it is We who sent down the Reminder, and indeed, We will be its guardian.\"",
        attribution: "Sūrah al-Ḥijr 15:9",
      },
      {
        type: "paragraph",
        text: "So the next time a reciter sounds a little different from the one you know, don't be unsettled — be amazed. You're listening to a living chain that reaches all the way back to the Prophet ﷺ. Learn your own reading well first, and let the others deepen your wonder at the Book we've been given to carry.",
      },
    ],
  },
  {
    slug: "tajweed-rules-explained-for-beginners",
    title:
      "The tajweed rules, explained simply: how to recite the Qur'an the way it was revealed",
    summary:
      "Tajweed isn't a scary science reserved for scholars. It's a small set of rules that make your recitation beautiful and correct — noon rules, madd, qalqalah, ghunnah and more, in plain language.",
    date: "2026-07-17",
    readingMinutes: 8,
    arabic: "وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا",
    body: [
      {
        type: "paragraph",
        text: "The word **tajwīd** comes from a root meaning *to make something excellent, to do it well*. In recitation, it means giving every letter its due — its correct articulation point, and the qualities that belong to it — so that the Qur'an leaves your mouth the way it was revealed. It sounds intimidating, like a science only qualified reciters can touch. It isn't. It's a handful of patterns that repeat on nearly every page.",
      },
      {
        type: "paragraph",
        text: "This is a plain-language tour of the rules you'll meet most often. The goal is not to make you a certified reciter overnight — that comes from a teacher and years of listening — but to let you *recognise* what's happening when you read, so the rules stop being mysterious and start being obvious.",
      },
      {
        type: "callout",
        label: "A note before we start",
        text: "Tajwīd is learned by ear, not just by reading about it. Use this as a map, but pair it with a teacher and with careful listening to a skilled reciter. Your tongue learns from imitation far faster than from explanation.",
      },
      {
        type: "heading",
        text: "Why bother? Because the meaning rides on the sound",
      },
      {
        type: "paragraph",
        text: "A single mispronounced letter can change a word entirely. The heavy **ض** (ḍād) and the light **د** (dāl) are different letters; so are the throated **ح** (ḥāʾ) and the plain **ه** (hāʾ). Reciting carelessly isn't just untidy — it can turn one word into another. Tajwīd protects the meaning, and it protects the beauty. Allah described His own Book as something to be recited *slowly and distinctly* — **tartīl** — not rushed.",
      },
      {
        type: "heading",
        text: "Makhārij — where each letter is born",
      },
      {
        type: "paragraph",
        text: "Before any rule, there's the foundation: **makhārij al-ḥurūf**, the articulation points. Every Arabic letter has a home — the throat, the tongue against a certain part of the mouth, the lips, the nasal passage. Getting the letter's *home* right is 90% of good recitation. Many letters that feel identical to a new reader (like **س** / **ص**, or **ت** / **ط**) are simply the same mouth-shape made *light* versus *heavy*.",
      },
      {
        type: "heading",
        text: "The rules of Nūn Sākinah and Tanwīn",
      },
      {
        type: "paragraph",
        text: "This is the single most important family of rules, because it appears constantly. A **nūn sākinah** is a نْ with no vowel; **tanwīn** is the doubled ending (ـً ـٍ ـٌ) that sounds like an *n*. Both behave the same way, and what happens depends entirely on the letter that comes *after* them. There are four possibilities:",
      },
      {
        type: "list",
        items: [
          "**Iẓhār (clear pronunciation)** — when followed by a throat letter (ء ه ع ح غ خ), the *n* sound is pronounced plainly and clearly, with no merging.",
          "**Idghām (merging)** — when followed by one of ي ر م ل و ن, the *n* merges into the next letter. With ي ن م و it carries a nasal hum (ghunnah); with ل and ر it merges with no hum.",
          "**Iqlāb (conversion)** — when followed by ب, the *n* sound flips into a hidden *m* sound with a nasal hum. You'll see a tiny م written above the letter to signal it.",
          "**Ikhfāʾ (concealment)** — when followed by any of the remaining fifteen letters, the *n* is neither fully pronounced nor fully merged; it's hidden, held in the nose with a light hum for a moment.",
        ],
      },
      {
        type: "paragraph",
        text: "That's it — one letter, four fates, decided by its neighbour. Once your ear catches these four, a huge portion of tajwīd is already handled.",
      },
      {
        type: "heading",
        text: "The rules of Mīm Sākinah",
      },
      {
        type: "paragraph",
        text: "A **mīm sākinah** is a مْ with no vowel, and it has its own smaller set of three rules, all involving the lips:",
      },
      {
        type: "list",
        items: [
          "**Ikhfāʾ Shafawī (labial concealment)** — before ب, the *m* is hidden with a light nasal hum and the lips lightly together.",
          "**Idghām Shafawī (labial merging)** — before another م, the two merge into one stressed *m* with a hum.",
          "**Iẓhār Shafawī (labial clarity)** — before any other letter, the *m* is pronounced plainly. Take special care before و and ف, where readers often let it slip.",
        ],
      },
      {
        type: "heading",
        text: "Ghunnah — the nasal hum",
      },
      {
        type: "paragraph",
        text: "**Ghunnah** is the pleasant nasal sound that lives in the letters **ن** and **م**, especially when they carry a **shaddah** (نّ / مّ). Hold the sound in your nose for about two counts. It's the gentle hum you hear at the start of *innā* or in *thumma*. Much of the music of recitation comes from getting the ghunnah right.",
      },
      {
        type: "heading",
        text: "Madd — the elongations",
      },
      {
        type: "paragraph",
        text: "**Madd** means stretching a vowel sound. The three madd letters are **ا و ي** (when they carry no vowel of their own and follow a matching vowel). There's a natural, base-level madd of two counts (**madd ṭabīʿī**) that happens all the time. Then there are longer madds that stretch to four, five, or six counts, triggered by specific conditions:",
      },
      {
        type: "list",
        items: [
          "**Madd Ṭabīʿī (natural)** — the default two counts, e.g. the ā in *qāla*.",
          "**Madd Muttaṣil (connected)** — a madd letter followed by a hamzah (ء) in the *same* word; stretched four to five counts.",
          "**Madd Munfaṣil (separated)** — a madd letter at the end of a word followed by a hamzah at the start of the *next* word; also four to five counts.",
          "**Madd Lāzim (obligatory)** — a madd letter followed by a permanent sukoon or shaddah; a full six counts. Think of the long stretches in the disjointed letters like *Alif-Lām-Mīm*.",
          "**Madd ʿĀriḍ (temporary)** — when you *stop* on a word whose last letter would normally be voweled, you can stretch the preceding madd two, four, or six counts.",
        ],
      },
      {
        type: "paragraph",
        text: "The key discipline with madd is **consistency**: whatever length you choose for a given type, keep it the same throughout your recitation.",
      },
      {
        type: "heading",
        text: "Qalqalah — the echo",
      },
      {
        type: "paragraph",
        text: "The five **qalqalah** letters are gathered in the phrase **قُطْبُ جَدٍ** — that is, **ق ط ب ج د**. When any of them carries a sukoon (no vowel), the letter is given a slight bounce or echo, as if it rebounds off the articulation point. You hear it clearly at the end of Sūrah al-Falaq and Sūrah al-Masad, and in words like *aḥad* when you stop on the *d*. The echo is stronger when you stop on the letter at the end of a verse.",
      },
      {
        type: "heading",
        text: "Heavy and light — tafkhīm and tarqīq",
      },
      {
        type: "paragraph",
        text: "Some letters are always pronounced **heavy** (full, with the back of the tongue raised) — the letters of **iṣṭiʿlāʾ**: خ ص ض غ ط ق ظ. Most other letters are **light**. Two letters, though, change depending on context, and they trip up almost every learner:",
      },
      {
        type: "list",
        items: [
          "**Rāʾ (ر)** — heavy when it carries a fatḥah or ḍammah (or is followed by one), light when it carries a kasrah. There are finer sub-rules, but that's the heart of it.",
          "**Lām (ل)** — light almost everywhere, but pronounced heavy in the name **Allāh** when preceded by a fatḥah or ḍammah (*naṣruḷḷāh*), and light when preceded by a kasrah (*bismiḷḷāh*).",
        ],
      },
      {
        type: "heading",
        text: "How to actually learn this",
      },
      {
        type: "paragraph",
        text: "Don't try to master all of it at once. Learn the makhārij first so your letters are clean. Then take the nūn sākinah rules, because they repeat endlessly and give the biggest improvement for the least effort. Add madd, then qalqalah and ghunnah, then the heavy/light letters. Above all, **recite to a teacher** who can hear you — tajwīd is an oral tradition passed mouth to ear, and no article can replace that.",
      },
      {
        type: "callout",
        label: "Hadith",
        text: "\"The one who is proficient in the recitation of the Qur'an will be with the honourable and obedient scribes (angels), and the one who recites it with difficulty, stumbling over it, will have a double reward.\"",
        attribution: "The Prophet ﷺ — Sahih al-Bukhari 4937 & Sahih Muslim 798 (ʿĀʾishah)",
      },
      {
        type: "paragraph",
        text: "Notice the mercy in that: even the one still struggling gets a *double* reward. So begin where you are. Every rule you learn is one more way of honouring the words you're carrying — and Allah rewards the effort long before the mastery arrives.",
      },
    ],
  },
  {
    slug: "quran-symbols-and-stopping-signs-explained",
    title:
      "The symbols in the Qur'an, decoded: stopping signs and recitation marks and what to do at each",
    summary:
      "Those little letters and shapes floating above the text aren't decoration — they tell you where to stop, where to keep going, when to prostrate, and how to pronounce. Here's what every common symbol means.",
    date: "2026-07-17",
    readingMinutes: 7,
    arabic: "أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ",
    body: [
      {
        type: "paragraph",
        text: "Open a muṣḥaf and you'll notice small letters and shapes scattered above and between the words — a tiny **م**, a **ج**, three dots in a cluster, a circle, a curved line. To a new reader they look like decoration or clutter. They aren't. Every one of them is an instruction, placed there by scholars to help you recite correctly: where it's safe to breathe, where stopping would break the meaning, when to prostrate, and how to pronounce a particular letter.",
      },
      {
        type: "paragraph",
        text: "Learning them is one of the most practical things you can do for your recitation, because a stop in the wrong place can distort the meaning of an āyah. Here's a guided tour of the ones you'll actually encounter.",
      },
      {
        type: "heading",
        text: "The waqf (stopping) signs",
      },
      {
        type: "paragraph",
        text: "**Waqf** means to pause — to stop the sound and take a breath. Most stopping signs are single Arabic letters, each abbreviating a longer instruction. From strongest 'must stop' to strongest 'don't stop':",
      },
      {
        type: "list",
        items: [
          "**مـ (Waqf Lāzim) — compulsory stop.** The strongest stop sign. Continuing here could badly distort the meaning, so you must pause. (Don't confuse it with the small *m* of iqlāb, which sits directly over a letter.)",
          "**ط (Waqf Muṭlaq) — absolute stop.** A recommended, complete stop, usually at the end of a full thought.",
          "**ج (Waqf Jāʾiz) — permissible stop.** You may stop or continue; both are equally fine. Do whichever suits your breath.",
          "**قلى (al-Waqf Awlā) — stopping is preferred.** You *can* continue, but pausing here is the better choice.",
          "**صلى (al-Waṣl Awlā) — continuing is preferred.** You *can* stop, but carrying on is the better choice.",
          "**ز (Waqf Mujawwaz) — permitted stop, but continuing is better.** Similar in spirit to ṣlā.",
          "**ص (Waqf Murakhkhaṣ) — licensed stop.** Continuing is better, but you're permitted to stop if you need a breath.",
          "**لا (Lā) — do not stop.** Do not pause here; stopping would break the sense. (If it falls at the very end of a verse, you may stop there, but you don't pause mid-flow at it.)",
          "**ق (qīla ʿalayhi al-waqf) — 'some say stop.'** Scholars differed; the preferred practice is usually to continue.",
        ],
      },
      {
        type: "heading",
        text: "The three dots — muʿānaqah (the embracing stop)",
      },
      {
        type: "paragraph",
        text: "One sign trips up almost everyone: **⸛ … ⸛**, three dots appearing **twice**, close together over two nearby spots. This is **muʿānaqah** (also called *taʿānuq*). It means: stop at **one** of the two places, but **not both**. If you pause at the first cluster, carry on past the second; if you skip the first, stop at the second. It's the Qur'an telling you the phrase belongs with either the words before it *or* the words after it — but not orphaned between the two.",
      },
      {
        type: "heading",
        text: "The sajdah (prostration) sign",
      },
      {
        type: "paragraph",
        text: "At certain verses you'll see the word **۩ (sajdah)** written in the margin or a decorative line above the text. These mark the **verses of prostration** — when you recite (or hear) one of them, it is recommended (and by some views obligatory) to make a single **sajdat al-tilāwah**, a prostration of recitation: say *Allāhu akbar*, prostrate once, glorify Allah, then rise. There are around fifteen such places across the muṣḥaf.",
      },
      {
        type: "heading",
        text: "The rukūʿ marker",
      },
      {
        type: "paragraph",
        text: "In the margin you may see a small **ع** (sometimes with numbers beside it). This is the **rukūʿ** sign, marking a natural thematic section — a convenient place to bow if you're breaking a long surah across the rakʿahs of tarāwīḥ or your own prayer. It's an organisational aid, not a rule of recitation.",
      },
      {
        type: "heading",
        text: "Marks that tell you how to pronounce",
      },
      {
        type: "paragraph",
        text: "A second family of symbols sits *directly on the letters* and governs pronunciation rather than pausing:",
      },
      {
        type: "list",
        items: [
          "**Small مـ above a letter — iqlāb.** It signals that a nūn sākinah or tanwīn turns into a hidden *m* sound before the letter ب.",
          "**Sukūn ( ْ ) — no vowel.** A small circle or head-shape over a letter meaning it carries no vowel; pronounce it as a pure consonant.",
          "**Shaddah ( ّ ) — doubling.** The letter is pronounced twice as strong, held with emphasis. Combined with a vowel mark above or below it.",
          "**Maddah ( ٓ ) — the wavy line.** Placed over an alif or letter to signal an extended elongation (a longer madd).",
          "**Dagger alif ( ٰ ) — a small vertical stroke.** A miniature standing alif that indicates a long *ā* sound not written with a full alif, as in *hādhā* or *raḥmān*.",
        ],
      },
      {
        type: "heading",
        text: "The little circles — silent letters",
      },
      {
        type: "paragraph",
        text: "Two small shapes tell you a letter is **not** pronounced, and the difference between them matters:",
      },
      {
        type: "list",
        items: [
          "**A small round circle (0) over a letter** — the letter is *always* silent, whether you continue or stop. Common over the alif in words like *anā* (أنا).",
          "**A small oval / vertical-oval over a letter** — the letter is silent only when you *continue*, but pronounced if you *stop* on it. This is why the same word can sound slightly different depending on whether you pause.",
        ],
      },
      {
        type: "heading",
        text: "The section markers in the margins",
      },
      {
        type: "paragraph",
        text: "Finally, the navigation aids. You'll see markers for **juzʾ** (one of the 30 parts), **ḥizb** (a half-juzʾ), and its quarters (¼, ½, ¾). These simply help you find your place and pace your reading — a page of the muṣḥaf is a map, and these are the mile-markers.",
      },
      {
        type: "callout",
        label: "The point of it all",
        text: "Every one of these marks exists so that you recite with understanding and care — pausing where the meaning pauses, flowing where it flows. They turn reading into *tartīl*.",
      },
      {
        type: "paragraph",
        text: "You don't need to memorise the whole list tonight. Start with the waqf signs — م, لا, ج, صلى, قلى — because they shape the meaning most directly, and the muʿānaqah dots, because they're the easiest to misread. The rest will settle naturally the more you read. And as always, recite to someone who knows, so your eyes and your tongue learn together.",
      },
    ],
  },
  {
    slug: "lead-the-prayer-memorize-juz-amma",
    pinned: true,
    title:
      "Lead the prayer: why every Muslim should memorize Juz ʿAmma — with understanding",
    summary:
      "Surah Al-Ikhlās in every rakʿah is a floor, not a ceiling. Ten honest minutes a day is enough to memorize the 30th juz and finally lead with confidence.",
    date: "2026-07-16",
    readingMinutes: 5,
    arabic: "وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا",
    body: [
      {
        type: "paragraph",
        text: "Be honest for a moment. How many of us step forward to pray and reach for the same two or three short surahs every single time? Al-Fātiḥah, then **Al-Ikhlās**, then **An-Nās**, and we're done. There is nothing wrong with those surahs — they are a treasure. But if they are the *only* thing we know, they have quietly become a ceiling rather than a floor.",
      },
      {
        type: "paragraph",
        text: "This is a gentle call — to myself first, and then to every reader — to stop being satisfied with the bare minimum. The 30th juz, **Juz ʿAmma**, is within reach of every one of us. Not just to recite from a page, but to carry in the heart, and to understand at least a little of what we're saying to our Lord.",
      },
      {
        type: "heading",
        text: "This is for the women too — and especially for the men",
      },
      {
        type: "paragraph",
        text: "Every believer, man or woman, is honoured by carrying the Qur'an. The reward, the light, and the closeness to Allah are not reserved for anyone. So this call is for all of us.",
      },
      {
        type: "paragraph",
        text: "But there is a particular weight on the men. You are the ones expected to **step forward and lead** — in the household, among friends on a trip, at a small gathering, in a masjid when the imam is away. And leadership in prayer is tied directly to what you carry of the Qur'an.",
      },
      {
        type: "callout",
        label: "Hadith",
        text: "\"Let the one who is most versed in the Book of Allah lead the people in prayer.\"",
        attribution: "The Prophet ﷺ — Sahih Muslim 673 (Abu Masʿūd al-Anṣārī)",
      },
      {
        type: "paragraph",
        text: "Picture it plainly. Your family is together and it's time to pray — who leads? Your children are learning to read Qur'an — from whom? Your friends look to someone to step up on a journey — is it you, or do you shrink back because you only know three surahs? A man who cannot lead his own household in prayer with a little variety and meaning has left a gap that someone, or something, will fill.",
      },
      {
        type: "paragraph",
        text: "O men — you are meant to lead your wives, your children, your friends, and your community. That responsibility is not a burden to resent; it is an honour to prepare for. And the preparation is genuinely small.",
      },
      {
        type: "heading",
        text: "Ten minutes a day. That's the whole secret.",
      },
      {
        type: "paragraph",
        text: "The reason most of us never memorize more is not lack of ability — it's that we imagine it as one enormous, impossible mountain. It isn't. It's a staircase, and each step is tiny.",
      },
      {
        type: "paragraph",
        text: "Give it **ten honest minutes a day**. Not an hour. Ten minutes. Take one small section of one surah — three or four verses — and work on just that section until it settles. Read it, understand roughly what it means, repeat it, then pray with it that same day so it locks in.",
      },
      {
        type: "list",
        items: [
          "Pick one short section — a handful of verses, not a whole surah.",
          "Read the meaning first, so the words are not just sounds.",
          "Repeat it out loud until you can say it without looking.",
          "Recite it in your very next prayer — that's how it moves from memory to heart.",
          "Come back to it tomorrow before adding anything new.",
        ],
      },
      {
        type: "paragraph",
        text: "Do that, and the arithmetic takes care of itself. A section every few days, and within a matter of months you are no longer the person who knows three surahs — you are someone who can lead maghrib with a different surah every night for weeks.",
      },
      {
        type: "callout",
        label: "Hadith",
        text: "\"The most beloved of deeds to Allah are those done consistently, even if they are few.\"",
        attribution: "The Prophet ﷺ — Sahih al-Bukhari 6464 (ʿĀʾishah)",
      },
      {
        type: "paragraph",
        text: "This is the mercy in it. Allah did not ask for a heroic burst that you abandon in a week. He loves the small, steady thing you actually keep doing. Ten minutes you sustain will take you infinitely further than a marathon you quit.",
      },
      {
        type: "heading",
        text: "Memorize with meaning, not as noise",
      },
      {
        type: "paragraph",
        text: "There is a difference between parroting sounds and reciting words you understand. When you know that Sūrah al-ʿAṣr is Allah swearing by time that humanity is in loss — *except* the ones who believe, do good, and hold each other to truth and patience — the surah stops being a hurdle to clear and becomes a conversation. Your prayer changes. You start to *mean* it.",
      },
      {
        type: "paragraph",
        text: "So learn a little of the meaning alongside the Arabic. Not a scholar's tafsīr on day one — just enough that when you stand and recite, your heart follows your tongue. That is the whole point of memorizing: not to store text, but to let it live in you and shape you.",
      },
      {
        type: "callout",
        label: "Hadith",
        text: "\"The best of you are those who learn the Qur'an and teach it.\"",
        attribution: "The Prophet ﷺ — Sahih al-Bukhari 5027 (ʿUthmān ibn ʿAffān)",
      },
      {
        type: "heading",
        text: "Start today — with the next section",
      },
      {
        type: "paragraph",
        text: "Don't wait for Ramadan. Don't wait until life is calmer, because it won't be. Open one surah in Juz ʿAmma, take the first small section, and give it your ten minutes. Then pray with it tonight.",
      },
      {
        type: "paragraph",
        text: "Do that tomorrow, and the day after. In a year you will look back astonished at how far a few honest minutes carried you — and, God willing, you'll be the one confidently stepping forward to lead. May Allah make His Book heavy on our tongues and light in our hearts.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  // Pinned posts first, then newest first.
  return [...posts].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Human-readable date, e.g. "16 July 2026". */
export function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
