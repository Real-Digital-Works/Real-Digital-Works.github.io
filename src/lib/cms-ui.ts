/**
 * Named CTAs and pop-up copy live on the same cms/content document as the rest
 * of the CMS. Empty strings fall back to the hardcoded defaults used on the
 * public site today, so shipping this later cannot blank production.
 */
import type { Content, NavItem } from "@/lib/content";

function readPath(root: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur) && /^\d+$/.test(part)) {
      cur = cur[Number(part)];
      continue;
    }
    if (typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[part];
      continue;
    }
    return undefined;
  }
  return cur;
}

function readText(draft: Content | null | undefined, path: string): string {
  const value = readPath(draft, path);
  return typeof value === "string" ? value : "";
}

export type CmsCta = { label: string; href: string };

export type CtaDef = {
  id: string;
  title: string;
  labelPath: string;
  hrefPath: string;
  fallbackLabel: string;
  fallbackHref: string;
};

function cta(
  id: string,
  title: string,
  fallbackLabel: string,
  fallbackHref: string,
  paths?: { labelPath?: string; hrefPath?: string },
): CtaDef {
  return {
    id,
    title,
    labelPath: paths?.labelPath ?? `ctas.${id.replace(/\./g, "_")}.label`,
    hrefPath: paths?.hrefPath ?? `ctas.${id.replace(/\./g, "_")}.href`,
    fallbackLabel,
    fallbackHref,
  };
}

export const CTA_DEFS: CtaDef[] = [
  cta("hero.primary", "Hero · Start a brief", "Start a brief", "/contact", {
    labelPath: "hero.primaryCta",
    hrefPath: "hero.primaryHref",
  }),
  cta("hero.secondary", "Hero · See our work", "See our work", "/work", {
    labelPath: "hero.secondaryCta",
    hrefPath: "hero.secondaryHref",
  }),
  cta("header.brief", "Header · Start a brief", "Start a brief", "/contact"),
  cta("header.megaAll", "Services menu · All services", "All services →", "/services"),
  cta("header.megaTalk", "Services menu · Talk to us", "Talk to us →", "/contact"),
  cta("home.allServices", "Home · All services", "All services →", "/services"),
  cta("home.allWork", "Home · All work", "All work", "/work"),
  cta("about.brief", "About · Start a brief", "Start a brief", "/contact"),
  cta("work.brief", "Work · Start a similar brief", "Start a similar brief", "/contact"),
  cta("work.pricing", "Work · See pricing", "See pricing", "/pricing"),
  cta("blog.brief", "Blog · Start a brief", "Start a brief", "/contact"),
  cta("blog.more", "Blog · More posts", "More posts", "/blog"),
  cta("page.contact", "Custom page · Get in touch", "Get in touch →", "/contact"),
  cta("services.quote", "Service · Get a quote", "Get a quote", "/contact"),
  cta("services.call", "Service · Book a free call", "Book a free call", "tel:+442077202581"),
  cta("services.pricing", "Service · See pricing", "See pricing", "/pricing"),
  cta("quote.send", "Quote builder · Send this to us", "Send this to us", "/contact"),
  cta("pricing.enquire", "Packages · Enquire", "Enquire", "/contact"),
  cta("askRdw.contact", "Ask RDW · Talk to a person", "Talk to a person", "/contact"),
  cta("askRdw.whatsapp", "Ask RDW · WhatsApp", "WhatsApp", "https://wa.me/447970325184"),
  cta("workflow.brief", "Workflow · Start this brief", "Start this brief", "/contact"),
  cta("workflow.pricing", "Workflow · Scope a number", "Scope a number", "/pricing"),
  cta("commandK.brief", "Jump to page · Send a brief", "Send a brief", "/contact"),
  cta("footer.about", "Footer · About", "About", "/about"),
  cta("footer.work", "Footer · Work", "Work", "/work"),
  cta("footer.pricing", "Footer · Pricing", "Pricing", "/pricing"),
  cta("footer.contact", "Footer · Contact", "Contact", "/contact"),
  cta("footer.privacy", "Footer · Privacy Policy", "Privacy Policy", "/privacy"),
  cta("footer.terms", "Footer · Terms", "Terms", "/terms"),
  cta("footer.modernSlavery", "Footer · Modern Slavery Policy", "Modern Slavery Policy", "/modern-slavery"),
  cta("footer.parent", "Footer · Parent studio", "Real Animation Works", "https://www.realanimationworks.com"),
  cta("contact.phone", "Contact · Call", "Call", "tel:+442077202581"),
  cta("contact.whatsapp", "Contact · WhatsApp", "WhatsApp", "https://wa.me/447970325184"),
  cta("contact.email", "Contact · Email", "Email", "mailto:hello@realdigitalworks.com"),
  cta("notfound.home", "404 · Home", "Home", "/"),
  cta("notfound.contact", "404 · Contact", "Contact", "/contact"),
];

