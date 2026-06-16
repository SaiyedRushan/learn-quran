import type {MetadataRoute} from "next";

// Required for `output: export` — emit a static /robots.txt at build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: "*", allow: "/"},
    sitemap: "https://learn-quran.app/sitemap.xml",
  };
}
