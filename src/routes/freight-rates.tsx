import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { freightRates as seedRates, type FreightRate } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { getRevealState } from "@/lib/leads";
import { CheckCircle2, ChevronDown, Lock, Search, X } from "lucide-react";

export const Route = createFileRoute("/freight-rates")({
  head: () => ({
    meta: [
      { title: "Freight Rate Dashboard — Abhay Road Carrier" },
      {
        name: "description",
        content:
          "Indicative freight charges across Vapi, Pune, Bhiwandi and Raipur with live updates.",
      },
    ],
  }),
  component: FreightRatesPage,
});

const trucks = ["All", "14ft Truck", "20ft Container", "32ft SXL", "32ft MXL", "Trailer 40ft"];
const loadTypes = ["All", "FTL", "PTL"];

// Comprehensive list of Indian cities for the city search dropdowns.
const INDIAN_CITIES = [
  "All",
  "Agra","Ahmedabad","Ajmer","Aligarh","Allahabad","Amravati","Amritsar","Asansol",
  "Aurangabad","Bangalore","Bareilly","Belgaum","Bhavnagar","Bhilai","Bhiwandi",
  "Bhopal","Bhubaneswar","Bikaner","Bilaspur","Bokaro","Chandigarh","Chennai",
  "Coimbatore","Cuttack","Dehradun","Delhi","Dhanbad","Durgapur","Erode","Faridabad",
  "Firozabad","Ghaziabad","Gorakhpur","Gulbarga","Guntur","Gurgaon","Guwahati",
  "Gwalior","Hubli","Hyderabad","Indore","Jabalpur","Jaipur","Jalandhar","Jammu",
  "Jamnagar","Jamshedpur","Jhansi","Jodhpur","Kakinada","Kalyan","Kanpur","Kochi",
  "Kota","Kozhikode","Kolkata","Lucknow","Ludhiana","Madurai","Meerut","Mumbai",
  "Mysore","Nagpur","Nashik","Navi Mumbai","Nellore","Noida","Patna","Pimpri",
  "Pune","Raipur","Rajkot","Ranchi","Salem","Sangli","Siliguri","Solapur","Srinagar",
  "Surat","Thane","Tiruchirappalli","Tirunelveli","Tiruppur","Ujjain","Vadodara",
  "Varanasi","Vapi","Vijayawada","Visakhapatnam","Warangal",
];

function FreightRatesPage() {
  const { value: rates } = useServerDataset<FreightRate[]>("freight-rates", seedRates);

  const [revealed, setRevealed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setRevealed(getRevealState());
  }, []);

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
        subtitle="Indicative road freight rates between our branches, updated regularly."
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 mb-6">
          <CitySearch label="From City" value={from} onChange={setFrom} />
          <CitySearch label="To City" value={to} onChange={setTo} />
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
                  <Th className="text-right">Rate (₹/Ton)</Th>
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
                    <Masked revealed={revealed} blur className="text-muted-foreground text-xs">
                      {r.updated}
                    </Masked>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
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
          conditions and tolls.
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

// ---------- sub-components ----------

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

/** Searchable city combobox that filters all Indian cities as the user types. */
function CitySearch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INDIAN_CITIES;
    return INDIAN_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city: string) => {
    onChange(city);
    setSearch("");
    setOpen(false);
  };

  return (
    <div className="grid gap-1.5" ref={ref}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className={value === "All" ? "text-muted-foreground" : ""}>{value}</span>
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
            {/* search input */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* list */}
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">No cities found.</p>
              ) : (
                filtered.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => select(city)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent/10 ${city === value ? "font-semibold text-accent" : ""}`}
                  >
                    {city}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
