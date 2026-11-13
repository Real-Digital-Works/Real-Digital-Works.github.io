const CHROME =
  ".rdw-ve-inspector, .rdw-ve-bar, .rdw-ve-drawer-root, .rdw-ve-status, .rdw-ve-drawer, .rdw-quote-calc-panel, .rdw-quote-calc-inline";

export type CmsHit =
  | { kind: "text"; id: string; el: HTMLElement; html: boolean }
  | { kind: "link"; id: string; el: HTMLElement }
  | { kind: "nav"; id: string; el: HTMLElement }
  | { kind: "popup"; id: string; el: HTMLElement };

export function isVisualChromeEvent(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(CHROME));
}

function visibleAt(el: HTMLElement, x: number, y: number): boolean {
  const rect = el.getBoundingClientRect();
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return false;
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none" || style.pointerEvents === "none") {
    return false;
  }
  if (Number.parseFloat(style.opacity) < 0.15) return false;
  return true;
}

function readHit(el: HTMLElement): CmsHit | null {
  if (el.closest(CHROME)) return null;
  const path = el.getAttribute("data-cms-path");
  if (path) {
    return { kind: "text", id: path, el, html: el.getAttribute("data-cms-html") === "true" };
  }
  const cta = el.getAttribute("data-cms-cta");
  if (cta) return { kind: "link", id: cta, el };
  const nav = el.getAttribute("data-cms-nav");
  if (nav) return { kind: "nav", id: nav, el };
  const popup = el.getAttribute("data-cms-popup");
  if (popup) return { kind: "popup", id: popup, el };
  return null;
}

function isHeading(el: HTMLElement): boolean {
  return /^H[1-4]$/.test(el.tagName);
}

/** Topmost heading wins; otherwise the smallest visible CMS target under the cursor. */
export function pickCmsHit(x: number, y: number): CmsHit | null {
  const stack = document.elementsFromPoint(x, y);
  const seen = new Set<HTMLElement>();
  const hits: Array<CmsHit & { area: number; heading: boolean }> = [];

  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.closest(CHROME)) continue;
    const host = node.closest("[data-cms-path], [data-cms-cta], [data-cms-nav], [data-cms-popup]");
    if (!(host instanceof HTMLElement) || seen.has(host)) continue;
    seen.add(host);
    if (!visibleAt(host, x, y)) continue;
    const hit = readHit(host);
    if (!hit) continue;
    const rect = host.getBoundingClientRect();
    hits.push({
      ...hit,
      area: Math.max(1, rect.width * rect.height),
      heading: isHeading(host),
    });
  }

  if (!hits.length) return null;
  const headings = hits.filter((item) => item.heading);
  const pool = headings.length ? headings : hits;
  pool.sort((a, b) => a.area - b.area);
  return pool[0];
}
