/**
 * Visual live-preview CMS — path helpers, page SEO resolution, and the
 * development-only bypass. Production visitors never see this overlay.
 */
import type { Content, PageSeo } from "@/lib/content";
import {
  DEFAULT_FOOTER_COPY,
  DEFAULT_HOME_SECTIONS,
  mergeLegal,
  mergeNavItems,
  mergePageIntros,
  mergeProjects,
  mergeSite,
  mergeStringMap,
  mergeWorkPage,
  mergeWorkSeo,
} from "@/lib/content";
import { mergeQuoteCalc } from "@/lib/quote-calc";
import { CMS_HTML_ERROR, isHtmlCmsPath, sanitizeCmsHtml } from "@/lib/cms-html";
import { mergeCmsMaps } from "@/lib/cms-ui";
import {
  mergeServicePagesList,
  recordsToCmsMap,
  recordsToListingServices,
  recordsToSeoMap,
} from "@/lib/services-data";

export const VISUAL_QUERY = "visual";
export const VISUAL_STORAGE_KEY = "rdw-visual-dev";
/** Set when an admin clicks Live edit. Overlay stays off for public visitors. */
export const VISUAL_EDITOR_FLAG_KEY = "rdw-visual-editor";
export const VISUAL_HIDDEN_KEY = "rdw-visual-hidden";
export const VISUAL_EDITOR_EXIT_HREF = "/admin/dashboard";

/** True only in `next dev`. Never compiled into production behaviour for visitors. */
export function isVisualDevRuntime(): boolean {
  return process.env.NODE_ENV === "development";
}

function readCookieFlag(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim() === `${name}=1`);
}

