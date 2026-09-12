"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { type Workflow, type WorkflowId, workflows } from "@/lib/workflows";

const STEP_MS = 1600;

function WebsiteScene({ step }: { step: number }) {
  return (
    <div className="wf-chrome">
      <div className="wf-bar">
        <span />
        <span />
        <span />
        <p>{step < 4 ? "draft.rdw.local" : "yoursite.co.uk"}</p>
      </div>
      <div className="wf-body">
        {step === 0 ? (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-cyan uppercase">Client brief</p>
            <p className="wf-type text-lg font-medium">5 pages · interiors studio · book a visit</p>
            <div className="h-2 w-2/3 rounded bg-white/10" />
            <div className="h-2 w-1/2 rounded bg-white/8" />
          </div>
        ) : null}
        {step === 1 ? (
          <div className="grid grid-cols-3 gap-2">
            {["Home", "Work", "Visit"].map((label, i) => (
              <div
                key={label}
                className="wf-pop rounded-lg border border-white/10 bg-white/5 p-3"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <p className="text-[10px] tracking-[0.14em] text-white/40 uppercase">{label}</p>
                <div className="mt-3 h-10 rounded bg-white/8" />
              </div>
            ))}
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-3">
            <div className="h-8 w-40 rounded bg-tech/80" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-lg bg-[linear-gradient(160deg,#3a2a22,#c9b59a)]" />
              <div className="h-16 rounded-lg bg-white/10" />
              <div className="h-16 rounded-lg bg-beam/40" />
            </div>
            <p className="text-[12px] text-white/50">CMS · forms · analytics in</p>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <p className="font-mono text-[11px] text-cyan uppercase">Search foundations</p>
            <div className="flex h-24 items-end gap-2">
              {[32, 48, 40, 70, 88, 76, 96].map((h, i) => (
                <div
                  key={i}
                  className="wf-grow flex-1 rounded-t bg-tech/70"
                  style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
            <p className="text-[12px] text-white/50">Index, titles, local, speed — then content that can rank.</p>
          </div>
        ) : null}
        {step >= 4 ? (
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="inline-flex rounded-full bg-[#28c840]/20 px-2 py-0.5 font-mono text-[10px] text-[#7dff8a] uppercase">
                Live
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">yoursite.co.uk</p>
              <p className="mt-2 text-[13px] text-white/50">You own the domain, the CMS, and the source.</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="wf-scan h-full w-1/3 bg-cyan" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AppScene({ step }: { step: number }) {
  const rows = [
    { name: "Jobs", on: step >= 2 },
    { name: "Files", on: step >= 3 },
    { name: "Invoices", on: step >= 4 },
  ];
  return (
    <div className="wf-chrome">
      <div className="wf-bar">
        <span />
        <span />
        <span />
        <p>atlas.app / portal</p>
      </div>
      <div className="wf-body space-y-2">
        {step === 0 ? (
          <p className="text-lg leading-snug text-white/70">
            Status lives in WhatsApp. The latest PDF is in someone&apos;s downloads.
          </p>
        ) : null}
        {step === 1 ? (
          <div className="rounded-xl border border-tech/40 bg-tech/10 p-4">
            <p className="font-mono text-[11px] text-cyan uppercase">Fixed scope</p>
            <p className="mt-2 text-sm">Jobs · files · invoices · roles. Price and date in writing.</p>
          </div>
        ) : null}
        {step >= 2
          ? rows.map((row) => (
              <div
                key={row.name}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                  row.on ? "bg-tech/20" : "bg-white/5"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${row.on ? "bg-cyan" : "bg-white/20"}`} />
                <span className="text-sm">{row.name}</span>
                <span className="ml-auto font-mono text-[10px] text-white/35">
                  {row.on ? "live" : "next"}
                </span>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

function AiScene({ step }: { step: number }) {
  return (
    <div className="wf-chrome">
      <div className="wf-bar">
        <span />
        <span />
        <span />
        <p>rdw / enquire-desk</p>
      </div>
      <div className="wf-body flex flex-col gap-2">
        {step >= 0 ? (
          <div className="wf-pop mr-8 rounded-2xl rounded-tl-md bg-white/8 px-3 py-2 text-[13px] text-white/70">
            How much for a brochure site — and can we book a call?
          </div>
        ) : null}
        {step >= 1 ? (
          <div className="wf-pop ml-8 rounded-2xl rounded-tr-md bg-beam/35 px-3 py-2 text-[13px]">
            Sites typically land £1,450–£3,200. I can put Thursday 11:00 in the diary.
          </div>
        ) : null}
        {step >= 2 ? (
          <div className="wf-pop rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 font-mono text-[11px] text-cyan">
            Booked · Thu 11:00 · Kennington or remote
          </div>
        ) : null}
        {step >= 3 ? (
          <div className="wf-pop rounded-xl bg-white/8 px-3 py-2 text-[13px] text-white/65">
            Thread handed to a human. The desk stays on the repetitive ones.
          </div>
        ) : null}
        {step >= 4 ? (
          <p className="mt-auto text-[12px] text-white/40">Next workflow: follow-up that actually sends.</p>
        ) : null}
      </div>
    </div>
  );
}

function MotionScene({ step }: { step: number }) {
  return (
    <div className="wf-chrome overflow-hidden">
      <div
        className="relative flex min-h-[220px] items-center justify-center"
        style={{
          background:
            "linear-gradient(125deg, #1a2230 0%, #1857ec 48%, #19dbfd 100%)",
          backgroundSize: "200% 200%",
          animation: "wfShift 6s ease-in-out infinite",
        }}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/35">
          <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
        </span>
        <div className="wf-playhead" />
      </div>
      <div className="grid grid-cols-5 gap-px bg-black/30">
        {["Story", "Make", "Review", "Master", "Place"].map((label, i) => (
          <div
            key={label}
            className={`px-2 py-2 text-center font-mono text-[9px] tracking-[0.12em] uppercase ${
              i <= step ? "bg-tech/35 text-white" : "bg-white/5 text-white/30"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

const scenes: Record<WorkflowId, (step: number) => ReactNode> = {
  websites: (step) => <WebsiteScene step={step} />,
  apps: (step) => <AppScene step={step} />,
  ai: (step) => <AiScene step={step} />,
  motion: (step) => <MotionScene step={step} />,
};

export function WorkflowPlay({
  id,
  onClose,
}: {
  id: WorkflowId;
  onClose: () => void;
}) {
  const flow = workflows.find((item) => item.id === id) as Workflow;
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setStep(0);
    const t = window.setInterval(() => {
      setStep((n) => (n + 1) % flow.beats.length);
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [flow.beats.length, id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass max-h-[92svh] w-full max-w-[980px] overflow-y-auto rounded-[28px] p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wf-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-cyan uppercase">
              {flow.n} · How it actually runs
            </p>
            <h2 id="wf-title" className="display mt-2 text-[clamp(28px,4vw,44px)]">
              {flow.title}
            </h2>
            <p className="mt-3 max-w-[54ch] text-[15px] text-white/58">{flow.promise}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-white/70"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ol className="space-y-1">
            {flow.beats.map((beat, i) => (
              <li key={beat.label}>
                <button
                  type="button"
                  className={`flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left ${
                    i === step ? "bg-white/8" : "hover:bg-white/4"
                  }`}
                  onClick={() => setStep(i)}
                >
                  <span
                    className={`mt-0.5 font-mono text-[11px] ${
                      i === step ? "text-cyan" : "text-white/30"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{beat.label}</span>
                    <span className="mt-0.5 block text-[13px] text-white/45">{beat.line}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div>
            {scenes[flow.id](step)}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-tech transition-[width] duration-300"
                style={{ width: `${((step + 1) / flow.beats.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="btn btn-beam" onClick={onClose}>
            Start this brief
          </Link>
          <Link href="/pricing" className="btn btn-outline-light" onClick={onClose}>
            Scope a number
          </Link>
          <p className="ml-auto font-mono text-[11px] text-white/35">
            {flow.from} · loops until you close
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
