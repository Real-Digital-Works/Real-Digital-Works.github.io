"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { fieldLabel, resolveVisualSeo, VISUAL_PAGES } from "@/lib/visual-editor";
import { useVisualEditor } from "./VisualEditorProvider";

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4.2L19.2 9a1.5 1.5 0 0 0 0-2.1l-2.1-2.1a1.5 1.5 0 0 0-2.1 0L4 15.8V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SeoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function VisualEditorChrome() {
  const ctx = useVisualEditor();
  const pathname = usePathname();
  const [seoOpen, setSeoOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("seo") === "1";
  });

  const seo = useMemo(() => resolveVisualSeo(pathname, ctx.draft), [pathname, ctx.draft]);
  const withVisual = (href: string) =>
    ctx.isDevBypass && href.indexOf("visual=") === -1
      ? `${href}${href.includes("?") ? "&" : "?"}visual=1`
      : href;

  if (!ctx.enabled) return null;

  const statusTone =
    ctx.status === "error" ? "#FECACA" : ctx.status === "saved" ? "#BBF7D0" : "#E2E8F0";

  return (
    <>
      <style>{visualEditorCss}</style>
      <div className="rdw-ve-bar" role="region" aria-label="Visual content editor">
        <div className="rdw-ve-row">
          <div className="rdw-ve-bar-left">
            <span className="rdw-ve-mark">
              <PencilIcon />
              Visual editor
            </span>
            {ctx.isDevBypass && !ctx.user ? (
              <span className="rdw-ve-dev" title="process.env.NODE_ENV === 'development' only">
                DEV ONLY · ?visual=1
              </span>
            ) : (
              <span className="rdw-ve-live">Signed in</span>
            )}
            <span className="rdw-ve-page">{seo.label}</span>
            {ctx.selectedPath ? (
              <span className="rdw-ve-field">Editing {fieldLabel(ctx.selectedPath)}</span>
            ) : (
              <span className="rdw-ve-hint">Click outlined text to edit</span>
            )}
          </div>
          <div className="rdw-ve-actions">
            <button type="button" className="rdw-ve-btn" onClick={() => setSeoOpen(true)}>
              <SeoIcon />
              SEO
            </button>
            <button
              type="button"
              className="rdw-ve-btn"
              onClick={() => void ctx.save("save")}
              disabled={ctx.status === "saving"}
            >
              {ctx.dirty ? "Save" : "Saved"}
            </button>
            <button
              type="button"
              className="rdw-ve-btn rdw-ve-btn-primary"
              onClick={() => void ctx.deploy()}
              disabled={ctx.status === "saving"}
            >
              Save &amp; Deploy
            </button>
            <Link href="/admin/dashboard" className="rdw-ve-btn rdw-ve-link">
              Advanced
            </Link>
            <button type="button" className="rdw-ve-btn" onClick={ctx.exit} title="Back to admin">
              Done
            </button>
          </div>
        </div>
        <nav className="rdw-ve-pages" aria-label="Pages to edit">
          {VISUAL_PAGES.map((page) => (
            <Link
              key={page.href}
              href={withVisual(page.href)}
              className={pathname === page.href ? "rdw-ve-chip rdw-ve-chip-on" : "rdw-ve-chip"}
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
      {ctx.statusMessage ? (
        <p className="rdw-ve-status" style={{ color: statusTone }} role="status">
          {ctx.statusMessage}
        </p>
      ) : null}

      {seoOpen ? (
        <div className="rdw-ve-drawer-root">
          <button
            type="button"
            className="rdw-ve-backdrop"
            aria-label="Close SEO drawer"
            onClick={() => setSeoOpen(false)}
          />
          <aside className="rdw-ve-drawer" aria-labelledby="rdw-ve-seo-title">
            <div className="rdw-ve-drawer-head">
              <div>
                <p className="rdw-ve-kicker">Search appearance</p>
                <h2 id="rdw-ve-seo-title">SEO · {seo.label}</h2>
              </div>
              <button type="button" className="rdw-ve-btn" onClick={() => setSeoOpen(false)}>
                Close
              </button>
            </div>
            <label className="rdw-ve-label">
              Title tag
              <input
                className="rdw-ve-input"
                value={seo.title}
                onChange={(event) =>
                  ctx.patchDraft(
                    seo.apply(ctx.draft, {
                      title: event.target.value,
                      description: seo.description,
                      keywords: seo.keywords,
                    }),
                  )
                }
              />
              <span className="rdw-ve-count">{seo.title.length} characters</span>
            </label>
            <label className="rdw-ve-label">
              Meta description
              <textarea
                className="rdw-ve-input rdw-ve-textarea"
                rows={4}
                value={seo.description}
                onChange={(event) =>
                  ctx.patchDraft(
                    seo.apply(ctx.draft, {
                      title: seo.title,
                      description: event.target.value,
                      keywords: seo.keywords,
                    }),
                  )
                }
              />
              <span className="rdw-ve-count">
                {seo.description.length} / 160 — search engines typically cut here
              </span>
            </label>
            <label className="rdw-ve-label">
              Keywords
              <input
                className="rdw-ve-input"
                value={seo.keywords.join(", ")}
                onChange={(event) =>
                  ctx.patchDraft(
                    seo.apply(ctx.draft, {
                      title: seo.title,
                      description: seo.description,
                      keywords: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }),
                  )
                }
                placeholder="comma, separated, phrases"
              />
            </label>
            <div className="rdw-ve-serp">
              <p className="rdw-ve-kicker">Google-style preview</p>
              <p className="rdw-ve-serp-url">realdigitalworks.com{pathname === "/" ? "" : pathname}</p>
              <p className="rdw-ve-serp-title">{seo.title || "Untitled page"}</p>
              <p className="rdw-ve-serp-desc">
                {seo.description || "Add a description so this page can rank on the words Ali cares about."}
              </p>
            </div>
            <p className="rdw-ve-note">
              This is not a Wix-style layout builder. You are editing the real site copy and this
              page’s SEO. Layout, colours, and blocks stay in code. The existing /admin dashboard
              remains for lists, images, and advanced fields.
            </p>
          </aside>
        </div>
      ) : null}
    </>
  );
}

const visualEditorCss = `
html[data-rdw-visual] body { padding-top: 96px; }
.rdw-ve-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 80;
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 14px 10px;
  background: rgba(12, 16, 24, 0.94);
  color: #F8FAFC;
  border-bottom: 1px solid rgba(24, 87, 236, 0.45);
  box-shadow: 0 12px 40px rgba(0,0,0,.28);
  backdrop-filter: blur(16px);
  font-family: var(--font-outfit), system-ui, sans-serif;
}
.rdw-ve-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rdw-ve-bar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.rdw-ve-mark { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 650; letter-spacing: .01em; }
.rdw-ve-dev {
  font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  background: #F59E0B; color: #111827; padding: 3px 7px; border-radius: 999px;
}
.rdw-ve-live {
  font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  background: #1857EC; color: #fff; padding: 3px 7px; border-radius: 999px;
}
.rdw-ve-page { font-size: 12px; color: #93C5FD; }
.rdw-ve-field, .rdw-ve-hint { font-size: 12px; color: #94A3B8; }
.rdw-ve-pages { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; }
.rdw-ve-chip {
  font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
  color: #CBD5E1; border: 1px solid rgba(255,255,255,.12); border-radius: 999px;
  padding: 5px 9px; cursor: pointer; text-decoration: none;
}
.rdw-ve-chip:hover { border-color: #1857EC; color: #fff; }
.rdw-ve-chip-on { background: #1857EC; border-color: #1857EC; color: #fff; }
.rdw-ve-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.rdw-ve-btn {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  height: 32px; padding: 0 10px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,.14); background: transparent; color: #F8FAFC;
  font-size: 12px; font-weight: 600;
}
.rdw-ve-btn:hover { border-color: #38BDF8; }
.rdw-ve-btn:disabled { opacity: .5; cursor: not-allowed; }
.rdw-ve-btn-primary { background: #1857EC; border-color: #1857EC; }
.rdw-ve-btn-primary:hover { opacity: .92; border-color: #1857EC; }
.rdw-ve-link { text-decoration: none; line-height: 32px; }
.rdw-ve-status {
  position: fixed; top: 100px; left: 50%; transform: translateX(-50%); z-index: 81;
  margin: 0; padding: 6px 12px; border-radius: 999px;
  background: rgba(12,16,24,.92); font-size: 12px; font-weight: 600;
}
.rdw-ve-drawer-root { position: fixed; inset: 0; z-index: 90; }
.rdw-ve-backdrop { position: absolute; inset: 0; background: rgba(8,12,20,.45); border: 0; cursor: pointer; }
.rdw-ve-drawer {
  position: absolute; top: 0; right: 0; height: 100%; width: min(420px, 100vw);
  background: #0F172A; color: #F8FAFC; padding: 22px 22px 32px;
  border-left: 1px solid rgba(24,87,236,.4);
  box-shadow: -18px 0 50px rgba(0,0,0,.35);
  overflow: auto;
}
.rdw-ve-drawer-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.rdw-ve-drawer h2 { margin: 4px 0 0; font-size: 22px; letter-spacing: -.03em; }
.rdw-ve-kicker { margin: 0; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #38BDF8; }
.rdw-ve-label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 650; margin-bottom: 14px; }
.rdw-ve-input {
  width: 100%; border-radius: 10px; border: 1px solid rgba(255,255,255,.12);
  background: #1E293B; color: #F8FAFC; padding: 10px 12px; font-size: 14px; font-weight: 500;
}
.rdw-ve-input:focus { outline: 2px solid #1857EC; border-color: #1857EC; }
.rdw-ve-textarea { resize: vertical; min-height: 96px; line-height: 1.5; }
.rdw-ve-count { font-weight: 500; color: #94A3B8; }
.rdw-ve-serp {
  border: 1px solid rgba(255,255,255,.1); border-radius: 14px; padding: 14px; background: #020617; margin: 8px 0 16px;
}
.rdw-ve-serp-url { color: #059669; font-size: 12px; margin: 8px 0 2px; }
.rdw-ve-serp-title { color: #1D4ED8; font-size: 18px; margin: 0; line-height: 1.3; }
.rdw-ve-serp-desc { color: #64748B; font-size: 13px; margin: 6px 0 0; line-height: 1.45; }
.rdw-ve-note { font-size: 12px; line-height: 1.5; color: #94A3B8; }
.rdw-cms-field {
  outline: 1px dashed rgba(24,87,236,.0); outline-offset: 3px;
  cursor: text; border-radius: 4px; transition: outline-color 150ms ease, background 150ms ease;
}
.rdw-cms-field:hover { outline-color: rgba(24,87,236,.55); background: rgba(24,87,236,.08); }
.rdw-cms-field:focus, .rdw-cms-field-selected {
  outline: 2px solid #1857EC; background: rgba(24,87,236,.12);
}
@media (prefers-reduced-motion: reduce) {
  .rdw-cms-field, .rdw-ve-chip, .rdw-ve-btn { transition: none; }
}
`;
