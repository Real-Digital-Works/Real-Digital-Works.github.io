"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { site } from "@/lib/site";

const needs = [
  "A new website",
  "A custom application",
  "Help getting found on Google",
  "AI and automation",
  "Video, 3D or animation",
  "Not sure yet",
];

export function ContactForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const estimate = params.get("estimate");
    const need = params.get("need");
    const size = params.get("size");
    const speed = params.get("speed");
    if (!estimate && !need) return;
    setMessage(
      [
        need ? `Quote builder: ${need}` : null,
        size ? `Size: ${size}` : null,
        speed ? `Timing: ${speed}` : null,
        estimate ? `Estimate shown: ${estimate}` : null,
      ]
        .filter(Boolean)
        .join(". "),
    );
  }, [params]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      business: String(form.get("business") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      need: String(form.get("need") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };
    const next: Record<string, string> = {};
    if (payload.name.length < 2) next.name = "Please tell us your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(payload.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (payload.message.length < 10) next.message = "A sentence or two is plenty.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    const lines = [
      payload.business ? `Business: ${payload.business}` : null,
      payload.phone ? `Phone: ${payload.phone}` : null,
      payload.need ? `Need: ${payload.need}` : null,
      "",
      payload.message,
    ]
      .filter((line) => line !== null)
      .join("\n");
    const href = `${site.emailHref}?subject=${encodeURIComponent(
      `Enquiry from ${payload.name}`,
    )}&body=${encodeURIComponent(lines)}`;
    window.location.href = href;
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <div className="rounded-[14px] bg-ink p-7 text-bone">
        <h3 className="text-xl font-semibold tracking-[-0.03em]">
          Thanks — that is with us.
        </h3>
        <p className="mt-2 text-[15.5px] text-bone/66">
          Your mail app should have opened a message to the studio. If it did
          not, write to {site.email} or call {site.phone}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
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
      <button className="btn btn-beam w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      {status === "err" ? (
        <p className="text-[14px] text-[#c0392b]">
          Could not save the enquiry locally. Check the terminal, then try again.
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
