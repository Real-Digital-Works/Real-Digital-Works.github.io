"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mergeNavItems, navItems, type NavItem } from "@/lib/content";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { usePopupCopy } from "@/components/visual-editor/CmsText";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";

function flattenNav(items: NavItem[]): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  for (const item of items) {
    if (item.hidden) continue;
    out.push({ label: item.label, href: item.href });
    if (item.children) out.push(...flattenNav(item.children));
  }
  return out;
}

export function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const visual = useVisualEditorOptional();
  const copy = usePopupCopy("commandK");
  const liveNav = visual?.enabled ? mergeNavItems(visual.draft.navItems) : navItems;

  useEffect(() => {
    setOpen(false);
    setQ("");
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("rdw:commandk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("rdw:commandk", onOpen);
    };
  }, []);

  useEffect(() => {
    if (visual?.activePopup === "commandK") setOpen(true);
  }, [visual?.activePopup]);

  const legalItems = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Modern Slavery Policy", href: "/modern-slavery" },
  ];
  const seen = new Set<string>();
  const items = [...flattenNav(liveNav), ...legalItems].filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return item.label.toLowerCase().includes(q.toLowerCase());
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="glass mx-auto mt-[18vh] w-[min(92vw,520px)] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy("placeholder")}
          className="w-full border-b border-line bg-transparent px-5 py-4 text-lg outline-none"
          onFocus={() => visual?.selectPopup("commandK")}
        />
        <ul className="p-2">
          {items.map((item) => (
            <li key={item.href}>
              <CmsLink
                href={item.href}
                className="block rounded-xl px-4 py-3 text-fg/80 hover:bg-fg/8"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </CmsLink>
            </li>
          ))}
          <li>
            <CmsLink
              popupId="commandK"
              labelKey="ctaLabel"
              hrefKey="ctaHref"
              href="/contact"
              className="block w-full rounded-xl px-4 py-3 text-left text-fg/80 hover:bg-fg/8"
              onClick={() => setOpen(false)}
            >
              Send a brief
            </CmsLink>
          </li>
        </ul>
        <p className="px-5 py-3 font-mono text-[11px] text-fg/35">{copy("hint")}</p>
      </div>
    </div>
  );
}
