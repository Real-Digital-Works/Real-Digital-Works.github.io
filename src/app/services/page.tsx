import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { services } from "@/lib/site";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <span className="tag on-dark">Services</span>
          <h1 className="display mt-3 max-w-[16ch] text-[clamp(36px,5.5vw,64px)]">
            Everything, or just the bit you are missing.
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16.5px] text-white/62">
            Take one service or the lot. Most clients start with a website and
            add software, search or motion as they grow.
          </p>
        </div>
      </section>
      <section className="pb-20">
        <div className="wrap grid gap-4">
          {services.map((service, i) => (
            <Reveal
              key={service.id}
              delay={i * 0.04}
              className="grid gap-6 glass rounded-3xl p-8 md:grid-cols-[0.9fr_1.4fr_auto] md:items-start"
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  {service.title}
                </h2>
                <p className="mt-2 font-semibold text-beam">{service.from}</p>
              </div>
              <div>
                <p className="text-white/58">{service.summary}</p>
                <p className="mt-3 text-[15px] text-white/40">{service.detail}</p>
              </div>
              <Link href="/contact" className="btn btn-ghost w-fit">
                Enquire
              </Link>
            </Reveal>
          ))}
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
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[14.5px]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
