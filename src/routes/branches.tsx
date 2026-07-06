import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { branches as seedBranches, type Branch } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, MessageCircle, Phone, Truck, User } from "lucide-react";
import { buildBranchWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Branch Network — Abhay Road Carrier" },
      {
        name: "description",
        content:
          "Vapi head office and branches in Raipur, Pune and Bhiwandi with contact details and capabilities.",
      },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  const { value: branches } = useServerDataset<Branch[]>("branches", seedBranches);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Branch Network"
        title="On-ground branches in India's busiest industrial corridors"
        subtitle="Each branch runs its own dispatch, coordination and POD operations — backed by a central platform."
      />
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div key={b.slug} className="border border-border rounded-xl bg-card p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-10 rounded-md bg-navy text-navy-foreground grid place-items-center">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-xl text-navy">{b.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {b.city}, {b.state}
                    </p>
                  </div>
                </div>
              </div>
              {b.isHeadOffice && (
                <span className="font-mono text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-2 py-1 rounded">
                  HQ
                </span>
              )}
            </div>

            {/* Contact details */}
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 mt-0.5 shrink-0" /> {b.address}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 shrink-0" /> {b.contactPerson}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" /> {b.phone}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" /> {b.email}
              </p>
            </div>

            {/* Capabilities */}
            {b.routes.length > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                  Capabilities
                </p>
                <ul className="space-y-1.5 text-sm">
                  {b.routes.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="size-3.5 text-accent shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Industries as tags (no count) */}
            {b.industries.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  Industries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {b.industries.map((i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <a
                href={buildBranchWhatsAppLink({ branchCity: b.city })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5d]">
                  <MessageCircle className="size-4 mr-1" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <p className="md:col-span-2 text-center text-muted-foreground py-12">
            No branches configured yet.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}
