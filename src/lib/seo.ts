import type { Metadata } from "next";

/** Use the full string as-is when it already includes the brand, so the layout template cannot double it. */
export function brandedTitle(title: string): NonNullable<Metadata["title"]> {
  return /real digital works/i.test(title) ? { absolute: title } : title;
}

/**
 * Page-level OG + Twitter titles. Next merges these with the root layout;
 * if a route omits twitter.title it inherits the homepage “Web Design…” title.
 */
export function shareTitle(
  title: string,
  description: string,
  openGraph?: Metadata["openGraph"],
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { ...openGraph, title, description },
    twitter: { title, description },
  };
}

/** Visible H1: keyword + London from the SEO title, never a bare service name. */
export function serviceHeading(seoTitle: string, title: string): string {
  const stripped = seoTitle.replace(/\s*[|·]\s*Real Digital Works\s*$/i, "").trim();
  if (stripped) return stripped;
  if (/^web design$/i.test(title)) return "Web design agency in London";
  return `${title} in London`;
}
