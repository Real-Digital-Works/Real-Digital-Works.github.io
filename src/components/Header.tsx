"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Logo } from "./Logo";
import { nav } from "@/lib/content";
import { serviceCategories, servicePages } from "@/lib/services-data";

// Lookup for service entries keyed by slug
const serviceMap = Object.fromEntries(servicePages.map((s) => [s.slug, s]));

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [servicesAccordionOpen, setServicesAccordionOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
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

        {/* Desktop nav — B1 */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            if (item.href === "/services") {
              const active = pathname.startsWith("/services");
              return (
                <button
                  key="services"
                  ref={megaTriggerRef}
                  type="button"
                  onClick={() => setMegaOpen((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                    active || megaOpen
                      ? "bg-fg/10 text-fg"
                      : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                  }`}
                >
                  {item.label}
                  <svg
                    className={`ml-1 inline-block h-3 w-3 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              );
            }
            const current =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium transition ${
                  current ? "bg-fg/10 text-fg" : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
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
        <Link href="/contact" className="btn btn-beam ml-2 hidden sm:inline-flex">
          Start a brief
        </Link>
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

      {/* ── Mega menu — B1 ── */}
      {megaOpen && (
        <div
          ref={megaRef}
          className="absolute inset-x-0 top-full z-50 hidden border-b border-line bg-[var(--header)] backdrop-blur-2xl lg:block"
        >
          <div className="wrap grid grid-cols-4 gap-0 py-8">
            {serviceCategories.map((cat) => (
              <div key={cat.label} className="border-r border-line px-6 last:border-r-0 first:pl-0">
                <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-tech uppercase">
                  {cat.label}
                </p>
                <ul className="space-y-1">
                  {cat.slugs.map((slug) => {
                    const svc = serviceMap[slug];
                    if (!svc) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/services/${slug}`}
                          className="group flex flex-col rounded-lg px-2 py-2 transition hover:bg-fg/5"
                        >
                          <span className="text-[14px] font-medium text-fg group-hover:text-beam">
                            {svc.title}
                          </span>
                          <span className="font-mono text-[11px] text-fg/40">{svc.from}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-line">
            <div className="wrap flex items-center justify-between py-3">
              <span className="text-[13px] text-fg/50">Can&apos;t find what you need?</span>
              <div className="flex gap-4">
                <Link href="/services" className="text-[13px] font-medium text-fg/70 hover:text-fg">
                  All services →
                </Link>
                <Link href="/contact" className="text-[13px] font-semibold text-beam hover:opacity-80">
                  Talk to us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu — B2 ── */}
      {open ? (
        <div className="wrap border-t border-line pb-5 lg:hidden">
          {nav.map((item) => {
            if (item.href === "/services") {
              return (
                <div key="services">
                  <button
                    type="button"
                    onClick={() => setServicesAccordionOpen((v) => !v)}
                    className="flex w-full items-center justify-between border-b border-line py-3.5 text-lg text-fg"
                  >
                    Services
                    <svg
                      className={`h-4 w-4 transition-transform ${servicesAccordionOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  {servicesAccordionOpen && (
                    <div className="grid grid-cols-2 gap-0 border-b border-line py-3">
                      {serviceCategories.map((cat) => (
                        <div key={cat.label} className="px-1 py-2">
                          <p className="mb-2 font-mono text-[9px] tracking-[0.18em] text-tech uppercase">
                            {cat.label}
                          </p>
                          {cat.slugs.map((slug) => {
                            const svc = serviceMap[slug];
                            if (!svc) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/services/${slug}`}
                                className="block py-1.5 text-[14px] text-fg/70 hover:text-fg"
                              >
                                {svc.title}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-line py-3.5 text-lg text-fg"
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn btn-beam mt-4 w-full">
            Start a brief
          </Link>
        </div>
      ) : null}
    </header>
  );
}
