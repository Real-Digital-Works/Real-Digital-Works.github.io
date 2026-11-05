import type { Metadata } from "next";
import { site } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const privacyTitle = "Privacy policy";
const privacyDescription =
  "How Real Digital Works uses enquiry details you send us, and how to ask for a copy or deletion.";

export const metadata: Metadata = {
  title: brandedTitle(privacyTitle),
  description: privacyDescription,
  alternates: { canonical: "/privacy" },
  ...shareTitle(privacyTitle, privacyDescription, { url: "/privacy" }),
};

export default function PrivacyPage() {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">Legal</span>
        <h1 className="display mt-4 text-[clamp(36px,5vw,56px)]">Privacy</h1>
        <p className="mt-6 text-mid">
          Real Digital Works collects the name, contact details and message you submit
          on this website so we can reply to your enquiry. We do not sell that
          information, and we do not use it for advertising lists.
        </p>
        <p className="mt-4 text-mid">
          Enquiries are stored so the studio can follow up. If you want a copy of
          what we hold, or you want it deleted, email {site.email} or call{" "}
          {site.phone}.
        </p>
        <p className="mt-4 text-mid">
          A fuller policy covering cookies, analytics and retention periods will
          replace this notice. Until then, treat the paragraph above as the
          current practice.
        </p>
      </div>
    </section>
  );
}
