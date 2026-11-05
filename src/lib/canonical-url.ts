import { site } from "@/lib/content";

/**
 * Vercel currently returns 200 on www and 308s apex → www.
 * Canonicals, sitemap, og:url and JSON-LD must use the 200 host so Ahrefs/Google
 * are not pointed at a redirect.
 *
 * Do not add a vercel.json www redirect — a previous host 301 took the site down.
 * If Vercel primary is later switched to apex, change the hostname rewrite below
 * (and the CMS Site URL) instead of adding a config redirect.
 */
const APEX_HOST = "realdigitalworks.com";
const WWW_HOST = "www.realdigitalworks.com";

export function canonicalOrigin(): string {
  const fallback = `https://${WWW_HOST}`;
  try {
    const url = new URL(site.url || fallback);
    if (url.hostname === APEX_HOST) url.hostname = WWW_HOST;
    url.protocol = "https:";
    return url.origin;
  } catch {
    return fallback;
  }
}

export function canonicalUrl(path = "/"): string {
  const origin = canonicalOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_IMAGE_PATH = "/og.png";

export function siteImageUrl(): string {
  return canonicalUrl(SITE_IMAGE_PATH);
}
