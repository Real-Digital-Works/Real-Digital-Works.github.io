import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { RichContent } from "@/components/RichContent";
import { disciplines, seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo.about.title,
  description: seo.about.description,
  keywords: seo.about.keywords,
  alternates: { canonical: "/about" },
  openGraph: {
    title: seo.about.title,
    description: seo.about.description,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-intro relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_320px_at_80%_0%,rgba(24,87,236,.22),transparent_60%)]" />
        <div className="wrap relative">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            Studio
          </p>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]">
            A motion house that learned to ship software.
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16.5px] text-fg/58">
            Real Digital Works is the build arm of Real Animation Works — the
            Kennington studio that has taught animation, CAD and visualisation
            since 2009. Same address. A new product: websites, AI desks,
            applications.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-4 md:grid-cols-3">
          {disciplines.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05} className="glass rounded-3xl p-8">
              <p className="font-mono text-[11px] text-cyan">0{i + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {item.title}
              </h2>
              <p className="mt-3 text-fg/55"><RichContent html={item.body} /></p>
            </Reveal>
          ))}
        </div>
        <div className="wrap mt-16 max-w-[68ch] text-fg/55">
          <p>
            Students from the parent studio have gone on to film and games.
            Industry people also come in to train. We do not put individual
            names or film credits on this site until the founding team wants
            them public.
          </p>
          <Link href="/contact" className="btn btn-beam mt-8">
            Start a brief
          </Link>
        </div>
      </section>
    </>
  );
}
