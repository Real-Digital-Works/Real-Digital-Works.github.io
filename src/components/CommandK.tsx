"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";

export function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();

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

  const items = nav.filter((item) =>
    item.label.toLowerCase().includes(q.toLowerCase()),
  );

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
          placeholder="Jump to a page…"
          className="w-full border-b border-line bg-transparent px-5 py-4 text-lg outline-none"
        />
        <ul className="p-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl px-4 py-3 text-fg/80 hover:bg-fg/8"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="block w-full rounded-xl px-4 py-3 text-left text-fg/80 hover:bg-fg/8"
              onClick={() => {
                setOpen(false);
                router.push("/contact");
              }}
            >
              Send a brief
            </button>
          </li>
        </ul>
        <p className="px-5 py-3 font-mono text-[11px] text-fg/35">esc to close</p>
      </div>
    </div>
  );
}
