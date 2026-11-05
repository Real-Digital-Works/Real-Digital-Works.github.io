import type { Metadata } from "next";
import { site } from "@/lib/content";
import { SITE_IMAGE_PATH } from "@/lib/canonical-url";

const META_DESCRIPTION_MAX = 160;

const shareImage = {
  url: SITE_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: site.name,
};

/** Cap CMS/generated descriptions for SERP snippets without rewriting source copy. */
export function metaDescription(raw: string, max = META_DESCRIPTION_MAX): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const at = sliced.lastIndexOf(" ");
  const cut = (at > 80 ? sliced.slice(0, at) : sliced).replace(/[\s.,;:–—-]+$/, "");
  return `${cut}…`;
}

/** Use the full string as-is when it already includes the brand, so the layout template cannot double it. */
export function brandedTitle(title: string): NonNullable<Metadata["title"]> {
  const trimmed = title.trim();
  return /real digital works/i.test(trimmed) ? { absolute: trimmed } : trimmed;
}

/**
 * Page-level OG + Twitter. Next replaces these objects instead of deep-merging
 * them with the root layout — so card, image, locale and siteName must be set
 * here or inner routes ship a title-only card with no image.
 */
export function shareTitle(
  title: string,
  description: string,
  openGraph?: Metadata["openGraph"],
): Pick<Metadata, "description" | "openGraph" | "twitter"> {
  const trimmedTitle = title.trim();
  const trimmedDescription = metaDescription(description);
  return {
    description: trimmedDescription,
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: site.name,
      images: [shareImage],
      ...openGraph,
      title: trimmedTitle,
      description: trimmedDescription,
    },
    twitter: {
      card: "summary_large_image",
      images: [SITE_IMAGE_PATH],
      title: trimmedTitle,
      description: trimmedDescription,
    },
  };
}

/** Visible H1: keyword + London from the SEO title, never a bare service name. */
export function serviceHeading(seoTitle: string, title: string): string {
  const stripped = seoTitle.replace(/\s*[|·]\s*Real Digital Works\s*$/i, "").trim();
  if (stripped) return stripped;
  if (/^web design$/i.test(title)) return "Web design agency in London";
  return `${title} in London`;
}
