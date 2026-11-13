/**
 * Quote builder calculation — CMS-owned so live edit can change prices,
 * format, and whether the headline is an auto-sum or a custom total.
 */
import {
  quoteExtras as seedExtras,
  quoteServices as seedServices,
  quoteSizes as seedSizes,
  quoteSpeeds as seedSpeeds,
} from "@/lib/site";

export type QuoteTotalMode = "auto" | "custom";

export interface QuoteLineItem {
  id: string;
  label: string;
  hint: string;
  one: number;
  month: number;
  hidden?: boolean;
  /** 0–100 off this line, after size/speed. */
  discountPercent?: number;
}

export interface QuoteFactor {
  id: string;
  label: string;
  factor: number;
}

export interface QuoteCalc {
  currency: string;
  prefix: string;
  suffix: string;
  /** 1 = single figure. 1.15 (default) shows a range. */
  rangeFactor: number;
  /** 0–100 off the whole estimate, after line discounts. */
  percentOff: number;
  /** 0 = suffix-only (e.g. +VAT). 20 = multiply amounts by 1.20. */
  vatRate: number;
  totalMode: QuoteTotalMode;
  customTotal: number | null;
  customMonthly: number | null;
  /** Catalog snapshot when the custom total was last confirmed. */
  overrideFingerprint: string;
  oneOffSub: string;
  monthlySub: string;
  /** Use `{monthly}` for the formatted monthly figure. */
  bothSub: string;
  services: QuoteLineItem[];
  extras: QuoteLineItem[];
  sizes: QuoteFactor[];
  speeds: QuoteFactor[];
}

export const DEFAULT_QUOTE_CALC: QuoteCalc = {
  currency: "£",
  prefix: "",
  suffix: "",
  rangeFactor: 1.15,
  percentOff: 0,
  vatRate: 0,
  totalMode: "auto",
  customTotal: null,
  customMonthly: null,
  overrideFingerprint: "",
  oneOffSub: "One-off project cost",
  monthlySub: "Ongoing monthly, three-month minimum",
  bothSub: "Plus {monthly} per month ongoing",
  services: seedServices.map(cloneLine),
  extras: seedExtras.map(cloneLine),
  sizes: seedSizes.map(cloneFactor),
  speeds: seedSpeeds.map(cloneFactor),
};

function cloneLine(item: {
  id: string;
  label: string;
  hint: string;
  one: number;
  month: number;
}): QuoteLineItem {
  return { id: item.id, label: item.label, hint: item.hint, one: item.one, month: item.month };
}

function cloneFactor(item: { id: string; label: string; factor: number }): QuoteFactor {
  return { id: item.id, label: item.label, factor: item.factor };
}

