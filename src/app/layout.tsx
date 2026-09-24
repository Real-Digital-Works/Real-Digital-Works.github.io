import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { PublicChrome } from "@/components/PublicChrome";
import { site, seo } from "@/lib/content";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.home.title,
    template: "%s · Real Digital Works",
  },
  description: seo.home.description,
  keywords: seo.home.keywords,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.name,
    title: seo.home.title,
    description: seo.home.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.home.title,
    description: seo.home.description,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

// ── LocalBusiness JSON-LD ──────────────────────────────────────────────────────
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  alternateName: site.parent,
  description: site.description,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  openingHours: "Mo-Sa 09:00-19:00",
  currenciesAccepted: "GBP",
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address[0] + ", " + site.address[1],
    addressLocality: "London",
    postalCode: "SW9 6DE",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.4867,
    longitude: -0.1085,
  },
  areaServed: [
    { "@type": "City", name: "London" },
    { "@type": "Country", name: "United Kingdom" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website Design & Development", description: "Brochure, booking and e-commerce sites from £1,450" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Software & Applications", description: "Client portals, internal tools, cloud applications" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI & Automation", description: "Enquiry bots, workflow automation from £900" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO & Search", description: "Technical SEO and content strategy from £550/month" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "3D, Video & Motion", description: "Product renders, explainers and animation from £450" } },
    ],
  },
  sameAs: [
    "https://www.realanimationworks.com",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Flash-free theme init — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("rdw-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
        {/* LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        className="flex min-h-full flex-col bg-void font-sans text-fg"
        suppressHydrationWarning
      >
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
