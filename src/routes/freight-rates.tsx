import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  freightRates as seedRates,
  branches as seedBranches,
  type Branch,
  type FreightRate,
} from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { getRevealState } from "@/lib/leads";
import { CheckCircle2, Lock, Search } from "lucide-react";

export const Route = createFileRoute("/freight-rates")({
  head: () => ({
    meta: [
      { title: "Freight Rate Dashboard — Trinetra Logistics" },
      {
        name: "description",
        content:
          "Indicative freight charges across Vapi, Pune, Bhiwandi and Raipur with diesel-impact and live updates.",
      },
    ],
  }),
  component: FreightRatesPage,
});

const trucks = ["All", "14ft Truck", "20ft Container", "32ft SXL", "32ft MXL", "Trailer 40ft"];
const loadTypes = ["All", "FTL", "PTL"];

function FreightRatesPage() {
  const { value: rates } = useServerDataset<FreightRate[]>("freight-rates", seedRates);
  const { value: branches } = useServerDataset<Branch[]>("branches", seedBranches);

  const [revealed, setRevealed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setRevealed(getRevealState());
  }, []);

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(branches.map((b) => b.city))), "Delhi"],
    [branches],
  );

  const [from, setFrom] = useState("All");
  const [to, setTo] = useState("All");
  const [truck, setTruck] = useState("All");
  const [load, setLoad] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      rates.filter(
        (r) =>
          (from === "All" || r.from === from) &&
          (to === "All" || r.to === to) &&
          (truck === "All" || r.vehicle === truck) &&
          (load === "All" || r.loadType === load) &&
          (q === "" || `${r.from} ${r.to} ${r.vehicle}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rates, from, to, truck, load, q],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Freight Rate Dashboard"
        title="Transparent freight indices for major industrial lanes"
        subtitle="Indicative road freight rates between our branches, updated regularly and adjusted for diesel movement."
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-3 md:grid-cols-5 mb-6">
          <Filter label="From Branch" value={from} onChange={setFrom} options={cities} />
          <Filter label="To Branch" value={to} onChange={setTo} options={cities} />
          <Filter label="Truck Type" value={truck} onChange={setTruck} options={trucks} />
          <Filter label="Load Type" value={load} onChange={setLoad} options={loadTypes} />
          <div className="grid gap-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
                placeholder="Vapi, Pune..."
              />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy text-navy-foreground text-left">
                <tr>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Vehicle</Th>
                  <Th>Load</Th>
                  <Th className="text-right">Rate (₹)</Th>
                  <Th>Diesel Impact</Th>
                  <Th>Last Updated</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={`${r.from}-${r.to}-${r.vehicle}-${i}`}
                    className="border-t border-border hover:bg-secondary/40"
                  >
                    <Td className="font-semibold text-navy">{r.from}</Td>
                    <Td className="font-semibold text-navy">{r.to}</Td>
                    <Masked revealed={revealed} blur>
                      {r.vehicle}
                    </Masked>
                    <Masked revealed={revealed} blur>
                      <span className="px-2 py-0.5 rounded bg-secondary text-xs font-mono">
                        {r.loadType}
                      </span>
                    </Masked>
                    <Masked revealed={revealed} className="text-right font-mono">
                      {revealed ? (
                        `₹${r.rate.toLocaleString("en-IN")}`
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-muted-foreground"
                          aria-label="Locked, submit lead form to view"
                        >
                          <Lock className="size-3" aria-hidden="true" /> ***
                        </span>
                      )}
                    </Masked>
                    <Masked revealed={revealed} className="text-accent font-mono text-xs">
                      {revealed ? (
                        r.dieselImpact
                      ) : (
                        <span aria-label="Locked, submit lead form to view">***</span>
                      )}
                    </Masked>
                    <Masked revealed={revealed} blur className="text-muted-foreground text-xs">
                      {r.updated}
                    </Masked>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-muted-foreground">
                      No routes match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!revealed ? (
          <div className="mt-6 rounded-xl bg-navy text-navy-foreground p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl">Unlock detailed lane rates</h3>
              <p className="text-sm text-white/70 mt-1">
                Share a few details and we'll reveal exact freight per ton and contracted rates.
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Submit form to get full details
            </Button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-5 inline-flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" /> All lane rates unlocked.
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Note: Freight rates may vary depending on vehicle availability, load type, route
          conditions, tolls, and diesel price movement.
        </p>
      </section>

      <LeadCaptureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source="enquiry"
        context={{ surface: "freight-rates", payload: { from, to, truck, load, query: q } }}
        title="Submit form to get full details"
        description="Drop your contact and route preferences — we'll unlock the full table and email a copy."
        onSuccess={() => setRevealed(true)}
      />
    </SiteLayout>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function Masked({
  children,
  revealed,
  blur,
  className = "",
}: {
  children: React.ReactNode;
  revealed: boolean;
  blur?: boolean;
  className?: string;
}) {
  if (revealed) return <td className={`px-4 py-3 ${className}`}>{children}</td>;
  if (blur) {
    return (
      <td className={`px-4 py-3 ${className}`} aria-label="Locked, submit lead form to view">
        <span aria-hidden="true" className="select-none blur-sm inline-block">
          {children}
        </span>
      </td>
    );
  }
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