export function parseMoney(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Parse a CMS “from” string such as “From £1,450” or “£95/mo”. */
export function parseFromCopy(from: string): { one: number; month: number } {
  const n = parseMoney(from);
  if (n == null || n <= 0) return { one: 0, month: 0 };
  if (/\/\s*mo|month|monthly/i.test(from)) return { one: 0, month: n };
  return { one: n, month: 0 };
}

function asNumber(value: unknown, fallback: number): number {
  const n = parseMoney(value);
  return n == null ? fallback : n;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function clampPercent(value: unknown): number {
  const n = asNumber(value, 0);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function normalizeLine(raw: unknown, fallback?: QuoteLineItem): QuoteLineItem | null {
  if (!raw || typeof raw !== "object") return fallback ?? null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id, fallback?.id ?? "").trim();
  if (!id) return fallback ?? null;
  return {
    id,
    label: asString(row.label, fallback?.label ?? id),
    hint: asString(row.hint, fallback?.hint ?? ""),
    one: asNumber(row.one, fallback?.one ?? 0),
    month: asNumber(row.month, fallback?.month ?? 0),
    hidden: typeof row.hidden === "boolean" ? row.hidden : fallback?.hidden,
    discountPercent:
      row.discountPercent == null && fallback?.discountPercent == null
        ? undefined
        : clampPercent(row.discountPercent ?? fallback?.discountPercent ?? 0),
  };
}

function normalizeFactor(raw: unknown, fallback?: QuoteFactor): QuoteFactor | null {
  if (!raw || typeof raw !== "object") return fallback ?? null;
  const row = raw as Record<string, unknown>;
  const id = asString(row.id, fallback?.id ?? "").trim();
  if (!id) return fallback ?? null;
  const factor = asNumber(row.factor, fallback?.factor ?? 1);
  return {
    id,
    label: asString(row.label, fallback?.label ?? id),
    factor: Number.isFinite(factor) ? factor : 1,
  };
}

function mergeLines(raw: unknown, seed: QuoteLineItem[]): QuoteLineItem[] {
  if (!Array.isArray(raw)) return seed.map((item) => ({ ...item }));
  return raw
    .map((row) => {
      const id = row && typeof row === "object" ? asString((row as QuoteLineItem).id, "") : "";
      const fallback = seed.find((item) => item.id === id);
      return normalizeLine(row, fallback);
    })
    .filter((item): item is QuoteLineItem => Boolean(item));
}

function mergeFactors(raw: unknown, seed: QuoteFactor[]): QuoteFactor[] {
  if (!Array.isArray(raw)) return seed.map((item) => ({ ...item }));
  return raw
    .map((row) => {
      const id = row && typeof row === "object" ? asString((row as QuoteFactor).id, "") : "";
      const fallback = seed.find((item) => item.id === id);
      return normalizeFactor(row, fallback);
    })
    .filter((item): item is QuoteFactor => Boolean(item));
}

export function mergeQuoteCalc(raw?: Partial<QuoteCalc> | null): QuoteCalc {
  const seed = DEFAULT_QUOTE_CALC;
  if (!raw || typeof raw !== "object") return { ...seed, services: [...seed.services], extras: [...seed.extras], sizes: [...seed.sizes], speeds: [...seed.speeds] };
  const totalMode = raw.totalMode === "custom" ? "custom" : "auto";
  const customTotal = raw.customTotal == null || raw.customTotal === ("" as unknown) ? null : parseMoney(raw.customTotal);
  const customMonthly = raw.customMonthly == null || raw.customMonthly === ("" as unknown) ? null : parseMoney(raw.customMonthly);
  return {
    currency: asString(raw.currency, seed.currency) || "£",
    prefix: asString(raw.prefix, seed.prefix),
    suffix: asString(raw.suffix, seed.suffix),
    rangeFactor: asNumber(raw.rangeFactor, seed.rangeFactor) || 1,
    percentOff: clampPercent(raw.percentOff ?? seed.percentOff),
    vatRate: asNumber(raw.vatRate, seed.vatRate),
    totalMode,
    customTotal,
    customMonthly,
    overrideFingerprint: asString(raw.overrideFingerprint, seed.overrideFingerprint),
    oneOffSub: asString(raw.oneOffSub, seed.oneOffSub),
    monthlySub: asString(raw.monthlySub, seed.monthlySub),
    bothSub: asString(raw.bothSub, seed.bothSub),
    services: mergeLines(raw.services, seed.services),
    extras: mergeLines(raw.extras, seed.extras),
    sizes: mergeFactors(raw.sizes, seed.sizes),
    speeds: mergeFactors(raw.speeds, seed.speeds),
  };
}

export function visibleQuoteLines(items: QuoteLineItem[]): QuoteLineItem[] {
  return items.filter((item) => !item.hidden);
}

export function catalogFingerprint(calc: QuoteCalc): string {
  const pack = (items: QuoteLineItem[]) =>
    visibleQuoteLines(items)
      .map((item) => `${item.id}:${item.one}:${item.month}:${item.discountPercent ?? 0}`)
      .join("|");
  const factors = (items: QuoteFactor[]) => items.map((item) => `${item.id}:${item.factor}`).join("|");
  return [
    pack(calc.services),
    pack(calc.extras),
    factors(calc.sizes),
    factors(calc.speeds),
    calc.rangeFactor,
    calc.percentOff,
    calc.vatRate,
  ].join("||");
}

export function selectionFingerprint(svc: Iterable<string>, extras: Iterable<string>, size: string, speed: string): string {
  return `${[...svc].sort().join(",")}|${[...extras].sort().join(",")}|${size}|${speed}`;
}

export function quoteOverrideDirty(calc: QuoteCalc): boolean {
  if (calc.totalMode !== "custom") return false;
  const current = catalogFingerprint(calc);
  if (!calc.overrideFingerprint) return true;
  return calc.overrideFingerprint !== current;
}

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n >= 1000 ? Math.round(n / 50) * 50 : Math.round(n / 5) * 5;
}

export function formatMoney(n: number, calc: Pick<QuoteCalc, "currency">): string {
  return `${calc.currency}${roundMoney(n).toLocaleString("en-GB")}`;
}

function joinDisplay(prefix: string, core: string, suffix: string): string {
  const left = prefix ? (prefix.endsWith(" ") ? prefix : `${prefix} `) : "";
  const right = suffix ? (suffix.startsWith(" ") ? suffix : ` ${suffix}`) : "";
  return `${left}${core}${right}`.trim();
}

function applyGlobals(amount: number, calc: QuoteCalc): number {
  const off = 1 - calc.percentOff / 100;
  const vat = 1 + (calc.vatRate > 0 ? calc.vatRate / 100 : 0);
  return amount * off * vat;
}

function lineAmounts(item: QuoteLineItem, size: number, speed: number, applySize: boolean) {
  const disc = 1 - clampPercent(item.discountPercent) / 100;
  const oneRaw = (parseMoney(item.one) ?? 0) * (applySize ? size : 1) * speed * disc;
  const monthRaw = (parseMoney(item.month) ?? 0) * (applySize ? size : 1) * disc;
  return { one: oneRaw, month: monthRaw };
}

export type QuoteLineDisplay = { id: string; label: string; value: string; one: number; month: number };

export type QuoteEstimate = {
  one: number;
  month: number;
  lines: QuoteLineDisplay[];
  autoHeadline: string;
  headline: string;
  sub: string;
  empty: boolean;
};

export function computeQuoteEstimate(
  calc: QuoteCalc,
  selected: { services: Set<string>; extras: Set<string>; size: string; speed: string },
  emptyCopy: string,
): QuoteEstimate {
  const size = calc.sizes.find((item) => item.id === selected.size)?.factor ?? 1;
  const speed = calc.speeds.find((item) => item.id === selected.speed)?.factor ?? 1;
  let one = 0;
  let month = 0;
  const lines: QuoteLineDisplay[] = [];

  const push = (item: QuoteLineItem, applySize: boolean) => {
    const amounts = lineAmounts(item, size, speed, applySize);
    if (amounts.one <= 0 && amounts.month <= 0) {
      return;
    }
    one += amounts.one;
    month += amounts.month;
    const value =
      amounts.one > 0 ? formatMoney(applyGlobals(amounts.one, calc), calc) : `${formatMoney(applyGlobals(amounts.month, calc), calc)}/mo`;
    lines.push({ id: item.id, label: item.label, value, one: amounts.one, month: amounts.month });
  };

  visibleQuoteLines(calc.services).forEach((item) => {
    if (selected.services.has(item.id)) push(item, true);
  });
  visibleQuoteLines(calc.extras).forEach((item) => {
    if (selected.extras.has(item.id)) push(item, false);
  });

  if (!lines.length) {
    return {
      one: 0,
      month: 0,
      lines,
      autoHeadline: "",
      headline: "",
      sub: emptyCopy,
      empty: true,
    };
  }

  const oneAdj = applyGlobals(one, calc);
  const monthAdj = applyGlobals(month, calc);
  const range = calc.rangeFactor > 1.0001 ? applyGlobals(one * calc.rangeFactor, calc) : oneAdj;
  const autoCore =
    oneAdj > 0
      ? range > oneAdj
        ? `${formatMoney(oneAdj, calc)} – ${formatMoney(range, calc)}`
        : formatMoney(oneAdj, calc)
      : `${formatMoney(monthAdj, calc)}/mo`;
  const autoHeadline = joinDisplay(calc.prefix, autoCore, calc.suffix);

  const useCustom =
    calc.totalMode === "custom" &&
    ((calc.customTotal != null && calc.customTotal > 0) || (calc.customMonthly != null && calc.customMonthly > 0));
  const customCore = useCustom
    ? calc.customTotal != null && calc.customTotal > 0
      ? formatMoney(calc.customTotal, calc)
      : `${formatMoney(calc.customMonthly ?? 0, calc)}/mo`
    : "";
  const headline = useCustom && customCore ? joinDisplay(calc.prefix, customCore, calc.suffix) : autoHeadline;

  const monthlyLabel = formatMoney(useCustom && calc.customMonthly != null ? calc.customMonthly : monthAdj, calc);
  const sub =
    oneAdj > 0 && monthAdj > 0
      ? calc.bothSub.replace("{monthly}", monthlyLabel)
      : oneAdj > 0
        ? calc.oneOffSub
        : calc.monthlySub;

  return { one: oneAdj, month: monthAdj, lines, autoHeadline, headline, sub, empty: false };
}

export function confirmQuoteOverride(calc: QuoteCalc, next: Partial<QuoteCalc> = {}): QuoteCalc {
  const merged = { ...calc, ...next };
  return { ...merged, overrideFingerprint: catalogFingerprint(merged) };
}

export function uniqueQuoteLineId(base: string, used: Set<string>): string {
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  if (!used.has(slug)) return slug;
  let i = 2;
  while (used.has(`${slug}-${i}`)) i += 1;
  return `${slug}-${i}`;
}
