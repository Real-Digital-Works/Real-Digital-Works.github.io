import type { Metadata } from "next";
import { CmsText } from "@/components/visual-editor/CmsText";
import { BlogIndex } from "@/components/BlogIndex";
import { site, pageIntros } from "@/lib/content";
import { getListedLiveBlogs } from "@/lib/live-blogs";
import { brandedTitle, shareTitle } from "@/lib/seo";

const blogDescription = `Insights, guides and studio news from ${site.name} — a London digital studio.`;

export const revalidate = 60;

export const metadata: Metadata = {
  title: brandedTitle("Blog"),
  description: blogDescription,
  alternates: { canonical: "/blog" },
  ...shareTitle("Blog", blogDescription, { url: "/blog" }),
};

export default async function BlogPage() {
  const published = await getListedLiveBlogs();
  const posts = published.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    tags: post.tags ?? [],
  }));

  return (
    <>
      <section className="page-intro">
        <div className="wrap md:pl-[88px]">
          <span className="tag on-dark">
            <CmsText path="pageIntros.blog.eyebrow">{pageIntros.blog.eyebrow}</CmsText>
          </span>
          <CmsText
            path="pageIntros.blog.headline"
            as="h1"
            className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]"
          >
            {pageIntros.blog.headline}
          </CmsText>
          <CmsText
            path="pageIntros.blog.sub"
            as="p"
            className="mt-4 max-w-[54ch] text-[16.5px] text-fg/62"
          >
            {pageIntros.blog.sub}
          </CmsText>
        </div>
      </section>

      <section className="pb-20">
        <div className="wrap md:pl-[88px]">
          {posts.length === 0 ? (
            <p className="text-fg/55">No posts yet. Check back soon.</p>
          ) : (
            <BlogIndex posts={posts} />
          )}
        </div>
      </section>
    </>
  );
}
