"use client";

import type { CmsServiceRecord } from "@/lib/content";
import {
  catalogFingerprint,
  confirmQuoteOverride,
  parseFromCopy,
  parseMoney,
  uniqueQuoteLineId,
  visibleQuoteLines,
  type QuoteCalc,
  type QuoteLineItem,
} from "@/lib/quote-calc";

export function QuoteCalcEditor({
  calc,
  onChange,
  autoHeadline,
  catalogDirty,
  selectionDirty,
  listedServices,
}: {
  calc: QuoteCalc;
  onChange: (next: QuoteCalc) => void;
  autoHeadline: string;
  catalogDirty: boolean;
  selectionDirty: boolean;
  listedServices: CmsServiceRecord[];
}) {
  const usedIds = new Set([...calc.services, ...calc.extras].map((item) => item.id));
  const addable = listedServices.filter(
    (row) => !row.hidden && !usedIds.has(row.slug) && parseFromCopy(row.from).one + parseFromCopy(row.from).month > 0,
  );

  function patch(next: Partial<QuoteCalc>) {
    onChange({ ...calc, ...next });
  }

  function setMode(totalMode: QuoteCalc["totalMode"]) {
    if (totalMode === "custom") {
      const parsed = parseMoney(autoHeadline.replace(/–.*/, ""));
      onChange(
        confirmQuoteOverride(calc, {
          totalMode: "custom",
          customTotal: calc.customTotal ?? parsed,
        }),
      );
      return;
    }
    patch({ totalMode: "auto" });
  }

  function updateLine(kind: "services" | "extras", id: string, next: Partial<QuoteLineItem>) {
    patch({
      [kind]: calc[kind].map((item) => (item.id === id ? { ...item, ...next } : item)),
    });
  }

  function addLine(kind: "services" | "extras", source?: CmsServiceRecord) {
    const parsed = source ? parseFromCopy(source.from) : { one: 0, month: 0 };
    const id = uniqueQuoteLineId(source?.slug ?? "item", usedIds);
    const row: QuoteLineItem = {
      id,
      label: source ? source.listingTitle.trim() || source.title : "New item",
      hint: source?.summary?.slice(0, 80) ?? "",
      one: parsed.one,
      month: parsed.month,
    };
    patch({ [kind]: [...calc[kind], row] });
  }

  function removeLine(kind: "services" | "extras", id: string) {
    patch({ [kind]: calc[kind].filter((item) => item.id !== id) });
  }

  const dirty = catalogDirty || selectionDirty;

  return (
    <div
      className="rdw-quote-calc-panel"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <p className="rdw-quote-calc-kicker">Estimate calculation</p>
      <div className="rdw-quote-calc-modes" role="group" aria-label="Estimate mode">
        <button
          type="button"
          className={calc.totalMode === "auto" ? "rdw-quote-calc-chip on" : "rdw-quote-calc-chip"}
          onClick={() => setMode("auto")}
        >
          Auto sum
        </button>
        <button
          type="button"
          className={calc.totalMode === "custom" ? "rdw-quote-calc-chip on" : "rdw-quote-calc-chip"}
          onClick={() => setMode("custom")}
        >
          Custom total
        </button>
      </div>
      {calc.totalMode === "auto" ? (
        <p className="rdw-quote-calc-note">
          Headline is the sum of selected line prices
          {autoHeadline ? ` (${autoHeadline})` : ", once something is ticked"}.
        </p>
      ) : (
        <div className="rdw-quote-calc-grid">
          <label>
            Custom total
            <input
              type="number"
              inputMode="decimal"
              value={calc.customTotal ?? ""}
              placeholder={autoHeadline ? String(parseMoney(autoHeadline.replace(/–.*/, "")) ?? "") : ""}
              onChange={(event) => {
                const n = parseMoney(event.target.value);
                onChange(confirmQuoteOverride(calc, { customTotal: n, totalMode: "custom" }));
              }}
            />
          </label>
          <label>
            Custom monthly
            <input
              type="number"
              inputMode="decimal"
              value={calc.customMonthly ?? ""}
              onChange={(event) => {
                const n = parseMoney(event.target.value);
                onChange(confirmQuoteOverride(calc, { customMonthly: n, totalMode: "custom" }));
              }}
            />
          </label>
        </div>
      )}
      {dirty && calc.totalMode === "custom" ? (
        <div className="rdw-quote-calc-dirty" role="status">
          <p>
            {catalogDirty
              ? "Line items or factors changed after this custom total."
              : "Selection changed after this custom total."}{" "}
            Recalc from items or keep the custom figure — it will not be wiped silently.
          </p>
          <div className="rdw-quote-calc-dirty-actions">
            <button
              type="button"
              onClick={() =>
                onChange(
                  confirmQuoteOverride(calc, {
                    totalMode: "auto",
                  }),
                )
              }
            >
              Recalc from items
            </button>
            <button
              type="button"
              onClick={() => onChange(confirmQuoteOverride(calc, { totalMode: "custom" }))}
            >
              Keep custom total
            </button>
          </div>
        </div>
      ) : null}
      <div className="rdw-quote-calc-grid">
        <label>
          Currency
          <input value={calc.currency} onChange={(event) => patch({ currency: event.target.value })} />
        </label>
        <label>
          Prefix
          <input
            value={calc.prefix}
            placeholder="from"
            onChange={(event) => patch({ prefix: event.target.value })}
          />
        </label>
        <label>
          Suffix
          <input
            value={calc.suffix}
            placeholder="+VAT"
            onChange={(event) => patch({ suffix: event.target.value })}
          />
        </label>
        <label>
          Range (1 = none)
          <input
            type="number"
            step="0.05"
            min="1"
            value={calc.rangeFactor}
            onChange={(event) => patch({ rangeFactor: Number(event.target.value) || 1 })}
          />
        </label>
        <label>
          % off
          <input
            type="number"
            min="0"
            max="100"
            value={calc.percentOff}
            onChange={(event) => patch({ percentOff: Number(event.target.value) || 0 })}
          />
        </label>
        <label>
          VAT %
          <input
            type="number"
            min="0"
            value={calc.vatRate}
            onChange={(event) => patch({ vatRate: Number(event.target.value) || 0 })}
          />
        </label>
      </div>
      <p className="rdw-quote-calc-note">
        Catalog fingerprint {catalogFingerprint(calc).slice(0, 18)}… Empty, hidden, or non-numeric
        prices are omitted from the public total.
      </p>
      {addable.length ? (
        <label className="rdw-quote-calc-add">
          Add published service
          <select
            defaultValue=""
            onChange={(event) => {
              const slug = event.target.value;
              const row = listedServices.find((item) => item.slug === slug);
              event.target.value = "";
              if (row) addLine("services", row);
            }}
          >
            <option value="">Choose a service with a starting price…</option>
            {addable.map((row) => (
              <option key={row.slug} value={row.slug}>
                {row.listingTitle.trim() || row.title} ({row.from})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <LineList
        title="Services"
        items={calc.services}
        onPatch={(id, next) => updateLine("services", id, next)}
        onRemove={(id) => removeLine("services", id)}
        onAdd={() => addLine("services")}
      />
      <LineList
        title="Extras"
        items={calc.extras}
        onPatch={(id, next) => updateLine("extras", id, next)}
        onRemove={(id) => removeLine("extras", id)}
        onAdd={() => addLine("extras")}
      />
    </div>
  );
}

function LineList({
  title,
  items,
  onPatch,
  onRemove,
  onAdd,
}: {
  title: string;
  items: QuoteLineItem[];
  onPatch: (id: string, next: Partial<QuoteLineItem>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rdw-quote-calc-lines">
      <div className="rdw-quote-calc-lines-head">
        <span>{title}</span>
        <button type="button" onClick={onAdd}>
          Add
        </button>
      </div>
      {items.map((item) => (
        <div key={item.id} className={item.hidden ? "rdw-quote-calc-line dim" : "rdw-quote-calc-line"}>
          <input
            aria-label={`${item.label} label`}
            value={item.label}
            onChange={(event) => onPatch(item.id, { label: event.target.value })}
          />
          <input
            aria-label={`${item.label} one-off`}
            type="number"
            placeholder="One-off"
            value={item.one || ""}
            onChange={(event) => onPatch(item.id, { one: parseMoney(event.target.value) ?? 0 })}
          />
          <input
            aria-label={`${item.label} monthly`}
            type="number"
            placeholder="/mo"
            value={item.month || ""}
            onChange={(event) => onPatch(item.id, { month: parseMoney(event.target.value) ?? 0 })}
          />
          <label className="rdw-quote-calc-hide">
            <input
              type="checkbox"
              checked={Boolean(item.hidden)}
              onChange={(event) => onPatch(item.id, { hidden: event.target.checked })}
            />
            Hide
          </label>
          <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.label}`}>
            ×
          </button>
        </div>
      ))}
      {!visibleQuoteLines(items).length ? (
        <p className="rdw-quote-calc-note">No visible {title.toLowerCase()} — nothing to sum.</p>
      ) : null}
    </div>
  );
}
