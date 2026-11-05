import type { Metadata } from "next";
import { site } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const policyTitle = "Modern Slavery Policy";
const policyDescription =
  "Modern slavery policy for Real Digital Works, covering our Kennington studio, suppliers, and how to raise a concern. Full policy forthcoming.";

export const metadata: Metadata = {
  title: brandedTitle(policyTitle),
  description: policyDescription,
  alternates: { canonical: "/modern-slavery" },
  ...shareTitle(policyTitle, policyDescription, { url: "/modern-slavery" }),
};

export default function ModernSlaveryPage() {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">Legal</span>
        <h1 className="display mt-4 text-[clamp(36px,5vw,56px)]">Modern Slavery Policy</h1>
        <p className="mt-6 text-mid">Policy forthcoming.</p>
        <p className="mt-4 text-mid">
          Real Digital Works, {site.address.join(", ")}.
        </p>
        <p className="mt-4 text-mid">
          Until the full policy is published, email {site.email} or call {site.phone}.
        </p>
      </div>
    </section>
  );
}
