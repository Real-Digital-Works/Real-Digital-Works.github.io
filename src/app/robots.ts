import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/canonical-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = canonicalOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
