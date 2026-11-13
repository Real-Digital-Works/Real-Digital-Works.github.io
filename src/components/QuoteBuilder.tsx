"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { withContactQuery } from "@/lib/cms-ui";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText, useLiveDraft, usePopupCopy } from "@/components/visual-editor/CmsText";
import { QuoteCalcEditor } from "@/components/visual-editor/QuoteCalcEditor";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";
import {
  computeQuoteEstimate,
  mergeQuoteCalc,
  quoteOverrideDirty,
  selectionFingerprint,
  visibleQuoteLines,
  type QuoteCalc,
  type QuoteFactor,
  type QuoteLineItem,
} from "@/lib/quote-calc";

export function QuoteBuilder() {
  const [svc, setSvc] = useState<Set<string>>(new Set());
  const [ex, setEx] = useState<Set<string>>(new Set());
  const [size, setSize] = useState("small");
  const [speed, setSpeed] = useState("standard");
  const visual = useVisualEditorOptional();
  const draft = useLiveDraft();
  const calc = mergeQuoteCalc(draft.quoteCalc);
  const copy = usePopupCopy("quote");
  const ctaHref = copy("ctaHref", "/contact");
  const editing = Boolean(visual?.enabled);
  const [sessionFp, setSessionFp] = useState("");

  const toggle = (set: Set<string>, id: string, next: boolean) => {
    const nextSet = new Set(set);
    if (next) nextSet.add(id);
    else nextSet.delete(id);
    return nextSet;
  };

  const estimate = useMemo(
    () =>
      computeQuoteEstimate(
        calc,
        { services: svc, extras: ex, size, speed },
        copy("empty", "Select what you need to see a price"),
      ),
    [calc, svc, ex, size, speed, copy],
  );

  const currentSelectionFp = selectionFingerprint(svc, ex, size, speed);
  const catalogDirty = quoteOverrideDirty(calc);
  const selectionDirty =
    calc.totalMode === "custom" && Boolean(sessionFp) && sessionFp !== currentSelectionFp;

  useEffect(() => {
    if (calc.totalMode !== "custom") return;
    if (!sessionFp) setSessionFp(currentSelectionFp);
  }, [calc.totalMode, sessionFp, currentSelectionFp]);

  function patchCalc(next: QuoteCalc) {
    if (!visual) return;
    visual.patchDraft({ ...visual.draft, quoteCalc: next });
    if (next.totalMode === "custom") setSessionFp(currentSelectionFp);
    if (next.totalMode === "auto") setSessionFp("");
  }

  const query = estimate.empty
    ? ""
    : new URLSearchParams({
        need: [...svc, ...ex].join(", "),
        size,
        speed,
        estimate: estimate.headline,
      }).toString();

  return (
    <div
      className="grid items-start gap-8 lg:grid-cols-[1fr_360px]"
      onClick={() => visual?.selectPopup("quote")}
    >
      <div className="glass rounded-[22px] px-5 py-8 sm:px-8">
        <Step
          title={<CmsText path="popups.quote.needTitle">{copy("needTitle")}</CmsText>}
          sub={<CmsText path="popups.quote.needSub">{copy("needSub")}</CmsText>}
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {visibleQuoteLines(calc.services).map((item) => (
              <Option
                key={item.id}
                item={item}
                editing={editing}
                checked={svc.has(item.id)}
                onChange={(v) => setSvc(toggle(svc, item.id, v))}
                onPatch={(next) =>
                  patchCalc({
                    ...calc,
                    services: calc.services.map((row) => (row.id === item.id ? { ...row, ...next } : row)),
                  })
                }
              />
            ))}
          </div>
        </Step>
        <Step
          title={<CmsText path="popups.quote.sizeTitle">{copy("sizeTitle")}</CmsText>}
          sub={<CmsText path="popups.quote.sizeSub">{copy("sizeSub")}</CmsText>}
        >
          <Seg
            items={calc.sizes}
            value={size}
            editing={editing}
            onChange={setSize}
            onPatch={(id, next) =>
              patchCalc({
                ...calc,
                sizes: calc.sizes.map((row) => (row.id === id ? { ...row, ...next } : row)),
              })
            }
          />
        </Step>
        <Step
          title={<CmsText path="popups.quote.extraTitle">{copy("extraTitle")}</CmsText>}
          sub={<CmsText path="popups.quote.extraSub">{copy("extraSub")}</CmsText>}
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {visibleQuoteLines(calc.extras).map((item) => (
              <Option
                key={item.id}
                item={item}
                editing={editing}
                checked={ex.has(item.id)}
                onChange={(v) => setEx(toggle(ex, item.id, v))}
                onPatch={(next) =>
                  patchCalc({
                    ...calc,
                    extras: calc.extras.map((row) => (row.id === item.id ? { ...row, ...next } : row)),
                  })
                }
              />
            ))}
          </div>
        </Step>
        <Step
          title={<CmsText path="popups.quote.whenTitle">{copy("whenTitle")}</CmsText>}
          sub={<CmsText path="popups.quote.whenSub">{copy("whenSub")}</CmsText>}
          last
        >
          <Seg
            items={calc.speeds}
            value={speed}
            editing={editing}
            onChange={setSpeed}
            onPatch={(id, next) =>
              patchCalc({
                ...calc,
                speeds: calc.speeds.map((row) => (row.id === id ? { ...row, ...next } : row)),
              })
            }
          />
        </Step>
      </div>

      <aside className="glass sticky top-24 overflow-hidden rounded-[22px] p-7">
        <p className="text-sm text-fg/55">
          <CmsText path="popups.quote.estimateLabel">{copy("estimateLabel")}</CmsText>
        </p>
        {estimate.headline ? (
          <p className="display mt-2 text-[42px]">{estimate.headline}</p>
        ) : (
          <p className="mt-2 text-[16px] text-fg/45">No priced items selected.</p>
        )}
        <p className="mt-2 border-b border-line pb-5 text-[14.5px] text-fg/55">{estimate.sub}</p>
        {editing ? (
          <div className="my-4">
            <QuoteCalcEditor
              calc={calc}
              onChange={patchCalc}
              autoHeadline={estimate.autoHeadline}
              catalogDirty={catalogDirty}
              selectionDirty={selectionDirty}
              listedServices={draft.servicePagesList ?? []}
            />
          </div>
        ) : null}
        <ul className="my-4 max-h-[240px] overflow-y-auto text-[14.5px]">
          {estimate.lines.length ? (
            estimate.lines.map((line) => (
              <li
                key={line.id}
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
        <CmsLink
          popupId="quote"
          labelKey="ctaLabel"
          hrefKey="ctaHref"
          href={withContactQuery(ctaHref, query)}
          className="btn btn-beam w-full"
        >
          Send this to us
        </CmsLink>
        <p className="mt-3.5 text-[12.5px] leading-5 text-fg/42">
          <CmsText path="popups.quote.note">{copy("note")}</CmsText>
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
  title: ReactNode;
  sub: ReactNode;
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
  item,
  checked,
  onChange,
  editing,
  onPatch,
}: {
  item: QuoteLineItem;
  checked: boolean;
  onChange: (v: boolean) => void;
  editing: boolean;
  onPatch: (next: Partial<QuoteLineItem>) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[11px] border-[1.5px] px-3.5 py-3.5 ${
        checked ? "border-beam bg-beam/15" : "border-line bg-fg/4"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked ? "border-beam bg-beam" : "border-fg/25 bg-fg/5"
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
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{item.label}</span>
        <span className="mt-0.5 block text-[13px] text-faint">{item.hint}</span>
        {editing ? (
          <span
            className="rdw-quote-calc-inline mt-2 flex flex-wrap gap-2"
            onClick={(event) => event.preventDefault()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <input
              aria-label={`${item.label} one-off price`}
              type="number"
              className="rdw-quote-line-input"
              placeholder="One-off"
              value={item.one || ""}
              onChange={(event) =>
                onPatch({ one: Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0 })
              }
            />
            <input
              aria-label={`${item.label} monthly price`}
              type="number"
              className="rdw-quote-line-input"
              placeholder="/mo"
              value={item.month || ""}
              onChange={(event) =>
                onPatch({ month: Number.isFinite(Number(event.target.value)) ? Number(event.target.value) : 0 })
              }
            />
          </span>
        ) : null}
      </span>
    </label>
  );
}

function Seg({
  items,
  value,
  onChange,
  editing,
  onPatch,
}: {
  items: QuoteFactor[];
  value: string;
  onChange: (id: string) => void;
  editing: boolean;
  onPatch: (id: string, next: Partial<QuoteFactor>) => void;
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
            value === item.id ? "border-beam bg-beam font-semibold text-white" : "border-line bg-fg/4"
          }`}
        >
          {item.label}
          {editing ? (
            <span
              className="mt-1 block font-normal"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <input
                aria-label={`${item.label} factor`}
                type="number"
                step="0.05"
                className="rdw-quote-line-input w-[72px]"
                value={item.factor}
                onChange={(event) => onPatch(item.id, { factor: Number(event.target.value) || 0 })}
              />
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
