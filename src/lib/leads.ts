import { v4 as uuid } from "uuid";
import { storage, STORAGE_KEYS } from "./storage";

export type LeadSource = "enquiry" | "quote-request";
export type LeadSurface = "home-estimator" | "freight-rates" | "get-quote";

export type LeadContext = {
  surface: LeadSurface;
  payload?: Record<string, unknown>;
};

export type Lead = {
  id: string;
  createdAt: string; // ISO 8601 UTC
  source: LeadSource;
  context: LeadContext;
  name: string;
  company: string;
  mobile: string;
  email: string;
  city?: string;
  monthlyShipments?: string;
  routes?: string;
  // Quote-request-specific extras (kept loose so the unified store doesn't need a discriminated union for storage):
  pickup?: string;
  delivery?: string;
  material?: string;
  weight?: string;
  truck?: string;
  loadingDate?: string;
  remarks?: string;
};

export function readLeads(): Lead[] {
  const list = storage.get<Lead[]>(STORAGE_KEYS.leads, []);
  if (!Array.isArray(list)) return [];
  return list;
}

export function writeLeads(list: Lead[]): void {
  storage.set(STORAGE_KEYS.leads, list);
}

export function appendLead(partial: Omit<Lead, "id" | "createdAt">): Lead {
  const lead: Lead = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
  const list = readLeads();
  list.push(lead);
  writeLeads(list);
  return lead;
}

export function deleteLead(id: string): void {
  writeLeads(readLeads().filter((l) => l.id !== id));
}

// One-time migration: pull legacy `trinetra_quotes` records into the unified
// `trinetra_leads` store. Idempotent — skips already-migrated ids.
export function migrateLegacyQuotes(): number {
  if (typeof window === "undefined") return 0;
  const legacy = storage.get<Array<Record<string, unknown>>>(STORAGE_KEYS.legacyQuotes, []);
  if (!Array.isArray(legacy) || legacy.length === 0) {
    storage.remove(STORAGE_KEYS.legacyQuotes);
    return 0;
  }
  const existing = readLeads();
  const existingIds = new Set(existing.map((l) => l.id));
  const migrated: Lead[] = [];
  for (const q of legacy) {
    const id = String(q.id ?? uuid());
    if (existingIds.has(id)) continue;
    migrated.push({
      id,
      createdAt: typeof q.createdAt === "string" ? q.createdAt : new Date().toISOString(),
      source: "quote-request",
      context: { surface: "get-quote" },
      name: String(q.name ?? ""),
      company: String(q.company ?? ""),
      mobile: String(q.mobile ?? ""),
      email: "",
      pickup: q.pickup as string | undefined,
      delivery: q.delivery as string | undefined,
      material: q.material as string | undefined,
      weight: q.weight as string | undefined,
      truck: q.truck as string | undefined,
      loadingDate: q.date as string | undefined,
      remarks: q.remarks as string | undefined,
    });
  }
  if (migrated.length > 0) {
    writeLeads([...existing, ...migrated]);
  }
  storage.remove(STORAGE_KEYS.legacyQuotes);
  return migrated.length;
}

export function getRevealState(): boolean {
  return storage.getRaw(STORAGE_KEYS.reveal) === "true";
}

export function setRevealState(value: boolean): void {
  if (value) storage.setRaw(STORAGE_KEYS.reveal, "true");
  else storage.remove(STORAGE_KEYS.reveal);
}

// Clean up legacy customer-auth artifacts on app boot. Idempotent.
export function clearLegacyAuthKeys(): void {
  storage.remove(STORAGE_KEYS.legacyUser);
  storage.remove(STORAGE_KEYS.legacyAdmin);
  storage.remove(STORAGE_KEYS.legacySaved);
}
