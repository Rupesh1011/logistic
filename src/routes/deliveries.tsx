import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { deliveries as seedDeliveries, deliveryCounters, type Delivery } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { CheckCircle2, Package } from "lucide-react";

export const Route = createFileRoute("/deliveries")({
  head: () => ({
    meta: [
      { title: "Delivery Success — Trinetra Logistics" },
      {
        name: "description",
        content:
          "Case studies of successful B2B deliveries across India with route, load, challenge and outcome.",
      },
    ],
  }),
  component: DeliveriesPage,
});

function DeliveriesPage() {
  const { value: deliveries } = useServerDataset<Delivery[]>("deliveries", seedDeliveries);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Delivery Success"
        title="Real loads. Real lanes. Successfully delivered."
        subtitle="Selected case studies from our branch network across India."
      />
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {deliveryCounters.map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-display font-bold text-3xl text-navy">{c.value}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                {c.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {deliveries.map((d, i) => (
            <article
              key={`${d.industry}-${d.route}-${i}`}
              className="border border-border rounded-xl bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-success">
                  <CheckCircle2 className="size-4" /> Successful
                </span>
                <span className="text-xs text-muted-foreground">{d.route}</span>
              </div>
              <h3 className="font-display font-bold text-xl mt-3 text-navy flex items-start gap-2">
                <Package className="size-5 text-accent mt-1 shrink-0" /> {d.industry}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{d.load}</p>
              <div className="mt-4 space-y-3 text-sm">
                <Block label="Challenge" text={d.challenge} />
                <Block label="Solution" text={d.solution} />
                <Block label="Result" text={d.result} />
              </div>
            </article>
          ))}
          {deliveries.length === 0 && (
            <p className="md:col-span-2 text-center text-muted-foreground py-12">
              No delivery stories yet.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">{label}</p>
      <p className="text-sm mt-1 whitespace-pre-line">{text}</p>
    </div>
  );
}
