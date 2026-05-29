import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { industries } from "@/data/mock";
import { Factory } from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries Served — Abhay Road Carrier" },
      {
        name: "description",
        content:
          "B2B logistics for manufacturing, chemicals, FMCG, steel, engineering, textiles and more.",
      },
    ],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Industries Served"
        title="Built for the verticals that move India's industry"
      />
      <section className="container mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {industries.map((i) => (
          <div
            key={i.name}
            className="rounded-xl border border-border bg-card p-6 hover:border-accent transition"
          >
            <div className="size-11 rounded-lg bg-accent/15 text-accent grid place-items-center">
              <Factory className="size-5" />
            </div>
            <h3 className="font-display font-semibold text-lg mt-4">{i.name}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{i.desc}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
