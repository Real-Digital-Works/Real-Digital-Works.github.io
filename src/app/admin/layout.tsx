/**
 * Admin layout — completely separate from the public site.
 * No public header, footer, or grain overlay.
 */
import type { Metadata } from "next";
import { AdminThemeProvider } from "@/components/AdminTheme";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin · Real Digital Works", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
