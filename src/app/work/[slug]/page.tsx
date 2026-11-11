import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectMetaLine, projects, site } from "@/lib/content";
import { canonicalOrigin, canonicalUrl, siteImageUrl } from "@/lib/canonical-url";
import { brandedTitle, shareTitle } from "@/lib/seo";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) {
    return { title: brandedTitle("Work not found"), robots: { index: false, follow: false } };
  }
  const title = `${project.title} — ${project.kind}`;
  return {
    title: brandedTitle(title),
    description: project.summary,
    keywords: [...project.tags, "web design London", "digital agency London"],
    alternates: { canonical: `/work/${slug}` },
    ...shareTitle(title, project.summary, { url: `/work/${slug}` }),
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: canonicalUrl(`/work/${slug}`),
    image: project.image ? project.image : siteImageUrl(),
    creator: { "@type": "Organization", name: site.name, url: canonicalOrigin() },
    genre: project.kind,
    ...(project.year ? { dateCreated: project.year } : {}),
    keywords: project.tags.join(", "),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <section className="page-intro">
        <div className="wrap">
          <Link href="/work" className="text-sm text-tech">
            ← All work
          </Link>
          <p className="mt-5 font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">
            {projectMetaLine(project)}
          </p>
          <CmsText
            path={`project.${slug}.title`}
            as="h1"
            className="display mt-3 max-w-[14ch] text-[clamp(36px,5.5vw,64px)]"
          >
            {project.title}
          </CmsText>
          <p className="mt-2 text-fg/50">
            <CmsText path={`project.${slug}.client`}>{project.client}</CmsText>
          </p>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-fg/68">
            <CmsText path={`project.${slug}.summary`}>{project.summary}</CmsText>
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 text-sm text-fg/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="wrap grid gap-12 md:grid-cols-3">
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              Problem
            </h2>
            <CmsText path={`project.${slug}.problem`} as="div" className="mt-3 text-mid" html>
              {project.problem}
            </CmsText>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              What we did
            </h2>
            <CmsText path={`project.${slug}.work`} as="div" className="mt-3 text-mid" html>
              {project.work}
            </CmsText>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              Why it is here
            </h2>
            <CmsText path={`project.${slug}.outcome`} as="div" className="mt-3 text-mid" html>
              {project.outcome}
            </CmsText>
          </article>
        </div>
        <div className="wrap mt-16 flex flex-wrap gap-3">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Visit site
            </a>
          ) : null}
          <CmsLink ctaId="work.brief" href="/contact" className="btn btn-beam">
            Start a similar brief
          </CmsLink>
          <CmsLink ctaId="work.pricing" href="/pricing" className="btn btn-ghost">
            See pricing
          </CmsLink>
        </div>
      </section>
    </>
  );
}
