import type {MetadataRoute} from "next";
import {surahIndex} from "@/lib/content";
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
    {url: absoluteUrl("/about/"), lastModified: now, changeFrequency: "yearly", priority: 0.4},
  ];

  const surahEntries: MetadataRoute.Sitemap = surahIndex.map((s) => ({
    url: absoluteUrl(`/surah/${s.slug}/`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}/`),
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticEntries, ...surahEntries, ...blogEntries];
}
