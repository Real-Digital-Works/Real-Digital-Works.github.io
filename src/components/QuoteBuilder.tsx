"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  quoteExtras,
  quoteServices,
  quoteSizes,
  quoteSpeeds,
} from "@/lib/content";

function money(n: number) {
  // Round to nearest £50 for large amounts, £5 for small — keeps £95/mo accurate
  const rounded = n >= 1000 ? Math.round(n / 50) * 50 : Math.round(n / 5) * 5;
  return `£${rounded.toLocaleString("en-GB")}`;
}

export function QuoteBuilder() {
  const [svc, setSvc] = useState<Set<string>>(new Set());
  const [ex, setEx] = useState<Set<string>>(new Set());
  const [size, setSize] = useState("small");
  const [speed, setSpeed] = useState("standard");

  const toggle = (set: Set<string>, id: string, next: boolean) => {
    const copy = new Set(set);
    if (next) copy.add(id);
    else copy.delete(id);
    return copy;
  };

  const estimate = useMemo(() => {
    const sm = quoteSizes.find((s) => s.id === size)?.factor ?? 1;
    const sp = quoteSpeeds.find((s) => s.id === speed)?.factor ?? 1;
    let one = 0;
    let month = 0;
    const lines: { label: string; value: string }[] = [];

    quoteServices.forEach((item) => {
      if (!svc.has(item.id)) return;
      const a = item.one * sm * sp;
      const m = item.month * sm;
      one += a;
      month += m;
      lines.push({
        label: item.label,
        value: a ? money(a) : `${money(m)}/mo`,
      });
    });
    quoteExtras.forEach((item) => {
      if (!ex.has(item.id)) return;
      const a = item.one * sp;
      const m = item.month;
      one += a;
      month += m;
      lines.push({
        label: item.label,
        value: a ? money(a) : `${money(m)}/mo`,
      });
    });

    if (!lines.length) {
      return {
        total: "£0",
        sub: "Select what you need to see a price",
        lines,
        query: "",
      };
    }

    const total = one
      ? `${money(one)} – ${money(one * 1.15)}`
      : `${money(month)}/mo`;
    const sub = one && month
      ? `Plus ${money(month)} per month ongoing`
      : one
        ? "One-off project cost"
        : "Ongoing monthly, three-month minimum";
    const query = new URLSearchParams({
      need: [...svc, ...ex].join(", "),
      size,
      speed,
      estimate: total,
    }).toString();
    return { total, sub, lines, query };
  }, [svc, ex, size, speed]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div className="glass rounded-[22px] px-5 py-8 sm:px-8">
        <Step title="What do you need?" sub="Choose as many as apply.">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {quoteServices.map((item) => (
              <Option
                key={item.id}
                title={item.label}
                hint={item.hint}
                checked={svc.has(item.id)}
                onChange={(v) => setSvc(toggle(svc, item.id, v))}
              />
            ))}
          </div>
        </Step>
        <Step title="How big is the organisation?" sub="This changes scope and support volume.">
          <Seg
            items={quoteSizes}
            value={size}
            onChange={setSize}
          />
        </Step>
        <Step title="Anything else?" sub="Optional extras we are often asked for.">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {quoteExtras.map((item) => (
              <Option
                key={item.id}
                title={item.label}
                hint={item.hint}
                checked={ex.has(item.id)}
                onChange={(v) => setEx(toggle(ex, item.id, v))}
              />
            ))}
          </div>
        </Step>
        <Step title="When do you need it?" sub="Priority displaces other work, so it costs more." last>
          <Seg items={quoteSpeeds} value={speed} onChange={setSpeed} />
        </Step>
      </div>

      <aside className="glass sticky top-24 overflow-hidden rounded-[22px] p-7">
        <p className="text-sm text-fg/55">Your estimate</p>
        <p className="display mt-2 text-[42px]">{estimate.total}</p>
        <p className="mt-2 border-b border-line pb-5 text-[14.5px] text-fg/55">
          {estimate.sub}
        </p>
        <ul className="my-4 max-h-[240px] overflow-y-auto text-[14.5px]">
          {estimate.lines.length ? (
            estimate.lines.map((line) => (
              <li
                key={line.label}
                className="flex justify-between gap-3 border-b border-line py-2 text-fg/70"
              >
                <span>{line.label}</span>
                <b className="font-semibold text-fg">{line.value}</b>
              </li>
            ))
          ) : (
            <li className="py-3 text-fg/40">Nothing selected yet.</li>
          )}
        </ul>
        <Link
          href={estimate.query ? `/contact?${estimate.query}` : "/contact"}
          className="btn btn-beam w-full"
        >
          Send this to us
        </Link>
        <p className="mt-3.5 text-[12.5px] leading-5 text-fg/42">
          Indicative range for this draft. Final price is fixed in writing after
          a free consultation.
        </p>
      </aside>
    </div>
  );
}

function Step({
  title,
  sub,
  children,
  last,
}: {
  title: string;
  sub: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "pt-2" : "border-b border-line py-7 first:pt-0"}>
      <h4 className="text-[16.5px] font-semibold tracking-[-0.02em]">{title}</h4>
      <p className="mb-5 text-[14.5px] text-faint">{sub}</p>
      {children}
    </div>
  );
}

function Option({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[11px] border-[1.5px] px-3.5 py-3.5 ${
        checked ? "border-beam bg-beam/15" : "border-line bg-fg/4"
      }`}
    >
      {/* Custom styled checkbox — replaces default white browser box */}
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked
            ? "border-beam bg-beam"
            : "border-fg/25 bg-fg/5"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-[15px] font-semibold leading-tight">{title}</span>
        <span className="mt-0.5 block text-[13px] text-faint">{hint}</span>
      </span>
    </label>
  );
}

function Seg({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-[9px] border-[1.5px] px-4 py-2.5 text-[14.5px] ${
            value === item.id
              ? "border-beam bg-beam font-semibold text-white"
              : "border-line bg-fg/4"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
