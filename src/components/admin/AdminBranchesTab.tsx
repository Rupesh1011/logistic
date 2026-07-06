import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { branches as seedBranches, type Branch } from "@/data/mock";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { CrudTable } from "./CrudTable";

const empty: Branch = {
  slug: "",
  name: "",
  city: "",
  state: "",
  isHeadOffice: false,
  address: "",
  contactPerson: "",
  phone: "",
  email: "",
  routes: [],
  industries: [],
};

const validRow = (r: unknown): r is Branch => {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.name === "string" &&
    typeof o.city === "string" &&
    typeof o.state === "string" &&
    typeof o.address === "string" &&
    typeof o.contactPerson === "string" &&
    typeof o.phone === "string" &&
    typeof o.email === "string" &&
    Array.isArray(o.routes) &&
    Array.isArray(o.industries)
  );
};

const validList = (v: unknown): v is Branch[] => Array.isArray(v) && v.every(validRow);

const tokensToList = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export function AdminBranchesTab() {
  const { value: rows, set } = useServerDataset<Branch[]>("branches", seedBranches, validList);
  const [editing, setEditing] = useState<{ index: number | null; data: Branch } | null>(null);
  const [routesText, setRoutesText] = useState("");
  const [industriesText, setIndustriesText] = useState("");

  const startEdit = (data: Branch, index: number | null) => {
    setEditing({ index, data });
    setRoutesText(data.routes.join(", "));
    setIndustriesText(data.industries.join(", "));
  };

  const openAdd = () => startEdit({ ...empty }, null);
  const openEdit = (row: Branch) => startEdit({ ...row }, rows.indexOf(row));

  const save = async () => {
    if (!editing) return;
    const slug = editing.data.slug.trim().toLowerCase();
    if (!slug || !/^[a-z0-9-]{2,40}$/.test(slug)) {
      toast.error("Slug must be 2-40 chars: lowercase letters, digits, dashes.");
      return;
    }
    const collision = rows.find((r, i) => r.slug.toLowerCase() === slug && i !== editing.index);
    if (collision) {
      toast.error(`Slug "${slug}" is already in use.`);
      return;
    }
    const next: Branch = {
      ...editing.data,
      slug,
      routes: tokensToList(routesText),
      industries: tokensToList(industriesText),
    };
    const nextRows =
      editing.index === null
        ? [...rows, next]
        : rows.map((r, i) => (i === editing.index ? next : r));
    const ok = await set(nextRows);
    if (!ok) return;
    setEditing(null);
    toast.success("Branch saved.");
  };

  return (
    <>
      <CrudTable<Branch>
        title="Branches"
        rows={rows}
        rowKey={(b) => b.slug}
        columns={[
          {
            header: "Name",
            render: (b) => (
              <span className="flex items-center gap-2">
                {b.name}
                {b.isHeadOffice && (
                  <span className="font-mono text-[10px] uppercase bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                    HQ
                  </span>
                )}
              </span>
            ),
          },
          { header: "City", render: (b) => b.city },
          { header: "State", render: (b) => b.state },
          { header: "Contact", render: (b) => b.contactPerson },
          { header: "Phone", render: (b) => b.phone },
          { header: "Email", render: (b) => b.email },
        ]}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(row) => void set(rows.filter((r) => r.slug !== row.slug))}
        rowDescription={(b) => `${b.name} (${b.city})`}
        emptyState="No branches yet."
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.index === null ? "Add branch" : "Edit branch"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Slug">
                  <Input
                    value={editing.data.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, slug: e.target.value } })
                    }
                    placeholder="e.g. vapi"
                  />
                </Field>
                <Field label="Name">
                  <Input
                    value={editing.data.name}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="City">
                  <Input
                    value={editing.data.city}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, city: e.target.value } })
                    }
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={editing.data.state}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, state: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <Field label="Address">
                <Input
                  value={editing.data.address}
                  onChange={(e) =>
                    setEditing({ ...editing, data: { ...editing.data, address: e.target.value } })
                  }
                />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Contact Person">
                  <Input
                    value={editing.data.contactPerson}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, contactPerson: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={editing.data.phone}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, phone: e.target.value } })
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={editing.data.email}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, email: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <Field label="Routes (comma separated)">
                <Textarea
                  rows={2}
                  value={routesText}
                  onChange={(e) => setRoutesText(e.target.value)}
                />
              </Field>
              <Field label="Industries (comma separated)">
                <Textarea
                  rows={2}
                  value={industriesText}
                  onChange={(e) => setIndustriesText(e.target.value)}
                />
              </Field>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!editing.data.isHeadOffice}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, data: { ...editing.data, isHeadOffice: v } })
                  }
                />
                <span className="text-sm">Mark as head office</span>
              </div>
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
