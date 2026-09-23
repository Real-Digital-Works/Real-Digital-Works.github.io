/**
 * Admin layout — completely separate from the public site.
 * No public header, footer, or grain overlay.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin · Real Digital Works", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e2e8f0] font-sans">
      {children}
    </div>
  );
}
