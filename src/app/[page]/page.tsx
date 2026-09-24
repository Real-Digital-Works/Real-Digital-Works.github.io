import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pages } from "@/lib/content";

type Props = { params: Promise<{ page: string }> };

// Reserved slugs — never hit this catch-all
const RESERVED = new Set([
  "work", "services", "pricing", "about", "contact",
  "blog", "admin", "privacy", "sitemap.xml", "robots.txt",
]);

export async function generateStaticParams() {
  return pages
    .filter((p) => p.status === "published" && !RESERVED.has(p.slug))
    .map((p) => ({ page: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: slug } = await params;
  const pg = pages.find((p) => p.slug === slug && p.status === "published");
  if (!pg) return { title: "Page not found" };
  return {
    title: pg.seoTitle || pg.title,
    description: pg.seoDescription,
    alternates: { canonical: `/${slug}` },
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
          <h1 className="display mt-3 max-w-[20ch] text-[clamp(36px,5.5vw,64px)]">
            {pg.title}
          </h1>
        </div>
      </section>
      <section className="pb-24">
        <div className="wrap">
          <article
            className="rdw-content max-w-[72ch]"
            dangerouslySetInnerHTML={{ __html: pg.content }}
          />
          <div className="mt-16 border-t border-line pt-8">
            <Link href="/contact" className="btn btn-ghost">Get in touch →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
