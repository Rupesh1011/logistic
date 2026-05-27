import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteLead, readLeads, type Lead, type LeadSource } from "@/lib/leads";
import { Download, Trash2 } from "lucide-react";
import { downloadJson } from "./shared";

const SOURCE_LABEL: Record<LeadSource, string> = {
  enquiry: "Enquiry",
  "quote-request": "Quote Request",
};

type Filter = "all" | LeadSource;

export function AdminLeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);

  useEffect(() => {
    setLeads(readLeads());
  }, []);

  const filtered = useMemo(() => {
    const list = filter === "all" ? leads : leads.filter((l) => l.source === filter);
    return list.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [leads, filter]);

  const refresh = () => setLeads(readLeads());

  const onDelete = () => {
    if (!pendingDelete) return;
    deleteLead(pendingDelete.id);
    setPendingDelete(null);
    refresh();
  };

  const onExport = () => {
    if (filtered.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`trinetra-leads-${date}.json`, filtered);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="enquiry">Enquiry</SelectItem>
            <SelectItem value="quote-request">Quote Request</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={onExport} disabled={filtered.length === 0}>
          <Download className="size-4 mr-1" /> Export Leads (JSON)
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy text-navy-foreground text-left text-xs uppercase tracking-wider">
            {filter === "all" && (
              <tr>
                <Th>Created</Th>
                <Th>Source</Th>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Mobile</Th>
                <Th>Email</Th>
                <Th>Context</Th>
                <Th />
              </tr>
            )}
            {filter === "enquiry" && (
              <tr>
                <Th>Created</Th>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Mobile</Th>
                <Th>Email</Th>
                <Th>City</Th>
                <Th>Monthly</Th>
                <Th>Routes</Th>
                <Th>Origin</Th>
                <Th />
              </tr>
            )}
            {filter === "quote-request" && (
              <tr>
                <Th>Created</Th>
                <Th>Name</Th>
                <Th>Company</Th>
                <Th>Mobile</Th>
                <Th>Email</Th>
                <Th>Pickup</Th>
                <Th>Delivery</Th>
                <Th>Material</Th>
                <Th>Weight</Th>
                <Th>Truck</Th>
                <Th>Loading</Th>
                <Th>Remarks</Th>
                <Th />
              </tr>
            )}
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={20} className="p-10 text-center text-muted-foreground">
                  No leads yet for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t border-border align-top">
                  <Td>{formatDate(l.createdAt)}</Td>
                  {filter === "all" && (
                    <>
                      <Td>{SOURCE_LABEL[l.source]}</Td>
                      <Td>{l.name}</Td>
                      <Td>{l.company}</Td>
                      <Td>{l.mobile}</Td>
                      <Td>{l.email}</Td>
                      <Td className="text-xs text-muted-foreground">{summarizeContext(l)}</Td>
                    </>
                  )}
                  {filter === "enquiry" && (
                    <>
                      <Td>{l.name}</Td>
                      <Td>{l.company}</Td>
                      <Td>{l.mobile}</Td>
                      <Td>{l.email}</Td>
                      <Td>{l.city || "—"}</Td>
                      <Td>{l.monthlyShipments || "—"}</Td>
                      <Td>{l.routes || "—"}</Td>
                      <Td>{originLabel(l)}</Td>
                    </>
                  )}
                  {filter === "quote-request" && (
                    <>
                      <Td>{l.name}</Td>
                      <Td>{l.company}</Td>
                      <Td>{l.mobile}</Td>
                      <Td>{l.email}</Td>
                      <Td>{l.pickup || "—"}</Td>
                      <Td>{l.delivery || "—"}</Td>
                      <Td>{l.material || "—"}</Td>
                      <Td>{l.weight || "—"}</Td>
                      <Td>{l.truck || "—"}</Td>
                      <Td>{l.loadingDate || "—"}</Td>
                      <Td className="text-xs text-muted-foreground max-w-xs truncate">
                        {l.remarks || "—"}
                      </Td>
                    </>
                  )}
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingDelete(l)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>
                  {pendingDelete.name} · {pendingDelete.company} · {pendingDelete.mobile}. This
                  cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-3 text-left">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function originLabel(l: Lead): string {
  if (l.context.surface === "home-estimator") return "FreightEstimator";
  if (l.context.surface === "freight-rates") return "Freight Rates";
  return "—";
}

function summarizeContext(l: Lead): string {
  if (l.context.surface === "home-estimator") {
    const p = l.context.payload as { from?: string; to?: string } | undefined;
    return p?.from && p?.to ? `${p.from} → ${p.to}` : "Home estimator";
  }
  if (l.context.surface === "freight-rates") return "Freight rates";
  if (l.source === "quote-request") {
    return l.pickup && l.delivery ? `${l.pickup} → ${l.delivery}` : "Get quote";
  }
  return "—";
}
