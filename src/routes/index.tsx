import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { FreightEstimator } from "@/components/FreightEstimator";
import { RevealCard } from "@/components/RevealCard";
import { Button } from "@/components/ui/button";
import {
  branches as seedBranches,
  deliveryCounters,
  industries,
  trustMetrics,
  type Branch,
} from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { useParallax } from "@/lib/motion";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Gauge,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trinetra Logistics — Reliable 3PL from Vapi to Industrial India" },
      {
        name: "description",
        content:
          "Branch-led 3PL road logistics across Vapi, Raipur, Pune & Bhiwandi. Live freight rate estimator and transparent transport quotes for B2B shippers.",
      },
      { property: "og:title", content: "Trinetra Logistics — 3PL Road Logistics India" },
      {
        property: "og:description",
        content: "Freight rate intelligence and reliable B2B transport from Vapi.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { value: branches } = useServerDataset<Branch[]>("branches", seedBranches);
  const heroBgRef = useParallax<HTMLDivElement>(0.3, 80);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative bg-navy text-navy-foreground overflow-hidden">
        <div
          ref={heroBgRef}
          className="parallax-layer absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_35%)]"
        />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-4 animate-fade-in-up">
            3PL · Road Logistics · Pan-India
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] max-w-4xl animate-fade-in-up">
            Reliable 3PL Logistics from <span className="text-accent">Vapi</span> to Industrial
            India.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/75 max-w-2xl animate-fade-in-up">
            Branch-led transport solutions, freight insights, and delivery support across Vapi,
            Raipur, Pune, and Bhiwandi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up">
            <Link to="/freight-rates">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Check Freight Rates <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link to="/get-quote">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Get Transport Quote
              </Button>
            </Link>
          </div>

          {/* Trust metrics */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustMetrics.map((m) => (
              <RevealCard
                key={m.label}
                className="rounded-lg bg-white/5 backdrop-blur border border-white/10 px-5 py-4"
              >
                <p className="font-display font-bold text-2xl md:text-3xl text-accent">{m.value}</p>
                <p className="text-xs uppercase tracking-wider text-white/60 mt-1">{m.label}</p>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* Estimator */}
      <section className="container mx-auto px-4 -mt-10 md:-mt-14 relative z-10">
        <FreightEstimator />
      </section>

      {/* Branches */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader
          eyebrow="Branch Network"
          title="Operations Where Industry Moves"
          subtitle="Local teams, local trucks, local accountability — connected by one platform."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {branches.map((b) => (
            <RevealCard
              key={b.slug}
              className="group border border-border rounded-xl p-6 bg-card hover:border-accent transition-all hover:shadow-lg hover:shadow-navy/5"
            >
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-md bg-navy text-navy-foreground grid place-items-center">
                  <MapPin className="size-5" />
                </div>
                {b.isHeadOffice && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent">
                    Head Office
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-xl mt-4">{b.city}</h3>
              <p className="text-xs text-muted-foreground">{b.state}</p>
              <div className="mt-4 space-y-1.5 text-sm">
                {b.routes.slice(0, 3).map((r) => (
                  <p key={r} className="text-muted-foreground flex items-center gap-2">
                    <Truck className="size-3.5 text-accent" /> {r}
                  </p>
                ))}
              </div>
              <Link
                to="/branches"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-accent"
              >
                Branch details <ArrowRight className="size-3.5" />
              </Link>
            </RevealCard>
          ))}
        </div>
      </section>

      {/* Why us / Capabilities */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <Capability
              icon={ShieldCheck}
              title="POD-Backed Reliability"
              desc="99.5% PODs collected and digitally archived for every consignment."
            />
            <Capability
              icon={Gauge}
              title="Live Rate Intelligence"
              desc="Diesel-adjusted freight indices updated continuously by route and vehicle."
            />
            <Capability
              icon={TrendingUp}
              title="Branch-Led Execution"
              desc="Empowered local teams own loading, transit and delivery accountability."
            />
          </div>
        </div>
      </section>

      {/* Delivery counters */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Delivery Success" title="Numbers That Move Industry" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
          {deliveryCounters.map((c) => (
            <RevealCard
              key={c.label}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <p className="font-display font-bold text-3xl md:text-4xl text-navy">{c.value}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                {c.label}
              </p>
            </RevealCard>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/deliveries">
            <Button variant="outline">
              See delivery case studies <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="bg-navy text-navy-foreground">
        <div className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              About Trinetra
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl">
              A 3PL partner built for industrial India.
            </h2>
            <p className="mt-5 text-white/75 leading-relaxed">
              Headquartered in Vapi with on-ground branches in Raipur, Pune and Bhiwandi, we operate
              as your extended logistics team — from spot loads to long-term lane contracts. Our
              platform combines transparent freight, real-time intel, and rigorous POD discipline so
              your supply chain doesn't run blind.
            </p>
            <div className="mt-6 grid gap-2 text-sm text-white/80">
              {[
                "Dedicated branch coordinators on every lane",
                "Digital POD tracking and document trail",
                "Industry-specific handling protocols",
                "Transparent indicative rates before you commit",
              ].map((p) => (
                <p key={p} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-accent mt-0.5" /> {p}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/about">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  More about us <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: "12+", l: "Years moving industrial India" },
              { v: "4", l: "Owned branch operations" },
              { v: "180+", l: "Vetted vehicle partners" },
              { v: "24×7", l: "Branch coordination" },
            ].map((s) => (
              <RevealCard key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-6">
                <p className="font-display text-3xl font-bold text-accent">{s.v}</p>
                <p className="text-xs uppercase tracking-wider text-white/60 mt-2">{s.l}</p>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Industries Served" title="Specialized handling for B2B verticals" />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {industries.map((i) => (
            <RevealCard
              key={i.name}
              className="border border-border rounded-lg p-5 bg-card hover:border-accent transition-colors"
            >
              <Factory className="size-5 text-accent" />
              <h3 className="font-display font-semibold mt-3">{i.name}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{i.desc}</p>
            </RevealCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-navy to-navy/80 text-navy-foreground p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Ready to move your next consignment?
            </h2>
            <p className="text-white/70 mt-2">
              Submit your requirement and get a branch-coordinated quote within 2 hours.
            </p>
          </div>
          <Link to="/get-quote">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Submit Requirement <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">{eyebrow}</p>
      <h2 className="font-display font-bold text-3xl md:text-4xl text-navy">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Capability({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-11 rounded-lg bg-accent/15 text-accent grid place-items-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5">{desc}</p>
      </div>
    </div>
  );
}
