import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.title ?? "Work" };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <>
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
          <p className="mt-2 text-white/50">{project.client}</p>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-white/68">{project.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/70"
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
            <p className="mt-3 text-mid">{project.problem}</p>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              What we did
            </h2>
            <p className="mt-3 text-mid">{project.work}</p>
          </article>
          <article>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-beam uppercase">
              Why it is here
            </h2>
            <p className="mt-3 text-mid">{project.outcome}</p>
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
