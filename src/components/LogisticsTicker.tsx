// The ticker reads live freight rates from the same dataset the admin edits,
// so any add/edit/delete in the admin panel automatically updates this banner.
import { Truck } from "lucide-react";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { freightRates as seedRates, type FreightRate } from "@/data/mock";

const STATIC_ITEMS = [
  "On-Time Delivery 97.4%",
  "POD Collection 99.5%",
  "Monthly Deliveries 4,200+",
  "Active Branches · Vapi | Raipur | Pune | Bhiwandi",
];

export function LogisticsTicker() {
  const { value: rates } = useServerDataset<FreightRate[]>("freight-rates", seedRates);

  // Build dynamic items from the live rates dataset (show rate per ton).
  const rateItems = rates.map(
    (r) => `Freight Index · ${r.from} → ${r.to} ₹${r.rate.toLocaleString("en-IN")}/Ton`,
  );

  const allItems = [...rateItems, ...STATIC_ITEMS];
  // Double for seamless loop.
  const items = [...allItems, ...allItems];

  return (
    <div className="bg-navy text-navy-foreground border-b border-white/10 overflow-hidden">
      <div className="flex items-stretch">
        <div className="hidden md:flex items-center gap-2 px-4 bg-accent text-accent-foreground font-mono text-xs font-semibold uppercase tracking-wider shrink-0">
          <Truck className="size-4" /> Live Logistics Intel
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap py-2.5 animate-ticker font-mono text-xs">
            {items.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="opacity-90">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
