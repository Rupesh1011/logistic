import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deliveries as seedDeliveries, type Delivery } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { CrudTable } from "./CrudTable";

const empty: Delivery = {
  industry: "",
  route: "",
  load: "",
  challenge: "",
  solution: "",
  result: "",
};

const validRow = (r: unknown): r is Delivery => {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.industry === "string" &&
    typeof o.route === "string" &&
    typeof o.load === "string" &&
    typeof o.challenge === "string" &&
    typeof o.solution === "string" &&
    typeof o.result === "string"
  );
};
const validList = (v: unknown): v is Delivery[] => Array.isArray(v) && v.every(validRow);

export function AdminDeliveriesTab() {
  const { value: rows, set } = useServerDataset<Delivery[]>(
    "deliveries",
    seedDeliveries,
    validList,
  );
  const [editing, setEditing] = useState<{ index: number | null; data: Delivery } | null>(null);

  const openAdd = () => setEditing({ index: null, data: { ...empty } });
  const openEdit = (row: Delivery) => setEditing({ index: rows.indexOf(row), data: { ...row } });

  const save = async () => {
    if (!editing) return;
    const d = editing.data;
    if (!d.industry.trim() || !d.route.trim() || !d.load.trim()) {
      toast.error("Industry, Route, and Load are required.");
      return;
    }
    const nextRows =
      editing.index === null ? [...rows, d] : rows.map((r, i) => (i === editing.index ? d : r));
    const ok = await set(nextRows);
    if (!ok) return;
    setEditing(null);
    toast.success("Delivery story saved.");
  };

  return (
    <>
      <CrudTable<Delivery>
        title="Delivery Stories"
        rows={rows}
        columns={[
          { header: "Industry", render: (d) => d.industry },
          { header: "Route", render: (d) => d.route },
          { header: "Load", render: (d) => d.load },
          {
            header: "Challenge",
            render: (d) => (
              <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                {d.challenge}
              </span>
            ),
          },
          {
            header: "Solution",
            render: (d) => (
              <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                {d.solution}
              </span>
            ),
          },
          {
            header: "Result",
            render: (d) => (
              <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                {d.result}
              </span>
            ),
          },
        ]}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(row) => void set(rows.filter((r) => r !== row))}
        rowDescription={(d) => `${d.industry} · ${d.route}`}
        emptyState="No delivery stories yet."
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.index === null ? "Add delivery story" : "Edit delivery story"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Industry">
                  <Input
                    value={editing.data.industry}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, industry: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Route">
                  <Input
                    value={editing.data.route}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, route: e.target.value } })
                    }
                    placeholder="Vapi → Pune"
                  />
                </Field>
              </div>
              <Field label="Load">
                <Input
                  value={editing.data.load}
                  onChange={(e) =>
                    setEditing({ ...editing, data: { ...editing.data, load: e.target.value } })
                  }
                />
              </Field>
              <LongField
                label="Challenge"
                value={editing.data.challenge}
                onChange={(v) =>
                  setEditing({ ...editing, data: { ...editing.data, challenge: v } })
                }
              />
              <LongField
                label="Solution"
                value={editing.data.solution}
                onChange={(v) => setEditing({ ...editing, data: { ...editing.data, solution: v } })}
              />
              <LongField
                label="Result"
                value={editing.data.result}
                onChange={(v) => setEditing({ ...editing, data: { ...editing.data, result: v } })}
              />
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

function LongField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const HARD = 1500;
  const SOFT = 600;
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        <span
          className={`text-[10px] font-mono ${value.length > SOFT ? "text-warning" : "text-muted-foreground"}`}
        >
          {value.length} / {HARD}
        </span>
      </Label>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value.slice(0, HARD))} />
    </div>
  );
}
