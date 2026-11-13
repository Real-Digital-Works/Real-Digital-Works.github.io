"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { BLOG_IMAGE_ACCEPT, BLOG_IMAGE_MAX_BYTES, uploadBlogImage } from "@/lib/blog-image-upload";

export function BlogCoverField({
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
  const canUpload = Boolean(slug.trim());

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canUpload) return;

    setError("");
    setBusy(true);
    try {
      const url = await uploadBlogImage(file, slug, "cover");
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
        Cover image
      </label>
      <p className="text-[11px] text-white/30">
        Upload JPG, PNG, WebP, or GIF (max {Math.round(BLOG_IMAGE_MAX_BYTES / (1024 * 1024))}
        MB). Stored on S3 as the post card and hero. Or paste an HTTPS URL.
      </p>
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
          accept={BLOG_IMAGE_ACCEPT}
          className="sr-only"
          onChange={onFile}
        />
        <button
          type="button"
          disabled={busy || !canUpload}
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
      {!canUpload ? (
        <p className="text-[11px] text-amber-200/80">Add a URL slug first so the image can be stored under that post.</p>
      ) : null}
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
