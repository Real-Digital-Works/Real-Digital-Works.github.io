import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { site, seo } from "@/lib/content";

export const metadata: Metadata = {
  title: seo.contact.title,
  description: seo.contact.description,
  keywords: seo.contact.keywords,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: seo.contact.title,
    description: seo.contact.description,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">Contact</span>
          <h1 className="display mt-3 max-w-[14ch] text-[clamp(36px,5.5vw,64px)]">
            Tell us what is not working.
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-fg/62">
            One working day for a reply. If we are not right for the job we
            will say so. The form opens an email to the studio.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <Suspense fallback={<p className="text-mid">Loading form…</p>}>
            <ContactForm />
          </Suspense>
          <aside className="glass h-fit rounded-[22px] p-8">
            <dl className="space-y-5">
              <div>
                <dt className="text-[13.5px] text-fg/50">Call</dt>
                <dd className="mt-1 text-lg font-medium">
                  <a href={site.phoneHref}>{site.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">WhatsApp</dt>
                <dd className="mt-1 text-lg font-medium">
                  <a href={site.whatsappHref}>{site.whatsapp}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Email</dt>
                <dd className="mt-1 text-lg font-medium">
                  <a href={site.emailHref}>{site.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Studio</dt>
                <dd className="mt-1 text-lg font-medium">
                  {site.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Hours</dt>
                <dd className="mt-1 text-lg font-medium">{site.hours}</dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Parent company</dt>
                <dd className="mt-1 text-lg font-medium">{site.parent}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
