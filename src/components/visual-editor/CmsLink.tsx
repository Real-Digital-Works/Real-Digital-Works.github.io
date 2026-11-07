"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import seedContent from "@/lib/content";
import {
  CTA_BY_ID,
  findNavItem,
  isInternalHref,
  popupText,
  resolveCta,
} from "@/lib/cms-ui";
import { useVisualEditorOptional } from "./VisualEditorProvider";

type CmsLinkProps = {
  className?: string;
  children?: ReactNode;
  href?: string;
  ctaId?: string;
  navId?: string;
  popupId?: string;
  labelKey?: string;
  hrefKey?: string;
  target?: string;
  rel?: string;
  /** Keep logo / rich children instead of replacing them with the plain label. */
  preserveChildren?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function labelOf(children: ReactNode, fallback: string): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  return fallback;
}

export function CmsLink({
  className,
  children,
  href,
  ctaId,
  navId,
  popupId,
  labelKey,
  hrefKey,
  target,
  rel,
  preserveChildren = false,
  onClick,
}: CmsLinkProps) {
  const ctx = useVisualEditorOptional();
  const source = ctx?.enabled ? ctx.draft : seedContent;
  const editing = Boolean(ctx?.enabled);

  let label = labelOf(children, "");
  let dest = href ?? "/";
  let selected = false;
  let select = () => {};

  if (popupId && labelKey && hrefKey) {
    label = popupText(source, popupId, labelKey, label);
    dest = popupText(source, popupId, hrefKey, dest);
    selected = ctx?.selection?.kind === "popup" && ctx.selection.id === popupId;
    select = () => ctx?.selectPopup(popupId);
  } else if (ctaId) {
    const resolved = resolveCta(source, ctaId, { label, href: dest });
    label = resolved.label;
    dest = resolved.href;
    selected = ctx?.selection?.kind === "link" && ctx.selection.id === ctaId;
    select = () => ctx?.selectLink(ctaId);
  } else if (navId) {
    const item = findNavItem(source.navItems, navId);
    if (item) {
      label = item.label || label;
      dest = item.href || dest;
    }
    selected = ctx?.selection?.kind === "nav" && ctx.selection.id === navId;
    select = () => ctx?.selectNav(navId);
  }

  if (
    !editing &&
    href &&
    (href === dest || href.startsWith(`${dest}?`) || href.startsWith(`${dest}&`))
  ) {
    dest = href;
  }

  const classes = [
    className,
    editing ? "rdw-cms-link" : "",
    editing && selected ? "rdw-cms-link-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (editing) {
    return (
      <span
        className={classes}
        role="link"
        tabIndex={0}
        data-cms-cta={ctaId}
        data-cms-nav={navId}
        data-cms-popup={popupId}
        aria-label={`Edit link ${label}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          select();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select();
          }
        }}
      >
        {preserveChildren ? children : label}
      </span>
    );
  }

  const extra = target === "_blank" ? { target, rel: rel ?? "noreferrer" } : { target, rel };

  if (!isInternalHref(dest)) {
    return (
      <a href={dest} className={className} onClick={onClick} {...extra}>
        {label}
      </a>
    );
  }

  return (
    <Link href={dest} className={className} onClick={onClick} {...extra}>
      {label}
    </Link>
  );
}

export function ctaTitle(id: string): string {
  return CTA_BY_ID[id]?.title ?? id;
}
