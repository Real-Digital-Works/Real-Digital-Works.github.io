import type { Metadata } from "next";
import Link from "next/link";
import { blogs, site } from "@/lib/content";
import { brandedTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle("Blog"),
  description: `Insights, guides and studio news from ${site.name} — a London digital studio.`,
  alternates: { canonical: "/blog" },
};

const published = blogs.filter((p) => p.status === "published");

export default function BlogPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">Blog</span>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]">
            Thinking out loud.
          </h1>
          <p className="mt-4 max-w-[54ch] text-[16.5px] text-fg/62">
            Guides, opinions and studio updates from the Kennington team.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="wrap">
          {published.length === 0 ? (
            <p className="text-fg/40">No posts yet. Check back soon.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {published.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="glass group flex flex-col rounded-[22px] p-6 transition hover:border-line"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.map((tag) => (
                      <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-fg/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-fg group-hover:text-tech transition flex-1">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-[14.5px] text-fg/52 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-[12px] text-fg/35">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
