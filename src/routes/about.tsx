import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Trinetra Logistics" },
      {
        name: "description",
        content:
          "Trinetra Logistics is a Vapi-based 3PL road logistics company with branches across Raipur, Pune and Bhiwandi.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  "Branch-level coordination on every consignment",
  "Digital POD support and document trail",
  "Delivery tracking with proactive ETA updates",
  "Vehicle vetting and driver compliance",
  "Industry-specific protocols (chemicals, steel, FMCG)",
  "Transparent indicative pricing before commitment",
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Trinetra"
        title="A 3PL logistics firm built around branch-level accountability"
        subtitle="Founded in Vapi, we operate as your extended logistics team across India's most demanding industrial corridors."
      />
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>
            Trinetra Logistics is a third-party (3PL) road logistics company headquartered in Vapi,
            Gujarat, with operating branches in{" "}
            <strong className="text-navy">Raipur, Pune and Bhiwandi</strong>. We move full and
            partial truckloads for manufacturers, traders and distributors across India's most
            active industrial hubs.
          </p>
          <p>
            Our edge isn't a software demo — it's{" "}
            <strong className="text-navy">on-ground execution</strong>. Each branch is staffed with
            experienced coordinators who own loading, transit, in-route issue resolution and POD
            discipline. Our central platform stitches their work together into one transparent view
            for you.
          </p>
          <p>
            We invest in the boring but essential things — vehicle vetting, driver compliance,
            weighbridge documentation, POD digitization, diesel-adjusted lane pricing — so your
            supply chain doesn't carry hidden risk.
          </p>
        </div>
        <div className="rounded-2xl bg-navy text-navy-foreground p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">What we do</p>
          <h2 className="font-display font-bold text-2xl mt-2">
            Reliable execution, not just promises.
          </h2>
          <ul className="mt-6 space-y-3">
            {pillars.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                <CheckCircle2 className="size-4 text-accent mt-0.5 shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