function writeCookieFlag(name: string, on: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = on
    ? `${name}=1; path=/; SameSite=Lax`
    : `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function readVisualEditorFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(VISUAL_EDITOR_FLAG_KEY) === "1" || readCookieFlag(VISUAL_EDITOR_FLAG_KEY);
  } catch {
    return false;
  }
}

export function setVisualEditorFlag() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VISUAL_EDITOR_FLAG_KEY, "1");
    writeCookieFlag(VISUAL_EDITOR_FLAG_KEY, true);
    window.sessionStorage.removeItem(VISUAL_HIDDEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearVisualEditorFlag() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(VISUAL_EDITOR_FLAG_KEY);
    writeCookieFlag(VISUAL_EDITOR_FLAG_KEY, false);
    window.sessionStorage.removeItem(VISUAL_HIDDEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Admin chrome: cookie + localStorage only, then open `/`. No Firestore. */
export function startLiveEdit() {
  setVisualEditorFlag();
  window.location.assign("/");
}

export function readVisualDevBypass(): boolean {
  if (!isVisualDevRuntime() || typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(VISUAL_QUERY) === "1") {
      window.localStorage.setItem(VISUAL_STORAGE_KEY, "1");
      window.sessionStorage.removeItem(VISUAL_HIDDEN_KEY);
      return true;
    }
    return window.localStorage.getItem(VISUAL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearVisualDevBypass() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(VISUAL_STORAGE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete(VISUAL_QUERY);
    window.history.replaceState(null, "", url.toString());
  } catch {
    /* ignore */
  }
}

export type CmsPathKind = "plain" | "svc" | "project" | "legal";

export function getByPath(root: unknown, path: string): unknown {
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

function setOnClone(root: unknown, path: string, value: unknown): unknown {
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return value;
  const clone = structuredClone(root);
  let cur: unknown = clone;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const nextKey = parts[i + 1];
    const asObj = cur as Record<string, unknown>;
    const idx = Array.isArray(cur) && /^\d+$/.test(part) ? Number(part) : null;
    const child = idx != null ? (cur as unknown[])[idx] : asObj[part];
    const nextIsIndex = /^\d+$/.test(nextKey);
    const nextVal =
      child == null
        ? nextIsIndex
          ? []
          : {}
        : Array.isArray(child)
          ? [...child]
          : { ...(child as object) };
    if (idx != null) (cur as unknown[])[idx] = nextVal;
    else asObj[part] = nextVal;
    cur = nextVal;
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur) && /^\d+$/.test(last)) cur[Number(last)] = value;
  else (cur as Record<string, unknown>)[last] = value;
  return clone;
}

/**
 * Read a CMS string. Special prefixes:
 * - `svc.{slug}.intro`
 * - `project.{slug}.title`
 * - `legal.privacy.title`
 */
export function getCmsText(draft: Content, path: string): string {
  const value = getCmsValue(draft, path);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string").join(", ");
  return value == null ? "" : String(value);
}

export function getCmsValue(draft: Content, path: string): unknown {
  if (path.startsWith("svc.")) {
    const [, slug, ...rest] = path.split(".");
    const row = (draft.servicePagesList ?? []).find((item) => item.slug === slug);
    return rest.length ? getByPath(row, rest.join(".")) : row;
  }
  if (path.startsWith("project.")) {
    const [, slug, ...rest] = path.split(".");
    const row = draft.projects.find((item) => item.slug === slug);
    return rest.length ? getByPath(row, rest.join(".")) : row;
  }
  if (path.startsWith("cmsPage.")) {
    const [, slug, ...rest] = path.split(".");
    const row = (draft.pages ?? []).find((item) => item.slug === slug);
    return rest.length ? getByPath(row, rest.join(".")) : row;
  }
  if (path.startsWith("blogPost.")) {
    const [, slug, ...rest] = path.split(".");
    const row = (draft.blogs ?? []).find((item) => item.slug === slug);
    return rest.length ? getByPath(row, rest.join(".")) : row;
  }
  return getByPath(draft, path);
}

export function setCmsText(draft: Content, path: string, value: string): Content {
  let nextValue = value;
  if (isHtmlCmsPath(path)) {
    const cleaned = sanitizeCmsHtml(value);
    if (cleaned.valid) nextValue = cleaned.html;
  }
  if (path.startsWith("svc.")) {
    const [, slug, ...rest] = path.split(".");
    const list = (draft.servicePagesList ?? []).map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), nextValue) as typeof row;
    });
    return { ...draft, servicePagesList: list };
  }
  if (path.startsWith("project.")) {
    const [, slug, ...rest] = path.split(".");
    const projects = draft.projects.map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), nextValue) as typeof row;
    });
    return { ...draft, projects };
  }
  if (path.startsWith("cmsPage.")) {
    const [, slug, ...rest] = path.split(".");
    const pages = (draft.pages ?? []).map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), nextValue) as typeof row;
    });
    return { ...draft, pages };
  }
  if (path.startsWith("blogPost.")) {
    const [, slug, ...rest] = path.split(".");
    const blogs = (draft.blogs ?? []).map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), nextValue) as typeof row;
    });
    return { ...draft, blogs };
  }
  if (path.endsWith(".keywords") && typeof getByPath(draft, path) !== "string") {
    const keywords = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return setOnClone(draft, path, keywords) as Content;
  }
  let next = setOnClone(draft, path, nextValue) as Content;
  if (path === "site.email") {
    next = setOnClone(next, "site.emailHref", `mailto:${nextValue.trim()}`) as Content;
  }
  return next;
}

export type VisualSeoTarget = {
  label: string;
  title: string;
  description: string;
  keywords: string[];
  apply: (draft: Content, next: { title: string; description: string; keywords: string[] }) => Content;
};

export function resolveVisualSeo(pathname: string, draft: Content): VisualSeoTarget {
  const path = pathname.replace(/\/$/, "") || "/";

  const pageKey = (
    {
      "/": "home",
      "/services": "services",
      "/pricing": "pricing",
      "/about": "about",
      "/contact": "contact",
      "/work": "work",
    } as const
  )[path];

  if (pageKey) {
    const seo = draft.seo[pageKey];
    return {
      label: pageKey === "home" ? "Home" : pageKey[0].toUpperCase() + pageKey.slice(1),
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords ?? [],
      apply: (current, next) => ({
        ...current,
        seo: { ...current.seo, [pageKey]: next },
      }),
    };
  }

  const serviceMatch = path.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const slug = serviceMatch[1];
    const row = (draft.servicePagesList ?? []).find((item) => item.slug === slug);
    const fallback: PageSeo = {
      title: row?.seoTitle ?? slug,
      description: row?.seoDescription ?? "",
      keywords: row?.keywords ?? [],
    };
    return {
      label: row?.title ?? slug,
      title: fallback.title,
      description: fallback.description,
      keywords: fallback.keywords,
      apply: (current, next) => ({
        ...current,
        servicePagesList: (current.servicePagesList ?? []).map((item) =>
          item.slug === slug
            ? {
                ...item,
                seoTitle: next.title,
                seoDescription: next.description,
                keywords: next.keywords,
              }
            : item,
        ),
      }),
    };
  }

  const workMatch = path.match(/^\/work\/([^/]+)$/);
  if (workMatch) {
    const slug = workMatch[1];
    const row = draft.projects.find((item) => item.slug === slug);
    return {
      label: row?.title ?? slug,
      title: row ? `${row.title} — ${row.kind}` : slug,
      description: row?.summary ?? "",
      keywords: row?.tags ?? [],
      apply: (current, next) => ({
        ...current,
        projects: current.projects.map((item) =>
          item.slug === slug
            ? { ...item, summary: next.description, tags: next.keywords }
            : item,
        ),
      }),
    };
  }

  const legalKey =
    path === "/privacy"
      ? "privacy"
      : path === "/terms"
        ? "terms"
        : path === "/modern-slavery"
          ? "modernSlavery"
          : null;
  if (legalKey && draft.legal) {
    const page = draft.legal[legalKey];
    return {
      label: page.title || legalKey,
      title: page.seoTitle,
      description: page.seoDescription,
      keywords: [],
      apply: (current, next) => ({
        ...current,
        legal: {
          privacy: current.legal?.privacy ?? page,
          terms: current.legal?.terms ?? page,
          modernSlavery: current.legal?.modernSlavery ?? page,
          ...current.legal,
          [legalKey]: {
            ...(current.legal?.[legalKey] ?? page),
            seoTitle: next.title,
            seoDescription: next.description,
          },
        },
      }),
    };
  }

  return {
    label: "This page",
    title: "",
    description: "",
    keywords: [],
    apply: (current) => current,
  };
}

export const VISUAL_PAGES = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Legal" },
] as const;

export function hydrateVisualDraft(seed: Content, live?: Record<string, unknown> | null): Content {
  const d = live ?? {};
  const list = mergeServicePagesList(
    (d.servicePagesList as Content["servicePagesList"]) ?? seed.servicePagesList,
    (d.servicePagesContent as Content["servicePagesContent"]) ?? seed.servicePagesContent,
    (d.servicePagesSeo as Content["servicePagesSeo"]) ?? seed.servicePagesSeo,
  );
  const liveSeo = (d.seo as Content["seo"] | undefined) ?? seed.seo;
  return {
    ...seed,
    site: mergeSite((d.site as Content["site"]) ?? seed.site, seed.site),
    seo: {
      ...seed.seo,
      ...liveSeo,
      work: mergeWorkSeo(liveSeo?.work),
    },
    hero: (d.hero as Content["hero"]) ?? seed.hero,
    proof: Array.isArray(d.proof) ? (d.proof as Content["proof"]) : seed.proof,
    services: recordsToListingServices(list),
    process: Array.isArray(d.process) ? (d.process as Content["process"]) : seed.process,
    disciplines: Array.isArray(d.disciplines)
      ? (d.disciplines as Content["disciplines"])
      : seed.disciplines,
    faq: Array.isArray(d.faq) ? (d.faq as Content["faq"]) : seed.faq,
    packages: Array.isArray(d.packages) ? (d.packages as Content["packages"]) : seed.packages,
    projects: mergeProjects(Array.isArray(d.projects) ? (d.projects as Content["projects"]) : seed.projects),
    workPage: mergeWorkPage((d.workPage as Content["workPage"]) ?? seed.workPage),
    sectors: Array.isArray(d.sectors) ? (d.sectors as string[]) : seed.sectors,
    stack: Array.isArray(d.stack) ? (d.stack as string[]) : seed.stack,
    blogs: Array.isArray(d.blogs) ? (d.blogs as Content["blogs"]) : seed.blogs,
    pages: Array.isArray(d.pages) ? (d.pages as Content["pages"]) : seed.pages,
    navItems: Array.isArray(d.navItems)
      ? mergeNavItems(d.navItems as Content["navItems"])
      : mergeNavItems(seed.navItems),
    legal: mergeLegal((d.legal as Content["legal"]) ?? seed.legal),
    servicePagesList: list,
    servicePagesContent: recordsToCmsMap(list),
    servicePagesSeo: recordsToSeoMap(list),
    ctas: mergeCmsMaps((d.ctas as Content["ctas"]) ?? seed.ctas),
    popups: mergeCmsMaps((d.popups as Content["popups"]) ?? seed.popups),
    pageIntros: mergePageIntros(
      (d.pageIntros as Content["pageIntros"]) ?? seed.pageIntros,
    ),
    homeSections: mergeStringMap(
      DEFAULT_HOME_SECTIONS,
      (d.homeSections as Content["homeSections"]) ?? seed.homeSections,
    ),
    footerCopy: mergeStringMap(
      DEFAULT_FOOTER_COPY,
      (d.footerCopy as Content["footerCopy"]) ?? seed.footerCopy,
    ),
    quoteCalc: mergeQuoteCalc((d.quoteCalc as Content["quoteCalc"]) ?? seed.quoteCalc),
  };
}

export function visualSavePayload(draft: Content) {
  const list = draft.servicePagesList ?? [];
  return {
    site: draft.site,
    seo: draft.seo,
    hero: draft.hero,
    workPage: draft.workPage,
    services: recordsToListingServices(list),
    servicePagesList: list,
    servicePagesContent: recordsToCmsMap(list),
    servicePagesSeo: recordsToSeoMap(list),
    faq: draft.faq,
    packages: draft.packages,
    projects: draft.projects,
    process: draft.process,
    disciplines: draft.disciplines,
    legal: draft.legal,
    navItems: draft.navItems,
    blogs: draft.blogs,
    pages: draft.pages,
    ctas: draft.ctas ?? {},
    popups: draft.popups ?? {},
    pageIntros: draft.pageIntros ?? mergePageIntros(null),
    homeSections: draft.homeSections ?? DEFAULT_HOME_SECTIONS,
    footerCopy: draft.footerCopy ?? DEFAULT_FOOTER_COPY,
    quoteCalc: mergeQuoteCalc(draft.quoteCalc),
  };
}

export function validateDraftHtml(draft: Content): string | null {
  const paths: string[] = ["hero.sub"];
  (draft.process ?? []).forEach((_, i) => paths.push(`process.${i}.body`));
  (draft.faq ?? []).forEach((_, i) => paths.push(`faq.${i}.a`));
  (draft.disciplines ?? []).forEach((_, i) => paths.push(`disciplines.${i}.body`));
  for (const key of ["privacy", "terms", "modernSlavery"] as const) {
    paths.push(`legal.${key}.body`);
  }
  for (const project of draft.projects ?? []) {
    paths.push(`project.${project.slug}.problem`, `project.${project.slug}.work`, `project.${project.slug}.outcome`);
  }
  for (const row of draft.servicePagesList ?? []) {
    paths.push(`svc.${row.slug}.detail`);
  }
  for (const blog of draft.blogs ?? []) {
    paths.push(`blogs.${(draft.blogs ?? []).indexOf(blog)}.content`);
  }
  for (const page of draft.pages ?? []) {
    paths.push(`pages.${(draft.pages ?? []).indexOf(page)}.content`);
  }
  for (const path of paths) {
    if (!isHtmlCmsPath(path)) continue;
    const value = getCmsText(draft, path);
    if (!value) continue;
    const result = sanitizeCmsHtml(value);
    if (!result.valid) return result.error ?? CMS_HTML_ERROR;
  }
  return null;
}

export function fieldLabel(path: string): string {
  const pretty = (value: string) =>
    value
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^./, (c) => c.toUpperCase());
  if (path.startsWith("svc.")) {
    const [, slug, ...rest] = path.split(".");
    return `${pretty(rest[rest.length - 1] ?? slug)} · ${pretty((slug ?? "").replace(/-/g, " "))}`;
  }
  if (path.startsWith("site.")) {
    const key = path.slice(5);
    const labels: Record<string, string> = {
      phone: "Studio phone",
      phoneHref: "Studio phone link",
      email: "Studio email",
      emailHref: "Studio email link",
      name: "Studio name",
      parent: "Parent company",
      footerBlurb: "Studio description",
      copyright: "Copyright",
      hours: "Studio hours",
      tagline: "Tagline",
      whatsapp: "WhatsApp",
    };
    if (key.startsWith("address.")) {
      return `Studio address line ${Number(key.split(".")[1]) + 1}`;
    }
    return labels[key] ?? pretty(key);
  }
  if (path.startsWith("pageIntros.")) {
    const [, page, field] = path.split(".");
    const fieldName =
      field === "headline" ? "heading" : field === "sub" ? "intro" : pretty(field);
    return `${pretty(page)} ${fieldName}`;
  }
  if (path.startsWith("homeSections.")) {
    const key = path.slice("homeSections.".length);
    const labels: Record<string, string> = {
      scrollCue: "Scroll cue",
      offerEyebrow: "Offer eyebrow",
      offerTitle: "Offer heading",
      offerOpen: "Open services label",
      offerMobileEyebrow: "Offer mobile eyebrow",
      unpack: "Unpack label",
      deskEyebrow: "Enquiry desk eyebrow",
      deskTitle: "Enquiry desk heading",
      deskIntro: "Enquiry desk intro",
      workEyebrow: "Work eyebrow",
      workTitle: "Work heading",
      openCase: "Open case label",
      processEyebrow: "Process eyebrow",
      faqEyebrow: "Questions eyebrow",
      faqTitle: "Questions heading",
    };
    return labels[key] ?? pretty(key);
  }
  if (path.startsWith("footerCopy.")) {
    const key = path.slice("footerCopy.".length);
    const labels: Record<string, string> = {
      colStudio: "Studio heading",
      colCompany: "Company heading",
      colBuild: "Build heading",
      colGrow: "Grow heading",
      colCreate: "Create heading",
      colSupport: "Support heading",
    };
    return labels[key] ?? pretty(key.replace(/^col/, ""));
  }
  if (path.startsWith("legal.")) {
    const [, page, field] = path.split(".");
    const pages: Record<string, string> = {
      privacy: "Privacy",
      terms: "Terms",
      modernSlavery: "Modern slavery",
    };
    const fields: Record<string, string> = {
      title: "heading",
      body: "body",
      seoTitle: "SEO title",
      seoDescription: "SEO description",
    };
    return `${pages[page] ?? pretty(page)} ${fields[field] ?? pretty(field ?? "")}`.trim();
  }
  const faqMatch = path.match(/^faq\.(\d+)\.(q|a)$/);
  if (faqMatch) {
    return `Question ${Number(faqMatch[1]) + 1} ${faqMatch[2] === "q" ? "title" : "answer"}`;
  }
  const processMatch = path.match(/^process\.(\d+)\.(title|body)$/);
  if (processMatch) {
    return `Step ${Number(processMatch[1]) + 1} ${processMatch[2] === "title" ? "title" : "body"}`;
  }
  if (path.startsWith("quoteCalc.")) {
    const key = path.slice("quoteCalc.".length);
    const labels: Record<string, string> = {
      currency: "Currency",
      prefix: "Price prefix",
      suffix: "Price suffix",
      totalMode: "Estimate mode",
      customTotal: "Custom total",
    };
    return labels[key] ?? pretty(key);
  }
  if (path.startsWith("hero.")) {
    const key = path.slice(5);
    const labels: Record<string, string> = {
      eyebrow: "Eyebrow",
      headline: "Heading",
      sub: "Intro",
      primaryCta: "Primary button",
      secondaryCta: "Secondary button",
    };
    return labels[key] ?? pretty(key);
  }
  const last = path.split(".").pop() ?? path;
  return pretty(last);
}
