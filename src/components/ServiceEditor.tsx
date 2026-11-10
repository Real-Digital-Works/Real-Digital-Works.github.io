"use client";

import type { CmsServiceRecord, ServiceCategory } from "@/lib/content";
import { SERVICE_CATEGORIES } from "@/lib/content";
import { LIVE_SERVICE_SLUGS } from "@/lib/services-data";
import { RichTextEditor } from "@/components/RichTextEditor";

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
      <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </label>
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${base} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export function ServiceEditor({
  services,
  openSlug,
  onOpen,
  onPatch,
  onRemove,
  onMove,
  onAdd,
}: {
  services: CmsServiceRecord[];
  openSlug: string | null;
  onOpen: (slug: string | null) => void;
  onPatch: (index: number, patch: Partial<CmsServiceRecord>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onAdd: () => void;
}) {
  return (
    <>
      {services.length === 0 && (
        <p className="mb-4 text-sm text-white/40">
          No services. The public /services listing, sitemap, and contact dropdown stay empty until you add one. Hidden services still keep their URLs.
        </p>
      )}
      {services.map((page, i) => {
        const livePath = `/services/${page.slug}`;
        const open = openSlug === page.slug;
        const slugIsLive = LIVE_SERVICE_SLUGS.has(page.slug);
        return (
          <div
            key={page.slug || `new-${i}`}
            className={`space-y-4 rounded-2xl border p-6 ${
              page.hidden ? "border-white/5 bg-white/2 opacity-70" : "border-white/8 bg-white/4"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpen(open ? null : page.slug)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="text-white/35">{open ? "▾" : "▸"}</span>
                <span>
                  <span className="block text-sm font-semibold text-white/80">
                    {page.title || "Untitled"}
                    {page.hidden ? (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                        Hidden
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono text-[11px] text-white/35">{livePath}</span>
                </span>
              </button>
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
                  disabled={i === services.length - 1}
                  className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <a
                  href={livePath}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] text-[#60a5fa] hover:bg-white/12"
                >
                  Open {livePath}
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-xs text-red-400/60 hover:text-red-400"
                  title="Hidden from menus and listings. The URL still works."
                >
                  {page.hidden ? "Unhide" : "Hide"}
                </button>
              </div>
            </div>

            {open && (
              <div className="space-y-6 border-t border-white/8 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Page name"
                    value={page.title}
                    onChange={(v) => onPatch(i, { title: v })}
                    hint="Short name in related-service cards and the menu. Not the H1 — that is the SEO title."
                  />
                  <Field
                    label="Slug (URL)"
                    value={page.slug}
                    onChange={(v) => onPatch(i, { slug: v })}
                    hint="/services/your-slug — generated from the title, editable, must be unique."
                  />
                </div>
                <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-[12px] text-yellow-200/80">
                  Changing a live slug breaks old URLs. There is no automatic redirect.
                  {slugIsLive ? " This slug is one of the original public service URLs." : ""}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                      Category
                    </label>
                    <select
                      value={page.category}
                      onChange={(e) => onPatch(i, { category: e.target.value as ServiceCategory })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC]"
                    >
                      {SERVICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <Field
                    label="Starting from (price)"
                    value={page.from}
                    onChange={(v) => onPatch(i, { from: v })}
                    hint={`Shown on listing cards and next to the quote buttons on ${livePath}.`}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={page.showOnHome}
                    onChange={(e) => onPatch(i, { showOnHome: e.target.checked })}
                    className="accent-[#1857EC]"
                  />
                  Show on the homepage offer strip
                </label>

                <div className="space-y-4 rounded-xl border border-white/8 p-4">
                  <h4 className="text-sm font-semibold text-white/80">Listing card</h4>
                  <p className="text-[11px] text-white/35">
                    Homepage (if ticked above) and the /services grid. Individual page copy is below.
                  </p>
                  <Field
                    label="Listing title"
                    value={page.listingTitle}
                    onChange={(v) => onPatch(i, { listingTitle: v })}
                    hint="Leave blank to use the page name."
                  />
                  <Field
                    label="Short summary"
                    value={page.summary}
                    textarea
                    onChange={(v) => onPatch(i, { summary: v })}
                    hint="Homepage and /services listing card."
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
                      Detail description
                    </label>
                    <p className="text-[11px] text-white/30">
                      Longer copy on the /services listing card only.
                    </p>
                    <RichTextEditor
                      content={page.detail}
                      onChange={(html) => onPatch(i, { detail: html })}
                      placeholder="Detailed description…"
                      minHeight="140px"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-[#1857EC]/25 bg-[#1857EC]/8 p-4">
                  <h4 className="text-sm font-semibold text-white/85">SEO for {livePath}</h4>
                  <p className="text-[11px] text-white/40">
                    Canonical stays {livePath}. The SEO title is also the public H1 (with the brand stripped if it is already in the string).
                  </p>
                  <Field
                    label="SEO title (also the H1)"
                    value={page.seoTitle}
                    onChange={(v) => onPatch(i, { seoTitle: v })}
                    hint="50–60 characters. Browser tab, Google title, Open Graph title, and the large heading on this page."
                  />
                  <Field
                    label="Meta description"
                    value={page.seoDescription}
                    textarea
                    onChange={(v) => onPatch(i, { seoDescription: v })}
                    hint="130–160 characters. Meta description and Open Graph description."
                  />
                  <Field
                    label="Keywords (comma separated)"
                    value={(page.keywords ?? []).join(", ")}
                    onChange={(v) =>
                      onPatch(i, {
                        keywords: v.split(",").map((k) => k.trim()).filter(Boolean),
                      })
                    }
                    hint="Used in meta keywords, same as other page SEO editors."
                  />
                </div>

                <Field
                  label="Intro"
                  value={page.intro}
                  textarea
                  onChange={(v) => onPatch(i, { intro: v })}
                  hint="Paragraph under the H1 on the individual page."
                />
                <Field
                  label="Overview"
                  value={page.overview}
                  textarea
                  onChange={(v) => onPatch(i, { overview: v })}
                  hint="“How we approach this” body on the individual page."
                />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/80">Feature cards</h4>
                  <p className="text-[11px] text-white/35">“What we can help with” — typically six cards.</p>
                  {page.whatsIncluded.map((item, idx) => (
                    <div key={idx} className="space-y-2 rounded-xl border border-white/8 p-3">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/30">Card {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onPatch(i, {
                              whatsIncluded: page.whatsIncluded.filter((_, n) => n !== idx),
                            })
                          }
                          className="text-xs text-red-400/60 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      <Field
                        label="Title"
                        value={item.title}
                        onChange={(v) => {
                          const next = [...page.whatsIncluded];
                          next[idx] = { ...next[idx], title: v };
                          onPatch(i, { whatsIncluded: next });
                        }}
                      />
                      <Field
                        label="Body"
                        value={item.description}
                        textarea
                        onChange={(v) => {
                          const next = [...page.whatsIncluded];
                          next[idx] = { ...next[idx], description: v };
                          onPatch(i, { whatsIncluded: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      onPatch(i, {
                        whatsIncluded: [...page.whatsIncluded, { title: "", description: "" }],
                      })
                    }
                    className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/40 hover:border-white/30"
                  >
                    + Add feature card
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/80">Process steps</h4>
                  <p className="text-[11px] text-white/35">Discover → Scope → Deliver → Review → Handover on {livePath}.</p>
                  {page.process.map((item, idx) => (
                    <div key={idx} className="space-y-2 rounded-xl border border-white/8 p-3">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/30">Step {String(idx + 1).padStart(2, "0")}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onPatch(i, {
                              process: page.process.filter((_, n) => n !== idx),
                            })
                          }
                          className="text-xs text-red-400/60 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      <Field
                        label="Title"
                        value={item.title}
                        onChange={(v) => {
                          const next = [...page.process];
                          next[idx] = { ...next[idx], title: v };
                          onPatch(i, { process: next });
                        }}
                      />
                      <Field
                        label="Body"
                        value={item.description}
                        textarea
                        onChange={(v) => {
                          const next = [...page.process];
                          next[idx] = { ...next[idx], description: v };
                          onPatch(i, { process: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      onPatch(i, {
                        process: [...page.process, { title: "", description: "" }],
                      })
                    }
                    className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/40 hover:border-white/30"
                  >
                    + Add process step
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/80">FAQs</h4>
                  <p className="text-[11px] text-white/35">
                    Visible FAQ section and the FAQ JSON-LD on this page stay in sync.
                  </p>
                  {page.faq.map((item, idx) => (
                    <div key={idx} className="space-y-2 rounded-xl border border-white/8 p-3">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-white/30">FAQ {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onPatch(i, {
                              faq: page.faq.filter((_, n) => n !== idx),
                            })
                          }
                          className="text-xs text-red-400/60 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      <Field
                        label="Question"
                        value={item.q}
                        onChange={(v) => {
                          const next = [...page.faq];
                          next[idx] = { ...next[idx], q: v };
                          onPatch(i, { faq: next });
                        }}
                      />
                      <Field
                        label="Answer"
                        value={item.a}
                        textarea
                        onChange={(v) => {
                          const next = [...page.faq];
                          next[idx] = { ...next[idx], a: v };
                          onPatch(i, { faq: next });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      onPatch(i, {
                        faq: [...page.faq, { q: "", a: "" }],
                      })
                    }
                    className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/40 hover:border-white/30"
                  >
                    + Add FAQ
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white/80">Related services</h4>
                  <p className="text-[11px] text-white/35">Shown at the bottom of {livePath}.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {services.filter((rel) => rel.slug && rel.slug !== page.slug && !rel.hidden).map((rel) => {
                      const checked = page.relatedSlugs.includes(rel.slug);
                      return (
                        <label key={rel.slug} className="flex items-center gap-2 text-[13px] text-white/70">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? page.relatedSlugs.filter((s) => s !== rel.slug)
                                : [...page.relatedSlugs, rel.slug];
                              onPatch(i, { relatedSlugs: next });
                            }}
                            className="accent-[#1857EC]"
                          />
                          {rel.title || rel.slug}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-2xl border border-dashed border-white/15 py-4 text-sm text-white/40 transition hover:border-white/30 hover:text-white/60"
      >
        + Add service
      </button>
    </>
  );
}
