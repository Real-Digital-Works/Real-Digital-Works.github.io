"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-2xl ${
        stuck || open
          ? "border-b border-line bg-[var(--header)]"
          : "border-b border-transparent bg-[var(--header)]"
      }`}
    >
      <div className="wrap flex h-16 items-center gap-4">
        <Link href="/" className="mr-auto">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const current =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[14px] font-medium ${
                  current
                    ? "bg-fg/10 text-fg"
                    : "text-fg/55 hover:bg-fg/6 hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="hidden rounded-md border border-line px-2 py-1 font-mono text-[11px] text-fg/45 hover:border-fg/25 hover:text-fg lg:block"
          onClick={() => window.dispatchEvent(new Event("rdw:commandk"))}
        >
          ⌘K
        </button>
        <Link href="/contact" className="btn btn-beam hidden sm:inline-flex">
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
      {open ? (
        <div className="wrap border-t border-line pb-5 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-line py-3.5 text-lg text-fg"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-beam mt-4 w-full">
            Start a brief
          </Link>
        </div>
      ) : null}
    </header>
  );
}
