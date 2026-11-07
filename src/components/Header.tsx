"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Logo } from "./Logo";
import { isServicesNavItem, mergeNavItems, navItems, type NavItem } from "@/lib/content";
import { serviceCategories, servicePages } from "@/lib/services-data";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";

const serviceMap = Object.fromEntries(servicePages.map((s) => [s.slug, s]));

function serviceSlugFromHref(href: string): string | null {
  const match = href.match(/^\/services\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function groupedNavChildren(children: NavItem[]) {
  const visible = children.filter((child) => !child.hidden);
  const used = new Set<string>();
  const groups = serviceCategories
    .map((cat) => ({
      label: cat.label,
      items: visible.filter((child) => {
        const slug = serviceSlugFromHref(child.href);
        if (!slug || !cat.slugs.includes(slug)) return false;
        used.add(child.id);
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
  const rest = visible.filter((child) => !used.has(child.id));
  if (rest.length) groups.push({ label: "Links", items: rest });
  return groups;
}

export function Header() {
  const pathname = usePathname();
  const visual = useVisualEditorOptional();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [servicesAccordionOpen, setServicesAccordionOpen] = useState(false);
  // Tracks which desktop sub-nav dropdown is open (by item id)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTriggerRef = useRef<HTMLButtonElement>(null);

  const visibleNav = (visual?.enabled ? mergeNavItems(visual.draft.navItems) : navItems).filter(
    (item) => !item.hidden,
  );

  useEffect(() => {
    if (visual?.activePopup === "mobileMenu") setOpen(true);
  }, [visual?.activePopup]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
    setDropdownOpen(null);
    setServicesAccordionOpen(false);
  }, [pathname]);

  // Close mega menu on outside click
  useEffect(() => {
    if (!megaOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        megaRef.current &&
        !megaRef.current.contains(e.target as Node) &&
        megaTriggerRef.current &&
        !megaTriggerRef.current.contains(e.target as Node)
      ) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [megaOpen]);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-2xl ${
        stuck || open || megaOpen
          ? "border-b border-line bg-[var(--header)]"
          : "border-b border-transparent bg-[var(--header)]"
      }`}
    >
      <div className="wrap flex h-16 items-center gap-0.5">
        <Link href="/" className="mr-auto">
          <Logo />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {visibleNav.map((item) => {
            const servicesItem = isServicesNavItem(item);
            const childList = item.children;
            const visibleChildren = (childList ?? []).filter((c) => !c.hidden);
            const useCmsMega = servicesItem && childList !== undefined;
            const useLegacyMega = servicesItem && childList === undefined;
            const hasChildren = visibleChildren.length > 0;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            // Services with no saved children → legacy CMS mega menu
            if (useLegacyMega) {
              return (
                <button
                  key={item.id}
                  ref={megaTriggerRef}
                  type="button"
                  onClick={() => setMegaOpen((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                    isActive || megaOpen
                      ? "bg-fg/10 text-fg"
                      : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                  }`}
                >
                  {item.label}
                  <svg
                    className={`ml-1 inline-block h-3 w-3 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              );
            }

            // Services with saved nested links → CMS mega menu
            if (useCmsMega && hasChildren) {
              return (
                <button
                  key={item.id}
                  ref={megaTriggerRef}
                  type="button"
                  onClick={() => setMegaOpen((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                    isActive || megaOpen
                      ? "bg-fg/10 text-fg"
                      : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                  }`}
                >
                  {item.label}
                  <svg
                    className={`ml-1 inline-block h-3 w-3 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12" fill="none" aria-hidden="true"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              );
            }

            // Items with sub-nav → dropdown
            if (hasChildren) {
              const isDropOpen = dropdownOpen === item.id;
              const visibleChildren = (item.children ?? []).filter((c) => !c.hidden);
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(isDropOpen ? null : item.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                      isActive || isDropOpen
                        ? "bg-fg/10 text-fg"
                        : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`ml-1 inline-block h-3 w-3 transition-transform duration-200 ${isDropOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 12 12" fill="none" aria-hidden="true"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  {isDropOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-line bg-[var(--header)] p-2 backdrop-blur-2xl shadow-xl">
                      {/* Link to the parent item itself */}
                      <CmsLink
                        navId={item.id}
                        href={item.href}
                        className="block rounded-xl px-3 py-2 text-[13px] text-fg/60 hover:bg-fg/6 hover:text-fg"
                      >
                        {item.label} overview
                      </CmsLink>
                      <div className="my-1 h-px bg-line" />
                      {visibleChildren.map((child) => (
                        <CmsLink
                          key={child.id}
                          navId={child.id}
                          href={child.href}
                          className="block rounded-xl px-3 py-2 text-[14px] text-fg/70 transition hover:bg-fg/6 hover:text-fg"
                        >
                          {child.label}
                        </CmsLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <CmsLink
                key={item.id}
                navId={item.id}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                  isActive ? "bg-fg/10 text-fg" : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                }`}
              >
                {item.label}
              </CmsLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="ml-1.5 hidden rounded-md border border-line px-2 py-1 font-mono text-[11px] text-fg/45 hover:border-fg/25 hover:text-fg lg:block"
          onClick={() => window.dispatchEvent(new Event("rdw:commandk"))}
        >
          ⌘K
        </button>
        <CmsLink ctaId="header.brief" href="/contact" className="btn btn-beam ml-2 hidden sm:inline-flex">
          Start a brief
        </CmsLink>
        <button
          type="button"
          className="rounded-lg border border-line p-2.5 text-fg lg:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      {/* ── Mega menu (Services) ── */}
      {megaOpen && (() => {
        const servicesNav = visibleNav.find((item) => isServicesNavItem(item));
        const cmsChildren = servicesNav?.children;
        const resolvedGroups = cmsChildren !== undefined
          ? groupedNavChildren(cmsChildren).map((group) => ({
              label: group.label,
              items: group.items.map((child) => {
                const slug = serviceSlugFromHref(child.href);
                const svc = slug ? serviceMap[slug] : undefined;
                return {
                  id: child.id,
                  label: child.label,
                  href: child.href,
                  from: svc?.from ?? "",
                };
              }),
            }))
          : serviceCategories.map((cat) => ({
              label: cat.label,
              items: cat.slugs
                .map((slug) => {
                  const svc = serviceMap[slug];
                  if (!svc) return null;
                  return {
                    id: slug,
                    label: svc.title,
                    href: `/services/${slug}`,
                    from: svc.from,
                  };
                })
                .filter((row): row is { id: string; label: string; href: string; from: string } => Boolean(row)),
            }));
        if (resolvedGroups.length === 0) return null;
        const colCount = Math.min(4, Math.max(1, resolvedGroups.length));
        return (
        <div
          ref={megaRef}
          className="absolute inset-x-0 top-full z-50 hidden border-b border-line bg-[var(--header)] backdrop-blur-2xl lg:block"
        >
          <div
            className="wrap grid gap-0 py-8"
            style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
          >
            {resolvedGroups.map((cat) => (
              <div key={cat.label} className="border-r border-line px-6 last:border-r-0 first:pl-0">
                <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-tech uppercase">
                  {cat.label}
                </p>
                <ul className="space-y-1">
                  {cat.items.map((entry) => (
                    <li key={entry.id}>
                      <CmsLink
                        navId={cmsChildren !== undefined ? entry.id : undefined}
                        ctaId={cmsChildren === undefined ? `footer.svc.${entry.id}` : undefined}
                        href={entry.href}
                        className="group flex flex-col rounded-lg px-2 py-2 transition hover:bg-fg/5"
                      >
                        {entry.label}
                      </CmsLink>
                      {entry.from ? (
                        <span className="font-mono text-[11px] text-fg/40 px-2">{entry.from}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-line">
            <div className="wrap flex items-center justify-between py-3">
              <span className="text-[13px] text-fg/50">Can&apos;t find what you need?</span>
              <div className="flex gap-4">
                <CmsLink ctaId="header.megaAll" href="/services" className="text-[13px] font-medium text-fg/70 hover:text-fg">
                  All services →
                </CmsLink>
                <CmsLink ctaId="header.megaTalk" href="/contact" className="text-[13px] font-semibold text-beam hover:opacity-80">
                  Talk to us →
                </CmsLink>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── Mobile menu ── */}
      {open ? (
        <div className="wrap border-t border-line pb-5 lg:hidden">
          {visibleNav.map((item) => {
            const servicesItem = isServicesNavItem(item);
            const childList = item.children;
            const visibleChildren = (childList ?? []).filter((c) => !c.hidden);
            const useCmsMega = servicesItem && childList !== undefined && visibleChildren.length > 0;
            const useLegacyMega = servicesItem && childList === undefined;
            const hasChildren = visibleChildren.length > 0;

            if (useLegacyMega || useCmsMega) {
              const groups = useCmsMega
                ? groupedNavChildren(visibleChildren)
                : serviceCategories.map((cat) => ({
                    label: cat.label,
                    items: cat.slugs
                      .map((slug) => {
                        const svc = serviceMap[slug];
                        if (!svc) return null;
                        return { id: slug, label: svc.title, href: `/services/${slug}` };
                      })
                      .filter((row): row is { id: string; label: string; href: string } => Boolean(row)),
                  }));
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setServicesAccordionOpen((v) => !v)}
                    className="flex w-full items-center justify-between border-b border-line py-3.5 text-lg text-fg"
                  >
                    {item.label}
                    <svg
                      className={`h-4 w-4 transition-transform ${servicesAccordionOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 12 12" fill="none"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  {servicesAccordionOpen && (
                    <div className="grid grid-cols-2 gap-0 border-b border-line py-3">
                      {groups.map((cat) => (
                        <div key={cat.label} className="px-1 py-2">
                          <p className="mb-2 font-mono text-[9px] tracking-[0.18em] text-tech uppercase">
                            {cat.label}
                          </p>
                          {cat.items.map((entry) => (
                            <CmsLink
                              key={entry.id}
                              navId={useCmsMega ? entry.id : undefined}
                              ctaId={!useCmsMega ? `footer.svc.${entry.id}` : undefined}
                              href={entry.href}
                              className="block py-1.5 text-[14px] text-fg/70 hover:text-fg"
                            >
                              {entry.label}
                            </CmsLink>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (hasChildren) {
              const visibleChildren = (item.children ?? []).filter((c) => !c.hidden);
              return (
                <div key={item.id}>
                  <CmsLink
                    navId={item.id}
                    href={item.href}
                    className="block border-b border-line py-3.5 text-lg text-fg"
                  >
                    {item.label}
                  </CmsLink>
                  <div className="border-b border-line pb-2 pl-4">
                    {visibleChildren.map((child) => (
                      <CmsLink
                        key={child.id}
                        navId={child.id}
                        href={child.href}
                        className="block py-2 text-[15px] text-fg/65 hover:text-fg"
                      >
                        {child.label}
                      </CmsLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <CmsLink
                key={item.id}
                navId={item.id}
                href={item.href}
                className="block border-b border-line py-3.5 text-lg text-fg"
              >
                {item.label}
              </CmsLink>
            );
          })}
          <CmsLink ctaId="header.brief" href="/contact" className="btn btn-beam mt-4 w-full">
            Start a brief
          </CmsLink>
        </div>
      ) : null}
    </header>
  );
}
