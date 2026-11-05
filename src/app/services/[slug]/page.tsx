import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/content";
import { brandedTitle, serviceHeading, shareTitle } from "@/lib/seo";
import {
  servicePages,
  getServiceBySlug,
  servicePricingNote,
} from "@/lib/services-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    return { title: brandedTitle("Page not found"), robots: { index: false, follow: false } };
  }
  return {
    title: brandedTitle(service.seoTitle),
    description: service.seoDescription,
    keywords: service.keywords?.length ? service.keywords : undefined,
    alternates: { canonical: `/services/${slug}` },
    ...shareTitle(service.seoTitle, service.seoDescription, {
      url: `/services/${slug}`,
    }),
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = servicePages.filter((s) => service.relatedSlugs.includes(s.slug));
  const heading = serviceHeading(service.seoTitle, service.title);
  const base = site.url.replace(/\/$/, "");
  const pageUrl = `${base}/services/${slug}`;
  const quoteHref = `/contact?service=${encodeURIComponent(slug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: heading,
        description: service.seoDescription,
        url: pageUrl,
        provider: {
          "@type": "ProfessionalService",
          name: site.name,
          url: base,
        },
        areaServed: [
          { "@type": "City", name: "London" },
          { "@type": "Country", name: "United Kingdom" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: `${base}/services` },
          { "@type": "ListItem", position: 3, name: heading, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <section className="border-b border-line py-20 md:py-28">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            {service.category}
          </p>
          <h1 className="display mt-3 text-[clamp(42px,6vw,80px)] leading-[0.95] tracking-[-0.04em]">
            {heading}
          </h1>
          <p className="mt-6 max-w-[55ch] text-[18px] leading-relaxed text-fg/65">
            {service.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={quoteHref}
              className="inline-flex h-12 items-center rounded-full bg-beam px-7 text-[14px] font-semibold tracking-[0.06em] text-black uppercase transition hover:opacity-90"
            >
              Get a quote
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex h-12 items-center rounded-full border border-line px-7 text-[14px] font-semibold tracking-[0.06em] uppercase transition hover:border-beam/50"
            >
              Book a free call
            </a>
            <span className="font-mono text-[13px] text-fg/55">{service.from}</span>
          </div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className="border-b border-line py-20">
        <div className="wrap max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            Overview
          </p>
          <h2 className="display mt-2 text-[clamp(28px,3.6vw,44px)]">
            How we approach this.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-fg/65">{service.overview}</p>
        </div>
      </section>

      {/* ── What we can help with ── */}
      <section className="border-b border-line py-20">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            What we can help with
          </p>
          <h2 className="display mt-2 text-[clamp(28px,3.6vw,44px)]">
            Six parts of the work.
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

      {/* ── Process ── */}
      <section className="border-b border-line py-20">
        <div className="wrap">
          <p className="font-mono text-[11px] tracking-[0.2em] text-tech uppercase">
            How it works
          </p>
          <h2 className="display mt-2 text-[clamp(28px,3.6vw,44px)]">
            Discover, scope, deliver, review, handover.
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {service.process.map((item, index) => (
              <li key={item.title} className="glass rounded-[20px] p-6">
                <p className="font-mono text-[11px] tracking-[0.18em] text-tech">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-fg/60">{item.description}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-[60ch] text-[14px] leading-relaxed text-fg/55">
            {servicePricingNote}
          </p>
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
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            Tell us what you need
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-[17px] text-fg/60">
            Tell us what you are trying to achieve. We will review the requirements and explain the
            most suitable next step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={quoteHref}
              className="inline-flex h-12 items-center rounded-full bg-beam px-8 text-[14px] font-semibold tracking-[0.06em] text-black uppercase transition hover:opacity-90"
            >
              Get a quote
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
