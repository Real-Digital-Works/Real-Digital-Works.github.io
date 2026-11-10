export const WORK_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const WORK_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_EDGE = 1600;
const QUALITY = 0.72;

export const CLOUDINARY_SETUP_HEADLINE =
  "Add Cloudinary Cloud Name (not an API key) and unsigned preset `work`";

export const CLOUDINARY_MISSING_CLOUD_NAME =
  "Cloudinary cloud name is missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to the Cloud Name from the Cloudinary dashboard (not an API key) and redeploy. Unsigned uploads do not use an API key.";

export const CLOUDINARY_UNKNOWN_KEY_ERROR =
  "Cloudinary rejected the upload. Unsigned uploads must send only the image and preset `work` — no API key. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is the Cloud Name from the dashboard (not an API key or empty) and redeploy.";

export const CLOUDINARY_SETUP_STEPS = [
  "Create a free account at cloudinary.com (no Google billing).",
  "Copy Cloud Name from the Cloudinary dashboard — not the API Key.",
  "Settings → Upload → Upload presets → Add upload preset. Signing mode: Unsigned. Preset name: work. Folder: work. Restrict to images only.",
  "In Vercel and .env.local set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=work. Redeploy.",
] as const;

/** Unsigned preset name (not the folder). Folder `work` is locked on the preset. */
const UNSIGNED_UPLOAD_PRESET = "work";

function cloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

function uploadPreset(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";
  return fromEnv || UNSIGNED_UPLOAD_PRESET;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName());
}

function extForType(type: string): string {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  return "jpg";
}

function safeSlug(slug: string): string {
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "case-study";
}

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type, lastModified: Date.now() });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), type, quality);
  });
  if (!blob) throw new Error("Could not compress the image.");
  return blob;
}

async function loadImage(file: File): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through to HTMLImageElement.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that image."));
      el.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Shrinks to max edge ~1600px and JPEG/WebP quality ~0.72. */
export async function compressWorkImage(file: File): Promise<File> {
  const source = await loadImage(file);
  const srcW = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress the image.");
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") source.close();

  const webpBlob = await canvasToBlob(canvas, "image/webp", QUALITY);
  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
  const chosen = webpBlob.size <= jpegBlob.size ? webpBlob : jpegBlob;
  const type = chosen.type || "image/jpeg";
  const base = file.name.replace(/\.[a-z0-9]+$/i, "") || "image";
  return blobToFile(chosen, `${base}.${extForType(type)}`, type);
}

type CloudinaryUploadResponse = {
  secure_url?: unknown;
  error?: { message?: unknown };
};

/** Compresses then POSTs to Cloudinary unsigned upload. Returns secure_url. */
export async function uploadWorkImage(file: File, slug: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > WORK_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 8MB. Compress it or pick a smaller file.");
  }
  const cloud = cloudName();
  if (!cloud) {
    throw new Error(CLOUDINARY_MISSING_CLOUD_NAME);
  }

  const compressed = await compressWorkImage(file);
  const named = blobToFile(
    compressed,
    `${safeSlug(slug)}-${compressed.name}`,
    compressed.type,
  );
  const body = new FormData();
  body.set("file", named);
  body.set("upload_preset", uploadPreset());
  // Unsigned endpoint: file + upload_preset only. Never api_key / api_secret / folder.
  body.delete("api_key");
  body.delete("api_secret");
  body.delete("signature");
  body.delete("timestamp");

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`;
  const res = await fetch(endpoint, { method: "POST", body });
  const payload = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;
  const errorMessage =
    typeof payload.error?.message === "string" ? payload.error.message.trim() : "";
  if (!res.ok || errorMessage) {
    if (/unknown api key/i.test(errorMessage)) {
      throw new Error(CLOUDINARY_UNKNOWN_KEY_ERROR);
    }
    throw new Error(errorMessage || "Cloudinary upload failed.");
  }
  if (typeof payload.secure_url !== "string" || !payload.secure_url.startsWith("https://")) {
    throw new Error("Cloudinary did not return an image URL.");
  }
  return payload.secure_url;
}
