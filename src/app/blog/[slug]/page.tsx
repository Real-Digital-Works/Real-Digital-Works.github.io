import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs, site } from "@/lib/content";
import { brandedTitle } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogs
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((p) => p.slug === slug);
  if (!post) return { title: brandedTitle("Post not found") };
  return {
    title: brandedTitle(post.seoTitle || post.title),
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogs.find((p) => p.slug === slug && p.status === "published");
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    keywords: post.tags?.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <section className="page-intro">
        <div className="wrap">
          <Link href="/blog" className="text-sm text-tech">← All posts</Link>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <span key={tag} className="rounded-full border border-line px-3 py-1 text-sm text-fg/60">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="display mt-4 max-w-[22ch] text-[clamp(32px,5vw,60px)]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 max-w-[58ch] text-[16.5px] text-fg/60">{post.excerpt}</p>
          )}
          <p className="mt-4 text-sm text-fg/35">
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="wrap">
          <article
            className="rdw-content max-w-[72ch]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="mt-16 border-t border-line pt-10">
            <Link href="/contact" className="btn btn-beam">Start a brief</Link>
            <Link href="/blog" className="btn btn-ghost ml-4">More posts</Link>
          </div>
        </div>
      </section>
    </>
  );
}
