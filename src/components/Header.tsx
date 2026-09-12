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
          ? "border-b border-white/10 bg-[#1a2230]/80"
          : "border-b border-transparent bg-[#1a2230]/40"
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
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="hidden rounded-md border border-white/10 px-2 py-1 font-mono text-[11px] text-white/45 hover:border-white/25 hover:text-white lg:block"
          onClick={() => window.dispatchEvent(new Event("rdw:commandk"))}
        >
          ⌘K
        </button>
        <Link href="/contact" className="btn btn-beam hidden sm:inline-flex">
          Start a brief
        </Link>
        <button
          type="button"
          className="rounded-lg border border-white/15 p-2.5 lg:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="#fff" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="wrap border-t border-white/10 pb-5 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-white/10 py-3.5 text-lg text-white"
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
