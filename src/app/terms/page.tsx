import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { legal } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

const page = legal.terms;
const metaTitle = page.seoTitle.trim() || page.title.trim() || "Terms of use";
const metaDescription =
  page.seoDescription.trim() ||
  "How to use the Real Digital Works website, and how to get a written agreement for project work.";

export const metadata: Metadata = {
  title: brandedTitle(metaTitle),
  description: metaDescription,
  alternates: { canonical: "/terms" },
  ...shareTitle(metaTitle, metaDescription, { url: "/terms" }),
};

export default function TermsPage() {
  return <LegalDocument page={page} field="terms" />;
}
