import type { Metadata } from "next";
import { brandedTitle, shareTitle } from "@/lib/seo";
import { CmsLink } from "@/components/visual-editor/CmsLink";
import { CmsText } from "@/components/visual-editor/CmsText";
import { pageIntros } from "@/lib/content";

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
        <span className="tag">
          <CmsText path="pageIntros.notfound.eyebrow">{pageIntros.notfound.eyebrow}</CmsText>
        </span>
        <CmsText
          path="pageIntros.notfound.headline"
          as="h1"
          className="display mt-4 text-[clamp(36px,5vw,56px)]"
        >
          {pageIntros.notfound.headline}
        </CmsText>
        <CmsText path="pageIntros.notfound.sub" as="p" className="mt-6 text-mid">
          {pageIntros.notfound.sub}
        </CmsText>
        <div className="mt-8 flex flex-wrap gap-3">
          <CmsLink ctaId="notfound.home" href="/" className="btn btn-beam">
            Home
          </CmsLink>
          <CmsLink ctaId="notfound.contact" href="/contact" className="btn btn-ghost">
            Contact
          </CmsLink>
        </div>
      </div>
    </section>
  );
}
