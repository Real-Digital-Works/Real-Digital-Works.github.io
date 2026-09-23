import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-void text-[15px] text-fg/62">
      <div className="wrap py-16">
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo variant="lockup" />
            <p className="mt-4 max-w-[34ch] text-fg/55">
              Websites, software, AI and motion. A Real Animation Works
              company, from the Kennington studio.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">
              Work
            </h4>
            <Link className="block py-1 hover:text-tech" href="/work">
              Case studies
            </Link>
            <Link className="block py-1 hover:text-tech" href="/services">
              Services
            </Link>
            <Link className="block py-1 hover:text-tech" href="/pricing">
              Pricing
            </Link>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">
              Company
            </h4>
            <Link className="block py-1 hover:text-tech" href="/about">
              About
            </Link>
            <Link className="block py-1 hover:text-tech" href="/contact">
              Contact
            </Link>
            <Link className="block py-1 hover:text-tech" href="/privacy">
              Privacy
            </Link>
            <a
              className="block py-1 hover:text-tech"
              href="https://www.realanimationworks.com"
              target="_blank"
              rel="noreferrer"
            >
              {site.parent}
            </a>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] text-fg uppercase">
              Studio
            </h4>
            <a className="block py-1 hover:text-tech" href={site.phoneHref}>
              {site.phone}
            </a>
            <a className="block py-1 hover:text-tech" href={site.emailHref}>
              {site.email}
            </a>
            <p className="py-2">
              {site.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 pt-6 text-[13px] text-fg/35">
          <span>© 2026 Real Digital Works · Draft for stakeholder review</span>
          <span>A {site.parent} company</span>
        </div>
      </div>
    </footer>
  );
}
