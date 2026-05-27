import { useEffect, useState } from "react";
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
import { ArrowRight, Calculator, CheckCircle2, Lock } from "lucide-react";
import { LeadCaptureDialog } from "@/components/LeadCaptureDialog";
import { getRevealState } from "@/lib/leads";

const cities = [
  "Vapi",
  "Pune",
  "Bhiwandi",
  "Raipur",
  "Mumbai",
  "Surat",
  "Ahmedabad",
  "Nagpur",
  "Delhi",
];
const vehicles = ["14ft Truck", "20ft Container", "32ft SXL", "32ft MXL", "Trailer 40ft"];
const packaging = ["Loose", "Pallet", "Drum", "Crate", "Bag"];
const categories = ["General", "Chemicals", "FMCG", "Steel", "Engineering Goods", "Textiles"];

export function FreightEstimator() {
  const [revealed, setRevealed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setRevealed(getRevealState());
    const onStorage = () => setRevealed(getRevealState());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [form, setForm] = useState({
    from: "Vapi",
    to: "Pune",
    weight: "10",
    packaging: "Pallet",
    vehicle: "32ft SXL",
    date: "",
    category: "General",
  });
  const [estimate, setEstimate] = useState<{ low: number; high: number; perTon: number } | null>(
    null,
  );

  const handle = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const calculate = () => {
    const base = 1800;
    const w = Math.max(1, parseFloat(form.weight) || 1);
    // Deterministic distance factor so the price doesn't jiggle on every click.
    const distFactor =
      form.from === form.to
        ? 0.4
        : 0.9 + ((form.from.length * 17 + form.to.length * 31) % 60) / 100;
    const vehMul = form.vehicle.includes("MXL") ? 1.15 : form.vehicle.includes("14ft") ? 0.85 : 1;
    const catMul = form.category === "Chemicals" ? 1.18 : form.category === "Steel" ? 1.1 : 1;
    const perTon = Math.round(base * distFactor * vehMul * catMul);
    const total = perTon * w;
    setEstimate({ low: Math.round(total * 0.92), high: Math.round(total * 1.08), perTon });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-xl shadow-navy/5 overflow-hidden">
      <div className="bg-navy text-navy-foreground px-6 py-4 flex items-center gap-3">
        <Calculator className="size-5 text-accent" />
        <div>
          <h3 className="font-display font-bold text-lg leading-tight">Freight Rate Estimator</h3>
          <p className="text-xs text-white/60">
            Instant indicative pricing across our branch network
          </p>
        </div>
      </div>
      <div className="p-6 grid gap-4 md:grid-cols-3">
        <Field label="Pickup Location">
          <Select value={form.from} onValueChange={(v) => handle("from", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Delivery Location">
          <Select value={form.to} onValueChange={(v) => handle("to", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Material Weight (tons)">
          <Input
            type="number"
            value={form.weight}
            onChange={(e) => handle("weight", e.target.value)}
          />
        </Field>
        <Field label="Packaging Type">
          <Select value={form.packaging} onValueChange={(v) => handle("packaging", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {packaging.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Vehicle Type">
          <Select value={form.vehicle} onValueChange={(v) => handle("vehicle", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Material Category">
          <Select value={form.category} onValueChange={(v) => handle("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Loading Date">
          <Input type="date" value={form.date} onChange={(e) => handle("date", e.target.value)} />
        </Field>
        <div className="md:col-span-2 flex items-end">
          <Button
            onClick={calculate}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-10"
          >
            Get Indicative Rate <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
      {estimate && (
        <div className="border-t border-border bg-secondary/40 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Indicative Range · {form.from} → {form.to}
              </p>
              {revealed ? (
                <p className="font-display text-3xl font-bold text-navy mt-1">
                  ₹{estimate.low.toLocaleString("en-IN")} – ₹{estimate.high.toLocaleString("en-IN")}
                </p>
              ) : (
                <>
                  <p
                    aria-hidden="true"
                    className="font-display text-3xl font-bold text-navy mt-1 select-none blur-md"
                  >
                    ₹{estimate.low.toLocaleString("en-IN")} – ₹
                    {estimate.high.toLocaleString("en-IN")}
                  </p>
                  <span className="sr-only">
                    Indicative rate hidden. Submit the lead form to view.
                  </span>
                </>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {revealed
                  ? `~₹${estimate.perTon.toLocaleString("en-IN")}/ton · subject to diesel, tolls, route conditions.`
                  : "Subject to diesel, tolls, route conditions."}
              </p>
            </div>
            {revealed ? (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" /> Quote details sent to your email
              </div>
            ) : (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-navy text-navy-foreground hover:bg-navy/90"
              >
                <Lock className="size-4 mr-1" /> Fill the form to unlock final quote
              </Button>
            )}
          </div>
        </div>
      )}
      <LeadCaptureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source="enquiry"
        context={{
          surface: "home-estimator",
          payload: estimate
            ? {
                from: form.from,
                to: form.to,
                weight: form.weight,
                vehicle: form.vehicle,
                category: form.category,
                low: estimate.low,
                high: estimate.high,
                perTon: estimate.perTon,
              }
            : { from: form.from, to: form.to },
        }}
        title="Unlock your indicative rate"
        description="Drop your details and our branch coordinator will reach out with a confirmed quote."
        onSuccess={() => setRevealed(true)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}
