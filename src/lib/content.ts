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
  sectors: string[];
  stack: string[];
  blogs: BlogPost[];
  pages: DynamicPage[];
  navItems?: NavItem[];
}

// ─── Exported accessors ───────────────────────────────────────────────────────

const content = raw as Content;

export const site = content.site;
export const seo = content.seo;
export const hero = content.hero;
export const proof = content.proof;
export const services = content.services;
export const process = content.process;
export const disciplines = content.disciplines;
export const faq = content.faq;
export const packages = content.packages;
export const projects = content.projects;
export const sectors = content.sectors;
export const stack = content.stack;
export const blogs: BlogPost[] = content.blogs ?? [];
export const pages: DynamicPage[] = content.pages ?? [];

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
