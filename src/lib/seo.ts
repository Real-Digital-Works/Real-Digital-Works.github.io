import type { Metadata } from "next";

/** Use the full string as-is when it already includes the brand, so the layout template cannot double it. */
export function brandedTitle(title: string): NonNullable<Metadata["title"]> {
  return /real digital works/i.test(title) ? { absolute: title } : title;
}

/** Visible H1: keyword + London from the SEO title, never a bare service name. */
export function serviceHeading(seoTitle: string, title: string): string {
  const stripped = seoTitle.replace(/\s*[|·]\s*Real Digital Works\s*$/i, "").trim();
  if (stripped) return stripped;
  if (/^web design$/i.test(title)) return "Web design agency in London";
  return `${title} in London`;
}
