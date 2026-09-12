import type { Metadata } from "next";
import Link from "next/link";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { packages } from "@/lib/site";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">Pricing</span>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]">
            Know the number before you call.
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-white/62">
            Tick what you need. The estimate updates as you go. Starting ranges
            for review, not a contract.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap">
          <QuoteBuilder />
          <div className="mt-20">
            <span className="tag">Packages</span>
            <h2 className="display mt-3 text-[clamp(28px,3.5vw,44px)]">
              Or start from a fixed website package.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {packages.map((tier) => (
                <article
                  key={tier.name}
                  className={`flex flex-col rounded-3xl p-8 ${
                    tier.featured
                      ? "border border-beam bg-beam/10 text-white"
                      : "glass"
                  }`}
                >
                  <h3 className="text-[21px] font-semibold">{tier.name}</h3>
                  <span
                    className={`display mt-3 text-[40px] ${
                      tier.featured ? "text-tech" : ""
                    }`}
                  >
                    {tier.amount}
                  </span>
                  <span
                    className={`mb-6 text-sm ${
                      tier.featured ? "text-white/50" : "text-faint"
                    }`}
                  >
                    {tier.per}
                  </span>
                  <ul className="mb-8 flex-1 space-y-2">
                    {tier.items.map((item) => (
                      <li
                        key={item}
                        className={`pl-5 text-[15px] ${
                          tier.featured ? "text-white/72" : "text-mid"
                        }`}
                        style={{
                          background:
                            "linear-gradient(currentColor, currentColor) 0 12px / 10px 1.5px no-repeat",
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={tier.featured ? "btn btn-light w-full" : "btn btn-ghost w-full"}
                  >
                    Enquire
                  </Link>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-[60ch] text-mid">
              Custom applications are scoped after a call — they do not fit a
              poster price. Charities and first-year startups: mention it when
              you enquire; we can usually move.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
