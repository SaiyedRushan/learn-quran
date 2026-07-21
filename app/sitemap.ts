import type {MetadataRoute} from "next";
import {surahIndex, getGuide, MIN_ORDERABLE_SECTIONS} from "@/lib/content";
import {getAllPosts} from "@/content/blog";
import {SITE, absoluteUrl} from "@/lib/site";

// Static export: generated once at build into /sitemap.xml. Trailing slashes
// match the app's `trailingSlash: true` routing.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1},
    {url: absoluteUrl("/blog/"), lastModified: now, changeFrequency: "weekly", priority: 0.8},
    {url: absoluteUrl("/duas/"), lastModified: now, changeFrequency: "monthly", priority: 0.7},
    {url: absoluteUrl("/games/"), lastModified: now, changeFrequency: "monthly", priority: 0.7},
    {url: absoluteUrl("/games/translate/"), lastModified: now, changeFrequency: "monthly", priority: 0.6},
    {url: absoluteUrl("/games/quiz/"), lastModified: now, changeFrequency: "monthly", priority: 0.6},
    {url: absoluteUrl("/games/order/"), lastModified: now, changeFrequency: "monthly", priority: 0.6},
    {url: absoluteUrl("/games/sections/"), lastModified: now, changeFrequency: "monthly", priority: 0.6},
    {url: absoluteUrl("/about/"), lastModified: now, changeFrequency: "yearly", priority: 0.4},
    {url: absoluteUrl("/contact/"), lastModified: now, changeFrequency: "yearly", priority: 0.5},
    {url: absoluteUrl("/privacy/"), lastModified: now, changeFrequency: "yearly", priority: 0.3},
  ];

  const surahEntries: MetadataRoute.Sitemap = surahIndex.map((s) => ({
    url: absoluteUrl(`/surah/${s.slug}/`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const gameEntries: MetadataRoute.Sitemap = surahIndex.flatMap((s) => [
    {
      url: absoluteUrl(`/surah/${s.slug}/quiz/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: absoluteUrl(`/games/translate/${s.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: absoluteUrl(`/games/order/${s.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  // Only surahs with enough thematic sections get an order-the-sections page.
  const sectionGameEntries: MetadataRoute.Sitemap = surahIndex
    .filter((s) => (getGuide(s.slug)?.sections.length ?? 0) >= MIN_ORDERABLE_SECTIONS)
    .map((s) => ({
      url: absoluteUrl(`/games/sections/${s.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}/`),
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticEntries, ...surahEntries, ...gameEntries, ...sectionGameEntries, ...blogEntries];
}
