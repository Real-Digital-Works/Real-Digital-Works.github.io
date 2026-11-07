import { Logo } from "./Logo";
import { site } from "@/lib/content";
import { FOOTER_SERVICE_LINKS } from "@/lib/cms-ui";
import { CmsLink } from "@/components/visual-editor/CmsLink";

const groups = ["Build", "Grow", "Create", "Support"] as const;

export function Footer() {
  return (
    <footer className="bg-void text-[15px] text-fg/62">
      <div className="wrap py-16">
        <div className="grid gap-10 border-b border-line pb-10 md:grid-cols-4">
          {groups.map((group) => (
            <div key={group}>
              <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">{group}</h4>
              {FOOTER_SERVICE_LINKS.filter((item) => item.group === group).map((item) => (
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
            <Logo variant="lockup" />
            <p className="mt-4 max-w-[34ch] text-fg/55">
              Websites, software, AI and motion. A Real Animation Works company,
              from the Kennington studio.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">Company</h4>
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
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">Studio</h4>
            <a className="block py-1 hover:text-tech" href={site.phoneHref}>{site.phone}</a>
            <a className="block py-1 hover:text-tech" href={site.emailHref}>{site.email}</a>
            <p className="py-2">
              {site.address.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13px] text-fg/55">
          <span>© 2026 Real Digital Works</span>
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
          <span>A {site.parent} company</span>
        </div>
      </div>
    </footer>
  );
}
