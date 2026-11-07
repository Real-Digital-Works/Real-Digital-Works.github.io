import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { legal } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const page = legal.modernSlavery;
const metaTitle = page.seoTitle.trim() || page.title.trim() || "Modern Slavery Policy";
const metaDescription =
  page.seoDescription.trim() ||
  "Modern slavery policy for Real Digital Works, covering our Kennington studio, suppliers, and how to raise a concern.";

export const metadata: Metadata = {
  title: brandedTitle(metaTitle),
  description: metaDescription,
  alternates: { canonical: "/modern-slavery" },
  ...shareTitle(metaTitle, metaDescription, { url: "/modern-slavery" }),
};

export default function ModernSlaveryPage() {
  return <LegalDocument page={page} field="modernSlavery" />;
}
