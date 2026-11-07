"use client";

import type { ElementType, FocusEvent, MouseEvent, ReactNode } from "react";
import { RichContent } from "@/components/RichContent";
import seedContent, { type Content } from "@/lib/content";
import { popupText } from "@/lib/cms-ui";
import { sanitizeCmsHtml } from "@/lib/cms-html";
import { useVisualEditorOptional } from "./VisualEditorProvider";

export function useLiveDraft(): Content {
  const ctx = useVisualEditorOptional();
  return ctx?.enabled ? ctx.draft : seedContent;
}

export function usePopupCopy(id: string) {
  const draft = useLiveDraft();
  return (key: string, fallback?: string) => popupText(draft, id, key, fallback);
}

type CmsTextProps = {
  path: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Treat the value as HTML (legal body, rich CMS fields). */
  html?: boolean;
  /** Split the last line into the site accent wash (hero headline). */
  accentLastLine?: boolean;
};

function asString(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  return "";
}

function AccentHeadline({
  text,
  className,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const lines = text.split("\n");
  const last = lines.slice(-1)[0] ?? "";
  const rest = lines.slice(0, -1).join(" ");
  return (
    <Tag className={className}>
      {rest ? (
        <>
          {rest}
          <br />
        </>
      ) : null}
      <span className="accent accent-wash">{last}</span>
    </Tag>
  );
}

export function CmsText({
  path,
  as: Tag = "span",
  className,
  children,
  html = false,
  accentLastLine = false,
}: CmsTextProps) {
  const ctx = useVisualEditorOptional();
  const fallback = asString(children);
  const value = ctx?.enabled ? ctx.getText(path) || fallback : fallback;
  const editing = Boolean(ctx?.enabled);

  if (!editing) {
    if (html) return <RichContent html={value} className={className} />;
    if (accentLastLine) return <AccentHeadline text={value} className={className} as={Tag} />;
    return <Tag className={className}>{value}</Tag>;
  }

  const selected = ctx?.selectedPath === path;
  const classes = ["rdw-cms-field", selected ? "rdw-cms-field-selected" : "", className]
    .filter(Boolean)
    .join(" ");

  if (html) {
    const safe = sanitizeCmsHtml(value).html || value;
    return (
      <Tag
        className={classes}
        data-cms-path={path}
        data-cms-html="true"
        role="button"
        tabIndex={0}
        aria-label={`Edit ${path} in the inspector`}
        onClick={(event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          ctx?.selectPath(path);
        }}
        onFocus={() => ctx?.selectPath(path)}
      >
        <RichContent html={safe} />
      </Tag>
    );
  }

  return (
    <Tag
      className={classes}
      contentEditable
      suppressContentEditableWarning
      data-cms-path={path}
      role="textbox"
      aria-label={`Edit ${path}`}
      onClick={() => ctx?.selectPath(path)}
      onFocus={() => ctx?.selectPath(path)}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        const next = (event.currentTarget.innerText ?? "").replace(/\u00a0/g, " ");
        if (next !== value) ctx?.setText(path, next);
      }}
    >
      {value}
    </Tag>
  );
}

export function useDraftArray<T>(path: string, fallback: T[]): T[] {
  const ctx = useVisualEditorOptional();
  if (!ctx?.enabled) return fallback;
  const value = path.split(".").reduce<unknown>((cur, key) => {
    if (cur == null) return undefined;
    if (Array.isArray(cur) && /^\d+$/.test(key)) return cur[Number(key)];
    return (cur as Record<string, unknown>)[key];
  }, ctx.draft as unknown);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function useDraftServicesHome<T>(fallback: T[]): T[] {
  const ctx = useVisualEditorOptional();
  if (!ctx?.enabled) return fallback;
  const list = ctx.draft.servicePagesList ?? [];
  return list
    .filter((row) => row.showOnHome)
    .map((row) => ({
      id: row.slug,
      title: row.listingTitle.trim() || row.title,
      from: row.from,
      summary: row.summary,
      detail: row.detail,
    })) as T[];
}
