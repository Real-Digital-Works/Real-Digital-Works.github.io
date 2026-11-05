import type { Metadata } from "next";
import { AdminThemeProvider, AdminThemeToggle } from "@/components/AdminTheme";
import "../admin/admin.css";

export const metadata: Metadata = {
  title: { absolute: "Account · Real Digital Works" },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <div className="relative">
        <div className="absolute right-4 top-4 z-10 w-36">
          <AdminThemeToggle compact />
        </div>
        {children}
      </div>
    </AdminThemeProvider>
  );
}
