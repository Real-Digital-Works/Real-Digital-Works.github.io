import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { site, seo } from "@/lib/content";
import { brandedTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.contact.title),
  description: seo.contact.description,
  keywords: seo.contact.keywords,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: seo.contact.title,
    description: seo.contact.description,
    url: "/contact",
  },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function quotePrefill(params: Record<string, string | string[] | undefined>) {
  const estimate = first(params.estimate);
  const need = first(params.need);
  const size = first(params.size);
  const speed = first(params.speed);
  if (!estimate && !need) return "";
  return [
    need ? `Quote builder: ${need}` : null,
    size ? `Size: ${size}` : null,
    speed ? `Timing: ${speed}` : null,
    estimate ? `Estimate shown: ${estimate}` : null,
  ]
    .filter(Boolean)
    .join(". ");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialMessage = quotePrefill(params);

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
            will say so. The form goes to the studio.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm initialMessage={initialMessage} />
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
