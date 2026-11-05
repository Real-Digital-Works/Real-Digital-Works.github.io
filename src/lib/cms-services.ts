/**
 * Maps the six CMS listing cards (admin Services tab) onto live public slugs.
 * Slugs stay frozen — never remap these URLs from the admin UI.
 */
export const CMS_SERVICE_SLUGS: Record<string, string> = {
  websites: "web-design",
  apps: "web-applications",
  ai: "ai-automation",
  seo: "seo",
  motion: "3d-animation",
  care: "hosting",
};

export function publicPathForCmsService(id: string): string | undefined {
  const slug = CMS_SERVICE_SLUGS[id];
  return slug ? `/services/${slug}` : undefined;
}

export function cmsIdForSlug(slug: string): string | undefined {
  return Object.entries(CMS_SERVICE_SLUGS).find(([, s]) => s === slug)?.[0];
}
