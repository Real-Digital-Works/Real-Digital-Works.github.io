import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/content";

const buildLinks = [
  { href: "/services/web-design", label: "Web design" },
  { href: "/services/ecommerce", label: "Ecommerce" },
  { href: "/services/web-applications", label: "Web applications" },
  { href: "/services/landing-pages", label: "Landing pages" },
];
const growLinks = [
  { href: "/services/seo", label: "SEO" },
  { href: "/services/google-ads", label: "Google Ads" },
  { href: "/services/social-media", label: "Social media" },
  { href: "/services/email-marketing", label: "Email marketing" },
];
const createLinks = [
  { href: "/services/branding", label: "Branding" },
  { href: "/services/3d-animation", label: "3D & animation" },
  { href: "/services/photography", label: "Photography" },
  { href: "/services/copywriting", label: "Copywriting" },
];
const supportLinks = [
  { href: "/services/hosting", label: "Hosting & care" },
  { href: "/services/training", label: "Training" },
  { href: "/services/ai-automation", label: "AI & automation" },
  { href: "/services/consultancy", label: "Consultancy" },
];

export function Footer() {
  return (
    <footer className="bg-void text-[15px] text-fg/62">
      <div className="wrap py-16">

        {/* Service columns — F1 */}
        <div className="grid gap-10 border-b border-line pb-10 md:grid-cols-4">
          <div>
            <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">Build</h4>
            {buildLinks.map((l) => (
              <Link key={l.href} className="block py-1 hover:text-tech" href={l.href}>{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">Grow</h4>
            {growLinks.map((l) => (
              <Link key={l.href} className="block py-1 hover:text-tech" href={l.href}>{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">Create</h4>
            {createLinks.map((l) => (
              <Link key={l.href} className="block py-1 hover:text-tech" href={l.href}>{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-fg/45 uppercase">Support</h4>
            {supportLinks.map((l) => (
              <Link key={l.href} className="block py-1 hover:text-tech" href={l.href}>{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Logo + Company + Studio — F2 */}
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
            <Link className="block py-1 hover:text-tech" href="/about">About</Link>
            <Link className="block py-1 hover:text-tech" href="/work">Work</Link>
            <Link className="block py-1 hover:text-tech" href="/pricing">Pricing</Link>
            <Link className="block py-1 hover:text-tech" href="/contact">Contact</Link>
            <a className="block py-1 hover:text-tech" href="https://www.realanimationworks.com" target="_blank" rel="noreferrer">{site.parent}</a>
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

        {/* Bottom row — F3 */}
        <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13px] text-fg/45">
          <span>© 2026 Real Digital Works</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-tech">Privacy Policy</Link>
            <Link href="/modern-slavery" className="hover:text-tech">Modern Slavery Policy</Link>
          </div>
          <span>A {site.parent} company</span>
        </div>
      </div>
    </footer>
  );
}
