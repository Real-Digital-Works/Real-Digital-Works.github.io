"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Script from "next/script";
import { site } from "@/lib/content";
import { servicePages } from "@/lib/services-data";
import { CmsText, usePopupCopy } from "@/components/visual-editor/CmsText";
import { useVisualEditorOptional } from "@/components/visual-editor/VisualEditorProvider";

const UNSURE = "Not sure yet";
const serviceOptions = [
  { value: "", label: UNSURE },
  ...servicePages.map((s) => ({ value: s.slug, label: s.title })),
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

export function ContactForm({
  initialMessage = "",
  initialService = "",
}: {
  initialMessage?: string;
  initialService?: string;
}) {
  const selectedService = serviceOptions.some((o) => o.value === initialService)
    ? initialService
    : "";
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [viaMailto, setViaMailto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(initialMessage);
  const [turnstileToken, setTurnstileToken] = useState("");
  const widgetHostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const visual = useVisualEditorOptional();
  const copy = usePopupCopy("brief");

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
    const needSlug = String(form.get("need") || "").trim();
    const needLabel =
      serviceOptions.find((option) => option.value === needSlug)?.label ??
      (needSlug || UNSURE);
    const payload = {
      name: String(form.get("name") || "").trim(),
      business: String(form.get("business") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      need: needSlug ? `${needLabel} (${needSlug})` : needLabel,
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
          {copy("thanksTitle")}
        </h3>
        <p className="mt-2 text-[15.5px] text-bone/66">
          {viaMailto
            ? `Your mail app should have opened a message to the studio. If it did not, write to ${site.email} or call ${site.phone}.`
            : copy("thanksBody")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative grid gap-4"
      noValidate
      onFocusCapture={() => visual?.selectPopup("brief")}
    >
      <div className="pointer-events-none absolute -left-[10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={<CmsText path="popups.brief.nameLabel">{copy("nameLabel")}</CmsText>}
          name="name"
          error={errors.name}
          placeholder={copy("namePlaceholder")}
        />
        <Field
          label={<CmsText path="popups.brief.businessLabel">{copy("businessLabel")}</CmsText>}
          name="business"
          placeholder={copy("businessPlaceholder")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={<CmsText path="popups.brief.emailLabel">{copy("emailLabel")}</CmsText>}
          name="email"
          type="email"
          error={errors.email}
          placeholder={copy("emailPlaceholder")}
        />
        <Field
          label={<CmsText path="popups.brief.phoneLabel">{copy("phoneLabel")}</CmsText>}
          name="phone"
          type="tel"
          placeholder={copy("phonePlaceholder")}
        />
      </div>
      <NeedSelect
        name="need"
        label={copy("needLabel")}
        options={serviceOptions}
        defaultValue={selectedService}
      />
      <label className="block text-[14.5px] font-medium">
        <CmsText path="popups.brief.messageLabel">{copy("messageLabel")}</CmsText>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy("messagePlaceholder")}
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
        {status === "sending" ? copy("sending") : copy("submit")}
      </button>
      {status === "err" ? (
        <p className="text-[14px] text-[#c0392b]">
          Could not send the enquiry. Write to {site.email} or call {site.phone}.
        </p>
      ) : null}
    </form>
  );
}

function NeedSelect({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  const labelId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const index = options.findIndex((option) => option.value === defaultValue);
    return index >= 0 ? index : 0;
  });

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    setValue(option.value);
    setActiveIndex(index);
    setOpen(false);
  }

  function moveActive(delta: number) {
    setActiveIndex((index) => (index + delta + options.length) % options.length);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      commit(activeIndex);
    }
  }

  return (
    <div ref={rootRef} className="block text-[14.5px] font-medium">
      <span id={labelId}>{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="relative mt-2">
        <button
          type="button"
          className="input-dark flex w-full items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-left text-base text-[color:var(--fg)]"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
          onClick={() => setOpen((isOpen) => !isOpen)}
          onKeyDown={onTriggerKeyDown}
        >
          <span>{selected.label}</span>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-[color:var(--fg)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              fill="currentColor"
              d="M3.2 5.7a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L3.2 6.76a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-[10px] border-[1.5px] border-[color:var(--line-dk)] bg-[color:var(--void)] py-1 text-base text-[color:var(--fg)] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li key={option.value || "unsure"} role="none">
                  <div
                    id={`${listId}-${index}`}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`cursor-pointer px-4 py-2.5 ${
                      isSelected
                        ? "bg-[color:var(--beam)] text-white"
                        : isActive
                          ? "bg-[color:var(--glass-hover)] text-[color:var(--fg)]"
                          : "bg-transparent text-[color:var(--fg)]"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commit(index)}
                  >
                    {option.label}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
}: {
  label: ReactNode;
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
