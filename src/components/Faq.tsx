"use client";

import { useState } from "react";
import { faq } from "@/lib/content";
import { CmsText } from "@/components/visual-editor/CmsText";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";

export function Faq({ items = faq }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const visual = Boolean(useVisualEditorOptional()?.enabled);
  return (
    <div className="max-w-[860px]">
      {items.map((item, i) => {
        const isOpen = visual || open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-6 py-4 text-left text-[17px] font-semibold tracking-[-0.02em]"
              aria-expanded={isOpen}
              onClick={() => {
                if (visual) return;
                setOpen(isOpen ? null : i);
              }}
            >
              <CmsText path={`faq.${i}.q`}>{item.q}</CmsText>
              <span className="relative h-[22px] w-[22px] shrink-0">
                <span className="absolute top-[10px] left-0 h-[2px] w-[22px] bg-beam" />
                <span
                  className={`absolute top-0 left-[10px] h-[22px] w-[2px] bg-beam transition-transform ${
                    isOpen ? "scale-y-0" : "scale-y-100"
                  }`}
                />
              </span>
            </button>
            {isOpen ? (
              <CmsText
                path={`faq.${i}.a`}
                as="div"
                className="max-w-[70ch] pb-6 text-[16.5px] text-mid"
                html
              >
                {item.a}
              </CmsText>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
