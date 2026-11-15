import { auth } from "@/lib/firebase";

type BlogImageKind = "cover" | "inline";

/** Hard cap before compression (cover and inline). */
export const BLOG_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const BLOG_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
/** Long edge: 2K is enough for blog + retina; avoids the softness of 1600px. */
const MAX_EDGE = 2560;
const LOSSY_QUALITY = 0.84;
const ALPHA_WEBP_QUALITY = 0.85;

type MintResponse = {
  uploadUrl?: unknown;
  publicUrl?: unknown;
  headers?: unknown;
  error?: unknown;
};

function extForType(type: string): string {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type, lastModified: Date.now() });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), type, quality);
  });
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

function canvasHasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/**
 * Shrink oversized photos to a 2560px long edge and encode WebP/JPEG around
 * quality 0.84. Keeps GIFs intact. Keeps the original when it is already
 * within the max edge and smaller than (or equal to) the compressed result.
 */
export async function compressBlogImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const source = await loadImage(file);
  const srcW = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;
  const longEdge = Math.max(srcW, srcH);
  const scale = Math.min(1, MAX_EDGE / longEdge);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Could not compress the image.");
  ctx.drawImage(source, 0, 0, width, height);
  const hasAlpha = canvasHasAlpha(ctx, width, height);
  if (!hasAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
  }
  if ("close" in source && typeof source.close === "function") source.close();

  const candidates: Blob[] = [];
  if (hasAlpha) {
    const webp = await canvasToBlob(canvas, "image/webp", ALPHA_WEBP_QUALITY);
    if (webp && webp.size > 0) candidates.push(webp);
  } else {
    const webp = await canvasToBlob(canvas, "image/webp", LOSSY_QUALITY);
    const jpeg = await canvasToBlob(canvas, "image/jpeg", LOSSY_QUALITY);
    if (webp && webp.size > 0) candidates.push(webp);
    if (jpeg && jpeg.size > 0) candidates.push(jpeg);
  }

  if (candidates.length === 0) {
    throw new Error("Could not compress the image.");
  }

  candidates.sort((a, b) => a.size - b.size);
  const best = candidates[0];

  const originalFits = longEdge <= MAX_EDGE;
  if (originalFits && file.size <= best.size) {
    return file;
  }

  const type = best.type || (hasAlpha ? "image/webp" : "image/jpeg");
  const base = file.name.replace(/\.[a-z0-9]+$/i, "") || "image";
  return blobToFile(best, `${base}.${extForType(type)}`, type);
}

async function prepareFile(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 10MB. Compress it or pick a smaller file.");
  }
  const compressed = await compressBlogImage(file);
  if (compressed.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 10MB after compression. Pick a smaller file.");
  }
  return compressed;
}

async function bearerToken(): Promise<string> {
  const user = auth().currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken();
}

/** Compress (except GIF), mint a server presigned PUT, upload the file. Returns the public HTTPS URL. */
export async function uploadBlogImage(
  file: File,
  slug: string,
  kind: BlogImageKind,
): Promise<string> {
  const prepared = await prepareFile(file);
  const token = await bearerToken();
  const mintRes = await fetch("/api/admin/blog-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      slug,
      kind,
      contentType: prepared.type || "image/jpeg",
    }),
  });
  const payload = (await mintRes.json().catch(() => ({}))) as MintResponse;
  if (!mintRes.ok) {
    const message = typeof payload.error === "string" ? payload.error : "Could not start the upload.";
    throw new Error(message);
  }
  if (typeof payload.uploadUrl !== "string" || typeof payload.publicUrl !== "string") {
    throw new Error("Upload was not given a destination URL.");
  }
  if (!payload.publicUrl.startsWith("https://")) {
    throw new Error("Upload did not return a public image URL.");
  }

  const headers = new Headers();
  if (payload.headers && typeof payload.headers === "object") {
    for (const [key, value] of Object.entries(payload.headers as Record<string, unknown>)) {
      if (typeof value === "string") headers.set(key, value);
    }
  }
  if (!headers.has("Content-Type")) headers.set("Content-Type", prepared.type || "image/jpeg");

  const putRes = await fetch(payload.uploadUrl, {
    method: "PUT",
    headers,
    body: prepared,
  });
  if (!putRes.ok) {
    throw new Error("S3 rejected the upload. Try again.");
  }
  return payload.publicUrl;
}
