// SWR-style hook backed by Vercel KV via TanStack Start server functions.
// Public pages call this with the seed data as fallback; the admin panel calls
// .set() to mutate and the change propagates to every visitor.
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getDatasetFn, setDatasetFn, type DatasetName } from "@/lib/server-store";
import { getAdminToken } from "@/hooks/use-admin-auth";

const CHANNEL = "trinetra-dataset-change";

export type UseServerDataset<T> = {
  value: T;
  set: (next: T | ((current: T) => T)) => Promise<boolean>;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useServerDataset<T>(
  name: DatasetName,
  seed: T,
  validator?: (value: unknown) => value is T,
): UseServerDataset<T> {
  const [value, setValue] = useState<T>(seed);
  const [isLoading, setLoading] = useState(true);
  const seedRef = useRef(seed);
  seedRef.current = seed;

  const fetchOnce = useCallback(async () => {
    try {
      const result = (await getDatasetFn({ data: { name } })) as {
        name: DatasetName;
        value: unknown;
      };
      const stored = result.value;
      if (stored !== null && (!validator || validator(stored))) {
        setValue(stored as T);
      } else {
        setValue(seedRef.current);
      }
    } catch (err) {
      // Network/edge failure — keep showing the seed/last-known value.
      console.warn(`[server-dataset] fetch ${name} failed`, err);
    } finally {
      setLoading(false);
    }
  }, [name, validator]);

  useEffect(() => {
    void fetchOnce();
    // When the same browser/tab mutates the dataset, refetch to confirm.
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent<{ name: DatasetName }>).detail;
      if (detail?.name === name) void fetchOnce();
    };
    window.addEventListener(CHANNEL, onLocal);
    return () => window.removeEventListener(CHANNEL, onLocal);
  }, [name, fetchOnce]);

  const set = useCallback(
    async (next: T | ((current: T) => T)): Promise<boolean> => {
      const previous = value;
      const resolved = typeof next === "function" ? (next as (c: T) => T)(previous) : next;
      setValue(resolved); // optimistic
      const token = getAdminToken();
      if (!token) {
        setValue(previous);
        toast.error("Not authenticated.");
        return false;
      }
      try {
        await setDatasetFn({
          data: { name, value: resolved as unknown, token },
        });
        window.dispatchEvent(new CustomEvent(CHANNEL, { detail: { name } }));
        return true;
      } catch (err) {
        setValue(previous);
        const message = err instanceof Error ? err.message : "Save failed.";
        toast.error(`Could not save: ${message}`);
        return false;
      }
    },
    [name, value],
  );

  return { value, set, isLoading, refetch: fetchOnce };
}
