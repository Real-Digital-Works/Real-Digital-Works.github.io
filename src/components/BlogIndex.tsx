"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/content";

export type BlogListPost = Pick<
  BlogPost,
  "slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "tags"
>;

function httpsCover(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function optimizeCover(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith("amazonaws.com") && parsed.pathname.startsWith("/blog/");
  } catch {
    return false;
  }
}

function formatPostDate(value: string): string {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return "";
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function uniqueTopics(posts: BlogListPost[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const label = tag.trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      ordered.push(label);
    }
  }
  return ordered.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

function CoverMedia({
  src,
  sizes,
  className,
}: {
  src?: string;
  sizes: string;
  className?: string;
}) {
  const url = httpsCover(src);
  return (
    <div className={`relative overflow-hidden bg-deep ${className ?? ""}`}>
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          unoptimized={!optimizeCover(url)}
        />
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--beam)_22%,transparent),var(--deep)_78%)]"
          aria-hidden
        />
      )}
    </div>
  );
}

function PostChips({ tags }: { tags?: string[] }) {
  const chips = (tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 2);
  if (chips.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-2">
      {chips.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium tracking-[0.04em] text-fg/70"
        >
          {tag}
        </span>
      ))}
    </p>
  );
}

export function BlogIndex({ posts }: { posts: BlogListPost[] }) {
  const topics = useMemo(() => uniqueTopics(posts), [posts]);
  const [topic, setTopic] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (!topic) return posts;
    return posts.filter((post) => (post.tags ?? []).includes(topic));
  }, [posts, topic]);

  const featured = visible.length === 1;

  return (
    <div>
      {topics.length > 0 ? (
        <div className="mb-8">
          <p className="tag">Topics</p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter posts by topic"
          >
            <button
              type="button"
              className={`min-h-10 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-medium tracking-[-0.01em] transition ${
                topic === null
                  ? "border-beam bg-beam text-white"
                  : "border-line bg-transparent text-fg/75 hover:border-tech"
              }`}
              aria-pressed={topic === null}
              onClick={() => setTopic(null)}
            >
              All
            </button>
            {topics.map((label) => {
              const pressed = topic === label;
              return (
                <button
                  key={label}
                  type="button"
                  className={`min-h-10 cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-medium tracking-[-0.01em] transition ${
                    pressed
                      ? "border-beam bg-beam text-white"
                      : "border-line bg-transparent text-fg/75 hover:border-tech"
                  }`}
                  aria-pressed={pressed}
                  onClick={() => setTopic(pressed ? null : label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div aria-live="polite" aria-atomic="true">
        {visible.length === 0 ? (
          <p className="text-[15.5px] text-fg/70">
            No posts in this topic yet.{" "}
            <button
              type="button"
              className="cursor-pointer text-tech underline-offset-2 hover:underline"
              onClick={() => setTopic(null)}
            >
              Show all posts
            </button>
          </p>
        ) : featured ? (
          <FeaturedCard post={visible[0]} />
        ) : (
          <ul className="grid list-none gap-5 p-0 md:grid-cols-2">
            {visible.map((post) => (
              <li key={post.slug}>
                <GridCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogListPost }) {
  const date = formatPostDate(post.publishedAt);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass group grid overflow-hidden rounded-[22px] md:grid-cols-[minmax(280px,44%)_1fr]"
    >
      <CoverMedia
        src={post.coverImage}
        sizes="(max-width: 768px) 100vw, 44vw"
        className="aspect-[16/9] min-h-[200px] md:aspect-auto md:min-h-full"
      />
      <div className="flex flex-col justify-center p-6 md:p-9">
        <PostChips tags={post.tags} />
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-semibold tracking-[-0.04em] text-fg transition group-hover:text-tech">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-3 max-w-[54ch] text-[15.5px] leading-relaxed text-fg/68 line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        {date ? <p className="mt-5 text-[13px] text-fg/55">{date}</p> : null}
      </div>
    </Link>
  );
}

function GridCard({ post }: { post: BlogListPost }) {
  const date = formatPostDate(post.publishedAt);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-[22px]"
    >
      <CoverMedia
        src={post.coverImage}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="aspect-[16/9]"
      />
      <div className="flex flex-1 flex-col p-6">
        <PostChips tags={post.tags} />
        <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.035em] text-fg transition group-hover:text-tech">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 text-[14.5px] leading-relaxed text-fg/65 line-clamp-2">
            {post.excerpt}
          </p>
        ) : null}
        {date ? <p className="mt-auto pt-4 text-[12.5px] text-fg/55">{date}</p> : null}
      </div>
    </Link>
  );
}
