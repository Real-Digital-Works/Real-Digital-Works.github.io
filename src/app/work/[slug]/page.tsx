import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, site } from "@/lib/content";
import { RichContent } from "@/components/RichContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return { title: "Work" };
  return {
    title: `${project.title} — ${project.kind}`,
    description: project.summary,
    keywords: [...project.tags, "web design London", "digital agency London"],
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: `${project.title} — ${project.kind} · Real Digital Works`,
      description: project.summary,
      url: `/work/${slug}`,
    },
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
    creator: { "@type": "Organization", name: site.name, url: site.url },
    genre: project.kind,
    dateCreated: project.year,
    keywords: project.tags.join(", "),
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
            {project.status} · {project.year} · {project.kind}
          </p>
          <h1 className="display mt-3 max-w-[14ch] text-[clamp(36px,5.5vw,64px)]">
            {project.title}
          </h1>
          <p className="mt-2 text-fg/50">{project.client}</p>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-fg/68">{project.summary}</p>
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
            <div className="mt-3 text-mid"><RichContent html={project.problem} /></div>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              What we did
            </h2>
            <div className="mt-3 text-mid"><RichContent html={project.work} /></div>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              Why it is here
            </h2>
            <div className="mt-3 text-mid"><RichContent html={project.outcome} /></div>
          </article>
        </div>
        <div className="wrap mt-16 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-beam">
            Start a similar brief
          </Link>
          <Link href="/pricing" className="btn btn-ghost">
            See pricing
          </Link>
        </div>
      </section>
    </>
  );
}
