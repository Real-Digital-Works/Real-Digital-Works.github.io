import { unstable_cache } from "next/cache";
import { blogs as bakedBlogs, type BlogPost } from "@/lib/content";

/** ISR window for public /blog so Publish appears without a Vercel rebuild. */
export const BLOG_REVALIDATE_SECONDS = 60;

function toIsoDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const row = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof row.toDate === "function") return row.toDate().toISOString();
    const seconds = row.seconds ?? row._seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000).toISOString();
  }
  return "";
}

function normalizeLiveBlog(slug: string, data: Record<string, unknown>): BlogPost {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    content: typeof data.content === "string" ? data.content : "",
    coverImage:
      typeof data.coverImage === "string" && data.coverImage.trim()
        ? data.coverImage.trim()
        : undefined,
    publishedAt: toIsoDate(data.publishedAt) || new Date().toISOString().split("T")[0],
    status: data.status === "published" ? "published" : "draft",
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : "",
    seoDescription: typeof data.seoDescription === "string" ? data.seoDescription : "",
    hidden: Boolean(data.hidden),
  };
}

function publishedAtMs(value: string): number {
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
}

async function fetchBlogsFromFirestore(): Promise<BlogPost[]> {
  const { adminDb } = await import("@/lib/firebase-admin");
  const db = await adminDb();
  const snap = await db.collection("blogs").get();
  return snap.docs
    .map((docSnap) => normalizeLiveBlog(docSnap.id, docSnap.data() as Record<string, unknown>))
    .sort((a, b) => publishedAtMs(b.publishedAt) - publishedAtMs(a.publishedAt));
}

const getCachedFirestoreBlogs = unstable_cache(
  fetchBlogsFromFirestore,
  ["live-blogs"],
  { revalidate: BLOG_REVALIDATE_SECONDS },
);

export async function getLiveBlogs(): Promise<BlogPost[]> {
  if (
    !process.env.FIREBASE_PROJECT_ID?.trim() ||
    !process.env.FIREBASE_CLIENT_EMAIL?.trim() ||
    !process.env.FIREBASE_PRIVATE_KEY?.trim()
  ) {
    return bakedBlogs;
  }
  try {
    return await getCachedFirestoreBlogs();
  } catch (err) {
    console.error("[live-blogs] Firestore read failed, using baked content.json:", err);
    return bakedBlogs;
  }
}

export function isListedBlog(post: BlogPost): boolean {
  return post.status === "published" && !post.hidden;
}

export async function getListedLiveBlogs(): Promise<BlogPost[]> {
  return (await getLiveBlogs()).filter(isListedBlog);
}

export async function getLiveBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getLiveBlogs();
  return posts.find((post) => post.slug === slug && post.status === "published");
}
