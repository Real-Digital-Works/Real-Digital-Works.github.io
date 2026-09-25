"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";

type Msg = { from: "rdw" | "you"; text: string };

const seed: Msg[] = [
  {
    from: "rdw",
    text: "Ask this desk anything about the studio. It is a live demo of the enquiry pattern we build — not a toy chatbot pasted on the side.",
  },
];

function answer(q: string) {
  const t = q.toLowerCase();
  if (/(price|cost|quote|£|cheap)/.test(t)) {
    return "Sites typically land £1,450–£3,200. Shops from £5,500. AI workflows from £900. Custom apps are scoped after a call. Open Pricing to tick a live range, or tell me what you need.";
  }
  if (/(ai|chat|automat|assistant|gpt)/.test(t)) {
    return "We ship one workflow first: enquiries, booking, follow-up, or internal search. If it saves hours, we add the next. No mystery retainer. This panel is a sketch of that product.";
  }
  if (/(website|web |site|shop)/.test(t)) {
    return "We design and build the site, the CMS, and the search foundations. You own the source. Most clients start here, then add an assistant or a portal.";
  }
  if (/(app|portal|software|cloud)/.test(t)) {
    return "Portals, booking engines, internal tools. Fixed written scope, weekly builds you can click, QA in the same studio as engineering.";
  }
  if (/(seo|google|search|rank)/.test(t)) {
    return "Technical health first, then pages built around real demand. From £550 / month. If the current site is salvageable we will say so.";
  }
  if (/(3d|animat|video|unreal|maya)/.test(t)) {
    return "Motion is in-house at the Kennington studio — the parent company has taught this craft since 2009. Renders, explainers, Unreal, Maya, Blender.";
  }
  if (/(london|where|office|kennington)/.test(t)) {
    return "Kennington Business Park, Lincoln House LG-02, London SW9 6DE. Meet in person or remote. One working day to reply.";
  }
  return "I can talk pricing, AI, websites, apps, search or motion. For a real brief, use Contact — a human answers within a day.";
}

export function StudioChat({
  variant = "panel",
}: {
  variant?: "panel" | "dock";
}) {
  const [open, setOpen] = useState(variant === "panel");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const list = useRef<HTMLDivElement>(null);
  // Hide the dock button when the enquiry desk section is already visible on screen
  const [deskVisible, setDeskVisible] = useState(false);

  useEffect(() => {
    if (variant !== "dock") return;
    const target = document.querySelector(".desk-block");
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setDeskVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [variant]);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const pending: Msg[] = [...msgs, { from: "you", text: q }];
    setMsgs(pending);
    setBusy(true);
    let reply = "";
    try {
      const res = await fetch("/api/ask-rdw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: pending, message: q }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: unknown;
        fallback?: unknown;
      };
      if (res.ok && !data.fallback && typeof data.reply === "string") {
        reply = data.reply.trim();
      }
    } catch {
      // Local keyword matcher keeps preview working without a key.
    }
    setMsgs((m) => [...m, { from: "rdw", text: reply || answer(q) }]);
    setBusy(false);
  }

  const windowUi = (
    <div className="glass flex h-full min-h-[380px] flex-col overflow-hidden rounded-[22px]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <p className="ml-3 font-mono text-[11px] tracking-[0.16em] text-fg/45 uppercase">
          rdw / enquire-desk
        </p>
        <span className="ml-auto font-mono text-[11px] text-cyan">live</span>
      </div>
      <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {msgs.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
              msg.from === "you"
                ? "ml-auto bg-beam text-white"
                : "bg-fg/6 text-fg/82"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {busy ? (
          <p className="font-mono text-[12px] text-cyan">thinking…</p>
        ) : null}
      </div>
      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about AI, a site, a price…"
          className="input-dark min-w-0 flex-1 rounded-full px-4 py-2.5 text-[15px]"
        />
        <button className="btn btn-beam rounded-full px-4 py-2.5" type="submit">
          Send
        </button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-fg/35">
        Ranges only — not a quote.{" "}
        <Link href="/contact" className="text-tech">
          Talk to a person
        </Link>
        {" · "}
        <a href={site.whatsappHref} className="text-tech" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </p>
    </div>
  );

  if (variant === "panel") return windowUi;

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-24 z-50 w-[min(100%-2rem,400px)] shadow-[0_30px_80px_rgba(0,0,0,.45)]">
          {windowUi}
        </div>
      ) : null}
      <button
        type="button"
        className={`fixed right-4 bottom-20 sm:bottom-4 z-50 rounded-full bg-beam px-4 py-3 text-[13px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_0_40px_rgba(24,87,236,.45)] transition-all duration-300 ${
          deskVisible ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close desk" : "Ask RDW"}
      </button>
    </>
  );
}
