"use client";

import { useState } from "react";
import { WorkflowPlay } from "@/components/WorkflowPlay";
import { type WorkflowId, workflows } from "@/lib/workflows";

function SiteSketch() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#10151d]">
      <div className="flex items-center gap-1 border-b border-white/8 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
        <span className="sk-url ml-2 h-1.5 flex-1 rounded-full bg-white/10" />
      </div>
      <div className="space-y-1.5 p-2.5">
        <div className="sk-bar h-2 w-[42%] rounded-sm bg-tech/70" />
        <div className="h-1.5 w-full rounded-sm bg-white/10" />
        <div className="h-1.5 w-[78%] rounded-sm bg-white/7" />
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-7 rounded-sm bg-white/8" />
          <div className="sk-pulse h-7 rounded-sm bg-beam/35" />
          <div className="h-7 rounded-sm bg-white/8" />
        </div>
      </div>
    </div>
  );
}

function AppSketch() {
  return (
    <div className="sk-rows space-y-1 overflow-hidden rounded-[10px] border border-white/10 bg-[#10151d] p-2">
      {["Jobs", "Files", "Invoices"].map((row) => (
        <div key={row} className="sk-row flex items-center gap-2 rounded-md px-1.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span className="text-[9px] tracking-[0.12em] text-white/55 uppercase">{row}</span>
          <span className="ml-auto h-1 w-8 rounded-full bg-white/12" />
        </div>
      ))}
    </div>
  );
}

function AiSketch() {
  return (
    <div className="space-y-1.5 overflow-hidden rounded-[10px] border border-white/10 bg-[#10151d] p-2">
      <div className="mr-6 rounded-lg rounded-tl-sm bg-white/8 px-2 py-1.5 text-[9px] leading-snug text-white/55">
        Can you build an enquiry desk?
      </div>
      <div className="sk-reply ml-6 rounded-lg rounded-tr-sm bg-beam/35 px-2 py-1.5 text-[9px] leading-snug text-white/80">
        Yes. One workflow, then a human.
      </div>
    </div>
  );
}

function MotionSketch() {
  return (
    <div className="sk-film relative overflow-hidden rounded-[10px] border border-white/10">
      <div className="flex h-[72px] items-center justify-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm">
          <span className="ml-0.5 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
        </span>
      </div>
      <div className="sk-playhead" />
      <div className="grid grid-cols-6 gap-px bg-black/20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-2 bg-white/10" />
        ))}
      </div>
    </div>
  );
}

const sketches = {
  websites: SiteSketch,
  apps: AppSketch,
  ai: AiSketch,
  motion: MotionSketch,
};

export function OfferBoard() {
  const [open, setOpen] = useState<WorkflowId | null>(null);

  return (
    <>
      <div className="hero-board rise-3 relative rounded-[22px] border border-white/10 bg-[#151c27]/80 p-3 shadow-[0_30px_80px_rgba(0,0,0,.35)] sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
            Click a tile · watch it run
          </p>
          <p className="font-mono text-[10px] tracking-[0.12em] text-cyan uppercase">
            Kennington · 1-day reply
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {workflows.map((slot) => {
            const Sketch = sketches[slot.id];
            return (
              <button
                key={slot.id}
                type="button"
                className="hero-tile group rounded-[16px] border border-white/8 bg-white/[0.035] p-3 text-left transition-[border-color,background] duration-200 hover:border-tech/50 hover:bg-white/[0.06]"
                onClick={() => setOpen(slot.id)}
              >
                <div aria-hidden="true">
                  <Sketch />
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] text-white/35">{slot.n}</p>
                    <p className="text-[15px] leading-tight font-semibold tracking-[-0.03em] sm:text-[17px]">
                      {slot.title}
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-cyan sm:text-[11px]">{slot.from}</p>
                </div>
                <p className="mt-2 font-mono text-[9px] tracking-[0.14em] text-white/30 uppercase group-hover:text-cyan">
                  Play workflow →
                </p>
              </button>
            );
          })}
        </div>
      </div>
      {open ? <WorkflowPlay id={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
