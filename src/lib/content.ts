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

export function mergeProjects(raw?: Project[] | null): Project[] {
  const seed = content.projects ?? [];
  if (!Array.isArray(raw) || raw.length === 0) return seed;
  return raw
    .map((item) => {
      const fallback = seed.find((p) => p.slug === item.slug);
      const slug = pickStr(item.slug, fallback?.slug ?? "");
      const tags =
        Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : (fallback?.tags ?? []);
      const status: ProjectStatus =
        item.status === "Live sample" || item.status === "Indicative"
          ? item.status
          : (fallback?.status ?? "Indicative");
      const image = pickStr(item.image, fallback?.image ?? "");
      return {
        slug,
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
    })
    .filter((p) => p.slug);
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

export const navItems: NavItem[] =
  content.navItems && content.navItems.length > 0
    ? content.navItems
    : DEFAULT_NAV_ITEMS;

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
