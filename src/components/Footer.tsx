import { Logo } from "./Logo";
import {
  DEFAULT_COPYRIGHT,
  DEFAULT_FOOTER_BLURB,
  DEFAULT_FOOTER_COPY,
  site,
} from "@/lib/content";
import { listedServiceRecords } from "@/lib/services-data";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";

const groups = ["Build", "Grow", "Create", "Support"] as const;
const colPath: Record<(typeof groups)[number], string> = {
  Build: "footerCopy.colBuild",
  Grow: "footerCopy.colGrow",
  Create: "footerCopy.colCreate",
  Support: "footerCopy.colSupport",
};

export function Footer() {
  const address = site.address?.length ? site.address : ["", "", ""];
  return (
    <footer className="relative z-20 bg-void text-[15px] text-fg/62">
      <div className="wrap py-16">
        <div className="grid gap-10 border-b border-line pb-10 md:grid-cols-4">
          {groups.map((group) => (
            <div key={group}>
              <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">
                <CmsText path={colPath[group]}>{group}</CmsText>
              </h4>
              {listedServiceRecords
                .filter((row) => row.category === group)
                .map((row) => ({
                  id: `footer.svc.${row.slug}`,
                  href: `/services/${row.slug}`,
                  label: row.listingTitle.trim() || row.title,
                }))
                .map((item) => (
                <CmsLink
                  key={item.id}
                  ctaId={item.id}
                  href={item.href}
                  className="block py-1 hover:text-tech"
                >
                  {item.label}
                </CmsLink>
              ))}
            </div>
          ))}
        </div>

        <div className="grid gap-10 border-b border-line py-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <CmsLink ctaId="footer.logo" href="/" className="inline-flex" preserveChildren>
              <Logo variant="lockup" />
            </CmsLink>
            <CmsText path="site.footerBlurb" as="p" className="mt-4 max-w-[34ch] text-fg/55">
              {site.footerBlurb || DEFAULT_FOOTER_BLURB}
            </CmsText>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">
              <CmsText path="footerCopy.colCompany">{DEFAULT_FOOTER_COPY.colCompany}</CmsText>
            </h4>
            <CmsLink ctaId="footer.about" href="/about" className="block py-1 hover:text-tech">About</CmsLink>
            <CmsLink ctaId="footer.work" href="/work" className="block py-1 hover:text-tech">Work</CmsLink>
            <CmsLink ctaId="footer.pricing" href="/pricing" className="block py-1 hover:text-tech">Pricing</CmsLink>
            <CmsLink ctaId="footer.contact" href="/contact" className="block py-1 hover:text-tech">Contact</CmsLink>
            <CmsLink ctaId="footer.privacy" href="/privacy" className="block py-1 hover:text-tech">Privacy Policy</CmsLink>
            <CmsLink ctaId="footer.terms" href="/terms" className="block py-1 hover:text-tech">Terms</CmsLink>
            <CmsLink ctaId="footer.modernSlavery" href="/modern-slavery" className="block py-1 hover:text-tech">
              Modern Slavery Policy
            </CmsLink>
            <CmsLink
              ctaId="footer.parent"
              href="https://www.realanimationworks.com"
              className="block py-1 hover:text-tech"
              target="_blank"
            >
              {site.parent}
            </CmsLink>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">
              <CmsText path="footerCopy.colStudio">{DEFAULT_FOOTER_COPY.colStudio}</CmsText>
            </h4>
            <CmsLink ctaId="footer.phone" href={site.phoneHref} className="block py-1 hover:text-tech">
              {site.phone}
            </CmsLink>
            <CmsLink ctaId="footer.email" href={site.emailHref} className="block py-1 hover:text-tech">
              {site.email}
            </CmsLink>
            <p className="py-2">
              {address.map((line, i) => (
                <CmsText
                  key={`address-${i}`}
                  path={`site.address.${i}`}
                  as="span"
                  className="block"
                >
                  {line}
                </CmsText>
              ))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13px] text-fg/55">
          <CmsText path="site.copyright" as="span">
            {site.copyright || DEFAULT_COPYRIGHT}
          </CmsText>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <CmsLink ctaId="footer.privacy" href="/privacy" className="text-fg/80 underline-offset-4 hover:text-tech hover:underline">
              Privacy Policy
            </CmsLink>
            <CmsLink ctaId="footer.terms" href="/terms" className="text-fg/80 underline-offset-4 hover:text-tech hover:underline">
              Terms
            </CmsLink>
            <CmsLink ctaId="footer.modernSlavery" href="/modern-slavery" className="text-fg/80 underline-offset-4 hover:text-tech hover:underline">
              Modern Slavery Policy
            </CmsLink>
          </nav>
          <span>
            A{" "}
            <CmsText path="site.parent">{site.parent}</CmsText>
            {" "}company
          </span>
        </div>
      </div>
    </footer>
  );
}
