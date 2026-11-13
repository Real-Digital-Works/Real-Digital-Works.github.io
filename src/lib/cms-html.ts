/**
 * Allowlisted HTML for CMS bodies. Live-edit never round-trips raw tags
 * to a non-technical editor; this is the safety net on change, render, and save.
 */
export const CMS_HTML_ERROR =
  "That content isn’t valid. Use the formatting buttons instead of HTML.";

const ALLOWED = new Set(["p", "br", "strong", "em", "u", "a", "h2", "h3", "h4", "ul", "ol", "li", "b", "i", "img"]);
const VOID = new Set(["br", "img"]);
const RENAME: Record<string, string> = { b: "strong", i: "em" };
const BLOCKED = /^(script|iframe|style|object|embed|link|meta|form|input|textarea|svg|video|audio|source)$/;

export function isHtmlCmsPath(path: string): boolean {
  if (path === "hero.sub") return true;
  if (/(^|\.)(body|detail|content|problem|work|outcome)$/.test(path)) return true;
  if (/(^|\.)faq\.\d+\.a$/.test(path)) return true;
  return false;
}

export function htmlTextContent(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeCmsHtml(input: string): { html: string; valid: boolean; error?: string } {
  const raw = typeof input === "string" ? input : "";
  try {
    const html = sanitizeTree(raw);
    if (htmlTextContent(raw) && !htmlTextContent(html)) {
      return { html: "", valid: false, error: CMS_HTML_ERROR };
    }
    return { html, valid: true };
  } catch {
    return { html: "", valid: false, error: CMS_HTML_ERROR };
  }
}

function sanitizeHref(value: string): string | null {
  const href = value.trim();
  if (!href || /^javascript:/i.test(href) || /^data:/i.test(href)) return null;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return href;
  return null;
}

function sanitizeImgSrc(value: string): string | null {
  const src = value.trim();
  if (!src || /^javascript:/i.test(src) || /^data:/i.test(src)) return null;
  if (/^https:\/\//i.test(src) || src.startsWith("/")) return src;
  return null;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function attr(name: string, attrs: string): string | null {
  const match = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|[^\\s>]+)`, "i"));
  if (!match) return null;
  return match[2] ?? match[3] ?? match[1] ?? null;
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeTree(dirty: string): string {
  const stripped = dirty
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/(?:script|iframe|style|object|embed)\b[^>]*>/gi, "")
    .replace(/<(script|iframe|style|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|style|object|embed|link|meta)\b[^>]*\/?>/gi, "");

  const tokens = stripped.split(/(<\/?[a-zA-Z][^>]*>)/g);
  const open: string[] = [];
  let out = "";

  for (const token of tokens) {
    if (!token) continue;
    const openMatch = token.match(/^<([a-zA-Z0-9]+)(\s[^>]*)?\/?>$/);
    const closeMatch = token.match(/^<\/([a-zA-Z0-9]+)\s*>$/);
    if (openMatch) {
      const rawTag = openMatch[1].toLowerCase();
      if (BLOCKED.test(rawTag) || !ALLOWED.has(rawTag)) continue;
      const tag = RENAME[rawTag] ?? rawTag;
      if (tag === "img") {
        const src = sanitizeImgSrc(attr("src", openMatch[2] ?? "") ?? "");
        if (!src) continue;
        const altRaw = attr("alt", openMatch[2] ?? "") ?? "";
        const alt = escapeAttr(altRaw.slice(0, 200));
        out += `<img src="${escapeAttr(src)}" alt="${alt}">`;
        continue;
      }
      if (VOID.has(tag)) {
        out += "<br>";
        continue;
      }
      if (tag === "a") {
        const href = sanitizeHref(attr("href", openMatch[2] ?? "") ?? "");
        if (!href) continue;
        const extra = /target\s*=\s*['_"]?_blank/i.test(openMatch[2] ?? "")
          ? ` target="_blank" rel="noreferrer"`
          : "";
        out += `<a href="${href.replace(/"/g, "&quot;")}"${extra}>`;
        open.push("a");
        continue;
      }
      out += `<${tag}>`;
      open.push(tag);
      continue;
    }
    if (closeMatch) {
      const rawTag = closeMatch[1].toLowerCase();
      const tag = RENAME[rawTag] ?? rawTag;
      if (!ALLOWED.has(tag) || VOID.has(tag)) continue;
      const idx = open.lastIndexOf(tag);
      if (idx === -1) continue;
      while (open.length > idx) {
        const last = open.pop();
        if (last) out += `</${last}>`;
      }
      continue;
    }
    out += token.includes("<") ? escapeText(token) : token;
  }
  while (open.length) {
    const last = open.pop();
    if (last) out += `</${last}>`;
  }
  return out;
}
