import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CmsText } from "@/components/visual-editor/CmsText";
import { seo, faq } from "@/lib/content";
import { canonicalUrl } from "@/lib/canonical-url";
import { cmsServiceRecords } from "@/lib/services-data";
import { brandedTitle, shareTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.services.title),
  description: seo.services.description,
  keywords: seo.services.keywords,
  alternates: { canonical: "/services" },
  ...shareTitle(seo.services.title, seo.services.description, { url: "/services" }),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Real Digital Works Services",
  itemListElement: cmsServiceRecords.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.listingTitle.trim() || s.title,
      url: canonicalUrl(`/services/${s.slug}`),
      description: s.summary || s.intro,
    },
  })),
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">Services</span>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]">
            Everything, or just the bit you are missing.
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-fg/62">
            Take one service or the lot. Most clients start with a website and
            add software, search or motion as they grow.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-4">
          {cmsServiceRecords.length === 0 ? (
            <p className="text-[16px] text-fg/55">No services published yet.</p>
          ) : (
            cmsServiceRecords.map((service, i) => (
              <Reveal
                key={service.slug}
                delay={i * 0.04}
                className="grid gap-6 glass rounded-3xl p-8 md:grid-cols-[0.9fr_1.4fr_auto] md:items-start"
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                    <CmsText path={`svc.${service.slug}.listingTitle`}>
                      {service.listingTitle.trim() || service.title}
                    </CmsText>
                  </h2>
                  <p className="mt-2 font-semibold text-beam">
                    <CmsText path={`svc.${service.slug}.from`}>{service.from}</CmsText>
                  </p>
                </div>
                <div>
                  <p className="text-fg/58">
                    <CmsText path={`svc.${service.slug}.summary`}>
                      {service.summary || service.intro}
                    </CmsText>
                  </p>
                  {service.detail ? (
                    <CmsText
                      path={`svc.${service.slug}.detail`}
                      as="div"
                      className="mt-3 text-[15px] text-fg/60"
                      html
                    >
                      {service.detail}
                    </CmsText>
                  ) : null}
                </div>
                <Link
                  href={`/services/${service.slug}`}
                  className="btn btn-ghost w-fit"
                >
                  View service
                </Link>
              </Reveal>
            ))
          )}
        </div>
        <div className="wrap mt-16">
          <span className="tag">Included as standard</span>
          <h2 className="display mt-3 text-[clamp(28px,3.5vw,44px)]">
            Things other agencies charge extra for.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              "Accessibility pass",
              "Speed optimisation",
              "Analytics setup",
              "SSL and security headers",
              "Mobile-first build",
              "Handover training",
              "Source files and full ownership",
              "30 days post-launch support",
              "QA inside the team",
              "GDPR-minded forms",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-line bg-fg/5 px-4 py-2 text-[14.5px]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="wrap mt-20">
          <span className="tag">Questions</span>
          <h2 className="display mt-3 text-[clamp(28px,3.5vw,44px)]">Common questions</h2>
          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {faq.slice(0, 4).map((item, i) => (
              <div key={item.q} className="glass rounded-2xl p-6">
                <dt className="font-semibold text-fg">
                  <CmsText path={`faq.${i}.q`}>{item.q}</CmsText>
                </dt>
                <dd className="mt-2 text-[15px] text-fg/55">
                  <CmsText path={`faq.${i}.a`} html>
                    {item.a}
                  </CmsText>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
