import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { servicePages, getServiceBySlug } from "@/lib/services-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    openGraph: { title: service.seoTitle, description: service.seoDescription },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = servicePages.filter((s) => service.relatedSlugs.includes(s.slug));

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b border-line py-20 md:py-28">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            {service.category}
          </p>
          <h1 className="display mt-3 text-[clamp(42px,6vw,80px)] leading-[0.95] tracking-[-0.04em]">
            {service.title}
          </h1>
          <p className="mt-6 max-w-[55ch] text-[18px] leading-relaxed text-fg/65">
            {service.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full bg-beam px-7 text-[14px] font-semibold tracking-[0.06em] text-black uppercase transition hover:opacity-90"
            >
              Get a quote
            </Link>
            <span className="font-mono text-[13px] text-fg/55">{service.from}</span>
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="border-b border-line py-20">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            What&apos;s included
          </p>
          <h2 className="display mt-2 text-[clamp(28px,3.6vw,44px)]">
            Everything in the price.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.whatsIncluded.map((item) => (
              <div key={item.title} className="glass rounded-[20px] p-7">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-line py-20">
        <div className="wrap max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">FAQ</p>
          <h2 className="display mt-2 text-[clamp(28px,3.6vw,44px)]">
            Common questions.
          </h2>
          <div className="mt-10 divide-y divide-line">
            {service.faq.map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="text-[16px] font-semibold tracking-[-0.015em]">{item.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg/60">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related services ── */}
      {related.length > 0 && (
        <section className="border-b border-line py-20">
          <div className="wrap">
            <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
              Related services
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="glass flex flex-col gap-3 rounded-[18px] p-6 transition hover:border-beam/40"
                >
                  <p className="font-mono text-[10px] tracking-[0.18em] text-tech uppercase">
                    {s.category}
                  </p>
                  <h3 className="text-[16px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <p className="text-[13px] font-mono text-cyan">{s.from}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 text-center">
        <div className="wrap">
          <h2 className="display text-[clamp(32px,5vw,64px)] leading-[0.95] tracking-[-0.04em]">
            Ready to talk?
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-[17px] text-fg/60">
            Tell us what you need and we&apos;ll come back with a clear answer within one working day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full bg-beam px-8 text-[14px] font-semibold tracking-[0.06em] text-black uppercase transition hover:opacity-90"
            >
              Start a conversation
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center rounded-full border border-line px-8 text-[14px] font-semibold tracking-[0.06em] uppercase transition hover:border-beam/50"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
