import type {MetadataRoute} from "next";
import {absoluteUrl} from "@/lib/site";

// Required for `output: export` — emit a static /robots.txt at build.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: "*", allow: "/"},
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
