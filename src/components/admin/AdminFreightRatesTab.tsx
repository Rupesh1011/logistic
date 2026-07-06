import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { freightRates as seedRates, type FreightRate } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { CrudTable } from "./CrudTable";
import { todayIsoDate } from "./shared";

const empty: FreightRate = {
  from: "",
  to: "",
  vehicle: "",
  loadType: "FTL",
  rate: 0,
  dieselImpact: "+0.0%",
  updated: todayIsoDate(),
};

const validRow = (r: unknown): r is FreightRate => {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.from === "string" &&
    typeof o.to === "string" &&
    typeof o.vehicle === "string" &&
    typeof o.loadType === "string" &&
    typeof o.rate === "number" &&
    typeof o.dieselImpact === "string" &&
    typeof o.updated === "string"
  );
};

const validList = (v: unknown): v is FreightRate[] => Array.isArray(v) && v.every(validRow);

export function AdminFreightRatesTab() {
  const { value: rows, set } = useServerDataset<FreightRate[]>(
    "freight-rates",
    seedRates,
    validList,
  );
  const [editing, setEditing] = useState<{ index: number | null; data: FreightRate } | null>(null);

  const openAdd = () => setEditing({ index: null, data: { ...empty, updated: todayIsoDate() } });
  const openEdit = (row: FreightRate) => {
    const idx = rows.indexOf(row);
    setEditing({ index: idx, data: { ...row } });
  };

  const save = async () => {
    if (!editing) return;
    const d = editing.data;
    if (!d.from.trim() || !d.to.trim() || !d.vehicle.trim()) {
      toast.error("From, To, and Vehicle are required.");
      return;
    }
    if (!Number.isFinite(d.rate) || d.rate <= 0) {
      toast.error("Rate must be a positive number.");
      return;
    }
    const next = { ...d, updated: todayIsoDate() };
    const nextRows =
      editing.index === null
        ? [...rows, next]
        : rows.map((r, i) => (i === editing.index ? next : r));
    const ok = await set(nextRows);
    if (!ok) return;
    setEditing(null);
    toast.success("Freight rate saved.");
  };

  return (
    <>
      <CrudTable<FreightRate>
        title="Freight Rates"
        rows={rows}
        columns={[
          { header: "From", render: (r) => r.from },
          { header: "To", render: (r) => r.to },
          { header: "Vehicle", render: (r) => r.vehicle },
          { header: "Load", render: (r) => r.loadType },
          { header: "Rate (₹)", render: (r) => `₹${r.rate.toLocaleString("en-IN")}`, className: "text-right font-mono" },
          {
            header: "Updated",
            render: (r) => <span className="text-xs text-muted-foreground">{r.updated}</span>,
          },
        ]}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(row) => void set(rows.filter((r) => r !== row))}
        rowDescription={(r) => `${r.from} → ${r.to} · ${r.vehicle}`}
        emptyState="No freight rate rows yet."
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing?.index === null ? "Add freight rate" : "Edit freight rate"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="From">
                  <Input
                    value={editing.data.from}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, from: e.target.value } })
                    }
                  />
                </Field>
                <Field label="To">
                  <Input
                    value={editing.data.to}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, to: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <Field label="Vehicle">
                <Input
                  value={editing.data.vehicle}
                  onChange={(e) =>
                    setEditing({ ...editing, data: { ...editing.data, vehicle: e.target.value } })
                  }
                  placeholder="e.g. 32ft SXL"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Load Type">
                  <Select
                    value={editing.data.loadType}
                    onValueChange={(v) =>
                      setEditing({ ...editing, data: { ...editing.data, loadType: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FTL">FTL</SelectItem>
                      <SelectItem value="PTL">PTL</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Rate (₹/Ton)">
                  <Input
                    type="number"
                    value={editing.data.rate}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, rate: Number(e.target.value) },
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Diesel Impact">
                <Input
                  value={editing.data.dieselImpact}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      data: { ...editing.data, dieselImpact: e.target.value },
                    })
                  }
                  placeholder="+1.2%"
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
