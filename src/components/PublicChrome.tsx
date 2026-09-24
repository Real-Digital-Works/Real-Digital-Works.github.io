"use client";
import { usePathname } from "next/navigation";
import { CommandK } from "@/components/CommandK";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StudioChat } from "@/components/StudioChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ReactNode } from "react";

/**
 * Renders the public site chrome (Header, Footer, StudioChat, etc.)
 * only on non-admin routes. Admin pages get a clean shell.
 */
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <CommandK />
      <ThemeToggle />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <StudioChat variant="dock" />
    </>
  );
}
