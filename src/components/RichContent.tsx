/**
 * RichContent — renders TipTap HTML output safely.
 * Applies .rich-content prose styles from globals.css.
 */

import type { HTMLAttributes } from "react";
import { sanitizeCmsHtml } from "@/lib/cms-html";

interface Props extends HTMLAttributes<HTMLDivElement> {
  html: string;
}

export function RichContent({ html, className = "", ...props }: Props) {
  const cleaned = sanitizeCmsHtml(html).html;
  const processed =
    cleaned && !/<[a-z][\s\S]*>/i.test(cleaned) ? `<p>${cleaned}</p>` : cleaned;

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
      {...props}
    />
  );
}
