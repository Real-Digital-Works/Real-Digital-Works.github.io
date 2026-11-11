/**
 * Typed content loader.
 * All pages/components import from here — never directly from site.ts.
 * At build time, content.json is populated by scripts/fetch-content.js
 * which reads from Firestore. Until Firebase is set up, the file ships
 * with the initial seed values so SEO metadata is present immediately.
 */
import raw from "@/data/content.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteInfo {
  name: string;
  parent: string;
  tagline: string;
  description: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  email: string;
  emailHref: string;
  address: string[];
  hours: string;
  url: string;
  /** Paragraph under the footer lockup. Empty falls back to the live site copy. */
  footerBlurb?: string;
  /** Bottom-left footer line, e.g. © 2026 Real Digital Works */
  copyright?: string;
}

export interface PageIntro {
  eyebrow: string;
  headline: string;
  sub: string;
  viewLabel?: string;
}

export const DEFAULT_FOOTER_BLURB =
  "Websites, software, AI and motion. A Real Animation Works company, from the Kennington studio.";
export const DEFAULT_COPYRIGHT = "© 2026 Real Digital Works";

export const DEFAULT_FOOTER_COPY: Record<string, string> = {
  colBuild: "Build",
  colGrow: "Grow",
  colCreate: "Create",
  colSupport: "Support",
  colCompany: "Company",
  colStudio: "Studio",
};

export const DEFAULT_HOME_SECTIONS: Record<string, string> = {
  scrollCue: "Scroll — the offer is below",
  offerEyebrow: "Keep scrolling",
  offerTitle: "One line at a time.",
  offerOpen: "Open services →",
  offerMobileEyebrow: "What we do",
  unpack: "Unpack",
  deskEyebrow: "Then try it",
  deskTitle: "The enquiry desk.",
  deskIntro:
    "This is the pattern we ship: answers first, then a human. Ask it about a website, an app, search, or motion.",
  workEyebrow: "Then the proof",
  workTitle: "Live work.",
  openCase: "Open the case →",
  processEyebrow: "How it ships",
  faqEyebrow: "First questions",
  faqTitle: "Price, time, lock-in.",
};

export const DEFAULT_PAGE_INTROS: Record<string, PageIntro> = {
  contact: {
    eyebrow: "Contact",
    headline: "Tell us what is not working.",
    sub: "One working day for a reply. If we are not right for the job we will say so. The form goes to the studio.",
  },
  about: {
    eyebrow: "Studio",
    headline: "A motion house that learned to ship software.",
    sub: "Real Digital Works is the build arm of Real Animation Works — the Kennington studio that has taught animation, CAD and visualisation since 2009. Same address. A new product: websites, AI desks, applications.",
  },
  pricing: {
    eyebrow: "Pricing",
    headline: "Know the number before you call.",
    sub: "Tick what you need. The estimate updates as you go. Starting ranges for review, not a contract.",
  },
  blog: {
    eyebrow: "Blog",
    headline: "Thinking out loud.",
    sub: "Guides, opinions and studio updates from the Kennington team.",
  },
  services: {
    eyebrow: "Services",
    headline: "Everything, or just the bit you are missing.",
    sub: "Take one service or the lot. Most clients start with a website and add software, search or motion as they grow.",
    viewLabel: "View service",
  },
  notfound: {
    eyebrow: "404",
    headline: "Page not found",
    sub: "That address is not on this site. Try the homepage, or send a brief if you were looking for a piece of work.",
  },
};

export interface PageSeo {
  title: string;
  description: string;
  keywords: string[];
}

export interface SeoMap {
  home: PageSeo;
  services: PageSeo;
  pricing: PageSeo;
  about: PageSeo;
  contact: PageSeo;
  work: PageSeo;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  sub: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}

export interface ProofStat {
  value: string;
  label: string;
}

export interface Service {
  id: string;
  title: string;
  from: string;
  summary: string;
  detail: string;
}

export interface ServicePageSeo {
  seoTitle: string;
  seoDescription: string;
  keywords?: string[];
}

export type ServicePagesSeoMap = Record<string, ServicePageSeo>;

