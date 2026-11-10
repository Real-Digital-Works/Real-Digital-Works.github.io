"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  CLOUDINARY_SETUP_HEADLINE,
  CLOUDINARY_SETUP_STEPS,
  WORK_IMAGE_ACCEPT,
  WORK_IMAGE_MAX_BYTES,
  isCloudinaryConfigured,
  uploadWorkImage,
} from "@/lib/work-image-upload";

export function WorkImageField({
  value,
  slug,
  onChange,
}: {
  value: string;
  slug: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const configured = isCloudinaryConfigured();

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!configured) return;

    setError("");
    setBusy(true);
    try {
      const url = await uploadWorkImage(file, slug);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium tracking-wide text-white/50 uppercase">
        Card image
      </label>
      <p className="text-[11px] text-white/30">
        Upload JPG, PNG, or WebP (max {Math.round(WORK_IMAGE_MAX_BYTES / (1024 * 1024))}
        MB). Images go to Cloudinary (free tier). Or paste an existing image URL. Leave
        empty for the accent gradient.
      </p>
      {!configured ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-[11px] text-amber-100/90">
          <p className="font-medium text-amber-50">{CLOUDINARY_SETUP_HEADLINE}</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-amber-100/75">
            {CLOUDINARY_SETUP_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {value ? (
        <div
          className="h-24 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${value})` }}
          aria-hidden
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={WORK_IMAGE_ACCEPT}
          className="sr-only"
          onChange={onFile}
        />
        <button
          type="button"
          disabled={busy || !configured}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Upload image"}
        </button>
        {value ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setError("");
              onChange("");
            }}
            className="text-xs text-white/40 hover:text-white/70 disabled:opacity-40"
          >
            Clear
          </button>
        ) : null}
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => {
          setError("");
          onChange(e.target.value);
        }}
        placeholder="https://… or upload above"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
      />
      {error ? <p className="text-[11px] text-red-400/90">{error}</p> : null}
    </div>
  );
}
