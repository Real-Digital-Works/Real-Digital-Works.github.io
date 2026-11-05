import type { Metadata } from "next";
import Link from "next/link";
import { brandedTitle, shareTitle } from "@/lib/seo";

const title = "Page not found";
const description = "That page is not on Real Digital Works. Head home or get in touch.";

export const metadata: Metadata = {
  title: brandedTitle(title),
  description,
  robots: { index: false, follow: false },
  ...shareTitle(title, description, { url: "/" }),
};

export default function NotFound() {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">404</span>
        <h1 className="display mt-4 text-[clamp(36px,5vw,56px)]">Page not found</h1>
        <p className="mt-6 text-mid">
          That address is not on this site. Try the homepage, or send a brief if you
          were looking for a piece of work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-beam">
            Home
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
