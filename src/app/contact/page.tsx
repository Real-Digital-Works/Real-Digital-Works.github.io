import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";
import { site, seo, pageIntros } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.contact.title),
  description: seo.contact.description,
  keywords: seo.contact.keywords,
  alternates: { canonical: "/contact" },
  ...shareTitle(seo.contact.title, seo.contact.description, { url: "/contact" }),
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
  const initialService = first(params.service)?.trim() ?? "";

  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">
            <CmsText path="pageIntros.contact.eyebrow">{pageIntros.contact.eyebrow}</CmsText>
          </span>
          <CmsText
            path="pageIntros.contact.headline"
            as="h1"
            className="display mt-3 max-w-[14ch] text-[clamp(36px,5.5vw,64px)]"
          >
            {pageIntros.contact.headline}
          </CmsText>
          <CmsText
            path="pageIntros.contact.sub"
            as="p"
            className="mt-4 max-w-[58ch] text-[16.5px] text-fg/62"
          >
            {pageIntros.contact.sub}
          </CmsText>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm initialMessage={initialMessage} initialService={initialService} />
          <aside className="glass h-fit rounded-[22px] p-8">
            <dl className="space-y-5">
              <div>
                <dt className="text-[13.5px] text-fg/50">Call</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CmsLink ctaId="footer.phone" href={site.phoneHref}>
                    {site.phone}
                  </CmsLink>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">WhatsApp</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CmsLink ctaId="contact.whatsapp" href={site.whatsappHref}>
                    {site.whatsapp}
                  </CmsLink>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Email</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CmsLink ctaId="footer.email" href={site.emailHref}>
                    {site.email}
                  </CmsLink>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Studio</dt>
                <dd className="mt-1 text-lg font-medium">
                  {site.address.map((line, i) => (
                    <CmsText key={`address-${i}`} path={`site.address.${i}`} as="span" className="block">
                      {line}
                    </CmsText>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Hours</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CmsText path="site.hours">{site.hours}</CmsText>
                </dd>
              </div>
              <div>
                <dt className="text-[13.5px] text-fg/50">Parent company</dt>
                <dd className="mt-1 text-lg font-medium">
                  <CmsText path="site.parent">{site.parent}</CmsText>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
