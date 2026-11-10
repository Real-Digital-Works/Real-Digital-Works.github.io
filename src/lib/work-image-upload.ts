export const WORK_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const WORK_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_EDGE = 1600;
const QUALITY = 0.72;

export const CLOUDINARY_SETUP_HEADLINE =
  "Add Cloudinary free cloud name + unsigned preset";

export const CLOUDINARY_SETUP_STEPS = [
  "Create a free account at cloudinary.com (no Google billing).",
  "Copy Cloud Name from the Cloudinary dashboard.",
  "Settings → Upload → Upload presets → Add upload preset. Signing mode: Unsigned. Folder: work. Restrict to images only. Save the preset name.",
  "In Vercel → Settings → Environment Variables (and locally in .env.local) add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. Redeploy.",
] as const;

function cloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

function uploadPreset(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName() && uploadPreset());
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
  if (!isCloudinaryConfigured()) {
    throw new Error(CLOUDINARY_SETUP_HEADLINE);
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
  // Folder is locked on the unsigned preset (`work`). Do not send extra unsigned params.

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName())}/image/upload`;
  const res = await fetch(endpoint, { method: "POST", body });
  const payload = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;
  const errorMessage =
    typeof payload.error?.message === "string" ? payload.error.message : "";
  if (!res.ok || errorMessage) {
    throw new Error(errorMessage || "Cloudinary upload failed.");
  }
  if (typeof payload.secure_url !== "string" || !payload.secure_url.startsWith("https://")) {
    throw new Error("Cloudinary did not return an image URL.");
  }
  return payload.secure_url;
}
