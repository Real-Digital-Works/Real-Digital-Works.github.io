import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

export const WORK_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const WORK_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const STORAGE_SETUP_HINT =
  "Firebase Storage may not be enabled. In Firebase Console: Build → Storage → Get started. Then paste/deploy storage.rules from this repo (do not open the whole bucket).";

function extForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function safeSlug(slug: string): string {
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "case-study";
}

function safeFilename(name: string, type: string): string {
  const base = name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "image"}.${extForType(type)}`;
}

export function workImageStoragePath(slug: string, filename: string): string {
  return `work/${safeSlug(slug)}/${filename}`;
}

function uploadErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  if (code === "storage/unauthorized") {
    return "Upload blocked by Storage rules. Sign in as admin, then deploy storage.rules from this repo.";
  }
  if (
    code === "storage/retry-limit-exceeded" ||
    code === "storage/unknown" ||
    /not found|404|bucket/i.test(message)
  ) {
    return STORAGE_SETUP_HINT;
  }
  return message || "Upload failed.";
}

/** Uploads a card image to Firebase Storage and returns the public download URL. */
export async function uploadWorkImage(file: File, slug: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > WORK_IMAGE_MAX_BYTES) {
    throw new Error("Image is over 8MB. Compress it or pick a smaller file.");
  }
  if (!auth().currentUser) {
    throw new Error("Sign in to upload images.");
  }

  const filename = `${Date.now()}-${safeFilename(file.name, file.type)}`;
  const path = workImageStoragePath(slug, filename);
  const objectRef = ref(storage(), path);

  try {
    await uploadBytes(objectRef, file, { contentType: file.type });
    return await getDownloadURL(objectRef);
  } catch (error) {
    throw new Error(uploadErrorMessage(error));
  }
}
