import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogs, isDirectUrlLive, site } from "@/lib/content";
import { canonicalOrigin, canonicalUrl, siteImageUrl } from "@/lib/canonical-url";
import { brandedTitle, shareTitle } from "@/lib/seo";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogs.filter((p) => p.slug && isDirectUrlLive(p)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((p) => p.slug === slug && isDirectUrlLive(p));
  if (!post) {
    return { title: brandedTitle("Post not found"), robots: { index: false, follow: false } };
  }
  const title = (post.seoTitle || post.title).trim();
  const description = (post.seoDescription || post.excerpt || post.title).trim();
  return {
    title: brandedTitle(title),
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...shareTitle(title, description, {
      type: "article",
      publishedTime: post.publishedAt,
      url: `/blog/${slug}`,
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogs.find((p) => p.slug === slug && isDirectUrlLive(p));
  if (!post) notFound();

  const origin = canonicalOrigin();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: siteImageUrl(),
    datePublished: post.publishedAt,
    mainEntityOfPage: canonicalUrl(`/blog/${slug}`),
    author: { "@type": "Organization", name: site.name, url: origin },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: origin,
      logo: { "@type": "ImageObject", url: siteImageUrl() },
    },
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
          <CmsText
            path={`blogPost.${post.slug}.title`}
            as="h1"
            className="display mt-4 max-w-[22ch] text-[clamp(32px,5vw,60px)]"
          >
            {post.title}
          </CmsText>
          {post.excerpt ? (
            <CmsText
              path={`blogPost.${post.slug}.excerpt`}
              as="p"
              className="mt-4 max-w-[58ch] text-[16.5px] text-fg/60"
            >
              {post.excerpt}
            </CmsText>
          ) : null}
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
          <article className="rdw-legal-body rdw-content max-w-[72ch]">
            <CmsText path={`blogPost.${post.slug}.content`} html>
              {post.content}
            </CmsText>
          </article>
          <div className="mt-16 border-t border-line pt-10">
            <CmsLink ctaId="blog.brief" href="/contact" className="btn btn-beam">Start a brief</CmsLink>
            <CmsLink ctaId="blog.more" href="/blog" className="btn btn-ghost ml-4">More posts</CmsLink>
          </div>
        </div>
      </section>
    </>
  );
}
