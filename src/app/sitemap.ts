import type { MetadataRoute } from "next";
import { site, blogs, pages } from "@/lib/content";
import { servicePages } from "@/lib/services-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/services`,lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/work`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly",  priority: 0.8 },
    { url: `${base}/blog`,    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/modern-slavery`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // All 16 service pages — generated from services-data.ts
  const serviceRoutes: MetadataRoute.Sitemap = servicePages.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...pageRoutes];
}
