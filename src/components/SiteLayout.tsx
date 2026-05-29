import { ReactNode, useEffect } from "react";
import { LogisticsTicker } from "./LogisticsTicker";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFab } from "./WhatsAppFab";
import { Toaster } from "@/components/ui/sonner";
import { clearLegacyAuthKeys, migrateLegacyQuotes } from "@/lib/leads";

export function SiteLayout({ children }: { children: ReactNode }) {
  // One-time bootstrap: drop stale customer-auth keys and migrate legacy
  // get-quote submissions into the unified Lead store.
  useEffect(() => {
    clearLegacyAuthKeys();
    migrateLegacyQuotes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col page-fade-in">
      <LogisticsTicker />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFab />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-navy text-navy-foreground border-b border-white/10">
      <div className="container mx-auto px-4 py-14 md:py-20">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl md:text-5xl font-bold max-w-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-white/70 max-w-2xl text-base md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
