import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";

type Props = { params: Promise<{ page: string }> };

// Reserved slugs — never hit this catch-all
const RESERVED = new Set([
  "work", "services", "pricing", "about", "contact",
  "blog", "admin", "privacy", "terms", "modern-slavery", "sitemap.xml", "robots.txt",
]);

export async function generateStaticParams() {
  return pages
    .filter((p) => p.status === "published" && !RESERVED.has(p.slug))
    .map((p) => ({ page: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: slug } = await params;
  const pg = pages.find((p) => p.slug === slug && p.status === "published");
  if (!pg) {
    return { title: brandedTitle("Page not found"), robots: { index: false, follow: false } };
  }
  const title = (pg.seoTitle || pg.title).trim();
  const description = (pg.seoDescription || pg.title).trim();
  return {
    title: brandedTitle(title),
    description,
    alternates: { canonical: `/${slug}` },
    ...shareTitle(title, description, { url: `/${slug}` }),
  };
}

export default async function DynamicPage({ params }: Props) {
  const { page: slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const pg = pages.find((p) => p.slug === slug && p.status === "published");
  if (!pg) notFound();

  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <CmsText
            path={`cmsPage.${pg.slug}.title`}
            as="h1"
            className="display mt-3 max-w-[20ch] text-[clamp(36px,5.5vw,64px)]"
          >
            {pg.title}
          </CmsText>
        </div>
      </section>
      <section className="pb-24">
        <div className="wrap">
          <article className="rdw-legal-body rdw-content max-w-[72ch]">
            <CmsText path={`cmsPage.${pg.slug}.content`} html>
              {pg.content}
            </CmsText>
          </article>
          <div className="mt-16 border-t border-line pt-8">
            <CmsLink ctaId="page.contact" href="/contact" className="btn btn-ghost">Get in touch →</CmsLink>
          </div>
        </div>
      </section>
    </>
  );
}
