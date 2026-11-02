"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { site } from "@/lib/content";

const needs = [
  "A new website",
  "A custom application",
  "Help getting found on Google",
  "AI and automation",
  "Video, 3D or animation",
  "Not sure yet",
];

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export function ContactForm({ initialMessage = "" }: { initialMessage?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [viaMailto, setViaMailto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(initialMessage);
  const [turnstileToken, setTurnstileToken] = useState("");
  const widgetHostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !widgetHostRef.current || !window.turnstile) return;
    if (widgetIdRef.current != null) {
      window.turnstile.reset(widgetIdRef.current);
      return;
    }
    widgetIdRef.current = window.turnstile.render(widgetHostRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
  }, []);

  function resetTurnstile() {
    setTurnstileToken("");
    if (widgetIdRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tokenFromWidget =
      (widgetIdRef.current != null && window.turnstile
        ? window.turnstile.getResponse(widgetIdRef.current)
        : "") || turnstileToken;
    const payload = {
      name: String(form.get("name") || "").trim(),
      business: String(form.get("business") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      need: String(form.get("need") || "").trim(),
      message: String(form.get("message") || "").trim(),
      website: String(form.get("website") || ""),
      turnstileToken: tokenFromWidget,
    };
    const next: Record<string, string> = {};
    if (payload.name.length < 2) next.name = "Please tell us your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(payload.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (payload.message.length < 10) next.message = "A sentence or two is plenty.";
    if (TURNSTILE_SITE_KEY && !payload.turnstileToken) {
      next.captcha = "Please complete the verification.";
    }
    if (!TURNSTILE_SITE_KEY && IS_PRODUCTION) {
      next.captcha = "Verification is not configured. Write to us instead.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    if (!TURNSTILE_SITE_KEY && IS_PRODUCTION) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: unknown;
        mailto?: unknown;
        error?: unknown;
      };
      if (res.ok && data.ok && typeof data.mailto === "string") {
        window.location.href = data.mailto;
        setViaMailto(true);
        setStatus("ok");
        return;
      }
      if (res.ok && data.ok) {
        setViaMailto(false);
        setStatus("ok");
        return;
      }
      if (typeof data.error === "string" && data.error.toLowerCase().includes("verif")) {
        setErrors({ captcha: data.error });
      }
      resetTurnstile();
      setStatus("err");
    } catch {
      const lines = [
        payload.business ? `Business: ${payload.business}` : null,
        payload.phone ? `Phone: ${payload.phone}` : null,
        payload.need ? `Need: ${payload.need}` : null,
        "",
        payload.message,
      ]
        .filter((line) => line !== null)
        .join("\n");
      window.location.href = `${site.emailHref}?subject=${encodeURIComponent(
        `Enquiry from ${payload.name}`
      )}&body=${encodeURIComponent(lines)}`;
      setViaMailto(true);
      setStatus("ok");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-[14px] bg-ink p-7 text-bone">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          Thanks — that is with us.
        </h3>
        <p className="mt-2 text-[15.5px] text-bone/66">
          {viaMailto
            ? `Your mail app should have opened a message to the studio. If it did not, write to ${site.email} or call ${site.phone}.`
            : `A person replies within one working day. If you need us sooner, write to ${site.email} or call ${site.phone}.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-4" noValidate>
      <div className="pointer-events-none absolute -left-[10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name} placeholder="Sam Patel" />
        <Field label="Business name" name="business" placeholder="Patel & Co" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          name="email"
          type="email"
          error={errors.email}
          placeholder="sam@studio.co.uk"
        />
        <Field label="Phone" name="phone" type="tel" placeholder="07700 900123" />
      </div>
      <label className="block text-[14.5px] font-medium">
        What do you need?
        <select
          name="need"
          defaultValue={needs[0]}
          className="mt-2 w-full rounded-[10px] input-dark px-4 py-3 text-base"
        >
          {needs.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="block text-[14.5px] font-medium">
        Tell us a bit more
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Current site, rough budget, when you would like it live."
          className={`mt-2 min-h-[140px] w-full resize-y rounded-[10px] input-dark px-4 py-3 text-base ${
            errors.message ? "border-[#c0392b]" : ""
          }`}
        />
        {errors.message ? (
          <span className="mt-1 block text-[13.5px] text-[#c0392b]">{errors.message}</span>
        ) : null}
      </label>
      {TURNSTILE_SITE_KEY ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onReady={renderTurnstile}
          />
          <div ref={widgetHostRef} className="min-h-[65px]" />
          {errors.captcha ? (
            <p className="text-[13.5px] text-[#c0392b]">{errors.captcha}</p>
          ) : null}
        </>
      ) : (
        <p className="text-[13.5px] text-fg/55">
          {IS_PRODUCTION
            ? `Verification is not configured yet. Write to ${site.email} or call ${site.phone}.`
            : "Turnstile site key is unset — local submits skip CAPTCHA."}
        </p>
      )}
      <button
        className="btn btn-beam w-fit"
        disabled={status === "sending" || (!TURNSTILE_SITE_KEY && IS_PRODUCTION)}
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      {status === "err" ? (
        <p className="text-[14px] text-[#c0392b]">
          Could not send the enquiry. Write to {site.email} or call {site.phone}.
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block text-[14.5px] font-medium">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete="on"
        suppressHydrationWarning
        className={`mt-2 w-full rounded-[10px] input-dark px-4 py-3 text-base ${
          error ? "border-[#c0392b]" : ""
        }`}
      />
      {error ? (
        <span className="mt-1 block text-[13.5px] text-[#c0392b]">{error}</span>
      ) : null}
    </label>
  );
}
