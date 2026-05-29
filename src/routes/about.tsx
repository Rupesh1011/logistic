import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Abhay Road Carrier" },
      {
        name: "description",
        content:
          "Abhay Road Carrier is a Vapi-headquartered B2B logistics company with 18+ years of experience and branches in Raipur, Pune and Bhiwandi.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  "Branch-level coordination on every consignment",
  "Digital POD support and document trail",
  "24×7 customer service and proactive ETA updates",
  "Vehicle vetting and driver compliance",
  "Industry-specific protocols (chemicals, steel, FMCG, welding)",
  "Transparent indicative pricing before commitment",
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Us"
        title="A B2B logistics partner built around 18+ years of on-ground execution"
        subtitle="Headquartered in Vapi with branches in Raipur, Pune and Bhiwandi, Abhay Road Carrier serves a diverse range of clients across India."
      />
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>
            Abhay Road Carrier, under the leadership of director and owner{" "}
            <strong className="text-navy">Prabhashankar Upadhyay</strong>, has been a cornerstone
            in the goods transportation industry for over 18 years. Initially, Prabhashankar
            started as a broker, seamlessly connecting clients and transporters and consistently
            delivering outstanding service.
          </p>
          <p>
            His expertise and dedication have propelled Abhay Road Carrier to new heights,
            transforming it into a premier logistics provider. Today, we proudly serve a diverse
            range of clients, ensuring end-to-end logistics solutions that are{" "}
            <strong className="text-navy">transparent, timely, and flawless</strong>. Our
            commitment to 24/7 customer service underscores our dedication to meeting and
            exceeding our clients' expectations.
          </p>
          <p>
            Logistics is a critical component of every company's operations, and at Abhay Road
            Carrier, we aim to simplify this process with innovative solutions. Our dedicated team
            is bound by a commitment to excellence, ensuring that your logistics needs are met
            with the highest standards of quality and reliability.
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            GST · 24AARPU0311R1Z7
          </p>
        </div>
        <div className="rounded-2xl bg-navy text-navy-foreground p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Why choose us</p>
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
