/**
 * Visual live-preview CMS — path helpers, page SEO resolution, and the
 * development-only bypass. Production visitors never see this overlay.
 */
import type { Content, PageSeo } from "@/lib/content";
import {
  mergeLegal,
  mergeNavItems,
  mergeProjects,
  mergeWorkPage,
  mergeWorkSeo,
} from "@/lib/content";
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

/** Admin chrome: turn the overlay on, then open the public site. */
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
  return getByPath(draft, path);
}

export function setCmsText(draft: Content, path: string, value: string): Content {
  if (path.startsWith("svc.")) {
    const [, slug, ...rest] = path.split(".");
    const list = (draft.servicePagesList ?? []).map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), value) as typeof row;
    });
    return { ...draft, servicePagesList: list };
  }
  if (path.startsWith("project.")) {
    const [, slug, ...rest] = path.split(".");
    const projects = draft.projects.map((row) => {
      if (row.slug !== slug) return row;
      return setOnClone(row, rest.join("."), value) as typeof row;
    });
    return { ...draft, projects };
  }
  if (path.endsWith(".keywords") && typeof getByPath(draft, path) !== "string") {
    const keywords = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return setOnClone(draft, path, keywords) as Content;
  }
  return setOnClone(draft, path, value) as Content;
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
  { href: "/services/seo", label: "SEO service" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/modern-slavery", label: "Modern slavery" },
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
    site: (d.site as Content["site"]) ?? seed.site,
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
  };
}

export function fieldLabel(path: string): string {
  const last = path.split(".").pop() ?? path;
  return last.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
