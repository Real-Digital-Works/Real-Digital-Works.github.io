import { auth } from "@/lib/firebase";
import { compressWorkImage, WORK_IMAGE_MAX_BYTES } from "@/lib/work-image-upload";

type BlogImageKind = "cover" | "inline";

export const BLOG_IMAGE_MAX_BYTES = WORK_IMAGE_MAX_BYTES;
export const BLOG_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type MintResponse = {
  uploadUrl?: unknown;
  publicUrl?: unknown;
  headers?: unknown;
  error?: unknown;
};

async function prepareFile(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 8MB. Compress it or pick a smaller file.");
  }
  if (file.type === "image/gif") return file;
  const compressed = await compressWorkImage(file);
  if (compressed.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 8MB after compression. Pick a smaller file.");
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
