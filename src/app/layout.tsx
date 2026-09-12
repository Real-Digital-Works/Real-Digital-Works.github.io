import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { CommandK } from "@/components/CommandK";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StudioChat } from "@/components/StudioChat";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Real Digital Works",
    template: "%s · Real Digital Works",
  },
  description:
    "Websites, custom software, AI, SEO and motion from a London studio. A Real Animation Works company.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body
        className="flex min-h-full flex-col bg-void font-sans text-white"
        suppressHydrationWarning
      >
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <CommandK />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StudioChat variant="dock" />
      </body>
    </html>
  );
}
