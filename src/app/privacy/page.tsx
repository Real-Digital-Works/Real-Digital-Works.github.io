import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { legal } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const page = legal.privacy;
const metaTitle = page.seoTitle.trim() || page.title.trim() || "Privacy policy";
const metaDescription =
  page.seoDescription.trim() ||
  "How Real Digital Works uses enquiry details you send us, and how to ask for a copy or deletion.";

export const metadata: Metadata = {
  title: brandedTitle(metaTitle),
  description: metaDescription,
  alternates: { canonical: "/privacy" },
  ...shareTitle(metaTitle, metaDescription, { url: "/privacy" }),
};

export default function PrivacyPage() {
  return <LegalDocument page={page} field="privacy" />;
}