export const SERVICE_CATEGORIES = ["Build", "Grow", "Create", "Support"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Editable body + SEO for a public /services/[slug] page */
export interface CmsServicePage {
  title: string;
  from: string;
  intro: string;
  overview: string;
  whatsIncluded: { title: string; description: string }[];
  process: { title: string; description: string }[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  listingTitle?: string;
  summary?: string;
  detail?: string;
  category?: ServiceCategory;
  showOnHome?: boolean;
  /** Hidden from listings/menus; the /services/{slug} URL still renders. */
  hidden?: boolean;
}

/** Canonical CMS row for one service — listing + individual page */
export interface CmsServiceRecord extends CmsServicePage {
  slug: string;
  category: ServiceCategory;
  listingTitle: string;
  summary: string;
  detail: string;
  showOnHome: boolean;
}

export type ServicePagesCmsMap = Record<string, CmsServicePage>;

export interface ProcessStep {
  n: string;
  title: string;
  body: string;
}

export interface Discipline {
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Package {
  name: string;
  amount: string;
  per: string;
  featured: boolean;
  items: string[];
}

export const PROJECT_STATUSES = ["Live", "Live sample", "Indicative"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  slug: string;
  title: string;
  client: string;
  kind: string;
  year: string;
  status: ProjectStatus;
  summary: string;
  problem: string;
  work: string;
  outcome: string;
  tags: string[];
  accent: string;
  /** Optional card image. Empty keeps the accent gradient used on /work. */
  image?: string;
  /** Live website URL. Shown as “Visit site” on the case-study page. */
  liveUrl?: string;
  /** Hidden from /work and homepage cards; /work/{slug} still renders. */
  hidden?: boolean;
}

export function projectMetaLine(project: Pick<Project, "status" | "year" | "kind">): string {
  return [project.status, project.year, project.kind].map((part) => part.trim()).filter(Boolean).join(" · ");
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

/** Intro copy on the public /work listing (not individual case studies). */
export interface WorkPageContent {
  eyebrow: string;
  headline: string;
  sub: string;
}

export type BlogStatus = "published" | "draft";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;       // HTML from rich text editor
  coverImage?: string;   // URL
  publishedAt: string;   // ISO date string
  status: BlogStatus;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  /** Hidden from /blog listing; /blog/{slug} still renders. */
  hidden?: boolean;
}

export type PageStatus = "published" | "draft";

export interface DynamicPage {
  slug: string;
  title: string;
  content: string;       // HTML from rich text editor
  status: PageStatus;
  showInNav: boolean;
  seoTitle: string;
  seoDescription: string;
  /** Hidden from menus and sitemaps; the custom path still renders. */
  hidden?: boolean;
}

export interface NavItem {
  id: string;            // stable UUID for DnD key
  label: string;
  href: string;
  hidden?: boolean;
  children?: NavItem[];  // sub-navigation (max 1 level deep)
}

/** CMS body + SEO for Privacy, Terms, and Modern Slavery */
export interface LegalPageContent {
  title: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
}

export interface LegalContent {
  privacy: LegalPageContent;
  terms: LegalPageContent;
  modernSlavery: LegalPageContent;
}

export const LEGAL_HREFS = {
  privacy: "/privacy",
  terms: "/terms",
  modernSlavery: "/modern-slavery",
} as const;

export interface Content {
  version: number;
  lastUpdated: string;
  site: SiteInfo;
  seo: SeoMap;
  hero: HeroContent;
  proof: ProofStat[];
  services: Service[];
  process: ProcessStep[];
  disciplines: Discipline[];
  faq: FaqItem[];
  packages: Package[];
  projects: Project[];
  /** Intro on the public /work listing page */
  workPage?: WorkPageContent;
  sectors: string[];
  stack: string[];
  blogs: BlogPost[];
  pages: DynamicPage[];
  /** Privacy, Terms, Modern Slavery — missing keys fall back to seed copy */
  legal?: LegalContent;
  navItems?: NavItem[];
  /** Per-slug SEO for public /services/[slug] pages (kept in sync with servicePagesContent) */
  servicePagesSeo?: ServicePagesSeoMap;
  /** Full CMS body for each public /services/[slug] page */
  servicePagesContent?: ServicePagesCmsMap;
  /**
   * Canonical ordered service list. Missing → seed the original 16 pages.
   * An empty array is a real value (every service is hidden or none exist).
   */
  servicePagesList?: CmsServiceRecord[];
  /** Named public CTAs (label + destination). Missing keys use in-code fallbacks. */
  ctas?: Record<string, { label?: string; href?: string }>;
  /** Copy for Ask RDW, quote builder, contact brief, ⌘K, and overlays. */
  popups?: Record<string, Record<string, string>>;
  /** H1 + intro on listing pages (contact, about, services, …). */
  pageIntros?: Record<string, PageIntro>;
  /** Home mid-page section copy (enquiry desk, process, FAQ heading, …). */
  homeSections?: Record<string, string>;
  /** Footer column headings. */
  footerCopy?: Record<string, string>;
}

// ─── Exported accessors ───────────────────────────────────────────────────────

const content = raw as Content;

function pickStr(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

export function mergeStringMap(
  seed: Record<string, string>,
  raw?: Record<string, string> | null,
): Record<string, string> {
  const next = { ...seed };
  if (!raw || typeof raw !== "object") return next;
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" && value.trim()) next[key] = value;
  }
  return next;
}

export function mergePageIntros(
  raw?: Record<string, Partial<PageIntro>> | null,
): Record<string, PageIntro> {
  const next: Record<string, PageIntro> = {};
  for (const [key, seed] of Object.entries(DEFAULT_PAGE_INTROS)) {
    const row = raw?.[key];
    next[key] = {
      eyebrow: pickStr(row?.eyebrow, seed.eyebrow),
      headline: pickStr(row?.headline, seed.headline),
      sub: pickStr(row?.sub, seed.sub),
      ...(seed.viewLabel || row?.viewLabel
        ? { viewLabel: pickStr(row?.viewLabel, seed.viewLabel ?? "View service") }
        : {}),
    };
  }
  return next;
}

export function mergeSite(raw?: Partial<SiteInfo> | null, seed: SiteInfo = content.site): SiteInfo {
  const addressRaw = Array.isArray(raw?.address) ? raw.address : seed.address;
  const address = (addressRaw.length ? addressRaw : seed.address).map((line, i) =>
    pickStr(typeof line === "string" ? line : "", seed.address[i] ?? ""),
  );
  return {
    name: pickStr(raw?.name, seed.name),
    parent: pickStr(raw?.parent, seed.parent),
    tagline: pickStr(raw?.tagline, seed.tagline),
    description: pickStr(raw?.description, seed.description),
    phone: pickStr(raw?.phone, seed.phone),
    phoneHref: pickStr(raw?.phoneHref, seed.phoneHref),
    whatsapp: pickStr(raw?.whatsapp, seed.whatsapp),
    whatsappHref: pickStr(raw?.whatsappHref, seed.whatsappHref),
    email: pickStr(raw?.email, seed.email),
    emailHref: pickStr(raw?.emailHref, seed.emailHref),
    address: address.length ? address : seed.address,
    hours: pickStr(raw?.hours, seed.hours),
    url: pickStr(raw?.url, seed.url),
    footerBlurb: pickStr(raw?.footerBlurb, seed.footerBlurb ?? DEFAULT_FOOTER_BLURB),
    copyright: pickStr(raw?.copyright, seed.copyright ?? DEFAULT_COPYRIGHT),
  };
}

function presentStr(raw: Partial<LegalPageContent> | null | undefined, key: keyof LegalPageContent, fallback: string): string {
  if (!raw || typeof raw !== "object" || !Object.prototype.hasOwnProperty.call(raw, key)) {
    return fallback;
  }
  const value = raw[key];
  return typeof value === "string" ? value : fallback;
}

export const DEFAULT_WORK_PAGE: WorkPageContent = {
  eyebrow: "Work",
  headline: "Proof before claims.",
  sub: "One live sample. Two product shapes labelled honestly until a paid case replaces them.",
};

export const DEFAULT_WORK_SEO: PageSeo = {
  title: "Work & Case Studies London | Real Digital Works",
  description:
    "See sample websites, product shapes and case studies from Real Digital Works, a digital agency in Kennington, London.",
  keywords: [
    "web design case studies London",
    "digital agency work London",
    "website portfolio London",
    "web design agency London",
    "website design London",
    "web development London",
    "professional web design London",
    "business website design",
    "responsive web design",
    "bespoke website development",
  ],
};

export function mergeWorkPage(raw?: Partial<WorkPageContent> | null): WorkPageContent {
  return {
    eyebrow: pickStr(raw?.eyebrow, DEFAULT_WORK_PAGE.eyebrow),
    headline: pickStr(raw?.headline, DEFAULT_WORK_PAGE.headline),
    sub: pickStr(raw?.sub, DEFAULT_WORK_PAGE.sub),
  };
}

export const DEFAULT_LEGAL: LegalContent = {
  privacy: {
    title: "Privacy",
    seoTitle: "Privacy policy",
    seoDescription:
      "How Real Digital Works uses enquiry details you send us, and how to ask for a copy or deletion.",
    body: `<p>Real Digital Works collects the name, contact details and message you submit on this website so we can reply to your enquiry. We do not sell that information, and we do not use it for advertising lists.</p><p>Enquiries are stored so the studio can follow up. If you want a copy of what we hold, or you want it deleted, email info@realdigitalworks.com or call 020 7720 2581.</p><p>A fuller policy covering cookies, analytics and retention periods will replace this notice. Until then, treat the paragraph above as the current practice.</p>`,
  },
  terms: {
    title: "Terms",
    seoTitle: "Terms of use",
    seoDescription:
      "How to use the Real Digital Works website, and how to get a written agreement for project work.",
    body: `<p>These pages explain how we use this website. They are not a substitute for a written proposal or contract on a paid project.</p><p>Real Digital Works is the digital studio of Real Animation Works, based at Kennington Business Park, Lincoln House LG-02, London SW9 6DE.</p><p>If you need terms for a brief, a quote, intellectual property, or how we work with clients, email info@realdigitalworks.com or call 020 7720 2581 and we will send them in writing.</p>`,
  },
  modernSlavery: {
    title: "Modern Slavery Policy",
    seoTitle: "Modern Slavery Policy",
    seoDescription:
      "Modern slavery policy for Real Digital Works, covering our Kennington studio, suppliers, and how to raise a concern. Full policy forthcoming.",
    body: `<p>Policy forthcoming.</p><p>Real Digital Works, Kennington Business Park, Lincoln House LG-02, London SW9 6DE.</p><p>Until the full policy is published, email info@realdigitalworks.com or call 020 7720 2581.</p>`,
  },
};

export function mergeLegalPage(
  raw: Partial<LegalPageContent> | null | undefined,
  fallback: LegalPageContent,
): LegalPageContent {
  if (!raw || typeof raw !== "object") return { ...fallback };
  return {
    title: presentStr(raw, "title", fallback.title),
    body: presentStr(raw, "body", fallback.body),
    seoTitle: presentStr(raw, "seoTitle", fallback.seoTitle),
    seoDescription: presentStr(raw, "seoDescription", fallback.seoDescription),
  };
}

export function mergeLegal(raw?: Partial<LegalContent> | null): LegalContent {
  return {
    privacy: mergeLegalPage(raw?.privacy, DEFAULT_LEGAL.privacy),
    terms: mergeLegalPage(raw?.terms, DEFAULT_LEGAL.terms),
    modernSlavery: mergeLegalPage(raw?.modernSlavery, DEFAULT_LEGAL.modernSlavery),
  };
}

export function mergeWorkSeo(raw?: Partial<PageSeo> | null): PageSeo {
  const keywords = Array.isArray(raw?.keywords)
    ? raw.keywords.map((k) => k.trim()).filter(Boolean)
    : [];
  return {
    title: pickStr(raw?.title, DEFAULT_WORK_SEO.title),
    description: pickStr(raw?.description, DEFAULT_WORK_SEO.description),
    keywords: keywords.length > 0 ? keywords : DEFAULT_WORK_SEO.keywords,
  };
}

/** URL-safe slug. Empty titles become `fallback`. */
export function slugifyTitle(title: string, fallback = ""): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || fallback;
}

/** URL-safe slug for /work/{slug}. Empty titles become "case-study". */
export function slugifyProjectTitle(title: string): string {
  return slugifyTitle(title, "case-study");
}

function uniqueSlug(
  desired: string,
  existing: string[],
  currentIndex: number | undefined,
  emptyFallback: string,
): string {
  const base = slugifyTitle(desired, emptyFallback);
  const taken = new Set(
    existing
      .filter((_, i) => i !== currentIndex)
      .map((s) => s.toLowerCase())
      .filter(Boolean),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Keep a slug unique within the case-study list. Pass `currentIndex` so an item can keep its own slug. */
export function uniqueProjectSlug(
  desired: string,
  existing: string[],
  currentIndex?: number,
): string {
  return uniqueSlug(desired, existing, currentIndex, "case-study");
}

/** URL-safe slug for /services/{slug}. Empty titles become "service". */
export function slugifyServiceTitle(title: string): string {
  return slugifyTitle(title, "service");
}

/** Keep a slug unique within the CMS service list. */
export function uniqueServiceSlug(
  desired: string,
  existing: string[],
  currentIndex?: number,
): string {
  return uniqueSlug(desired, existing, currentIndex, "service");
}

export function createBlankProject(existingSlugs: string[]): Project {
  const title = "New case study";
  return {
    slug: uniqueProjectSlug(title, existingSlugs),
    title,
    client: "",
    kind: "",
    year: "",
    status: "Indicative",
    summary: "",
    problem: "",
    work: "",
    outcome: "",
    tags: [],
    accent: "#1857EC",
  };
}

function normalizeProject(item: Partial<Project>, seed: Project[]): Project {
  const fallback = seed.find((p) => p.slug && p.slug === item.slug);
  const tags =
    Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : (fallback?.tags ?? []);
  const status: ProjectStatus = isProjectStatus(item.status)
    ? item.status
    : (fallback?.status ?? "Indicative");
  const image = pickStr(item.image, fallback?.image ?? "");
  const liveUrl = pickStr(item.liveUrl, fallback?.liveUrl ?? "");
  return {
    slug: slugifyProjectTitle(pickStr(item.slug, fallback?.slug ?? "")),
    title: pickStr(item.title, fallback?.title ?? ""),
    client: pickStr(item.client, fallback?.client ?? ""),
    kind: pickStr(item.kind, fallback?.kind ?? ""),
    year: pickStr(item.year, fallback?.year ?? ""),
    status,
    summary: pickStr(item.summary, fallback?.summary ?? ""),
    problem: pickStr(item.problem, fallback?.problem ?? ""),
    work: pickStr(item.work, fallback?.work ?? ""),
    outcome: pickStr(item.outcome, fallback?.outcome ?? ""),
    tags,
    accent: pickStr(item.accent, fallback?.accent ?? "#1857EC"),
    ...(image ? { image } : {}),
    ...(liveUrl ? { liveUrl } : {}),
    ...(item.hidden ? { hidden: true } : {}),
  };
}

export function isHidden(item?: { hidden?: boolean } | null): boolean {
  return Boolean(item?.hidden);
}

/** Listings, menus, sitemaps — omit hidden records. Direct URLs still use the full list. */
export function visibleItems<T extends { hidden?: boolean }>(items: T[]): T[] {
  return items.filter((item) => !isHidden(item));
}

/** Published pages/posts, plus hidden ones so their URLs keep working. */
export function isDirectUrlLive(item: { status?: string; hidden?: boolean }): boolean {
  return item.status === "published" || Boolean(item.hidden);
}

/**
 * Live client sites that must survive a Firestore overlay.
 * Vercel `fetch-content.js` replaces content.json with cms/content, which
 * historically dropped git-only case studies (Plot Atelier stayed, these vanished).
 */
export const FEATURED_CLIENT_PROJECTS: Project[] = [
  {
    slug: "coopers-gang",
    title: "Cooper's Gang",
    client: "Cooper's Gang",
    kind: "Website",
    year: "",
    status: "Live",
    summary: "Signature grooming, boutique finds and doggy day care, the Cooper's Gang way.",
    problem: "A live website for Cooper's Gang.",
    work: "Website delivered by Real Digital Works.",
    outcome: "Live at https://coopersgang.co.uk/",
    tags: ["Pets", "Grooming", "Website"],
    accent: "#3f4a3c",
    image: "/work/coopers-gang.png",
    liveUrl: "https://coopersgang.co.uk/",
  },
  {
    slug: "vape-superstore",
    title: "Vape Superstore",
    client: "Vape Superstore",
    kind: "Ecommerce",
    year: "",
    status: "Live",
    summary: "Vape Superstore: your UK online vape shop.",
    problem: "A live UK online shop for Vape Superstore.",
    work: "Website delivered by Real Digital Works.",
    outcome: "Live at https://www.vapesuperstore.co.uk/",
    tags: ["Ecommerce", "Retail"],
    accent: "#0e6e75",
    image: "/work/vape-superstore.png",
    liveUrl: "https://www.vapesuperstore.co.uk/",
  },
  {
    slug: "glassware-uk",
    title: "Glassware UK",
    client: "Glassware UK",
    kind: "Ecommerce",
    year: "",
    status: "Live",
    summary: "Premium glassware and accessories — wine glasses, decanters and tableware.",
    problem: "A live UK shop for Glassware UK.",
    work: "Website delivered by Real Digital Works.",
    outcome: "Live at https://glasswareuk.co.uk/",
    tags: ["Ecommerce", "Retail"],
    accent: "#165a6b",
    image: "/work/glassware-uk.png",
    liveUrl: "https://glasswareuk.co.uk/",
  },
  {
    slug: "valentina-valentti",
    title: "Valentina Valentti",
    client: "Valentina Valentti",
    kind: "Ecommerce",
    year: "",
    status: "Live",
    summary: "Luxury pet products and premium dog essentials.",
    problem: "A live UK online pet shop for Valentina Valentti.",
    work: "Website delivered by Real Digital Works.",
    outcome: "Live at https://www.valentinavalentti.co.uk/",
    tags: ["Ecommerce", "Pets"],
    accent: "#c4a035",
    image: "/work/valentina-valentti.png",
    liveUrl: "https://www.valentinavalentti.co.uk/",
  },
  {
    slug: "tpob",
    title: "TPOB",
    client: "TPOB",
    kind: "Ecommerce",
    year: "",
    status: "Live",
    summary: "The TPOB Pro line of hair clippers and trimmers for professional barbers and stylists.",
    problem: "A live shop for the TPOB barber brand.",
    work: "Website delivered by Real Digital Works.",
    outcome: "Live at https://tpob.co.uk/",
    tags: ["Ecommerce", "Barber"],
    accent: "#111111",
    image: "/work/tpob.png",
    liveUrl: "https://tpob.co.uk/",
  },
];

/**
 * Merge CMS case studies. An empty visible list is a real value (every item may be hidden).
 * Seed is used only when the list is missing entirely, not when it is empty.
 * Featured client sites are prepended when their slug is absent from CMS (including
 * after a Firestore fetch that only contains the older sample work).
 */
export function mergeProjects(raw?: Project[] | null): Project[] {
  const seed = [
    ...FEATURED_CLIENT_PROJECTS,
    ...(Array.isArray(content.projects) ? content.projects : []),
  ];
  const catalog = FEATURED_CLIENT_PROJECTS;
  if (!Array.isArray(raw)) {
    const json = Array.isArray(content.projects) ? content.projects : [];
    const jsonSlugs = new Set(json.map((item) => item.slug));
    const missing = catalog.filter((item) => !jsonSlugs.has(item.slug));
    return [...missing, ...json].map((item) => normalizeProject(item, seed));
  }
  const seen: string[] = [];
  const cms = raw.map((item) => {
    const normalized = normalizeProject(item, seed);
    normalized.slug = uniqueProjectSlug(
      normalized.slug || normalized.title || "case-study",
      seen,
    );
    seen.push(normalized.slug);
    return normalized;
  });
  const cmsSlugs = new Set(cms.map((item) => item.slug));
  const missing = catalog
    .filter((item) => !cmsSlugs.has(item.slug))
    .map((item) => normalizeProject(item, seed));
  return [...missing, ...cms];
}

export const site = mergeSite(content.site);
export const pageIntros = mergePageIntros(content.pageIntros);
export const homeSections = mergeStringMap(DEFAULT_HOME_SECTIONS, content.homeSections);
export const footerCopy = mergeStringMap(DEFAULT_FOOTER_COPY, content.footerCopy);
export const seo: SeoMap = {
  ...content.seo,
  work: mergeWorkSeo(content.seo?.work),
};
export const hero = content.hero;
export const proof = content.proof;
export const services = content.services;
export const process = content.process;
export const disciplines = content.disciplines;
export const faq = content.faq;
export const packages = content.packages;
export const projects = mergeProjects(content.projects);
export const workPage = mergeWorkPage(content.workPage);
export const sectors = content.sectors;
export const stack = content.stack;
export const blogs: BlogPost[] = content.blogs ?? [];
export const pages: DynamicPage[] = content.pages ?? [];
export const legal: LegalContent = mergeLegal(content.legal);
export const servicePagesSeo: ServicePagesSeoMap = content.servicePagesSeo ?? {};
export const servicePagesContent: ServicePagesCmsMap = content.servicePagesContent ?? {};
export const servicePagesList = content.servicePagesList;

export function isServiceCategory(value: unknown): value is ServiceCategory {
  return SERVICE_CATEGORIES.includes(value as ServiceCategory);
}

function newNavId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeNavItem(item: Partial<NavItem> | null | undefined): NavItem {
  const children = Array.isArray(item?.children)
    ? item.children.map((child) => normalizeNavItem(child))
    : undefined;
  return {
    id: pickStr(item?.id, newNavId()),
    label: pickStr(item?.label, "Untitled"),
    href: pickStr(item?.href, "/"),
    ...(item?.hidden ? { hidden: true } : {}),
    ...(children ? { children } : {}),
  };
}

/** Default nav — used when no CMS nav has been saved yet */
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "work",     label: "Work",     href: "/work" },
  { id: "services", label: "Services", href: "/services" },
  { id: "pricing",  label: "Pricing",  href: "/pricing" },
  { id: "blog",     label: "Blog",     href: "/blog" },
  { id: "about",    label: "About",    href: "/about" },
  { id: "contact",  label: "Contact",  href: "/contact" },
];

/**
 * Merge CMS nav. An empty visible list is a real value (every item may be hidden).
 * Seed is used only when the list is missing entirely, not when it is empty.
 */
export function mergeNavItems(raw?: NavItem[] | null): NavItem[] {
  if (!Array.isArray(raw)) return DEFAULT_NAV_ITEMS.map((item) => normalizeNavItem(item));
  return raw.map((item) => normalizeNavItem(item));
}

export function isServicesNavItem(item: NavItem): boolean {
  return item.href === "/services" || item.id === "services";
}

/** Fill Services children from CMS pages only when children were never saved. */
export function hydrateServicesNavChildren(
  items: NavItem[],
  pages: { slug: string; title: string; hidden?: boolean }[],
): NavItem[] {
  return items.map((item) => {
    if (!isServicesNavItem(item) || item.children !== undefined) return item;
    return {
      ...item,
      children: pages.map((page) => ({
        id: `svc-${page.slug}`,
        label: page.title,
        href: `/services/${page.slug}`,
        ...(page.hidden ? { hidden: true } : {}),
      })),
    };
  });
}

export function navContainsHref(items: NavItem[], href: string): boolean {
  return items.some(
    (item) =>
      item.href === href ||
      (item.children ? navContainsHref(item.children, href) : false),
  );
}

export function appendNavChild(
  items: NavItem[],
  parentHref: string,
  child: NavItem,
): NavItem[] {
  return items.map((item) => {
    if (item.href !== parentHref) {
      return item.children
        ? { ...item, children: appendNavChild(item.children, parentHref, child) }
        : item;
    }
    const children = item.children ?? [];
    if (children.some((c) => c.href === child.href)) return item;
    return { ...item, children: [...children, child] };
  });
}

export function rewriteNavHrefs(items: NavItem[], from: string, to: string): NavItem[] {
  if (!from || from === to) return items;
  return items.map((item) => ({
    ...item,
    href: item.href === from ? to : item.href,
    ...(item.children ? { children: rewriteNavHrefs(item.children, from, to) } : {}),
  }));
}

export function setNavHrefsHidden(
  items: NavItem[],
  href: string,
  hidden: boolean,
): NavItem[] {
  return items.map((item) => ({
    ...item,
    hidden: item.href === href ? hidden : item.hidden,
    ...(item.children ? { children: setNavHrefsHidden(item.children, href, hidden) } : {}),
  }));
}

export const navItems: NavItem[] = mergeNavItems(content.navItems);

/** Legacy flat nav — kept for backward compat with any remaining consumers */
export const nav = navItems
  .filter((item) => !item.hidden)
  .map(({ label, href }) => ({ label, href }));

/**
 * Quote builder data stays in code — pricing structure changes rarely
 * and is part of business logic, not marketing copy.
 */
export {
  quoteServices,
  quoteExtras,
  quoteSizes,
  quoteSpeeds,
} from "@/lib/site";

export default content;
