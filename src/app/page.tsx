import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";
import { seo } from "@/lib/content";
import { brandedTitle, shareTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle(seo.home.title),
  description: seo.home.description,
  keywords: seo.home.keywords,
  alternates: { canonical: "/" },
  ...shareTitle(seo.home.title, seo.home.description, { url: "/" }),
};

export default function HomePage() {
  return <HomeView />;
}
