import { Truck } from "lucide-react";

const tickerItems = [
  "Freight Index · Vapi → Pune ₹1,850/Ton",
  "Freight Index · Vapi → Bhiwandi ₹1,100/Ton",
  "Freight Index · Vapi → Raipur ₹3,650/Ton",
  "Freight Index · Pune → Raipur ₹3,200/Ton",
  "Freight Index · Bhiwandi → Vapi ₹1,250/Ton",
  "On-Time Delivery 97.4%",
  "POD Collection 99.5%",
  "Monthly Deliveries 4,200+",
  "Active Branches · Vapi | Raipur | Pune | Bhiwandi",
];

export function LogisticsTicker() {
  const items = [...tickerItems, ...tickerItems];
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
