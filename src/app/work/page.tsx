import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/site";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            Work
          </p>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,6vw,68px)]">
            Proof before claims.
          </h1>
          <p className="mt-4 max-w-[54ch] text-[16.5px] text-white/55">
            One live sample. Two product shapes labelled honestly until a paid
            case replaces them.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap space-y-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="glass group grid overflow-hidden rounded-[22px] md:grid-cols-[240px_1fr]"
            >
              <div
                className="min-h-[140px]"
                style={{
                  background: `linear-gradient(145deg, ${project.accent}, #1a2230 78%)`,
                }}
              />
              <div className="p-6 md:p-8">
                <p className="font-mono text-[11px] tracking-[0.16em] text-cyan uppercase">
                  {project.status} · {project.kind}
                </p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] group-hover:text-tech">
                  {project.title}
                </h2>
                <p className="mt-2 max-w-[54ch] text-[15px] text-white/52">
                  {project.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
