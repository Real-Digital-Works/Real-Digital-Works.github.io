import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/firebase-admin";
import {
  BLOG_IMAGE_KINDS,
  isAllowedBlogImageType,
  isBlogS3Configured,
  mintBlogImageUpload,
  type BlogImageKind,
} from "@/lib/s3-blog-images";

export async function POST(request: Request) {
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!isBlogS3Configured()) {
    console.error("[blog-image] Missing AWS_REGION, AWS_S3_BUCKET, or access keys");
    return NextResponse.json({ error: "Image uploads are not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const row = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  const kind = row.kind;
  const contentType = typeof row.contentType === "string" ? row.contentType.trim().toLowerCase() : "";

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }
  if (kind !== "cover" && kind !== "inline") {
    return NextResponse.json({ error: "kind must be cover or inline" }, { status: 400 });
  }
  if (!BLOG_IMAGE_KINDS.includes(kind as BlogImageKind) || !isAllowedBlogImageType(contentType)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 400 });
  }

  try {
    const minted = await mintBlogImageUpload({
      slug,
      kind,
      contentType,
    });
    return NextResponse.json({
      uploadUrl: minted.uploadUrl,
      publicUrl: minted.publicUrl,
      headers: minted.headers,
    });
  } catch (err) {
    console.error("[blog-image] Presign failed:", err instanceof Error ? err.name : "error");
    return NextResponse.json({ error: "Could not create an upload URL." }, { status: 500 });
  }
}
