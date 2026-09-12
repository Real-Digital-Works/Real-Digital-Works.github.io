import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">Legal</span>
        <h1 className="display mt-4 text-[clamp(36px,5vw,56px)]">Privacy</h1>
        <p className="mt-6 text-mid">
          This is a draft site. Enquiries submitted on this machine are stored
          in a local JSON file for demonstration and are not sent to a third
          party. When we go live we will publish a full policy covering what we
          collect, why, and how long we keep it.
        </p>
        <p className="mt-4 text-mid">
          Until then, email {site.email} or call {site.phone} if you want
          anything removed.
        </p>
      </div>
    </section>
  );
}
