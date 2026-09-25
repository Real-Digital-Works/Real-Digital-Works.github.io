import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";
import { seo } from "@/lib/content";
import { brandedTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.home.title),
  description: seo.home.description,
  keywords: seo.home.keywords,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeView />;
}
