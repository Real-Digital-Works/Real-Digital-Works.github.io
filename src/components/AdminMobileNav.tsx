"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AdminThemeToggle } from "@/components/AdminTheme";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type AdminNavTab<T extends string = string> = { id: T; label: string };

export function AdminMobileNav<T extends string>({
  tabs,
  currentId,
  onSelectTab,
  onLiveEdit,
  onSignOut,
  email,
}: {
  tabs: AdminNavTab<T>[];
  currentId: T;
  onSelectTab: (id: T) => void;
  onLiveEdit: () => void;
  onSignOut: () => void;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panelId = useId();
  const openerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [open]);

  function selectTab(id: T) {
    onSelectTab(id);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 4.5h12M3 9h12M3 13.5h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
          />
          <aside
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex h-full w-[min(18rem,86vw)] flex-col border-r border-white/8 bg-[var(--admin-bg)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <span className="rounded-lg bg-[#1857EC] px-2.5 py-1 text-xs font-bold text-white">
                RDW
              </span>
              <div className="min-w-0 flex-1">
                <p id={titleId} className="text-[13px] font-semibold text-white">
                  Admin
                </p>
                <p className="max-w-[140px] truncate text-[11px] text-white/35">{email}</p>
              </div>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white"
                aria-label="Close admin menu"
                onClick={() => setOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3 3l8 8M11 3L3 11"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="border-b border-white/8 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLiveEdit();
                }}
                className="min-h-11 w-full rounded-xl bg-[#1857EC] px-4 py-3 text-left transition hover:bg-blue-600"
              >
                <span className="block text-sm font-semibold text-white">Live edit</span>
                <span className="mt-0.5 block text-[11px] font-medium text-white/80">
                  Edit the website
                </span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2" aria-label="Admin sections">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex min-h-11 w-full items-center px-5 text-left text-[13px] transition ${
                    currentId === item.id
                      ? "bg-[#1857EC]/20 font-medium text-[#60a5fa]"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="space-y-3 border-t border-white/8 p-4">
              <AdminThemeToggle />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className="min-h-11 w-full rounded-xl border border-white/10 px-4 text-xs text-white/50 transition hover:text-white/80"
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
