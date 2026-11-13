"use client";

/**
 * Admin dashboard — content editor.
 *
 * Tabs:
 *   Site Info | SEO | Hero | Services | Work | FAQ | Pricing | Projects | Blog | Pages | Legal | Deploy
 */

import { useEffect, useState, useCallback, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { cmsContentDoc, saveLiveCmsContent } from "@/lib/cms-save";
import {
  cmsRevisionFromData,
  cmsRevisionsMatch,
  EMPTY_CMS_REVISION,
  isStaleCmsContentError,
  type CmsRevisionToken,
} from "@/lib/cms-revision";
import {
  cmsVersionsCollection,
  mapCmsVersionDoc,
  type CmsSaveSource,
  type CmsVersionRow,
} from "@/lib/cms-versions";
import { CmsRemoteVersionBanner, CmsStaleSaveModal } from "@/components/CmsStaleNotice";
import { isPermissionDenied, logFirestoreIssue } from "@/lib/firestore-errors";
import content, {
  DEFAULT_NAV_ITEMS,
  appendNavChild,
  createBlankProject,
  hydrateServicesNavChildren,
  mergeLegal,
  mergeNavItems,
  mergeProjects,
  mergeWorkPage,
  mergeWorkSeo,
  navContainsHref,
  rewriteNavHrefs,
  setNavHrefsHidden,
  slugifyProjectTitle,
  slugifyServiceTitle,
  uniqueProjectSlug,
  uniqueServiceSlug,
  type CmsServiceRecord,
  type Content,
} from "@/lib/content";
import type {
  SiteInfo,
  PageSeo,
  HeroContent,
  FaqItem,
  Package,
  Project,
  WorkPageContent,
  BlogPost,
  DynamicPage,
  ProcessStep,
  Discipline,
  NavItem,
  LegalContent,
  LegalPageContent,
} from "@/lib/content";
import {
  createBlankService,
  mergeServicePagesList,
  recordsToCmsMap,
  recordsToListingServices,
  recordsToSeoMap,
} from "@/lib/services-data";
import { RichTextEditor } from "@/components/RichTextEditor";
import { NavEditor, type NavPageOption } from "@/components/NavEditor";
import { ServiceEditor } from "@/components/ServiceEditor";
import { AdminThemeToggle } from "@/components/AdminTheme";
import { startLiveEdit } from "@/lib/visual-editor";
import { WorkImageField } from "@/components/WorkImageField";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "site"
  | "seo"
  | "hero"
  | "services"
  | "work"
  | "faq"
  | "pricing"
  | "projects"
  | "about"
  | "nav"
  | "blog"
  | "pages"
  | "legal"
  | "users"
  | "deploy";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  textarea,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  const base =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC] transition";
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">
        {label}
      </label>
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${base} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {sub && <p className="mt-1 text-sm text-white/40">{sub}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/4 p-6 ${className}`}>
      {children}
    </div>
  );
}

const HIDE_HINT = "Hidden from menus and listings. The URL still works.";

function firestoreDateString(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const row = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof row.toDate === "function") return row.toDate().toISOString();
    const seconds = row.seconds ?? row._seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000).toISOString();
  }
  return "";
}

function normalizeBlogPost(slug: string, data: Record<string, unknown>): BlogPost {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    content: typeof data.content === "string" ? data.content : "",
    coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
    publishedAt: firestoreDateString(data.publishedAt) || new Date().toISOString().split("T")[0],
    status: data.status === "published" ? "published" : "draft",
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : "",
    seoDescription: typeof data.seoDescription === "string" ? data.seoDescription : "",
    hidden: Boolean(data.hidden),
  };
}

function blogDocPayload(post: BlogPost): Record<string, unknown> {
  const dateOnly = (post.publishedAt ?? "").split("T")[0];
  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(dateOnly)
    ? `${dateOnly}T00:00:00.000Z`
    : post.publishedAt || new Date().toISOString();
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    publishedAt,
    status: post.status === "published" ? "published" : "draft",
    tags: post.tags ?? [],
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    hidden: Boolean(post.hidden),
    ...(post.coverImage ? { coverImage: post.coverImage } : {}),
  };
}

function CaseStudyList({
  projects,
  onPatch,
  onRemove,
  onMove,
  onAdd,
}: {
  projects: Project[];
  onPatch: (index: number, patch: Partial<Project>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onAdd: () => void;
}) {
  return (
    <>
      {projects.length === 0 && (
        <p className="mb-4 text-sm text-white/40">
          No case studies. The public /work page will show an empty list until you add one.
        </p>
      )}
      {projects.map((proj, i) => (
        <Card key={i} className={`space-y-4 ${proj.hidden ? "opacity-70" : ""}`}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full" style={{ background: proj.accent }} />
            <h3 className="text-sm font-semibold text-white/80">{proj.title || "Untitled"}</h3>
            {proj.hidden ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                Hidden
              </span>
            ) : null}
            <span className="ml-auto font-mono text-[11px] text-white/40">/work/{proj.slug}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onMove(i, -1)}
              disabled={i === 0}
              className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
            >
              ↑ Up
            </button>
            <button
              type="button"
              onClick={() => onMove(i, 1)}
              disabled={i === projects.length - 1}
              className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
            >
              ↓ Down
            </button>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-auto text-xs text-red-400/60 hover:text-red-400"
              title={HIDE_HINT}
            >
              {proj.hidden ? "Unhide" : "Hide"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project title" value={proj.title} onChange={(v) => onPatch(i, { title: v })} />
            <Field
              label="Slug (URL)"
              value={proj.slug}
              onChange={(v) => onPatch(i, { slug: v })}
              hint="/work/your-slug — generated from the title, editable, must be unique."
            />
          </div>
          <Field label="Client" value={proj.client} onChange={(v) => onPatch(i, { client: v })} />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Year" value={proj.year} onChange={(v) => onPatch(i, { year: v })} />
            <Field label="Kind" value={proj.kind} onChange={(v) => onPatch(i, { kind: v })} />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Status</label>
              <select
                value={proj.status}
                onChange={(e) => onPatch(i, { status: e.target.value as Project["status"] })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
              >
                <option value="Live">Live</option>
                <option value="Live sample">Live sample</option>
                <option value="Indicative">Indicative</option>
              </select>
            </div>
          </div>
          <Field
            label="Summary (card text)"
            value={proj.summary}
            textarea
            onChange={(v) => onPatch(i, { summary: v })}
            hint="Shown on /work and the case-study page intro."
          />
          <Field
            label="Tags (comma separated)"
            value={proj.tags.join(", ")}
            onChange={(v) =>
              onPatch(i, {
                tags: v.split(",").map((k) => k.trim()).filter(Boolean),
              })
            }
            hint="Pills on the individual /work/{slug} page."
          />
          <Field
            label="Accent colour"
            value={proj.accent}
            onChange={(v) => onPatch(i, { accent: v })}
            hint="#hex used for the card when there is no image."
          />
          <WorkImageField
            value={proj.image ?? ""}
            slug={proj.slug}
            onChange={(v) => onPatch(i, { image: v })}
          />
          <Field
            label="Live site URL"
            value={proj.liveUrl ?? ""}
            onChange={(v) => onPatch(i, { liveUrl: v })}
            hint="Shown as Visit site on /work/{slug}. Leave empty if there is no public URL."
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">The problem</label>
            <RichTextEditor content={proj.problem} onChange={(html) => onPatch(i, { problem: html })} placeholder="Describe the challenge…" minHeight="120px" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">The work</label>
            <RichTextEditor content={proj.work} onChange={(html) => onPatch(i, { work: html })} placeholder="Describe what was done…" minHeight="120px" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">The outcome</label>
            <RichTextEditor content={proj.outcome} onChange={(html) => onPatch(i, { outcome: html })} placeholder="Describe the result…" minHeight="120px" />
          </div>
        </Card>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-white/40 transition hover:border-white/30 hover:text-white/60"
      >
        + Add case study
      </button>
    </>
  );
}

function StatusBadge({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { label: string; cls: string }> = {
    idle: { label: "", cls: "" },
    unsaved: { label: "Unsaved changes", cls: "text-yellow-400 bg-yellow-400/10" },
    saving: { label: "Saving…", cls: "text-blue-400 bg-blue-400/10" },
    saved: { label: "✓ Saved", cls: "text-green-400 bg-green-400/10" },
    error: { label: "Save failed", cls: "text-red-400 bg-red-400/10" },
  };
  if (status === "idle") return null;
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("site");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "done" | "error">("idle");

  // ── Content state ──
  const [siteData, setSiteData] = useState<SiteInfo>(content.site);
  const [seoData, setSeoData] = useState(() => ({
    ...content.seo,
    work: mergeWorkSeo(content.seo.work),
  }));
  const [heroData, setHeroData] = useState<HeroContent>(content.hero);
  const [workPageData, setWorkPageData] = useState<WorkPageContent>(() =>
    mergeWorkPage(content.workPage),
  );
  const [servicePagesList, setServicePagesList] = useState<CmsServiceRecord[]>(() =>
    mergeServicePagesList(content.servicePagesList, content.servicePagesContent, content.servicePagesSeo),
  );
  const [openServiceSlug, setOpenServiceSlug] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FaqItem[]>(content.faq);
  const [packagesData, setPackagesData] = useState<Package[]>(content.packages);
  const [projectsData, setProjectsData] = useState<Project[]>(() =>
    mergeProjects(content.projects),
  );
  const [processData, setProcessData] = useState<ProcessStep[]>(content.process);
  const [disciplinesData, setDisciplinesData] = useState<Discipline[]>(content.disciplines);
  const [navData, setNavData] = useState<NavItem[]>(() =>
    hydrateServicesNavChildren(
      mergeNavItems(content.navItems),
      mergeServicePagesList(content.servicePagesList, content.servicePagesContent, content.servicePagesSeo),
    ),
  );
  const [blogsData, setBlogsData] = useState<BlogPost[]>([]);
  const [pagesData, setPagesData] = useState<DynamicPage[]>([]);
  const [legalData, setLegalData] = useState<LegalContent>(() => mergeLegal(content.legal));
  const [ctasData, setCtasData] = useState<Content["ctas"]>(content.ctas ?? {});
  const [popupsData, setPopupsData] = useState<Content["popups"]>(content.popups ?? {});
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [deployHook, setDeployHook] = useState("");
  const [hookConfigured, setHookConfigured] = useState(false);
  const [hookSource, setHookSource] = useState<"firestore" | "env" | "none">("none");
  const [hookDisplay, setHookDisplay] = useState("");
  const [versions, setVersions] = useState<CmsVersionRow[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [remoteNewer, setRemoteNewer] = useState(false);
  const [staleSaveOpen, setStaleSaveOpen] = useState(false);
  const loadedRevisionRef = useRef<CmsRevisionToken>(EMPTY_CMS_REVISION);
  const remoteRevisionRef = useRef<CmsRevisionToken>(EMPTY_CMS_REVISION);
  const dismissedRemoteRef = useRef<CmsRevisionToken | null>(null);
  const cmsReadyRef = useRef(false);

  // ── Users state ──
  type AdminUser = { uid: string; email?: string; displayName: string | null; createdAt?: string; lastSignIn: string | null; emailVerified: boolean; };
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // ── Auth guard ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth(), (u) => {
      if (!u) { router.replace("/admin/login"); return; }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  const applyLiveContent = useCallback((d: Record<string, unknown>) => {
    if (d.site) setSiteData(d.site as SiteInfo);
    if (d.seo) {
      const liveSeo = d.seo as typeof content.seo;
      setSeoData({
        ...content.seo,
        ...liveSeo,
        work: mergeWorkSeo(liveSeo.work),
      });
    }
    if (d.hero) setHeroData(d.hero as HeroContent);
    setWorkPageData(mergeWorkPage(d.workPage as Partial<WorkPageContent> | undefined));
    const nextServices = mergeServicePagesList(
      d.servicePagesList as CmsServiceRecord[] | undefined,
      d.servicePagesContent as Parameters<typeof mergeServicePagesList>[1],
      d.servicePagesSeo as Parameters<typeof mergeServicePagesList>[2],
    );
    setServicePagesList(nextServices);
    if (d.faq) setFaqData(d.faq as FaqItem[]);
    if (d.packages) setPackagesData(d.packages as Package[]);
    if (Array.isArray(d.projects)) setProjectsData(mergeProjects(d.projects as Project[]));
    if (d.process) setProcessData(d.process as ProcessStep[]);
    if (d.disciplines) setDisciplinesData(d.disciplines as Discipline[]);
    setLegalData(mergeLegal(d.legal as Partial<LegalContent> | undefined));
    if (Array.isArray(d.navItems)) {
      setNavData(hydrateServicesNavChildren(mergeNavItems(d.navItems as NavItem[]), nextServices));
    } else {
      setNavData(hydrateServicesNavChildren(DEFAULT_NAV_ITEMS, nextServices));
    }
    setCtasData((d.ctas as Content["ctas"]) ?? {});
    setPopupsData((d.popups as Content["popups"]) ?? {});
  }, []);

  // ── Load from Firestore ──
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const snap = await getDoc(cmsContentDoc());
        if (snap.exists()) {
          const data = snap.data() as Record<string, unknown>;
          applyLiveContent(data);
          loadedRevisionRef.current = cmsRevisionFromData(data);
        }
      } catch (e) {
        logFirestoreIssue("cms/content read", e);
      }
      try {
        const blogsSnap = await getDocs(collection(db(), "blogs"));
        const blogs = blogsSnap.docs.map((d) =>
          normalizeBlogPost(d.id, d.data() as Record<string, unknown>),
        );
        setBlogsData(
          blogs.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
        );
      } catch (e) {
        logFirestoreIssue("blogs list", e);
      }
      try {
        const pagesSnap = await getDocs(collection(db(), "pages"));
        const pages = pagesSnap.docs.map((d) => ({ slug: d.id, ...d.data() } as DynamicPage));
        setPagesData(pages);
      } catch (e) {
        logFirestoreIssue("pages list", e);
      }
      cmsReadyRef.current = true;
    }
    load();
  }, [user, applyLiveContent]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      cmsContentDoc(),
      (snap) => {
        if (!cmsReadyRef.current || !snap.exists()) return;
        const remote = cmsRevisionFromData(snap.data() as Record<string, unknown>);
        remoteRevisionRef.current = remote;
        if (cmsRevisionsMatch(loadedRevisionRef.current, remote)) {
          setRemoteNewer(false);
          return;
        }
        if (
          dismissedRemoteRef.current &&
          cmsRevisionsMatch(dismissedRemoteRef.current, remote)
        ) {
          return;
        }
        setRemoteNewer(true);
      },
      (error) => {
        logFirestoreIssue("cms/content listen", error);
      },
    );
    return unsub;
  }, [user]);

  // ── Mark unsaved on any edit ──
  const markUnsaved = useCallback(() => setStatus("unsaved"), []);

  const patchService = useCallback(
    (index: number, patch: Partial<CmsServiceRecord>) => {
      const current = servicePagesList[index];
      if (!current) return;
      const next = servicePagesList.map((row) => ({ ...row, relatedSlugs: [...row.relatedSlugs] }));
      const merged: CmsServiceRecord = { ...current, ...patch };
      const slugs = next.map((item) => item.slug);
      const previousSlug = current.slug;
      if (patch.slug !== undefined) {
        merged.slug = uniqueServiceSlug(patch.slug, slugs, index);
      } else if (patch.title !== undefined) {
        const previousAuto = slugifyServiceTitle(current.title);
        if (!current.slug || current.slug === previousAuto) {
          merged.slug = uniqueServiceSlug(patch.title, slugs, index);
        }
        if (!current.listingTitle || current.listingTitle === current.title) {
          merged.listingTitle = patch.title;
        }
      }
      if (merged.slug !== previousSlug) {
        for (let i = 0; i < next.length; i += 1) {
          if (i === index) continue;
          next[i].relatedSlugs = next[i].relatedSlugs.map((rel) =>
            rel === previousSlug ? merged.slug : rel,
          );
        }
        setNavData((nav) =>
          rewriteNavHrefs(nav, `/services/${previousSlug}`, `/services/${merged.slug}`),
        );
        setOpenServiceSlug(merged.slug);
      }
      next[index] = merged;
      setServicePagesList(next);
      markUnsaved();
    },
    [markUnsaved, servicePagesList],
  );

  const addService = useCallback(() => {
    const blank = createBlankService(servicePagesList.map((item) => item.slug));
    setServicePagesList((list) => [...list, blank]);
    setOpenServiceSlug(blank.slug);
    const href = `/services/${blank.slug}`;
    if (
      !navContainsHref(navData, href) &&
      confirm(`Add "${blank.title}" to the Services menu? You can still pick the page later from Navigation.`)
    ) {
      setNavData((nav) =>
        appendNavChild(nav, "/services", {
          id: `svc-${blank.slug}`,
          label: blank.title,
          href,
        }),
      );
    }
    markUnsaved();
  }, [markUnsaved, navData, servicePagesList]);

  const removeService = useCallback(
    (index: number) => {
      const item = servicePagesList[index];
      const label = item?.title || item?.slug || "this service";
      const nextHidden = !item?.hidden;
      if (
        nextHidden &&
        !confirm(
          `Hide "${label}"? ${HIDE_HINT} Save & Deploy to update listings.`,
        )
      ) {
        return;
      }
      const slug = item?.slug;
      setServicePagesList((list) =>
        list.map((row, i) => (i === index ? { ...row, hidden: nextHidden } : row)),
      );
      if (slug) {
        setNavData((nav) => setNavHrefsHidden(nav, `/services/${slug}`, nextHidden));
      }
      markUnsaved();
    },
    [markUnsaved, servicePagesList],
  );

  const moveService = useCallback(
    (index: number, dir: -1 | 1) => {
      setServicePagesList((list) => {
        const target = index + dir;
        if (target < 0 || target >= list.length) return list;
        const next = [...list];
        const [row] = next.splice(index, 1);
        next.splice(target, 0, row);
        return next;
      });
      markUnsaved();
    },
    [markUnsaved],
  );

  const patchProject = useCallback(
    (index: number, patch: Partial<Project>) => {
      setProjectsData((p) => {
        const next = [...p];
        const current = next[index];
        if (!current) return p;
        const merged: Project = { ...current, ...patch };
        const slugs = next.map((item) => item.slug);
        if (patch.slug !== undefined) {
          merged.slug = uniqueProjectSlug(patch.slug, slugs, index);
        } else if (patch.title !== undefined) {
          const previousAuto = slugifyProjectTitle(current.title);
          if (!current.slug || current.slug === previousAuto) {
            merged.slug = uniqueProjectSlug(patch.title, slugs, index);
          }
        }
        next[index] = merged;
        return next;
      });
      markUnsaved();
    },
    [markUnsaved],
  );

  const addProject = useCallback(() => {
    setProjectsData((p) => [...p, createBlankProject(p.map((item) => item.slug))]);
    markUnsaved();
  }, [markUnsaved]);

  const removeProject = useCallback(
    (index: number) => {
      const item = projectsData[index];
      const label = item?.title || item?.slug || "this case study";
      const nextHidden = !item?.hidden;
      if (
        nextHidden &&
        !confirm(`Hide "${label}" from /work? ${HIDE_HINT} Save & Deploy to update listings.`)
      ) {
        return;
      }
      setProjectsData((p) =>
        p.map((row, i) => (i === index ? { ...row, hidden: nextHidden } : row)),
      );
      markUnsaved();
    },
    [markUnsaved, projectsData],
  );

  const moveProject = useCallback(
    (index: number, dir: -1 | 1) => {
      setProjectsData((p) => {
        const target = index + dir;
        if (target < 0 || target >= p.length) return p;
        const next = [...p];
        const [row] = next.splice(index, 1);
        next.splice(target, 0, row);
        return next;
      });
      markUnsaved();
    },
    [markUnsaved],
  );

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const snap = await getDocs(
        query(cmsVersionsCollection(db()), orderBy("createdAt", "desc"), limit(50)),
      );
      setVersions(snap.docs.map(mapCmsVersionDoc));
      setVersionsError(null);
    } catch (e) {
      logFirestoreIssue("cms/content/versions read", e);
      setVersions([]);
      setVersionsError(
        isPermissionDenied(e)
          ? "Firestore denied cms/content/versions. Live cms/content still works. Paste the signed-in admin rule if you want snapshots."
          : "Could not load content versions. Live cms/content is unaffected.",
      );
    } finally {
      setVersionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || tab !== "deploy") return;
    void loadVersions();
  }, [user, tab, loadVersions]);

  // ── Auth token helper for API calls ──
  async function getToken() {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error("Not signed in");
    return currentUser.getIdToken();
  }

  // ── Shared deploy hook (Firestore override or server env) ──
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadDeployHook() {
      try {
        const token = await getToken();
        const res = await fetch("/api/admin/deploy-hook", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          configured?: boolean;
          source?: "firestore" | "env" | "none";
          override?: string;
          displayUrl?: string;
        };
        if (cancelled) return;
        setDeployHook(typeof data.override === "string" ? data.override : "");
        setHookConfigured(!!data.configured);
        setHookSource(data.source ?? "none");
        setHookDisplay(typeof data.displayUrl === "string" ? data.displayUrl : "");
      } catch (e) {
        logFirestoreIssue("admin deploy-hook load", e);
      }
    }
    loadDeployHook();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Fetch users list ──
  const fetchUsers = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) setUsersData(data.users);
    } catch (e) {
      logFirestoreIssue("admin users fetch", e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function buildLiveContentPayload() {
    return {
      site: siteData,
      seo: seoData,
      hero: heroData,
      workPage: workPageData,
      services: recordsToListingServices(servicePagesList),
      servicePagesList,
      servicePagesContent: recordsToCmsMap(servicePagesList),
      servicePagesSeo: recordsToSeoMap(servicePagesList),
      faq: faqData,
      packages: packagesData,
      projects: projectsData,
      process: processData,
      disciplines: disciplinesData,
      legal: legalData,
      navItems: navData,
      ctas: ctasData ?? {},
      popups: popupsData ?? {},
    };
  }

  async function loadLatestCms() {
    try {
      const snap = await getDoc(cmsContentDoc());
      if (snap.exists()) {
        const data = snap.data() as Record<string, unknown>;
        applyLiveContent(data);
        loadedRevisionRef.current = cmsRevisionFromData(data);
      }
      setRemoteNewer(false);
      setStaleSaveOpen(false);
      dismissedRemoteRef.current = null;
      setStatus("idle");
    } catch (e) {
      logFirestoreIssue("cms/content reload", e);
      setStatus("error");
    }
  }

  // ── Save to Firestore ──
  async function save(source: CmsSaveSource = "save"): Promise<boolean> {
    setStatus("saving");
    try {
      const payload = buildLiveContentPayload();
      const result = await saveLiveCmsContent({
        payload,
        source,
        createdBy: {
          uid: user?.uid ?? null,
          email: user?.email ?? null,
        },
        expectedRevision: loadedRevisionRef.current,
      });
      loadedRevisionRef.current = result.revision;
      setRemoteNewer(false);
      setStaleSaveOpen(false);
      // Persist a typed override only — never write an empty string over the shared hook
      if (deployHook.trim()) {
        const token = await getToken();
        const hookRes = await fetch("/api/admin/deploy-hook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deployHook: deployHook.trim(), deploy: false }),
        });
        if (hookRes.ok) {
          setHookConfigured(true);
          setHookSource("firestore");
        }
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
      if (tab === "deploy") void loadVersions();
      return true;
    } catch (e) {
      if (isStaleCmsContentError(e)) {
        setStaleSaveOpen(true);
        setRemoteNewer(true);
        setStatus("unsaved");
        return false;
      }
      logFirestoreIssue("cms/content save", e);
      setStatus("error");
      return false;
    }
  }

  async function restoreVersion(row: CmsVersionRow) {
    const when = row.createdAt ? row.createdAt.toLocaleString() : row.id;
    if (
      !confirm(
        `Restore the snapshot from ${when}? This writes it back to live cms/content. Then use Save & Deploy to publish the site. Older versions are kept.`,
      )
    ) {
      return;
    }
    setRestoringId(row.id);
    setStatus("saving");
    try {
      const result = await saveLiveCmsContent({
        payload: { ...row.content },
        source: "restore",
        createdBy: {
          uid: user?.uid ?? null,
          email: user?.email ?? null,
        },
        note: `Restored from ${row.id}`,
        expectedRevision: loadedRevisionRef.current,
        force: true,
        replace: true,
      });
      applyLiveContent(row.content);
      loadedRevisionRef.current = result.revision;
      setRemoteNewer(false);
      setStaleSaveOpen(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
      if (tab === "deploy") void loadVersions();
    } catch (e) {
      logFirestoreIssue("cms/content restore", e);
      setStatus("error");
    } finally {
      setRestoringId(null);
    }
  }

  // ── Save & Deploy ──
  async function triggerDeploy(): Promise<"deployed" | "unconfigured" | "error"> {
    setDeployStatus("deploying");
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/deploy-hook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deployHook: deployHook.trim() || undefined,
          deploy: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; source?: "firestore" | "env" | "none" };
      if (!res.ok) {
        const message = data.error ?? "Deploy failed";
        if (res.status === 400 && /no shared deploy hook/i.test(message)) {
          setDeployStatus("idle");
          return "unconfigured";
        }
        throw new Error(message);
      }
      if (data.source) {
        setHookConfigured(true);
        setHookSource(data.source);
      }
      setDeployStatus("done");
      setTimeout(() => setDeployStatus("idle"), 5000);
      return "deployed";
    } catch (e) {
      logFirestoreIssue("admin deploy", e);
      setDeployStatus("error");
      return "error";
    }
  }

  async function saveAndDeploy() {
    const ok = await save("save-and-deploy");
    if (!ok) return;
    const result = await triggerDeploy();
    if (result === "unconfigured") {
      alert("No shared deploy hook is configured. Add DEPLOY_HOOK_URL in Vercel, or paste a hook URL in the Deploy tab.");
    }
  }

  async function saveBlogPost(intent: "draft" | "publish") {
    if (!editingBlog) return;
    if (!editingBlog.slug) {
      alert("Add a URL slug first.");
      return;
    }
    const next: BlogPost = {
      ...editingBlog,
      status: intent === "publish" ? "published" : "draft",
      hidden: intent === "publish" ? false : Boolean(editingBlog.hidden),
    };
    const payload = blogDocPayload(next);
    setStatus("saving");
    try {
      await setDoc(doc(db(), "blogs", next.slug), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      setEditingBlog(next);
      setBlogsData((prev) => {
        const idx = prev.findIndex((p) => p.slug === next.slug);
        if (idx >= 0) {
          const list = [...prev];
          list[idx] = next;
          return list;
        }
        return [next, ...prev];
      });
      setStatus("saved");
      if (intent === "publish") {
        alert("Published. It will show on /blog within a minute.");
      }
      setTimeout(() => {
        setStatus("idle");
        setEditingBlog(null);
      }, 1500);
    } catch (e) {
      logFirestoreIssue("blogs save", e);
      setStatus("error");
    }
  }

  const navPageOptions: NavPageOption[] = [
    { group: "Site", label: "Home", href: "/" },
    { group: "Site", label: "Services", href: "/services" },
    { group: "Site", label: "Work", href: "/work" },
    { group: "Site", label: "Pricing", href: "/pricing" },
    { group: "Site", label: "Blog", href: "/blog" },
    { group: "Site", label: "About", href: "/about" },
    { group: "Site", label: "Contact", href: "/contact" },
    { group: "Legal", label: "Privacy Policy", href: "/privacy" },
    { group: "Legal", label: "Terms", href: "/terms" },
    { group: "Legal", label: "Modern Slavery Policy", href: "/modern-slavery" },
    ...servicePagesList.map((svc) => ({
      group: "Services",
      label: svc.title || svc.slug,
      href: `/services/${svc.slug}`,
    })),
    ...projectsData.filter((p) => p.slug).map((proj) => ({
      group: "Work",
      label: proj.title || proj.slug,
      href: `/work/${proj.slug}`,
    })),
    ...blogsData.map((post) => ({
      group: "Blog",
      label: post.title || post.slug,
      href: `/blog/${post.slug}`,
    })),
    ...pagesData.map((pg) => ({
      group: "Pages",
      label: pg.title || pg.slug,
      href: `/${pg.slug}`,
    })),
  ];

  function editPageFromHref(href: string) {
    if (href === "/" || href === "/home") {
      setTab("hero");
      return;
    }
    if (href === "/services") {
      setTab("services");
      setOpenServiceSlug(null);
      return;
    }
    const serviceMatch = href.match(/^\/services\/([^/]+)\/?$/);
    if (serviceMatch) {
      setTab("services");
      setOpenServiceSlug(serviceMatch[1]);
      return;
    }
    if (href === "/work") {
      setTab("work");
      return;
    }
    const workMatch = href.match(/^\/work\/([^/]+)\/?$/);
    if (workMatch) {
      setTab("work");
      return;
    }
    if (href === "/pricing") {
      setTab("pricing");
      return;
    }
    if (href === "/about") {
      setTab("about");
      return;
    }
    if (href === "/contact") {
      setTab("site");
      return;
    }
    if (href === "/privacy" || href === "/terms" || href === "/modern-slavery") {
      setTab("legal");
      return;
    }
    if (href === "/blog" || href.startsWith("/blog/")) {
      const blogSlug = href.startsWith("/blog/") ? href.slice("/blog/".length).replace(/\/$/, "") : "";
      const post = blogSlug ? blogsData.find((b) => b.slug === blogSlug) : null;
      setTab("blog");
      setEditingBlog(post ?? null);
      return;
    }
    const page = pagesData.find((pg) => `/${pg.slug}` === href);
    if (page) {
      setTab("pages");
      setEditingPage(page);
      return;
    }
    setTab("nav");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "site", label: "Site Info" },
    { id: "seo", label: "SEO" },
    { id: "hero", label: "Hero" },
    { id: "services", label: "Services" },
    { id: "work", label: "Work" },
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
    { id: "projects", label: "Projects" },
    { id: "about", label: "About / Process" },
    { id: "nav", label: "🧭 Navigation" },
    { id: "blog", label: "✍ Blog" },
    { id: "pages", label: "📄 Pages" },
    { id: "legal", label: "Legal" },
    { id: "users", label: "👥 Users" },
    { id: "deploy", label: "⚡ Deploy" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/8 bg-white/2 lg:flex">
        <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
          <span className="rounded-lg bg-[#1857EC] px-2.5 py-1 text-xs font-bold text-white">RDW</span>
          <div>
            <p className="text-[13px] font-semibold text-white">Admin</p>
            <p className="text-[11px] text-white/35 truncate max-w-[100px]">{user?.email}</p>
          </div>
        </div>
        <div className="border-b border-white/8 px-4 py-3">
          <button
            type="button"
            onClick={startLiveEdit}
            className="w-full rounded-xl bg-[#1857EC] px-4 py-3 text-left transition hover:bg-blue-600"
          >
            <span className="block text-sm font-semibold text-white">Live edit</span>
            <span className="mt-0.5 block text-[11px] font-medium text-white/80">Edit the website</span>
          </button>
        </div>
        <nav className="flex-1 py-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full px-5 py-2.5 text-left text-[13px] transition ${
                tab === t.id
                  ? "bg-[#1857EC]/20 text-[#60a5fa] font-medium"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/8 p-4 space-y-3">
          <AdminThemeToggle />
          <button
            onClick={() => signOut(auth())}
            className="w-full rounded-xl border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:text-white/80"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {remoteNewer && !staleSaveOpen ? (
          <CmsRemoteVersionBanner
            dirty={status === "unsaved"}
            onLoadLatest={() => void loadLatestCms()}
            onKeepEditing={() => {
              dismissedRemoteRef.current = remoteRevisionRef.current;
              setRemoteNewer(false);
            }}
          />
        ) : null}
        {staleSaveOpen ? (
          <CmsStaleSaveModal
            onLoadLatest={() => void loadLatestCms()}
            onCancel={() => setStaleSaveOpen(false)}
          />
        ) : null}
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-white/8 px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile tab label */}
            <span className="text-sm font-medium text-white lg:hidden">
              {tabs.find((t) => t.id === tab)?.label}
            </span>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <AdminThemeToggle compact />
            </div>
            <button
              type="button"
              onClick={startLiveEdit}
              className="rounded-xl border border-[#1857EC]/40 bg-[#1857EC]/10 px-4 py-2 text-sm font-semibold text-[#60a5fa] transition hover:bg-[#1857EC]/20"
            >
              Live edit
            </button>
            <button
              onClick={() => void save()}
              disabled={status === "saving"}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={saveAndDeploy}
              disabled={status === "saving" || deployStatus === "deploying"}
              className="rounded-xl bg-[#1857EC] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {deployStatus === "deploying"
                ? "Deploying…"
                : deployStatus === "done"
                ? "✓ Deployed"
                : "Save & Deploy"}
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">

            {/* ── SITE INFO ── */}
            {tab === "site" && (
              <>
                <SectionTitle title="Site Info" sub="Core details used across the site and in Google search results." />
                <Card className="space-y-4">
                  <Field label="Studio name" value={siteData.name} onChange={(v) => { setSiteData((p) => ({ ...p, name: v })); markUnsaved(); }} />
                  <Field label="Parent company" value={siteData.parent} onChange={(v) => { setSiteData((p) => ({ ...p, parent: v })); markUnsaved(); }} />
                  <Field label="One-line tagline" value={siteData.tagline} onChange={(v) => { setSiteData((p) => ({ ...p, tagline: v })); markUnsaved(); }} />
                  <Field label="Meta description (used by Google)" value={siteData.description} textarea onChange={(v) => { setSiteData((p) => ({ ...p, description: v })); markUnsaved(); }} hint="Aim for 130–160 characters." />
                  <Field label="Site URL" value={siteData.url} onChange={(v) => { setSiteData((p) => ({ ...p, url: v })); markUnsaved(); }} hint="Use the live 200 host, currently https://www.realdigitalworks.com (apex 308s to www)." />
                </Card>
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Contact details</h3>
                  <Field label="Phone (display)" value={siteData.phone} onChange={(v) => { setSiteData((p) => ({ ...p, phone: v })); markUnsaved(); }} />
                  <Field label="Phone (href)" value={siteData.phoneHref} onChange={(v) => { setSiteData((p) => ({ ...p, phoneHref: v })); markUnsaved(); }} />
                  <Field label="WhatsApp (display)" value={siteData.whatsapp} onChange={(v) => { setSiteData((p) => ({ ...p, whatsapp: v })); markUnsaved(); }} />
                  <Field label="Email" value={siteData.email} onChange={(v) => { setSiteData((p) => ({ ...p, email: v, emailHref: `mailto:${v}` })); markUnsaved(); }} />
                  <Field label="Business hours" value={siteData.hours} onChange={(v) => { setSiteData((p) => ({ ...p, hours: v })); markUnsaved(); }} />
                  {(siteData.address ?? []).map((line, i) => (
                    <Field
                      key={`address-${i}`}
                      label={`Address line ${i + 1}`}
                      value={line}
                      onChange={(v) => {
                        setSiteData((p) => {
                          const address = [...(p.address ?? [])];
                          address[i] = v;
                          return { ...p, address };
                        });
                        markUnsaved();
                      }}
                    />
                  ))}
                  <Field
                    label="Footer description"
                    value={siteData.footerBlurb ?? ""}
                    textarea
                    onChange={(v) => { setSiteData((p) => ({ ...p, footerBlurb: v })); markUnsaved(); }}
                    hint="Shown under the logo in the footer."
                  />
                  <Field
                    label="Copyright line"
                    value={siteData.copyright ?? ""}
                    onChange={(v) => { setSiteData((p) => ({ ...p, copyright: v })); markUnsaved(); }}
                    hint="Bottom-left footer, e.g. © 2026 Real Digital Works."
                  />
                </Card>
              </>
            )}

            {/* ── SEO ── */}
            {tab === "seo" && (
              <>
                <SectionTitle
                  title="SEO Settings"
                  sub="Title and description shown in Google results. Keywords help reinforce the page topic."
                />
                {(Object.keys(seoData) as Array<keyof typeof seoData>).map((pageKey) => {
                  const pageSeo = seoData[pageKey] as PageSeo;
                  return (
                    <Card key={pageKey} className="space-y-4">
                      <h3 className="text-sm font-semibold text-white capitalize">{pageKey === "home" ? "Home page" : `${pageKey} page`}</h3>
                      <Field
                        label="Page title"
                        value={pageSeo.title}
                        onChange={(v) => { setSeoData((p) => ({ ...p, [pageKey]: { ...p[pageKey], title: v } })); markUnsaved(); }}
                        hint="50–60 characters ideal."
                      />
                      <Field
                        label="Meta description"
                        value={pageSeo.description}
                        textarea
                        onChange={(v) => { setSeoData((p) => ({ ...p, [pageKey]: { ...p[pageKey], description: v } })); markUnsaved(); }}
                        hint="130–160 characters ideal."
                      />
                      <Field
                        label="Keywords (comma separated)"
                        value={pageSeo.keywords.join(", ")}
                        onChange={(v) => { setSeoData((p) => ({ ...p, [pageKey]: { ...p[pageKey], keywords: v.split(",").map((k) => k.trim()).filter(Boolean) } })); markUnsaved(); }}
                        hint="Used in JSON-LD structured data and meta keywords."
                      />
                    </Card>
                  );
                })}
              </>
            )}

            {/* ── HERO ── */}
            {tab === "hero" && (
              <>
                <SectionTitle title="Hero Section" sub="The main headline visitors see first." />
                <Card className="space-y-4">
                  <Field label="Eyebrow text" value={heroData.eyebrow} onChange={(v) => { setHeroData((p) => ({ ...p, eyebrow: v })); markUnsaved(); }} />
                  <Field label="Headline" value={heroData.headline} textarea onChange={(v) => { setHeroData((p) => ({ ...p, headline: v })); markUnsaved(); }} hint="Use line breaks (\n) for word wrapping." />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Intro paragraph</label>
                    <p className="text-[11px] text-white/30">Supports bold, italic, links. Plain text also works.</p>
                    <RichTextEditor
                      content={heroData.sub}
                      onChange={(html) => { setHeroData((p) => ({ ...p, sub: html })); markUnsaved(); }}
                      placeholder="Write the hero intro paragraph…"
                      minHeight="160px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Primary button label" value={heroData.primaryCta} onChange={(v) => { setHeroData((p) => ({ ...p, primaryCta: v })); markUnsaved(); }} />
                    <Field label="Primary button link" value={heroData.primaryHref} onChange={(v) => { setHeroData((p) => ({ ...p, primaryHref: v })); markUnsaved(); }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Secondary button label" value={heroData.secondaryCta} onChange={(v) => { setHeroData((p) => ({ ...p, secondaryCta: v })); markUnsaved(); }} />
                    <Field label="Secondary button link" value={heroData.secondaryHref} onChange={(v) => { setHeroData((p) => ({ ...p, secondaryHref: v })); markUnsaved(); }} />
                  </div>
                </Card>
              </>
            )}

            {/* ── SERVICES ── */}
            {tab === "services" && (
              <>
                <SectionTitle
                  title="Services"
                  sub="Add, remove, or update services. Each item is a listing card and a public /services/{slug} page. Empty list stays empty — seed pages are not resurrected."
                />
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/80">/services listing page SEO</h3>
                  <p className="text-[11px] text-white/35">
                    Google title and snippet for the listing page itself — not an individual service. Same fields as the SEO tab.
                  </p>
                  <Field
                    label="Page title"
                    value={seoData.services.title}
                    onChange={(v) => { setSeoData((p) => ({ ...p, services: { ...p.services, title: v } })); markUnsaved(); }}
                    hint="50–60 characters ideal. Shown in the browser tab and Google for /services."
                  />
                  <Field
                    label="Meta description"
                    value={seoData.services.description}
                    textarea
                    onChange={(v) => { setSeoData((p) => ({ ...p, services: { ...p.services, description: v } })); markUnsaved(); }}
                    hint="130–160 characters. Google snippet for /services."
                  />
                  <Field
                    label="Keywords (comma separated)"
                    value={seoData.services.keywords.join(", ")}
                    onChange={(v) => { setSeoData((p) => ({ ...p, services: { ...p.services, keywords: v.split(",").map((k) => k.trim()).filter(Boolean) } })); markUnsaved(); }}
                  />
                </Card>
                <ServiceEditor
                  services={servicePagesList}
                  openSlug={openServiceSlug}
                  onOpen={setOpenServiceSlug}
                  onPatch={patchService}
                  onRemove={removeService}
                  onMove={moveService}
                  onAdd={addService}
                />
              </>
            )}

            {/* ── FAQ ── */}
            {tab === "faq" && (
              <>
                <SectionTitle title="FAQ" sub="Answers appear in Google's FAQ rich results when marked up correctly." />
                {faqData.map((item, i) => (
                  <Card key={i} className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="mt-1 text-xs text-white/30">#{i + 1}</span>
                      <button
                        onClick={() => { setFaqData((f) => f.filter((_, idx) => idx !== i)); markUnsaved(); }}
                        className="text-xs text-red-400/60 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <Field label="Question" value={item.q} onChange={(v) => { const f = [...faqData]; f[i] = { ...f[i], q: v }; setFaqData(f); markUnsaved(); }} />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Answer</label>
                      <RichTextEditor
                        content={item.a}
                        onChange={(html) => { const f = [...faqData]; f[i] = { ...f[i], a: html }; setFaqData(f); markUnsaved(); }}
                        placeholder="Write the answer…"
                        minHeight="140px"
                      />
                    </div>
                  </Card>
                ))}
                <button
                  onClick={() => { setFaqData((f) => [...f, { q: "", a: "" }]); markUnsaved(); }}
                  className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-white/40 transition hover:border-white/30 hover:text-white/60"
                >
                  + Add FAQ item
                </button>
              </>
            )}

            {/* ── PRICING ── */}
            {tab === "pricing" && (
              <>
                <SectionTitle title="Pricing Packages" sub="The three website packages shown on the Pricing page." />
                {packagesData.map((pkg, i) => (
                  <Card key={pkg.name} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white/80">{pkg.name}</h3>
                      {pkg.featured && <span className="rounded-full bg-[#1857EC]/30 px-2 py-0.5 text-[10px] text-blue-300">Featured</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Package name" value={pkg.name} onChange={(v) => { const p = [...packagesData]; p[i] = { ...p[i], name: v }; setPackagesData(p); markUnsaved(); }} />
                      <Field label="Price" value={pkg.amount} onChange={(v) => { const p = [...packagesData]; p[i] = { ...p[i], amount: v }; setPackagesData(p); markUnsaved(); }} />
                    </div>
                    <Field label="Sub-line (timeline)" value={pkg.per} onChange={(v) => { const p = [...packagesData]; p[i] = { ...p[i], per: v }; setPackagesData(p); markUnsaved(); }} />
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Included items</label>
                      {pkg.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const p = [...packagesData];
                              const items = [...p[i].items];
                              items[j] = e.target.value;
                              p[i] = { ...p[i], items };
                              setPackagesData(p);
                              markUnsaved();
                            }}
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#1857EC]"
                          />
                          <button
                            onClick={() => {
                              const p = [...packagesData];
                              p[i] = { ...p[i], items: p[i].items.filter((_, k) => k !== j) };
                              setPackagesData(p);
                              markUnsaved();
                            }}
                            className="text-xs text-white/30 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const p = [...packagesData];
                          p[i] = { ...p[i], items: [...p[i].items, ""] };
                          setPackagesData(p);
                          markUnsaved();
                        }}
                        className="text-xs text-white/40 hover:text-white/60"
                      >
                        + Add item
                      </button>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* ── WORK ── */}
            {tab === "work" && (
              <>
                <SectionTitle
                  title="Work page"
                  sub="Intro, SEO, and the case-study cards on /work. Canonical stays /work. Slugs become /work/{slug}."
                />
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/80">Listing intro</h3>
                  <p className="text-[11px] text-white/35">
                    The heading block at the top of /work. Empty fields fall back to the live copy so the public page cannot go blank.
                  </p>
                  <Field
                    label="Eyebrow"
                    value={workPageData.eyebrow}
                    onChange={(v) => { setWorkPageData((p) => ({ ...p, eyebrow: v })); markUnsaved(); }}
                    hint="Small uppercase label above the H1."
                  />
                  <Field
                    label="Headline"
                    value={workPageData.headline}
                    textarea
                    onChange={(v) => { setWorkPageData((p) => ({ ...p, headline: v })); markUnsaved(); }}
                    hint="Public H1. Line breaks are kept."
                  />
                  <Field
                    label="Intro paragraph"
                    value={workPageData.sub}
                    textarea
                    onChange={(v) => { setWorkPageData((p) => ({ ...p, sub: v })); markUnsaved(); }}
                    hint="Copy under the H1."
                  />
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/80">/work SEO</h3>
                  <p className="text-[11px] text-white/35">
                    Browser tab, Google snippet, and Open Graph for /work. Same fields as the SEO tab. Canonical is always /work.
                  </p>
                  <Field
                    label="Page title"
                    value={seoData.work.title}
                    onChange={(v) => { setSeoData((p) => ({ ...p, work: { ...p.work, title: v } })); markUnsaved(); }}
                    hint="50–60 characters. Should describe the work/case-studies page, not the homepage."
                  />
                  <Field
                    label="Meta description"
                    value={seoData.work.description}
                    textarea
                    onChange={(v) => { setSeoData((p) => ({ ...p, work: { ...p.work, description: v } })); markUnsaved(); }}
                    hint="130–160 characters. Google snippet for /work."
                  />
                  <Field
                    label="Keywords (comma separated)"
                    value={seoData.work.keywords.join(", ")}
                    onChange={(v) => {
                      setSeoData((p) => ({
                        ...p,
                        work: {
                          ...p.work,
                          keywords: v.split(",").map((k) => k.trim()).filter(Boolean),
                        },
                      }));
                      markUnsaved();
                    }}
                  />
                </Card>

                <SectionTitle
                  title="Case studies"
                  sub="Cards on /work. Hide keeps /work/{slug} live. Each item needs a unique slug. Upload a card image or paste a URL; empty keeps the accent gradient."
                />
                <CaseStudyList
                  projects={projectsData}
                  onPatch={patchProject}
                  onRemove={removeProject}
                  onMove={moveProject}
                  onAdd={addProject}
                />
              </>
            )}

            {/* ── PROJECTS ── */}
            {tab === "projects" && (
              <>
                <SectionTitle
                  title="Projects / Work"
                  sub="Same case studies as the Work tab. Hide removes them from /work listings; the slug URL still works."
                />
                <CaseStudyList
                  projects={projectsData}
                  onPatch={patchProject}
                  onRemove={removeProject}
                  onMove={moveProject}
                  onAdd={addProject}
                />
              </>
            )}

            {/* ── ABOUT / PROCESS ── */}
            {tab === "about" && (
              <>
                <SectionTitle title="About — Disciplines" sub="The three discipline cards on the About page. Title is a plain heading; body is rich text." />
                {disciplinesData.map((item, i) => (
                  <Card key={i} className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="mt-1 text-xs text-white/30">#{i + 1}</span>
                    </div>
                    <Field label="Discipline title" value={item.title} onChange={(v) => { const d = [...disciplinesData]; d[i] = { ...d[i], title: v }; setDisciplinesData(d); markUnsaved(); }} />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Description</label>
                      <RichTextEditor
                        content={item.body}
                        onChange={(html) => { const d = [...disciplinesData]; d[i] = { ...d[i], body: html }; setDisciplinesData(d); markUnsaved(); }}
                        placeholder="Describe this discipline…"
                        minHeight="140px"
                      />
                    </div>
                  </Card>
                ))}

                <SectionTitle title="Process Steps" sub="The numbered steps shown on the home page. Step number and title are plain; description is rich text." />
                {processData.map((step, i) => (
                  <Card key={i} className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="mt-1 text-xs text-white/30">Step {step.n}</span>
                      <button
                        onClick={() => { setProcessData((p) => p.filter((_, idx) => idx !== i)); markUnsaved(); }}
                        className="text-xs text-red-400/60 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <Field label="Step number" value={step.n} onChange={(v) => { const p = [...processData]; p[i] = { ...p[i], n: v }; setProcessData(p); markUnsaved(); }} />
                      <div className="col-span-3">
                        <Field label="Step title" value={step.title} onChange={(v) => { const p = [...processData]; p[i] = { ...p[i], title: v }; setProcessData(p); markUnsaved(); }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Description</label>
                      <RichTextEditor
                        content={step.body}
                        onChange={(html) => { const p = [...processData]; p[i] = { ...p[i], body: html }; setProcessData(p); markUnsaved(); }}
                        placeholder="Describe this step…"
                        minHeight="120px"
                      />
                    </div>
                  </Card>
                ))}
                <button
                  onClick={() => { setProcessData((p) => [...p, { n: String(p.length + 1).padStart(2, "0"), title: "", body: "" }]); markUnsaved(); }}
                  className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-white/40 transition hover:border-white/30 hover:text-white/60"
                >
                  + Add process step
                </button>
              </>
            )}

            {/* ── NAVIGATION ── */}
            {tab === "nav" && (
              <>
                <SectionTitle
                  title="Navigation"
                  sub="Drag to reorder. Toggle the eye to hide without deleting. Click ▶ / sub to manage nested dropdowns. Pick an existing page or enter a custom path."
                />
                <Card>
                  <NavEditor
                    items={navData}
                    pageOptions={navPageOptions}
                    onChange={(items) => { setNavData(items); markUnsaved(); }}
                    onEditPage={editPageFromHref}
                  />
                </Card>
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200/60 leading-relaxed space-y-2">
                  <p><strong className="text-blue-300">Services item</strong> — nested links become the desktop mega menu and the mobile accordion. When you add a service you can append one menu item; saving will not duplicate the whole list.</p>
                  <p><strong className="text-blue-300">Any other item with nested links</strong> — shows a dropdown on desktop and an indented list on mobile.</p>
                  <p><strong className="text-blue-300">Edit page</strong> — jumps to that page’s editor so you do not have to hunt tabs.</p>
                  <p><strong className="text-blue-300">Changes go live</strong> on the next “Save &amp; Deploy” — the header rebuilds with the new structure.</p>
                </div>
              </>
            )}

            {/* ── BLOG ── */}
            {tab === "blog" && (
              <>
                {!editingBlog ? (
                  <>
                    <SectionTitle
                      title="Blog"
                      sub="Drafts stay in admin. Publish writes the post to Firestore — it appears on /blog within about a minute, with no Vercel rebuild. Hidden posts stay off the listing."
                    />
                    <button
                      onClick={() => setEditingBlog({
                        slug: "",
                        title: "",
                        excerpt: "",
                        content: "",
                        publishedAt: new Date().toISOString().split("T")[0],
                        status: "draft",
                        tags: [],
                        seoTitle: "",
                        seoDescription: "",
                      })}
                      className="mb-6 rounded-xl bg-[#1857EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                      + New post
                    </button>

                    {blogsData.length === 0 ? (
                      <Card><p className="text-sm text-white/40">No blog posts yet. Click "New post" to get started.</p></Card>
                    ) : (
                      <div className="space-y-3">
                        {blogsData.map((post) => (
                          <Card key={post.slug} className={`flex items-center justify-between gap-4 ${post.hidden ? "opacity-70" : ""}`}>
                            <div>
                              <p className="font-medium text-white">
                                {post.title || "(untitled)"}
                                {post.hidden ? (
                                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                                    Hidden
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-xs text-white/40 mt-0.5">
                                /{post.slug} · {post.status} · {post.publishedAt?.split("T")[0] ?? "no date"}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setEditingBlog(post)}
                                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  const nextHidden = !post.hidden;
                                  if (
                                    nextHidden &&
                                    !confirm(`Hide "${post.title}"? ${HIDE_HINT}`)
                                  ) {
                                    return;
                                  }
                                  const next = { ...post, hidden: nextHidden };
                                  await setDoc(doc(db(), "blogs", post.slug), {
                                    ...blogDocPayload(next),
                                    updatedAt: serverTimestamp(),
                                  });
                                  setBlogsData((b) => b.map((p) => (p.slug === post.slug ? next : p)));
                                  alert("Visibility saved. The /blog listing updates within a minute.");
                                }}
                                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                                title={HIDE_HINT}
                              >
                                {post.hidden ? "Unhide" : "Hide"}
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <SectionTitle
                        title={editingBlog.slug ? `Edit: ${editingBlog.title || "Untitled"}` : "New blog post"}
                      />
                      <button
                        onClick={() => setEditingBlog(null)}
                        className="text-sm text-white/40 hover:text-white"
                      >
                        ← Back to list
                      </button>
                    </div>

                    <Card className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Title"
                          value={editingBlog.title}
                          onChange={(v) => setEditingBlog((p) => p ? { ...p, title: v } : p)}
                        />
                        <Field
                          label="Slug (URL)"
                          value={editingBlog.slug}
                          onChange={(v) => setEditingBlog((p) => p ? { ...p, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : p)}
                          hint="/blog/your-slug"
                        />
                      </div>
                      <Field
                        label="Excerpt (shown on listing page)"
                        value={editingBlog.excerpt}
                        textarea
                        onChange={(v) => setEditingBlog((p) => p ? { ...p, excerpt: v } : p)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Publish date"
                          value={editingBlog.publishedAt?.split("T")[0] ?? ""}
                          onChange={(v) => setEditingBlog((p) => p ? { ...p, publishedAt: v } : p)}
                          hint="YYYY-MM-DD"
                        />
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Status</label>
                          <select
                            value={editingBlog.status}
                            onChange={(e) => setEditingBlog((p) => p ? { ...p, status: e.target.value as "published" | "draft" } : p)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC]"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                      <Field
                        label="Tags (comma separated)"
                        value={editingBlog.tags?.join(", ") ?? ""}
                        onChange={(v) => setEditingBlog((p) => p ? { ...p, tags: v.split(",").map((t) => t.trim()).filter(Boolean) } : p)}
                      />
                    </Card>

                    <Card className="space-y-3">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Content</label>
                      <RichTextEditor
                        content={editingBlog.content}
                        onChange={(html) => setEditingBlog((p) => p ? { ...p, content: html } : p)}
                        placeholder="Write your blog post here…"
                        minHeight="400px"
                      />
                    </Card>

                    <Card className="space-y-4">
                      <h3 className="text-sm font-semibold text-white/70">SEO</h3>
                      <Field label="SEO title" value={editingBlog.seoTitle ?? ""} onChange={(v) => setEditingBlog((p) => p ? { ...p, seoTitle: v } : p)} hint="Leave blank to use the post title" />
                      <Field label="SEO description" value={editingBlog.seoDescription ?? ""} textarea onChange={(v) => setEditingBlog((p) => p ? { ...p, seoDescription: v } : p)} />
                    </Card>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void saveBlogPost("publish")}
                        disabled={status === "saving"}
                        className="rounded-xl bg-[#1857EC] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        {status === "saving" ? "Publishing…" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveBlogPost("draft")}
                        disabled={status === "saving"}
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/60 hover:text-white disabled:opacity-50"
                      >
                        Save draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBlog(null)}
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[12px] text-white/35">
                      Publish sets status to published and clears Hidden. The public /blog listing reads Firestore, so the post appears within about a minute — no Save & Deploy. Save draft does not update the public site.
                    </p>
                  </>
                )}
              </>
            )}

            {/* ── PAGES ── */}
            {tab === "pages" && (
              <>
                {!editingPage ? (
                  <>
                    <SectionTitle
                      title="Custom Pages"
                      sub="Create any page at any URL. Use for landing pages, terms, case studies, anything."
                    />
                    <button
                      onClick={() => setEditingPage({
                        slug: "",
                        title: "",
                        content: "",
                        status: "draft",
                        showInNav: false,
                        seoTitle: "",
                        seoDescription: "",
                      })}
                      className="mb-6 rounded-xl bg-[#1857EC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                      + New page
                    </button>

                    {pagesData.length === 0 ? (
                      <Card><p className="text-sm text-white/40">No custom pages yet. Click "New page" to get started.</p></Card>
                    ) : (
                      <div className="space-y-3">
                        {pagesData.map((pg) => (
                          <Card key={pg.slug} className={`flex items-center justify-between gap-4 ${pg.hidden ? "opacity-70" : ""}`}>
                            <div>
                              <p className="font-medium text-white">
                                {pg.title || "(untitled)"}
                                {pg.hidden ? (
                                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                                    Hidden
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-xs text-white/40 mt-0.5">/{pg.slug} · {pg.status}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => setEditingPage(pg)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white">Edit</button>
                              <button
                                onClick={async () => {
                                  const nextHidden = !pg.hidden;
                                  if (
                                    nextHidden &&
                                    !confirm(`Hide "${pg.title}"? ${HIDE_HINT}`)
                                  ) {
                                    return;
                                  }
                                  const next = { ...pg, hidden: nextHidden };
                                  await setDoc(doc(db(), "pages", pg.slug), {
                                    ...next,
                                    updatedAt: serverTimestamp(),
                                  });
                                  setPagesData((p) => p.map((x) => (x.slug === pg.slug ? next : x)));
                                  markUnsaved();
                                }}
                                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                                title={HIDE_HINT}
                              >
                                {pg.hidden ? "Unhide" : "Hide"}
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <SectionTitle title={editingPage.slug ? `Edit: ${editingPage.title || "Untitled"}` : "New page"} />
                      <button onClick={() => setEditingPage(null)} className="text-sm text-white/40 hover:text-white">← Back</button>
                    </div>

                    <Card className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Page title" value={editingPage.title} onChange={(v) => setEditingPage((p) => p ? { ...p, title: v } : p)} />
                        <Field label="Slug (URL)" value={editingPage.slug} onChange={(v) => setEditingPage((p) => p ? { ...p, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : p)} hint="/your-page-slug" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="space-y-1.5 flex-1">
                          <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Status</label>
                          <select value={editingPage.status} onChange={(e) => setEditingPage((p) => p ? { ...p, status: e.target.value as "published" | "draft" } : p)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC]">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-white/60 mt-5 cursor-pointer">
                          <input type="checkbox" checked={editingPage.showInNav} onChange={(e) => setEditingPage((p) => p ? { ...p, showInNav: e.target.checked } : p)} className="rounded" />
                          Show in nav
                        </label>
                      </div>
                    </Card>

                    <Card className="space-y-3">
                      <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Page content</label>
                      <RichTextEditor
                        content={editingPage.content}
                        onChange={(html) => setEditingPage((p) => p ? { ...p, content: html } : p)}
                        placeholder="Write your page content here…"
                        minHeight="400px"
                      />
                    </Card>

                    <Card className="space-y-4">
                      <h3 className="text-sm font-semibold text-white/70">SEO</h3>
                      <Field label="SEO title" value={editingPage.seoTitle ?? ""} onChange={(v) => setEditingPage((p) => p ? { ...p, seoTitle: v } : p)} />
                      <Field label="SEO description" value={editingPage.seoDescription ?? ""} textarea onChange={(v) => setEditingPage((p) => p ? { ...p, seoDescription: v } : p)} />
                    </Card>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!editingPage.slug) { alert("Add a URL slug first."); return; }
                          setStatus("saving");
                          try {
                            await setDoc(doc(db(), "pages", editingPage.slug), {
                              ...editingPage,
                              updatedAt: serverTimestamp(),
                            });
                            setPagesData((prev) => {
                              const idx = prev.findIndex((p) => p.slug === editingPage.slug);
                              if (idx >= 0) { const n = [...prev]; n[idx] = editingPage; return n; }
                              return [...prev, editingPage];
                            });
                            setStatus("saved");
                            setTimeout(() => { setStatus("idle"); setEditingPage(null); }, 1500);
                          } catch (e) {
                            logFirestoreIssue("pages save", e);
                            setStatus("error");
                          }
                        }}
                        className="rounded-xl bg-[#1857EC] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                      >
                        Save page
                      </button>
                      <button onClick={() => setEditingPage(null)} className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/60 hover:text-white">Cancel</button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── LEGAL ── */}
            {tab === "legal" && (
              <>
                <SectionTitle
                  title="Legal pages"
                  sub="Privacy, Terms and Modern Slavery. Shown in the footer and at /privacy, /terms and /modern-slavery. Save & Deploy publishes them like every other CMS page."
                />
                {(
                  [
                    { key: "privacy", href: "/privacy", label: "Privacy Policy" },
                    { key: "terms", href: "/terms", label: "Terms" },
                    { key: "modernSlavery", href: "/modern-slavery", label: "Modern Slavery Policy" },
                  ] as const
                ).map((item) => {
                  const page = legalData[item.key];
                  const patch = (next: Partial<LegalPageContent>) => {
                    setLegalData((current) => ({
                      ...current,
                      [item.key]: { ...current[item.key], ...next },
                    }));
                    markUnsaved();
                  };
                  return (
                    <Card key={item.key} className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white/80">{item.label}</h3>
                        <span className="font-mono text-[11px] text-white/40">{item.href}</span>
                      </div>
                      <Field label="Page title" value={page.title} onChange={(v) => patch({ title: v })} hint="Visible H1 on the public page." />
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-white/50 uppercase tracking-wide">Body</label>
                        <RichTextEditor
                          content={page.body}
                          onChange={(html) => patch({ body: html })}
                          placeholder="Write the legal copy…"
                          minHeight="220px"
                        />
                      </div>
                      <Field
                        label="SEO title"
                        value={page.seoTitle}
                        onChange={(v) => patch({ seoTitle: v })}
                        hint="Browser tab and Google title. 50–60 characters ideal."
                      />
                      <Field
                        label="Meta description"
                        value={page.seoDescription}
                        textarea
                        onChange={(v) => patch({ seoDescription: v })}
                        hint="Google snippet. 130–160 characters ideal."
                      />
                    </Card>
                  );
                })}
              </>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <>
                <SectionTitle
                  title="Users & Access"
                  sub="Invite team members. They receive a link to set their own password."
                />

                {/* Invite form */}
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Invite a new user</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Enter their email. We will generate a secure invite link — copy it and send it via email, WhatsApp, or Slack.
                    When they click the link they will be taken to a branded page to set their own password.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setInviteLink(""); setInviteStatus("idle"); }}
                      placeholder="colleague@example.com"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#1857EC]"
                    />
                    <button
                      onClick={async () => {
                        if (!inviteEmail) return;
                        setInviteStatus("sending");
                        setInviteLink("");
                        try {
                          const token = await getToken();
                          const res = await fetch("/api/admin/invite", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ email: inviteEmail }),
                          });
                          const data = await res.json();
                          if (data.inviteLink) {
                            setInviteLink(data.inviteLink);
                            setInviteStatus("done");
                            setInviteEmail("");
                            // Refresh users list
                            fetchUsers();
                            // Log email status
                            if (data.emailSent) {
                              console.log("[invite] Email sent successfully");
                            } else if (data.emailError) {
                              console.warn("[invite] Email failed:", data.emailError);
                            }
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (e) {
                          logFirestoreIssue("admin invite", e);
                          setInviteStatus("error");
                        }
                      }}
                      disabled={inviteStatus === "sending" || !inviteEmail}
                      className="rounded-xl bg-[#1857EC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40 whitespace-nowrap"
                    >
                      {inviteStatus === "sending" ? "Generating…" : "Generate invite link"}
                    </button>
                  </div>

                  {/* Generated link */}
                  {inviteLink && (
                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                      <p className="text-sm font-medium text-green-300">✓ Invite link generated — email sent to user</p>
                      <p className="text-xs text-green-200/70">A copy of the link is below in case you need to resend it manually. It expires in 7 days.</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-xs text-green-100/80">
                          {inviteLink}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(inviteLink); }}
                          className="rounded-lg bg-green-500/20 px-3 py-2 text-xs text-green-300 hover:bg-green-500/30 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {inviteStatus === "error" && (
                    <p className="text-sm text-red-400">Failed to generate link. Check that Firebase Admin credentials are set in Vercel.</p>
                  )}
                </Card>

                {/* User list */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/70">Current users</h3>
                    <button onClick={fetchUsers} className="text-xs text-white/40 hover:text-white/70">
                      Refresh
                    </button>
                  </div>
                  {usersData.length === 0 ? (
                    <div>
                      <p className="text-sm text-white/40">Click "Refresh" to load the user list.</p>
                      <button onClick={fetchUsers} className="mt-3 text-sm text-[#60a5fa] hover:underline">Load users</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {usersData.map((u) => (
                        <div key={u.uid} className="flex items-center justify-between gap-4 py-3">
                          <div>
                            <p className="text-sm text-white/80">{u.email}</p>
                            <p className="text-xs text-white/30 mt-0.5">
                              Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "—"}
                              {" · "}
                              Last active: {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString("en-GB") : "Never"}
                              {!u.emailVerified && <span className="ml-2 text-yellow-400/70">Invite pending</span>}
                            </p>
                          </div>
                          {u.email !== user?.email && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Remove access for ${u.email}?`)) return;
                                try {
                                  const token = await getToken();
                                  await fetch("/api/admin/users", {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ uid: u.uid }),
                                  });
                                  setUsersData((prev) => prev.filter((x) => x.uid !== u.uid));
                                } catch (e) {
                                  logFirestoreIssue("admin user remove", e);
                                }
                              }}
                              className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200/60 leading-relaxed">
                  <strong className="text-blue-300">How it works:</strong> The invite link opens <code className="rounded bg-white/10 px-1">realdigitalworks.com/auth/invite</code> — a branded page where the user sets their own password. Once set, they can log in at <code className="rounded bg-white/10 px-1">/admin</code>. Links expire after 7 days; generate a new one if it expires.
                </div>
              </>
            )}

            {/* ── DEPLOY ── */}
            {tab === "deploy" && (
              <>
                <SectionTitle
                  title="Deploy Settings"
                  sub="Save & Deploy uses one shared Vercel hook for the whole team. You usually do not need to set anything here."
                />
                <Card className="space-y-4">
                  <Field
                    label="Vercel deploy hook URL (optional override)"
                    value={deployHook}
                    onChange={(v) => { setDeployHook(v); markUnsaved(); }}
                    placeholder={hookDisplay || "https://api.vercel.com/v1/integrations/deploy/…"}
                    hint="Leave blank to use the shared hook. Only paste a URL here if you need to override it."
                  />
                  {hookConfigured && !deployHook && hookSource === "env" && (
                    <p className="text-xs text-green-400/80">
                      Using the shared server hook ({hookDisplay || "DEPLOY_HOOK_URL"}). Every admin deploys with this — nobody needs to paste it.
                    </p>
                  )}
                  {hookConfigured && hookSource === "firestore" && (
                    <p className="text-xs text-green-400/80">
                      Using the shared hook saved in CMS settings. Every signed-in admin sees the same value.
                    </p>
                  )}
                  {!hookConfigured && !deployHook && (
                    <p className="text-xs text-yellow-400/70">
                      No shared hook yet. Add <code className="rounded bg-white/10 px-1">DEPLOY_HOOK_URL</code> in Vercel, or paste a hook URL above once for the whole team.
                    </p>
                  )}
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200/70 leading-relaxed">
                    <strong className="text-blue-300">How it works:</strong> "Save &amp; Deploy" writes content to Firestore, then the server POSTs to the shared Vercel hook (from <code className="rounded bg-white/10 px-1">DEPLOY_HOOK_URL</code> or the optional override above). The hook is never called from your browser, so CORS and per-user paste are not an issue. Vercel starts a new build — GitHub Actions then runs <code className="rounded bg-white/10 px-1">scripts/fetch-content.js</code> and the public site updates in about 60–90 seconds.
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Content versions</h3>
                  <p className="text-sm text-white/40">
                    Every Save writes the live <code className="rounded bg-white/10 px-1">cms/content</code> document and an immutable snapshot under{" "}
                    <code className="rounded bg-white/10 px-1">cms/content/versions</code>. Builds still read only the live document. Restore copies a snapshot back to live — then Save &amp; Deploy to publish.
                  </p>
                  {versionsError ? (
                    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
                      {versionsError} Snapshots are optional — Live edit and Save still use{" "}
                      <code className="rounded bg-white/10 px-1">cms/content</code>.
                    </p>
                  ) : versionsLoading && versions.length === 0 ? (
                    <p className="text-sm text-white/40">Loading versions…</p>
                  ) : versions.length === 0 ? (
                    <p className="text-sm text-white/40">No snapshots yet. The next Save will create the first one.</p>
                  ) : (
                    <div className="divide-y divide-white/8 rounded-xl border border-white/8">
                      {versions.map((v) => (
                        <div
                          key={v.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm text-white/80">
                              {v.createdAt ? v.createdAt.toLocaleString() : "Saving…"}
                            </p>
                            <p className="text-[11px] text-white/35">
                              {v.createdBy.email || v.createdBy.uid || "unknown"} · {v.source}
                              {v.note ? ` · ${v.note}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => restoreVersion(v)}
                            disabled={restoringId !== null || status === "saving"}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:text-white disabled:opacity-40"
                          >
                            {restoringId === v.id ? "Restoring…" : "Restore"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Deploy now</h3>
                  <p className="text-sm text-white/40">
                    Save your changes and trigger a full site rebuild. The public site updates in ~60 seconds.
                  </p>
                  <button
                    onClick={saveAndDeploy}
                    disabled={(!hookConfigured && !deployHook.trim()) || deployStatus === "deploying"}
                    className="rounded-xl bg-[#1857EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40"
                  >
                    {deployStatus === "deploying"
                      ? "Deploying…"
                      : deployStatus === "done"
                      ? "✓ Deploy triggered"
                      : deployStatus === "error"
                      ? "Error — retry?"
                      : "Save & Deploy"}
                  </button>
                </Card>

                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-white/70">Your account</h3>
                  <p className="text-sm text-white/50">Signed in as <strong className="text-white/80">{user?.email}</strong></p>
                  <button
                    onClick={() => signOut(auth())}
                    className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:text-white/80"
                  >
                    Sign out
                  </button>
                </Card>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
