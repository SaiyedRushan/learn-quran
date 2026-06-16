import type {MetadataRoute} from "next";
import {surahIndex} from "@/lib/content";

const BASE = "https://learn-quran.app";

// Static export: generated once at build into /sitemap.xml. Trailing slashes
// match the app's `trailingSlash: true` routing.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["/", "/duas/", "/about/"];
  const surahPaths = surahIndex.map((s) => `/surah/${s.slug}/`);
  return [...staticPaths, ...surahPaths].map((path) => ({
    url: BASE + path,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
