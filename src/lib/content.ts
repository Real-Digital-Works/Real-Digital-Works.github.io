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
}

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

export type ProjectStatus = "Live sample" | "Indicative";

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
}

export interface NavItem {
  id: string;            // stable UUID for DnD key
  label: string;
  href: string;
  hidden?: boolean;
  children?: NavItem[];  // sub-navigation (max 1 level deep)
}

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
  navItems?: NavItem[];
  /** Per-slug SEO for public /services/[slug] pages (kept in sync with servicePagesContent) */
  servicePagesSeo?: ServicePagesSeoMap;
  /** Full CMS body for each public /services/[slug] page */
  servicePagesContent?: ServicePagesCmsMap;
  /**
   * Canonical ordered service list. Missing → seed the original 16 pages.
   * An empty array is a real value (user deleted every service).
   */
  servicePagesList?: CmsServiceRecord[];
}

// ─── Exported accessors ───────────────────────────────────────────────────────

const content = raw as Content;

function pickStr(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
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
  const status: ProjectStatus =
    item.status === "Live sample" || item.status === "Indicative"
      ? item.status
      : (fallback?.status ?? "Indicative");
  const image = pickStr(item.image, fallback?.image ?? "");
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
  };
}

/**
 * Merge CMS case studies. An empty array is a real value (user deleted every item).
 * Seed is used only when the list is missing entirely, not when it is empty.
 */
export function mergeProjects(raw?: Project[] | null): Project[] {
  const seed = Array.isArray(content.projects) ? content.projects : [];
  if (!Array.isArray(raw)) {
    return seed.map((item) => normalizeProject(item, seed));
  }
  const seen: string[] = [];
  return raw.map((item) => {
    const normalized = normalizeProject(item, seed);
    normalized.slug = uniqueProjectSlug(
      normalized.slug || normalized.title || "case-study",
      seen,
    );
    seen.push(normalized.slug);
    return normalized;
  });
}

export const site = content.site;
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
 * Merge CMS nav. An empty array is a real value (user deleted every item).
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
  pages: { slug: string; title: string }[],
): NavItem[] {
  return items.map((item) => {
    if (!isServicesNavItem(item) || item.children !== undefined) return item;
    return {
      ...item,
      children: pages.map((page) => ({
        id: `svc-${page.slug}`,
        label: page.title,
        href: `/services/${page.slug}`,
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

export function removeNavHrefs(items: NavItem[], href: string): NavItem[] {
  return items
    .filter((item) => item.href !== href)
    .map((item) =>
      item.children
        ? { ...item, children: removeNavHrefs(item.children, href) }
        : item,
    );
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
