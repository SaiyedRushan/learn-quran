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
  body: BlogBlock[];
}

const posts: BlogPost[] = [
  {
    slug: "lead-the-prayer-memorize-juz-amma",
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
  // Newest first.
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
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
