"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CTA_BY_ID,
  destinationGroups,
  findNavItem,
  patchNavItem,
  POPUP_BY_ID,
  POPUP_DEFS,
  popupText,
  resolveCta,
  type PopupField,
} from "@/lib/cms-ui";
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

function DestinationField({
  href,
  onChange,
}: {
  href: string;
  onChange: (next: string) => void;
}) {
  const ctx = useVisualEditor();
  const groups = useMemo(() => destinationGroups(ctx.draft), [ctx.draft]);
  const matched = groups.some((group) => group.items.some((item) => item.href === href));
  const selectValue = matched ? href : "__custom__";

  return (
    <label className="rdw-ve-label">
      Destination
      <select
        className="rdw-ve-input"
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "__custom__") return;
          onChange(next);
        }}
      >
        {groups.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((item) => (
              <option key={`${group.group}-${item.href}`} value={item.href}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value="__custom__">Custom URL / mailto / tel / WhatsApp</option>
      </select>
      <input
        className="rdw-ve-input"
        value={href}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/contact, https://…, mailto:, tel:, https://wa.me/…"
      />
      <span className="rdw-ve-count">
        Pairing pages: pick Home, a service, a case study, or paste a custom URL.
      </span>
    </label>
  );
}

function PopupFields({
  id,
  fields,
}: {
  id: string;
  fields: PopupField[];
}) {
  const ctx = useVisualEditor();
  return (
    <>
      {fields.map((field) => {
        if (field.kind === "cta") {
          const label = popupText(ctx.draft, id, field.labelKey);
          const href = popupText(ctx.draft, id, field.hrefKey);
          return (
            <div key={field.key} className="rdw-ve-block">
              <label className="rdw-ve-label">
                {field.label}
                <input
                  className="rdw-ve-input"
                  value={label}
                  onChange={(event) => ctx.setText(`popups.${id}.${field.labelKey}`, event.target.value)}
                />
              </label>
              <DestinationField
                href={href}
                onChange={(next) => ctx.setText(`popups.${id}.${field.hrefKey}`, next)}
              />
            </div>
          );
        }
        const value = popupText(ctx.draft, id, field.key);
        return (
          <label key={field.key} className="rdw-ve-label">
            {field.label}
            {field.kind === "textarea" ? (
              <textarea
                className="rdw-ve-input rdw-ve-textarea"
                rows={3}
                value={value}
                onChange={(event) => ctx.setText(`popups.${id}.${field.key}`, event.target.value)}
              />
            ) : (
              <input
                className="rdw-ve-input"
                value={value}
                onChange={(event) => ctx.setText(`popups.${id}.${field.key}`, event.target.value)}
              />
            )}
          </label>
        );
      })}
    </>
  );
}

export function VisualEditorChrome() {
  const ctx = useVisualEditor();
  const pathname = usePathname();
  const router = useRouter();
  const [seoOpen, setSeoOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("seo") === "1";
  });
  const [popupsOpen, setPopupsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const seo = useMemo(() => resolveVisualSeo(pathname, ctx.draft), [pathname, ctx.draft]);
  const withVisual = (href: string) =>
    ctx.isDevBypass && href.indexOf("visual=") === -1
      ? `${href}${href.includes("?") ? "&" : "?"}visual=1`
      : href;

  if (!ctx.enabled) return null;

  const statusTone =
    ctx.status === "error" ? "#FECACA" : ctx.status === "saved" ? "#BBF7D0" : "#E2E8F0";

  const selectionKind = ctx.selection?.kind ?? "none";
  const hint =
    selectionKind === "link" || selectionKind === "nav"
      ? "Link — label and destination"
      : selectionKind === "popup"
        ? "Pop-up copy"
        : ctx.selectedPath
          ? `Text · ${fieldLabel(ctx.selectedPath)}`
          : "Click outlined text, a green link, or Edit pop-ups";

  function openListedPopup(id: string) {
    const def = POPUP_BY_ID[id];
    setPopupsOpen(false);
    setInspectorOpen(true);
    ctx.openPopup(id);
    if (def?.open === "route" && def.href && pathname !== def.href) {
      router.push(withVisual(def.href));
    }
    if (id === "workflow" && pathname !== "/") {
      router.push(withVisual("/"));
    }
  }

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
            <span className="rdw-ve-hint">{hint}</span>
          </div>
          <div className="rdw-ve-actions">
            <button type="button" className="rdw-ve-btn" onClick={() => setInspectorOpen((v) => !v)}>
              Inspector
            </button>
            <button type="button" className="rdw-ve-btn" onClick={() => setPopupsOpen(true)}>
              Edit pop-ups
            </button>
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

      {inspectorOpen ? (
        <aside className="rdw-ve-inspector" aria-label="Selected element inspector">
          {ctx.selection?.kind === "link" ? (
            <LinkInspector id={ctx.selection.id} />
          ) : ctx.selection?.kind === "nav" ? (
            <NavInspector id={ctx.selection.id} />
          ) : ctx.selection?.kind === "popup" ? (
            <PopupInspector id={ctx.selection.id} />
          ) : ctx.selection?.kind === "text" ? (
            <TextInspector path={ctx.selection.path} />
          ) : (
            <div>
              <p className="rdw-ve-kicker">Inspector</p>
              <h2>Nothing selected</h2>
              <p className="rdw-ve-note">
                Blue outline is wording. Green outline is a button or link (label + where it goes).
                Use Edit pop-ups for Ask RDW, the brief form, and the quote builder.
              </p>
            </div>
          )}
        </aside>
      ) : null}

      {popupsOpen ? (
        <div className="rdw-ve-drawer-root">
          <button
            type="button"
            className="rdw-ve-backdrop"
            aria-label="Close pop-ups list"
            onClick={() => setPopupsOpen(false)}
          />
          <aside className="rdw-ve-drawer" aria-labelledby="rdw-ve-popups-title">
            <div className="rdw-ve-drawer-head">
              <div>
                <p className="rdw-ve-kicker">Overlays</p>
                <h2 id="rdw-ve-popups-title">Edit pop-ups</h2>
              </div>
              <button type="button" className="rdw-ve-btn" onClick={() => setPopupsOpen(false)}>
                Close
              </button>
            </div>
            <ul className="rdw-ve-popup-list">
              {POPUP_DEFS.map((item) => (
                <li key={item.id}>
                  <button type="button" className="rdw-ve-popup-item" onClick={() => openListedPopup(item.id)}>
                    <strong>{item.title}</strong>
                    <span>{item.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="rdw-ve-note">
              There is no cookie banner on this site. Start a brief is the header button plus the
              contact form — not a second product.
            </p>
          </aside>
        </div>
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
              This is not a Wix-style layout builder. You are editing the real site copy, links, and
              pop-ups. Layout stays in code.
            </p>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function TextInspector({ path }: { path: string }) {
  const ctx = useVisualEditor();
  return (
    <div>
      <p className="rdw-ve-kicker">Text</p>
      <h2>{fieldLabel(path)}</h2>
      <p className="rdw-ve-note">
        Click the outlined copy on the page and type. Save &amp; Deploy writes it to cms/content.
      </p>
      <label className="rdw-ve-label">
        Value
        <textarea
          className="rdw-ve-input rdw-ve-textarea"
          rows={4}
          value={ctx.getText(path)}
          onChange={(event) => ctx.setText(path, event.target.value)}
        />
      </label>
    </div>
  );
}

function LinkInspector({ id }: { id: string }) {
  const ctx = useVisualEditor();
  const def = CTA_BY_ID[id];
  const value = resolveCta(ctx.draft, id);
  if (!def) {
    return <p className="rdw-ve-note">Unknown link {id}</p>;
  }
  return (
    <div>
      <p className="rdw-ve-kicker">Link</p>
      <h2>{def.title}</h2>
      <label className="rdw-ve-label">
        Label
        <input
          className="rdw-ve-input"
          value={value.label}
          onChange={(event) => ctx.setText(def.labelPath, event.target.value)}
        />
      </label>
      <DestinationField href={value.href} onChange={(next) => ctx.setText(def.hrefPath, next)} />
    </div>
  );
}

function NavInspector({ id }: { id: string }) {
  const ctx = useVisualEditor();
  const item = findNavItem(ctx.draft.navItems, id);
  if (!item) {
    return <p className="rdw-ve-note">That menu item is not in the saved nav.</p>;
  }
  return (
    <div>
      <p className="rdw-ve-kicker">Menu link</p>
      <h2>{item.label}</h2>
      <label className="rdw-ve-label">
        Label
        <input
          className="rdw-ve-input"
          value={item.label}
          onChange={(event) =>
            ctx.patchDraft({
              ...ctx.draft,
              navItems: patchNavItem(ctx.draft.navItems ?? [], id, { label: event.target.value }),
            })
          }
        />
      </label>
      <DestinationField
        href={item.href}
        onChange={(next) =>
          ctx.patchDraft({
            ...ctx.draft,
            navItems: patchNavItem(ctx.draft.navItems ?? [], id, { href: next }),
          })
        }
      />
    </div>
  );
}

function PopupInspector({ id }: { id: string }) {
  const def = POPUP_BY_ID[id];
  if (!def) return <p className="rdw-ve-note">Unknown pop-up {id}</p>;
  return (
    <div>
      <p className="rdw-ve-kicker">Pop-up</p>
      <h2>{def.title}</h2>
      <p className="rdw-ve-note">{def.hint}</p>
      <PopupFields id={id} fields={def.fields} />
    </div>
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
.rdw-ve-inspector {
  position: fixed; top: 108px; right: 12px; z-index: 82;
  width: min(340px, calc(100vw - 24px)); max-height: calc(100vh - 128px);
  overflow: auto; padding: 16px 16px 20px;
  background: rgba(15, 23, 42, 0.96); color: #F8FAFC;
  border: 1px solid rgba(24,87,236,.4); border-radius: 16px;
  box-shadow: 0 18px 50px rgba(0,0,0,.35);
  font-family: var(--font-outfit), system-ui, sans-serif;
}
.rdw-ve-inspector h2 { margin: 4px 0 10px; font-size: 18px; letter-spacing: -.03em; }
.rdw-ve-block { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,.08); }
.rdw-ve-popup-list { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 8px; }
.rdw-ve-popup-item {
  width: 100%; text-align: left; cursor: pointer;
  border: 1px solid rgba(255,255,255,.12); background: #1E293B; color: #F8FAFC;
  border-radius: 12px; padding: 12px 14px;
}
.rdw-ve-popup-item strong { display: block; font-size: 14px; }
.rdw-ve-popup-item span { display: block; margin-top: 4px; font-size: 12px; color: #94A3B8; }
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
.rdw-cms-link {
  outline: 1px dashed rgba(16,185,129,0); outline-offset: 3px;
  cursor: pointer; border-radius: 4px;
}
.rdw-cms-link:hover { outline-color: rgba(16,185,129,.7); background: rgba(16,185,129,.1); }
.rdw-cms-link-selected { outline: 2px solid #10B981; background: rgba(16,185,129,.14); }
@media (prefers-reduced-motion: reduce) {
  .rdw-cms-field, .rdw-ve-chip, .rdw-ve-btn { transition: none; }
}
`;
