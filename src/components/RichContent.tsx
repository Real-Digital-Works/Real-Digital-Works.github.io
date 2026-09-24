/**
 * RichContent — renders TipTap HTML output safely.
 * Applies .rich-content prose styles from globals.css.
 */

import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  html: string;
}

export function RichContent({ html, className = "", ...props }: Props) {
  // If the content has no HTML tags (legacy plain text), wrap it in a <p> so
  // it still renders visibly.
  const processed =
    html && !/<[a-z][\s\S]*>/i.test(html) ? `<p>${html}</p>` : html;

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
      {...props}
    />
  );
}