export const FOOTER_SERVICE_LINKS: { id: string; href: string; label: string; group: string }[] = [
  { id: "footer.svc.web-design", href: "/services/web-design", label: "Web design", group: "Build" },
  { id: "footer.svc.ecommerce", href: "/services/ecommerce", label: "Ecommerce", group: "Build" },
  { id: "footer.svc.web-applications", href: "/services/web-applications", label: "Web applications", group: "Build" },
  { id: "footer.svc.landing-pages", href: "/services/landing-pages", label: "Landing pages", group: "Build" },
  { id: "footer.svc.seo", href: "/services/seo", label: "SEO", group: "Grow" },
  { id: "footer.svc.google-ads", href: "/services/google-ads", label: "Google Ads", group: "Grow" },
  { id: "footer.svc.social-media", href: "/services/social-media", label: "Social media", group: "Grow" },
  { id: "footer.svc.email-marketing", href: "/services/email-marketing", label: "Email marketing", group: "Grow" },
  { id: "footer.svc.branding", href: "/services/branding", label: "Branding", group: "Create" },
  { id: "footer.svc.3d-animation", href: "/services/3d-animation", label: "3D & animation", group: "Create" },
  { id: "footer.svc.photography", href: "/services/photography", label: "Photography", group: "Create" },
  { id: "footer.svc.copywriting", href: "/services/copywriting", label: "Copywriting", group: "Create" },
  { id: "footer.svc.hosting", href: "/services/hosting", label: "Hosting & care", group: "Support" },
  { id: "footer.svc.training", href: "/services/training", label: "Training", group: "Support" },
  { id: "footer.svc.ai-automation", href: "/services/ai-automation", label: "AI & automation", group: "Support" },
  { id: "footer.svc.consultancy", href: "/services/consultancy", label: "Consultancy", group: "Support" },
];

export const CTA_BY_ID: Record<string, CtaDef> = Object.fromEntries([
  ...CTA_DEFS,
  ...FOOTER_SERVICE_LINKS.map((item) =>
    cta(item.id, `Footer · ${item.label}`, item.label, item.href),
  ),
].map((item) => [item.id, item]));

export type PopupField =
  | { key: string; label: string; kind: "text" | "textarea" }
  | { key: string; label: string; kind: "cta"; labelKey: string; hrefKey: string };

export type PopupDef = {
  id: string;
  title: string;
  hint: string;
  open: "overlay" | "route";
  href?: string;
  fields: PopupField[];
  defaults: Record<string, string>;
};

