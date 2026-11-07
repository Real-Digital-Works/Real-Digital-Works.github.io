import type { Metadata } from "next";
import Link from "next/link";
import { CmsText } from "@/components/visual-editor/CmsText";
import { mergeWorkPage, mergeWorkSeo, projects, seo, workPage as cmsWorkPage } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const workPage = mergeWorkPage(cmsWorkPage);
const workSeo = mergeWorkSeo(seo.work);
const workProjects = projects;

export const metadata: Metadata = {
  title: brandedTitle(workSeo.title),
  description: workSeo.description,
  keywords: workSeo.keywords,
  alternates: { canonical: "/work" },
  ...shareTitle(workSeo.title, workSeo.description, { url: "/work" }),
};

export default function WorkPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            <CmsText path="workPage.eyebrow">{workPage.eyebrow}</CmsText>
          </p>
          <CmsText
            path="workPage.headline"
            as="h1"
            className="display mt-3 max-w-[16ch] whitespace-pre-line text-[clamp(36px,6vw,68px)]"
          >
            {workPage.headline}
          </CmsText>
          <CmsText
            path="workPage.sub"
            as="p"
            className="mt-4 max-w-[54ch] whitespace-pre-line text-[16.5px] text-fg/55"
          >
            {workPage.sub}
          </CmsText>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap space-y-3">
          {workProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="glass group grid overflow-hidden rounded-[22px] md:grid-cols-[240px_1fr]"
            >
              <div
                className="min-h-[140px] bg-cover bg-center"
                style={
                  project.image
                    ? { backgroundImage: `url(${project.image})` }
                    : {
                        background: `linear-gradient(145deg, ${project.accent}, #1a2230 78%)`,
                      }
                }
              />
              <div className="p-6 md:p-8">
                <p className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">
                  {project.status} · {project.kind}
                </p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] group-hover:text-tech">
                  <CmsText path={`project.${project.slug}.title`}>{project.title}</CmsText>
                </h2>
                <p className="mt-2 max-w-[54ch] text-[15px] text-fg/52">
                  <CmsText path={`project.${project.slug}.summary`}>{project.summary}</CmsText>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
