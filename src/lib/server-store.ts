// Server-side dataset store backed by Vercel KV in production and a local JSON
// file fallback during `npm run dev`. Public reads are open. Writes require the
// caller to send the same admin secret that's also baked into the server build,
// keeping casual scrapers from corrupting the dataset without standing up a
// full auth backend.
//
// The same hook (useServerDataset) calls these functions from the browser; on
// Vercel they execute as serverless functions, locally they run inside the
// Vite dev server.

import { createServerFn } from "@tanstack/react-start";

const DATASETS = ["freight-rates", "branches", "deliveries"] as const;
export type DatasetName = (typeof DATASETS)[number];

const KV_KEY = (name: DatasetName) => `trinetra:${name}`;

// ---- Server-only helpers ------------------------------------------------------

async function getKv(): Promise<{
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<unknown>;
} | null> {
  // Upstash Redis (used via Vercel's Upstash integration) injects these two vars.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    return {
      get: <T>(key: string) => redis.get<T>(key),
      set: (key: string, value: unknown) => redis.set(key, value),
    };
  } catch {
    return null;
  }
}

async function readFromFile(name: DatasetName): Promise<unknown | null> {
  if (typeof process === "undefined") return null;
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), ".kv-local", `${name}.json`);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeToFile(name: DatasetName, value: unknown): Promise<void> {
  if (typeof process === "undefined") return;
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.resolve(process.cwd(), ".kv-local");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${name}.json`), JSON.stringify(value, null, 2), "utf8");
}

function adminHash(): string {
  // Same value on client (VITE_*) and server. Used as a shared secret so the
  // server can reject writes from anyone who hasn't authenticated through
  // the admin login (which already has the hash compiled in).
  return (process.env.VITE_ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD_HASH ?? "").trim();
}

function isValidDatasetName(value: unknown): value is DatasetName {
  return typeof value === "string" && (DATASETS as readonly string[]).includes(value);
}

// ---- Server functions exposed to the client ----------------------------------

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

/** Public read. Returns the stored array or null when the dataset hasn't been
 * initialised yet (the client falls back to the seed data in that case). */
export const getDatasetFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown): { name: DatasetName } => {
    if (!input || typeof input !== "object") throw new Error("name required");
    const name = (input as { name?: unknown }).name;
    if (!isValidDatasetName(name)) throw new Error(`unknown dataset: ${String(name)}`);
    return { name };
  })
  .handler(async ({ data }): Promise<{ name: DatasetName; value: JsonValue | null }> => {
    const kv = await getKv();
    const stored = kv ? await kv.get<unknown>(KV_KEY(data.name)) : await readFromFile(data.name);
    return { name: data.name, value: (stored as JsonValue | null) ?? null };
  });

/** Authenticated write. The client must include the admin password hash so we
 * can verify it matches the build-baked secret. Without the match we throw a
 * generic 403; we never echo the expected value. */
export const setDatasetFn = createServerFn({ method: "POST" })
  .inputValidator(
    (
      input: unknown,
    ): {
      name: DatasetName;
      value: unknown;
      token: string;
    } => {
      if (!input || typeof input !== "object") throw new Error("invalid payload");
      const i = input as Record<string, unknown>;
      if (!isValidDatasetName(i.name)) throw new Error("invalid dataset");
      if (typeof i.token !== "string") throw new Error("missing token");
      if (!Array.isArray(i.value)) throw new Error("value must be an array");
      return { name: i.name, value: i.value, token: i.token };
    },
  )
  .handler(async ({ data }) => {
    const expected = adminHash();
    if (!expected || data.token !== expected) {
      throw new Error("forbidden");
    }
    const kv = await getKv();
    if (kv) {
      await kv.set(KV_KEY(data.name), data.value);
    } else {
      await writeToFile(data.name, data.value);
    }
    return { ok: true as const };
  });