export const POPUP_DEFS: PopupDef[] = [
  {
    id: "askRdw",
    title: "Ask RDW",
    hint: "Floating enquiry desk and the home-page panel.",
    open: "overlay",
    fields: [
      { key: "title", label: "Window title", kind: "text" },
      { key: "greeting", label: "Opening message", kind: "textarea" },
      { key: "placeholder", label: "Input placeholder", kind: "text" },
      { key: "submit", label: "Send button", kind: "text" },
      { key: "launcher", label: "Launcher (Ask RDW)", kind: "text" },
      { key: "closer", label: "Close label", kind: "text" },
      { key: "note", label: "Footer note", kind: "text" },
      { key: "cta", label: "Talk to a person", kind: "cta", labelKey: "ctaLabel", hrefKey: "ctaHref" },
      { key: "whatsapp", label: "WhatsApp", kind: "cta", labelKey: "whatsappLabel", hrefKey: "whatsappHref" },
    ],
    defaults: {
      title: "rdw / enquire-desk",
      greeting:
        "Ask this desk anything about the studio. It is a live demo of the enquiry pattern we build — not a toy chatbot pasted on the side.",
      placeholder: "Ask about AI, a site, a price…",
      submit: "Send",
      launcher: "Ask RDW",
      closer: "Close desk",
      note: "Ranges only — not a quote.",
      ctaLabel: "Talk to a person",
      ctaHref: "/contact",
      whatsappLabel: "WhatsApp",
      whatsappHref: "https://wa.me/447970325184",
    },
  },
  {
    id: "brief",
    title: "Start a brief (contact form)",
    hint: "The /contact enquiry form — this is the brief, not a separate builder.",
    open: "route",
    href: "/contact",
    fields: [
      { key: "nameLabel", label: "Name label", kind: "text" },
      { key: "namePlaceholder", label: "Name placeholder", kind: "text" },
      { key: "businessLabel", label: "Business label", kind: "text" },
      { key: "businessPlaceholder", label: "Business placeholder", kind: "text" },
      { key: "emailLabel", label: "Email label", kind: "text" },
      { key: "emailPlaceholder", label: "Email placeholder", kind: "text" },
      { key: "phoneLabel", label: "Phone label", kind: "text" },
      { key: "phonePlaceholder", label: "Phone placeholder", kind: "text" },
      { key: "needLabel", label: "Need label", kind: "text" },
      { key: "messageLabel", label: "Message label", kind: "text" },
      { key: "messagePlaceholder", label: "Message placeholder", kind: "text" },
      { key: "submit", label: "Submit button", kind: "text" },
      { key: "sending", label: "Sending label", kind: "text" },
      { key: "thanksTitle", label: "Thanks title", kind: "text" },
      { key: "thanksBody", label: "Thanks body", kind: "textarea" },
    ],
    defaults: {
      nameLabel: "Your name",
      namePlaceholder: "Sam Patel",
      businessLabel: "Business name",
      businessPlaceholder: "Patel & Co",
      emailLabel: "Email",
      emailPlaceholder: "sam@studio.co.uk",
      phoneLabel: "Phone",
      phonePlaceholder: "07700 900123",
      needLabel: "What do you need?",
      messageLabel: "Tell us a bit more",
      messagePlaceholder: "Current site, rough budget, when you would like it live.",
      submit: "Send enquiry",
      sending: "Sending…",
      thanksTitle: "Thanks — that is with us.",
      thanksBody: "A person replies within one working day.",
    },
  },
  {
    id: "quote",
    title: "Quote builder",
    hint: "The live estimate on /pricing.",
    open: "route",
    href: "/pricing",
    fields: [
      { key: "needTitle", label: "Step 1 title", kind: "text" },
      { key: "needSub", label: "Step 1 subtitle", kind: "text" },
      { key: "sizeTitle", label: "Step 2 title", kind: "text" },
      { key: "sizeSub", label: "Step 2 subtitle", kind: "text" },
      { key: "extraTitle", label: "Step 3 title", kind: "text" },
      { key: "extraSub", label: "Step 3 subtitle", kind: "text" },
      { key: "whenTitle", label: "Step 4 title", kind: "text" },
      { key: "whenSub", label: "Step 4 subtitle", kind: "text" },
      { key: "estimateLabel", label: "Estimate heading", kind: "text" },
      { key: "empty", label: "Empty estimate", kind: "text" },
      { key: "cta", label: "Send this to us", kind: "cta", labelKey: "ctaLabel", hrefKey: "ctaHref" },
      { key: "note", label: "Fine print", kind: "textarea" },
    ],
    defaults: {
      needTitle: "What do you need?",
      needSub: "Choose as many as apply.",
      sizeTitle: "How big is the organisation?",
      sizeSub: "This changes scope and support volume.",
      extraTitle: "Anything else?",
      extraSub: "Optional extras we are often asked for.",
      whenTitle: "When do you need it?",
      whenSub: "Priority displaces other work, so it costs more.",
      estimateLabel: "Your estimate",
      empty: "Select what you need to see a price",
      ctaLabel: "Send this to us",
      ctaHref: "/contact",
      note: "Indicative range for this draft. Final price is fixed in writing after a free consultation.",
    },
  },
  {
    id: "commandK",
    title: "Jump to page (⌘K)",
    hint: "Keyboard overlay from the header chip.",
    open: "overlay",
    fields: [
      { key: "placeholder", label: "Search placeholder", kind: "text" },
      { key: "cta", label: "Send a brief", kind: "cta", labelKey: "ctaLabel", hrefKey: "ctaHref" },
      { key: "hint", label: "Footer hint", kind: "text" },
    ],
    defaults: {
      placeholder: "Jump to a page…",
      ctaLabel: "Send a brief",
      ctaHref: "/contact",
      hint: "esc to close",
    },
  },
  {
    id: "mobileMenu",
    title: "Mobile menu",
    hint: "Hamburger overlay. Nav labels live on each link; the brief button is shared with the header.",
    open: "overlay",
    fields: [
      { key: "note", label: "Note", kind: "text" },
    ],
    defaults: {
      note: "Edit Start a brief from the header button. Edit menu pages by clicking them.",
    },
  },
  {
    id: "workflow",
    title: "Workflow play",
    hint: "Home offer tiles open this overlay.",
    open: "overlay",
    href: "/",
    fields: [
      { key: "cta", label: "Start this brief", kind: "cta", labelKey: "ctaLabel", hrefKey: "ctaHref" },
      { key: "pricing", label: "Scope a number", kind: "cta", labelKey: "pricingLabel", hrefKey: "pricingHref" },
    ],
    defaults: {
      ctaLabel: "Start this brief",
      ctaHref: "/contact",
      pricingLabel: "Scope a number",
      pricingHref: "/pricing",
    },
  },
];

