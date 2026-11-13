import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const BLOG_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const BLOG_IMAGE_KINDS = ["cover", "inline"] as const;
export type BlogImageKind = (typeof BLOG_IMAGE_KINDS)[number];

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const PRESIGN_EXPIRES_SECONDS = 120;
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export function isAllowedBlogImageType(contentType: string): boolean {
  return Object.prototype.hasOwnProperty.call(ALLOWED_TYPES, contentType);
}

export function extForBlogImageType(contentType: string): string {
  return ALLOWED_TYPES[contentType] ?? "jpg";
}

export function safeBlogSlug(slug: string): string {
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "draft";
}

function region(): string {
  return process.env.AWS_REGION?.trim() ?? "";
}

function bucket(): string {
  return process.env.AWS_S3_BUCKET?.trim() ?? "";
}

export function isBlogS3Configured(): boolean {
  return Boolean(
    region() &&
      bucket() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  );
}

function publicBaseUrl(): string {
  const fromEnv = process.env.AWS_S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return `https://${bucket()}.s3.${region()}.amazonaws.com`;
}

export function publicBlogImageUrl(key: string): string {
  return `${publicBaseUrl()}/${key.replace(/^\/+/, "")}`;
}

function client(): S3Client {
  return new S3Client({
    region: region(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "",
    },
  });
}

export async function mintBlogImageUpload(input: {
  slug: string;
  kind: BlogImageKind;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; headers: Record<string, string>; key: string }> {
  if (!isBlogS3Configured()) {
    throw new Error("Blog image storage is not configured.");
  }
  if (!isAllowedBlogImageType(input.contentType)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image.");
  }
  if (!BLOG_IMAGE_KINDS.includes(input.kind)) {
    throw new Error("Invalid image kind.");
  }

  const ext = extForBlogImageType(input.contentType);
  const id = crypto.randomUUID();
  const key = `blog/${safeBlogSlug(input.slug)}/${input.kind}-${id}.${ext}`;
  const headers = {
    "Content-Type": input.contentType,
    "Cache-Control": CACHE_CONTROL,
  };

  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: input.contentType,
    CacheControl: CACHE_CONTROL,
  });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: PRESIGN_EXPIRES_SECONDS });

  return {
    uploadUrl,
    publicUrl: publicBlogImageUrl(key),
    headers,
    key,
  };
}
