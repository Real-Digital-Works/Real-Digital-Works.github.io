import { CmsText } from "@/components/visual-editor/CmsText";
import type { LegalContent, LegalPageContent } from "@/lib/content";

export function LegalDocument({
  page,
  field = "privacy",
}: {
  page: LegalPageContent;
  field?: keyof LegalContent;
}) {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">Legal</span>
        <CmsText
          path={`legal.${field}.title`}
          as="h1"
          className="display mt-4 text-[clamp(36px,5vw,56px)]"
        >
          {page.title}
        </CmsText>
        <article className="rdw-legal-body mt-6 text-mid">
          <CmsText path={`legal.${field}.body`} as="div" html>
            {page.body}
          </CmsText>
        </article>
      </div>
    </section>
  );
}