export const POPUP_BY_ID: Record<string, PopupDef> = Object.fromEntries(
  POPUP_DEFS.map((item) => [item.id, item]),
);

export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function resolveCta(
  draft: Content | null | undefined,
  id: string,
  fallback?: Partial<CmsCta>,
): CmsCta {
  const def = CTA_BY_ID[id];
  const fbLabel = fallback?.label ?? def?.fallbackLabel ?? "";
  const fbHref = fallback?.href ?? def?.fallbackHref ?? "/";
  if (!draft || !def) return { label: fbLabel, href: fbHref };
  const label = readText(draft, def.labelPath).trim();
  const href = readText(draft, def.hrefPath).trim();
  return { label: label || fbLabel, href: href || fbHref };
}

export function popupText(
  draft: Content | null | undefined,
  id: string,
  key: string,
  fallback?: string,
): string {
  const fromDef = POPUP_BY_ID[id]?.defaults[key] ?? "";
  const fb = fallback ?? fromDef;
  if (!draft) return fb;
  const value = readText(draft, `popups.${id}.${key}`).trim();
  return value || fb;
}

export function findNavItem(items: NavItem[] | undefined, id: string): NavItem | null {
  for (const item of items ?? []) {
    if (item.id === id) return item;
    const nested = findNavItem(item.children, id);
    if (nested) return nested;
  }
  return null;
}

export function patchNavItem(items: NavItem[], id: string, patch: Partial<NavItem>): NavItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...patch,
        id: item.id,
        children: item.children,
      };
    }
    if (item.children) {
      return { ...item, children: patchNavItem(item.children, id, patch) };
    }
    return item;
  });
}

export function destinationGroups(draft: Content): { group: string; items: { label: string; href: string }[] }[] {
  const site = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];
  const legal = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Modern slavery", href: "/modern-slavery" },
  ];
  const services = (draft.servicePagesList ?? []).map((row) => ({
    label: row.title || row.slug,
    href: `/services/${row.slug}`,
  }));
  const work = (draft.projects ?? []).map((row) => ({
    label: row.title || row.slug,
    href: `/work/${row.slug}`,
  }));
  const blogs = (draft.blogs ?? [])
    .filter((row) => row.status === "published")
    .map((row) => ({ label: row.title || row.slug, href: `/blog/${row.slug}` }));
  const pages = (draft.pages ?? [])
    .filter((row) => row.status === "published")
    .map((row) => ({ label: row.title || row.slug, href: `/${row.slug}` }));
  const contact = [
    { label: "WhatsApp", href: draft.site.whatsappHref },
    { label: "Email (mailto)", href: draft.site.emailHref },
    { label: "Phone (tel)", href: draft.site.phoneHref },
  ];
  return [
    { group: "Pages", items: site },
    { group: "Services", items: services },
    { group: "Work", items: work },
    { group: "Blog", items: blogs },
    { group: "Custom pages", items: pages },
    { group: "Legal", items: legal },
    { group: "Direct contact", items: contact },
  ].filter((group) => group.items.length > 0);
}

export function withContactQuery(href: string, query: string): string {
  if (!query) return href;
  if (!href.startsWith("/contact")) return href;
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}${query}`;
}

export function mergeCmsMaps<T extends Record<string, string>>(
  raw: Record<string, Record<string, string>> | undefined,
): Record<string, Record<string, string>> {
  if (!raw || typeof raw !== "object") return {};
  const next: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue;
    const row: Record<string, string> = {};
    for (const [field, text] of Object.entries(value)) {
      if (typeof text === "string") row[field] = text;
    }
    next[key] = row;
  }
  return next as Record<string, T>;
}
