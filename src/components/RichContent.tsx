/**
 * RichContent — renders TipTap HTML output safely.
 * Applies .rich-content prose styles from globals.css.
 */

"use client";

import type { HTMLAttributes, MouseEvent } from "react";
import { sanitizeCmsHtml } from "@/lib/cms-html";

interface Props extends HTMLAttributes<HTMLDivElement> {
  html: string;
}

export function RichContent({ html, className = "", onClick, ...props }: Props) {
  const cleaned = sanitizeCmsHtml(html).html;
  const processed =
    cleaned && !/<[a-z][\s\S]*>/i.test(cleaned) ? `<p>${cleaned}</p>` : cleaned;

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement | null)?.closest("a")) {
      event.stopPropagation();
    }
    onClick?.(event);
  }

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
      onClick={handleClick}
      {...props}
    />
  );
}
