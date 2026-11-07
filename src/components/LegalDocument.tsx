import { RichContent } from "@/components/RichContent";
import type { LegalPageContent } from "@/lib/content";

export function LegalDocument({ page }: { page: LegalPageContent }) {
  return (
    <section className="py-24">
      <div className="wrap max-w-[68ch]">
        <span className="tag">Legal</span>
        <h1 className="display mt-4 text-[clamp(36px,5vw,56px)]">{page.title}</h1>
        <RichContent html={page.body} className="mt-6 text-mid" />
      </div>
    </section>
  );
}
