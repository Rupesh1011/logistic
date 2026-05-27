import { useCallback, useEffect, useState } from "react";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import adminCredsJson from "@/data/admin-credentials.json";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

type AdminSession = { email: string; expiresAt: number } | null;

type AdminCreds = { email: string; passwordHash: string };

function readCreds(): AdminCreds | null {
  const envEmail = (import.meta.env.VITE_ADMIN_EMAIL ?? "").trim();
  const envHash = (import.meta.env.VITE_ADMIN_PASSWORD_HASH ?? "").trim();
  if (envEmail && envHash) return { email: envEmail, passwordHash: envHash };
  const fileEmail = (adminCredsJson.email ?? "").trim();
  const fileHash = (adminCredsJson.passwordHash ?? "").trim();
  if (fileEmail && fileHash) return { email: fileEmail, passwordHash: fileHash };
  return null;
}

/**
 * Token sent with admin write requests. Same value the server expects in
 * VITE_ADMIN_PASSWORD_HASH / ADMIN_PASSWORD_HASH. Already in the client bundle
 * for the bcrypt comparison, so exposing it here doesn't widen the trust
 * boundary — it just lets us reject writes from untouched/anonymous browsers.
 */
export function getAdminToken(): string {
  return readCreds()?.passwordHash ?? "";
}

function constantTimeEqual(a: string, b: string): boolean {
  const la = a.length;
  const lb = b.length;
  let diff = la ^ lb;
  const max = Math.max(la, lb);
  for (let i = 0; i < max; i++) {
    const ca = i < la ? a.charCodeAt(i) : 0;
    const cb = i < lb ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

function readSession(): AdminSession {
  const s = storage.get<AdminSession>(STORAGE_KEYS.adminSession, null);
  if (!s || typeof s.email !== "string" || typeof s.expiresAt !== "number") {
    storage.remove(STORAGE_KEYS.adminSession);
    return null;
  }
  if (Date.now() > s.expiresAt) {
    storage.remove(STORAGE_KEYS.adminSession);
    return null;
  }
  return s;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "throttled" | "config" | "timeout" };

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.adminSession) setSession(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const creds = readCreds();
    if (!creds) return { ok: false, reason: "config" };

    const trimmedEmail = email.trim().toLowerCase();
    const expectedEmail = creds.email.trim().toLowerCase();

    let bcrypt: { compare: (a: string, b: string) => Promise<boolean> };
    try {
      const mod = (await import("bcryptjs")) as unknown as
        | { default: { compare: (a: string, b: string) => Promise<boolean> } }
        | { compare: (a: string, b: string) => Promise<boolean> };
      bcrypt = "default" in mod ? mod.default : mod;
    } catch {
      return { ok: false, reason: "config" };
    }

    const compareWithTimeout = (): Promise<boolean> =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("timeout")), 5000);
        Promise.resolve(bcrypt.compare(password, creds.passwordHash)).then(
          (v) => {
            clearTimeout(t);
            resolve(Boolean(v));
          },
          () => {
            clearTimeout(t);
            resolve(false);
          },
        );
      });

    let pwOk = false;
    try {
      pwOk = await compareWithTimeout();
    } catch {
      return { ok: false, reason: "timeout" };
    }
    const emailOk = constantTimeEqual(trimmedEmail, expectedEmail);

    if (!pwOk || !emailOk) return { ok: false, reason: "invalid" };

    const next: AdminSession = { email: expectedEmail, expiresAt: Date.now() + SESSION_TTL_MS };
    storage.set(STORAGE_KEYS.adminSession, next);
    setSession(next);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.adminSession);
    setSession(null);
  }, []);

  return {
    admin: session?.email ?? null,
    expiresAt: session?.expiresAt ?? null,
    isAuthenticated: !!session,
    hydrated,
    login,
    logout,
  };
}

// Login throttle helpers — exported so the login route can use them.
export type ThrottleState = {
  failures: number;
  blockedUntil: number | null;
  windowStart: number | null;
};

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function readThrottle(): ThrottleState {
  const s = storage.get<ThrottleState>(STORAGE_KEYS.loginThrottle, {
    failures: 0,
    blockedUntil: null,
    windowStart: null,
  });
  if (!s || typeof s.failures !== "number") {
    return { failures: 0, blockedUntil: null, windowStart: null };
  }
  return s;
}

export function isBlocked(state: ThrottleState): { blocked: boolean; minutes: number } {
  if (!state.blockedUntil) return { blocked: false, minutes: 0 };
  const remaining = state.blockedUntil - Date.now();
  if (remaining <= 0) return { blocked: false, minutes: 0 };
  return { blocked: true, minutes: Math.max(1, Math.ceil(remaining / 60_000)) };
}

export function recordFailure(): ThrottleState {
  const now = Date.now();
  const cur = readThrottle();
  let windowStart = cur.windowStart;
  let failures = cur.failures;
  if (windowStart === null || now - windowStart >= WINDOW_MS) {
    windowStart = now;
    failures = 1;
  } else {
    failures += 1;
  }
  const blockedUntil = failures >= MAX_FAILURES ? now + BLOCK_MS : cur.blockedUntil;
  const next: ThrottleState = { failures, windowStart, blockedUntil };
  storage.set(STORAGE_KEYS.loginThrottle, next);
  return next;
}

export function clearThrottle(): void {
  storage.set(STORAGE_KEYS.loginThrottle, {
    failures: 0,
    blockedUntil: null,
    windowStart: null,
  });
}
