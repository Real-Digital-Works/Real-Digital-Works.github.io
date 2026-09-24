"use client";

/**
 * Admin dashboard — content editor.
 *
 * Tabs:
 *   Site Info | SEO | Hero | Services | FAQ | Pricing | Projects | Blog | Pages | Deploy
 */

import { useEffect, useState, useCallback, type ChangeEvent } from "react";
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
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import content from "@/lib/content";
import type {
  SiteInfo,
  PageSeo,
  HeroContent,
  Service,
  FaqItem,
  Package,
  Project,
  BlogPost,
  DynamicPage,
} from "@/lib/content";
import { RichTextEditor } from "@/components/RichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "site"
  | "seo"
  | "hero"
  | "services"
  | "faq"
  | "pricing"
  | "projects"
  | "blog"
  | "pages"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
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
          className={`${base} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
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
  const [seoData, setSeoData] = useState(content.seo);
  const [heroData, setHeroData] = useState<HeroContent>(content.hero);
  const [servicesData, setServicesData] = useState<Service[]>(content.services);
  const [faqData, setFaqData] = useState<FaqItem[]>(content.faq);
  const [packagesData, setPackagesData] = useState<Package[]>(content.packages);
  const [projectsData, setProjectsData] = useState<Project[]>(content.projects);
  const [blogsData, setBlogsData] = useState<BlogPost[]>([]);
  const [pagesData, setPagesData] = useState<DynamicPage[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [deployHook, setDeployHook] = useState("");

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

  // ── Load from Firestore ──
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const snap = await getDoc(doc(db(), "cms", "content"));
        if (snap.exists()) {
          const d = snap.data();
          if (d.site) setSiteData(d.site);
          if (d.seo) setSeoData(d.seo);
          if (d.hero) setHeroData(d.hero);
          if (d.services) setServicesData(d.services);
          if (d.faq) setFaqData(d.faq);
          if (d.packages) setPackagesData(d.packages);
          if (d.projects) setProjectsData(d.projects);
        }
        // Load blogs collection
        const blogsSnap = await getDocs(collection(db(), "blogs"));
        const blogs = blogsSnap.docs.map((d) => ({ slug: d.id, ...d.data() } as BlogPost));
        setBlogsData(blogs.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));

        // Load pages collection
        const pagesSnap = await getDocs(collection(db(), "pages"));
        const pages = pagesSnap.docs.map((d) => ({ slug: d.id, ...d.data() } as DynamicPage));
        setPagesData(pages);

        const settingsSnap = await getDoc(doc(db(), "cms", "settings"));
        if (settingsSnap.exists()) {
          setDeployHook(settingsSnap.data().deployHook ?? "");
        }
      } catch (e) {
        console.error("Error loading content:", e);
      }
    }
    load();
  }, [user]);

  // ── Mark unsaved on any edit ──
  const markUnsaved = useCallback(() => setStatus("unsaved"), []);

  // ── Auth token helper for API calls ──
  async function getToken() {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error("Not signed in");
    return currentUser.getIdToken();
  }

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
      console.error("Failed to fetch users:", e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save to Firestore ──
  async function save() {
    setStatus("saving");
    try {
      await setDoc(doc(db(), "cms", "content"), {
        site: siteData,
        seo: seoData,
        hero: heroData,
        services: servicesData,
        faq: faqData,
        packages: packagesData,
        projects: projectsData,
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db(), "cms", "settings"), {
        deployHook,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      console.error("Save error:", e);
      setStatus("error");
    }
  }

  // ── Save & Deploy ──
  async function saveAndDeploy() {
    await save();
    if (!deployHook) {
      alert("Add a Vercel deploy hook URL in the Deploy tab first.");
      return;
    }
    setDeployStatus("deploying");
    try {
      await fetch(deployHook, { method: "POST" });
      setDeployStatus("done");
      setTimeout(() => setDeployStatus("idle"), 5000);
    } catch {
      setDeployStatus("error");
    }
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
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
    { id: "projects", label: "Projects" },
    { id: "blog", label: "✍ Blog" },
    { id: "pages", label: "📄 Pages" },
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
        <div className="border-t border-white/8 p-4">
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
            <button
              onClick={save}
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
                  <Field label="Site URL" value={siteData.url} onChange={(v) => { setSiteData((p) => ({ ...p, url: v })); markUnsaved(); }} hint="e.g. https://realdigitalworks.com" />
                </Card>
                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Contact details</h3>
                  <Field label="Phone (display)" value={siteData.phone} onChange={(v) => { setSiteData((p) => ({ ...p, phone: v })); markUnsaved(); }} />
                  <Field label="Phone (href)" value={siteData.phoneHref} onChange={(v) => { setSiteData((p) => ({ ...p, phoneHref: v })); markUnsaved(); }} />
                  <Field label="WhatsApp (display)" value={siteData.whatsapp} onChange={(v) => { setSiteData((p) => ({ ...p, whatsapp: v })); markUnsaved(); }} />
                  <Field label="Email" value={siteData.email} onChange={(v) => { setSiteData((p) => ({ ...p, email: v, emailHref: `mailto:${v}` })); markUnsaved(); }} />
                  <Field label="Business hours" value={siteData.hours} onChange={(v) => { setSiteData((p) => ({ ...p, hours: v })); markUnsaved(); }} />
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
                  <Field label="Sub-headline" value={heroData.sub} textarea onChange={(v) => { setHeroData((p) => ({ ...p, sub: v })); markUnsaved(); }} />
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
                <SectionTitle title="Services" sub="These appear on the Services page and in Google structured data." />
                {servicesData.map((svc, i) => (
                  <Card key={svc.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/80">{svc.title}</h3>
                      <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] text-white/40">{svc.id}</span>
                    </div>
                    <Field label="Service title" value={svc.title} onChange={(v) => { const s = [...servicesData]; s[i] = { ...s[i], title: v }; setServicesData(s); markUnsaved(); }} />
                    <Field label="Starting from (price)" value={svc.from} onChange={(v) => { const s = [...servicesData]; s[i] = { ...s[i], from: v }; setServicesData(s); markUnsaved(); }} />
                    <Field label="Short summary" value={svc.summary} textarea onChange={(v) => { const s = [...servicesData]; s[i] = { ...s[i], summary: v }; setServicesData(s); markUnsaved(); }} />
                    <Field label="Detail paragraph" value={svc.detail} textarea onChange={(v) => { const s = [...servicesData]; s[i] = { ...s[i], detail: v }; setServicesData(s); markUnsaved(); }} />
                  </Card>
                ))}
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
                    <Field label="Answer" value={item.a} textarea onChange={(v) => { const f = [...faqData]; f[i] = { ...f[i], a: v }; setFaqData(f); markUnsaved(); }} />
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

            {/* ── PROJECTS ── */}
            {tab === "projects" && (
              <>
                <SectionTitle title="Projects / Work" sub="Case studies shown on the Work page and in individual project pages." />
                {projectsData.map((proj, i) => (
                  <Card key={proj.slug} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ background: proj.accent }} />
                      <h3 className="text-sm font-semibold text-white/80">{proj.title}</h3>
                      <span className="ml-auto rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] text-white/40">{proj.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Project title" value={proj.title} onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], title: v }; setProjectsData(p); markUnsaved(); }} />
                      <Field label="Client" value={proj.client} onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], client: v }; setProjectsData(p); markUnsaved(); }} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Year" value={proj.year} onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], year: v }; setProjectsData(p); markUnsaved(); }} />
                      <Field label="Kind" value={proj.kind} onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], kind: v }; setProjectsData(p); markUnsaved(); }} />
                      <Field label="Accent colour" value={proj.accent} onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], accent: v }; setProjectsData(p); markUnsaved(); }} hint="#hex" />
                    </div>
                    <Field label="Summary (card text)" value={proj.summary} textarea onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], summary: v }; setProjectsData(p); markUnsaved(); }} />
                    <Field label="The problem" value={proj.problem} textarea onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], problem: v }; setProjectsData(p); markUnsaved(); }} />
                    <Field label="The work" value={proj.work} textarea onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], work: v }; setProjectsData(p); markUnsaved(); }} />
                    <Field label="The outcome" value={proj.outcome} textarea onChange={(v) => { const p = [...projectsData]; p[i] = { ...p[i], outcome: v }; setProjectsData(p); markUnsaved(); }} />
                  </Card>
                ))}
              </>
            )}

            {/* ── BLOG ── */}
            {tab === "blog" && (
              <>
                {!editingBlog ? (
                  <>
                    <SectionTitle
                      title="Blog"
                      sub="Write and publish blog posts. Each post gets its own page with full SEO."
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
                          <Card key={post.slug} className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-white">{post.title || "(untitled)"}</p>
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
                                  if (!confirm(`Delete "${post.title}"?`)) return;
                                  await deleteDoc(doc(db(), "blogs", post.slug));
                                  setBlogsData((b) => b.filter((p) => p.slug !== post.slug));
                                  markUnsaved();
                                }}
                                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                              >
                                Delete
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

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!editingBlog.slug) { alert("Add a URL slug first."); return; }
                          setStatus("saving");
                          try {
                            await setDoc(doc(db(), "blogs", editingBlog.slug), {
                              ...editingBlog,
                              updatedAt: serverTimestamp(),
                            });
                            setBlogsData((prev) => {
                              const idx = prev.findIndex((p) => p.slug === editingBlog.slug);
                              if (idx >= 0) { const n = [...prev]; n[idx] = editingBlog; return n; }
                              return [editingBlog, ...prev];
                            });
                            setStatus("saved");
                            setTimeout(() => { setStatus("idle"); setEditingBlog(null); }, 1500);
                          } catch (e) {
                            console.error(e); setStatus("error");
                          }
                        }}
                        className="rounded-xl bg-[#1857EC] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                      >
                        Save post
                      </button>
                      <button onClick={() => setEditingBlog(null)} className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/60 hover:text-white">
                        Cancel
                      </button>
                    </div>
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
                          <Card key={pg.slug} className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-white">{pg.title || "(untitled)"}</p>
                              <p className="text-xs text-white/40 mt-0.5">/{pg.slug} · {pg.status}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => setEditingPage(pg)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:text-white">Edit</button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete "${pg.title}"?`)) return;
                                  await deleteDoc(doc(db(), "pages", pg.slug));
                                  setPagesData((p) => p.filter((x) => x.slug !== pg.slug));
                                  markUnsaved();
                                }}
                                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                              >
                                Delete
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
                            console.error(e); setStatus("error");
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
                          console.error(e);
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
                      <p className="text-xs text-green-200/70">A copy of the link is below in case you need to resend it manually. It expires in 1 hour.</p>
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
                                  console.error(e);
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
                  <strong className="text-blue-300">How it works:</strong> The invite link opens <code className="rounded bg-white/10 px-1">realdigitalworks.com/auth/action</code> — a branded page where the user sets their own password. Once set, they can log in at <code className="rounded bg-white/10 px-1">/admin</code>. Links expire after 1 hour; generate a new one if it expires.
                </div>
              </>
            )}

            {/* ── DEPLOY ── */}
            {tab === "deploy" && (
              <>
                <SectionTitle
                  title="Deploy Settings"
                  sub="Configure the Vercel deploy hook so Save & Deploy triggers a new build."
                />
                <Card className="space-y-4">
                  <Field
                    label="Vercel deploy hook URL"
                    value={deployHook}
                    onChange={(v) => { setDeployHook(v); markUnsaved(); }}
                    hint="Vercel → Project settings → Git → Deploy hooks. Create one called 'Admin deploy', copy the URL here."
                  />
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200/70 leading-relaxed">
                    <strong className="text-blue-300">How it works:</strong> When you click "Save &amp; Deploy", we save your content to Firestore and POST to this URL. Vercel starts a new build — GitHub Actions then runs <code className="rounded bg-white/10 px-1">scripts/fetch-content.js</code> which reads your saved content from Firestore and writes it into the static build. Your site rebuilds with the new copy in about 60–90 seconds.
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-sm font-semibold text-white/70">Deploy now</h3>
                  <p className="text-sm text-white/40">
                    Save your changes and trigger a full site rebuild. The public site updates in ~60 seconds.
                  </p>
                  <button
                    onClick={saveAndDeploy}
                    disabled={!deployHook || deployStatus === "deploying"}
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
                  {!deployHook && (
                    <p className="text-xs text-yellow-400/70">Add the deploy hook URL above first.</p>
                  )}
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
