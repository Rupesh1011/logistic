import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLeadsTab } from "@/components/admin/AdminLeadsTab";
import { AdminFreightRatesTab } from "@/components/admin/AdminFreightRatesTab";
import { AdminBranchesTab } from "@/components/admin/AdminBranchesTab";
import { AdminDeliveriesTab } from "@/components/admin/AdminDeliveriesTab";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { STORAGE_KEYS } from "@/lib/storage";
import { readLeads } from "@/lib/leads";
import {
  branches as seedBranches,
  deliveries as seedDeliveries,
  freightRates as seedRates,
  type Branch,
  type Delivery,
  type FreightRate,
} from "@/data/mock";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Trinetra Logistics" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAuthenticated, hydrated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [leadCount, setLeadCount] = useState(0);

  const { value: rates } = useServerDataset<FreightRate[]>("freight-rates", seedRates);
  const { value: branches } = useServerDataset<Branch[]>("branches", seedBranches);
  const { value: deliveries } = useServerDataset<Delivery[]>("deliveries", seedDeliveries);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
    }
  }, [hydrated, isAuthenticated, navigate]);

  // Refresh lead counter on every visit + whenever the leads store changes.
  useEffect(() => {
    const refresh = () => setLeadCount(readLeads().length);
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.leads) refresh();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  if (!hydrated || !isAuthenticated) {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Checking session…
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin Panel"
        title="Operations control center"
        subtitle="Manage rates, branch data, delivery stories, and review captured leads."
      />
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-foreground/80 mb-6">
          Edits save automatically and appear on the public site instantly. No JSON or redeploy
          needed.
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Total Leads" value={leadCount} />
          <Stat label="Freight Rates" value={rates.length} />
          <Stat label="Branches" value={branches.length} />
          <Stat label="Delivery Stories" value={deliveries.length} />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4 mr-1" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="rates">Freight Rates</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="stories">Delivery Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <AdminLeadsTab />
          </TabsContent>
          <TabsContent value="rates" className="mt-6">
            <AdminFreightRatesTab />
          </TabsContent>
          <TabsContent value="branches" className="mt-6">
            <AdminBranchesTab />
          </TabsContent>
          <TabsContent value="stories" className="mt-6">
            <AdminDeliveriesTab />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to site
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-display font-bold text-3xl text-navy">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
