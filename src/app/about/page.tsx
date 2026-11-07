import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";
import { disciplines, seo, pageIntros } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.about.title),
  description: seo.about.description,
  keywords: seo.about.keywords,
  alternates: { canonical: "/about" },
  ...shareTitle(seo.about.title, seo.about.description, { url: "/about" }),
};

export default function AboutPage() {
  return (
    <>
      <section className="page-intro relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_320px_at_80%_0%,rgba(24,87,236,.22),transparent_60%)]" />
        <div className="wrap relative">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            <CmsText path="pageIntros.about.eyebrow">{pageIntros.about.eyebrow}</CmsText>
          </p>
          <CmsText
            path="pageIntros.about.headline"
            as="h1"
            className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]"
          >
            {pageIntros.about.headline}
          </CmsText>
          <CmsText
            path="pageIntros.about.sub"
            as="p"
            className="mt-4 max-w-[60ch] text-[16.5px] text-fg/58"
          >
            {pageIntros.about.sub}
          </CmsText>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-4 md:grid-cols-3">
          {disciplines.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05} className="glass rounded-3xl p-8">
              <p className="font-mono text-[11px] text-cyan">0{i + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                <CmsText path={`disciplines.${i}.title`}>{item.title}</CmsText>
              </h2>
              <CmsText path={`disciplines.${i}.body`} as="p" className="mt-3 text-fg/55" html>
                {item.body}
              </CmsText>
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
          <CmsLink ctaId="about.brief" href="/contact" className="btn btn-beam mt-8">
            Start a brief
          </CmsLink>
        </div>
      </section>
    </>
  );
}
