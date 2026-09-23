"use client";

/**
 * Admin dashboard — content editor.
 *
 * Tabs:
 *   Site Info | SEO | Hero | Services | FAQ | Pricing | Projects | Deploy
 *
 * Data flow:
 *   1. On mount: load content from Firestore (falls back to content.json values)
 *   2. User edits fields → local React state (shows "Unsaved" badge)
 *   3. "Save" → writes to Firestore (shows "Saved")
 *   4. "Save & Deploy" → saves to Firestore, then POSTs to the Vercel deploy hook
 *      (URL stored in Firestore settings/deploy document)
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
} from "@/lib/content";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "site"
  | "seo"
  | "hero"
  | "services"
  | "faq"
  | "pricing"
  | "projects"
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
  const [deployHook, setDeployHook] = useState("");

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
