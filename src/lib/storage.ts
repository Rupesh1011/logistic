// Tiny safe-localStorage wrapper. Returns null on SSR or any access error
// so callers don't need try/catch ladders.

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
  getRaw(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setRaw(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* noop */
    }
  },
};

export const STORAGE_KEYS = {
  reveal: "trinetra_lead_revealed",
  leads: "trinetra_leads",
  legacyQuotes: "trinetra_quotes",
  legacyUser: "trinetra_user",
  legacyAdmin: "trinetra_admin",
  legacySaved: "trinetra_saved_routes",
  adminSession: "trinetra_admin_session",
  loginThrottle: "trinetra_login_throttle",
} as const;
