import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";
import { appendLead } from "@/lib/leads";
import { emailJsConfigured, sendLeadEmail } from "@/lib/emailjs";

export const Route = createFileRoute("/get-quote")({
  head: () => ({
    meta: [
      { title: "Get Transport Quote — Trinetra Logistics" },
      {
        name: "description",
        content:
          "Submit your transport requirement and get a branch-coordinated freight quote within 2 hours.",
      },
    ],
  }),
  component: QuotePage,
});

const trucks = ["14ft Truck", "20ft Container", "32ft SXL", "32ft MXL", "Trailer 40ft"];
const materials = [
  "General Goods",
  "Chemicals",
  "FMCG",
  "Steel",
  "Engineering Goods",
  "Textiles",
  "Packaging",
];

function QuotePage() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pickup: "",
    delivery: "",
    material: "General Goods",
    weight: "",
    truck: "32ft SXL",
    date: "",
    name: "",
    mobile: "",
    email: "",
    company: "",
    remarks: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const leadData = {
      source: "quote-request" as const,
      context: { surface: "get-quote" as const, payload: form },
      name: form.name,
      company: form.company,
      mobile: form.mobile,
      email: form.email,
      pickup: form.pickup,
      delivery: form.delivery,
      material: form.material,
      weight: form.weight,
      truck: form.truck,
      loadingDate: form.date,
      remarks: form.remarks,
    };

    try {
      if (emailJsConfigured) {
        await sendLeadEmail({
          ...leadData,
          context_surface: "get-quote",
        });
      }
      appendLead(leadData);
      if (emailJsConfigured) toast.success("Requirement received. We will reach out shortly.");
      else toast.warning("Saved locally. Email delivery is not configured yet.");
      setSubmitting(false);
      setDone(true);
    } catch {
      setSubmitting(false);
      toast.error("Could not deliver your request. Please try again.");
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Get Quote"
        title="Submit your transport requirement"
        subtitle="A branch coordinator will revert with a confirmed quote within 2 working hours."
      />
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        {done ? (
          <div className="border border-success/30 bg-success/5 rounded-xl p-8 text-center">
            <CheckCircle2 className="size-12 text-success mx-auto" />
            <h2 className="font-display font-bold text-2xl mt-4">Requirement received.</h2>
            <p className="text-muted-foreground mt-2">
              Our nearest branch will reach out shortly with a confirmed quotation.
            </p>
            <Button className="mt-6" onClick={() => setDone(false)} variant="outline">
              Submit another
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="grid gap-4 md:grid-cols-2 bg-card border border-border rounded-xl p-6 md:p-8"
          >
            <F label="Pickup Location *">
              <Input
                required
                value={form.pickup}
                onChange={(e) => set("pickup", e.target.value)}
                placeholder="e.g. Vapi GIDC"
              />
            </F>
            <F label="Delivery Location *">
              <Input
                required
                value={form.delivery}
                onChange={(e) => set("delivery", e.target.value)}
                placeholder="e.g. Pune Chakan"
              />
            </F>
            <F label="Material Type">
              <Select value={form.material} onValueChange={(v) => set("material", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Weight (tons) *">
              <Input
                required
                type="number"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
            </F>
            <F label="Truck Type">
              <Select value={form.truck} onValueChange={(v) => set("truck", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            <F label="Loading Date">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </F>
            <F label="Contact Name *">
              <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
            </F>
            <F label="Mobile Number *">
              <Input
                required
                type="tel"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
              />
            </F>
            <F label="Email *" className="md:col-span-2">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </F>
            <F label="Company Name *" className="md:col-span-2">
              <Input
                required
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </F>
            <F label="Remarks" className="md:col-span-2">
              <Textarea
                rows={3}
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                placeholder="Loading time, packing, special handling..."
              />
            </F>
            <div className="md:col-span-2">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 mr-1 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit Requirement"
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function F({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
