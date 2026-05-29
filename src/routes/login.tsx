import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearThrottle,
  isBlocked,
  readThrottle,
  recordFailure,
  useAdminAuth,
} from "@/hooks/use-admin-auth";
import { Loader2, ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin Login — Abhay Road Carrier" }] }),
  validateSearch: searchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAdminAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [throttle, setThrottle] = useState(() => readThrottle());

  // If already logged in, bounce to admin (or the requested redirect).
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      const target =
        search.redirect && search.redirect.startsWith("/admin") ? search.redirect : "/admin";
      navigate({ to: target as "/admin" });
    }
  }, [hydrated, isAuthenticated, navigate, search.redirect]);

  // Tick to refresh the blocked-until countdown.
  useEffect(() => {
    const t = setInterval(() => setThrottle(readThrottle()), 1000);
    return () => clearInterval(t);
  }, []);

  const blockState = isBlocked(throttle);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (blockState.blocked) {
      setError(`Too many failed attempts. Try again in ${blockState.minutes} minutes.`);
      return;
    }

    if (!email.trim() || password.length < 6) {
      setError("Invalid email or password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.ok) {
      clearThrottle();
      setThrottle(readThrottle());
      const target =
        search.redirect && search.redirect.startsWith("/admin") ? search.redirect : "/admin";
      navigate({ to: target as "/admin" });
      return;
    }

    if (result.reason === "config") {
      setError("Admin credentials are not configured. Check src/data/admin-credentials.json.");
      return;
    }
    if (result.reason === "timeout") {
      setError("Login timed out. Try again.");
      return;
    }

    const next = recordFailure();
    setThrottle(next);
    const blocked = isBlocked(next);
    if (blocked.blocked) {
      setError(`Too many failed attempts. Try again in ${blocked.minutes} minutes.`);
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 max-w-5xl">
        <div className="hidden md:block">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Admin Portal</p>
          <h1 className="font-display font-bold text-3xl mt-2 text-navy">Owner login.</h1>
          <p className="text-muted-foreground mt-3">
            This area is restricted to the site owner. Manage rates, branches, delivery stories, and
            review captured leads.
          </p>
          <div className="mt-8 rounded-xl bg-navy text-navy-foreground p-6 text-sm">
            <ShieldCheck className="size-5 text-accent" />
            <p className="mt-3 text-white/80">
              Authentication runs entirely in your browser. No backend, no third party, no cost.
            </p>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-xl p-6 md:p-8 grid gap-4 self-start"
          noValidate
        >
          <h2 className="font-display font-bold text-xl">Admin Login</h2>
          <div className="grid gap-1.5">
            <Label htmlFor="login-email" className="text-xs uppercase">
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="login-password" className="text-xs uppercase">
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {blockState.blocked && (
            <p className="text-xs text-muted-foreground">
              Too many failed attempts. Try again in {blockState.minutes} minutes.
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting || blockState.blocked}
            className="bg-navy text-navy-foreground hover:bg-navy/90"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" /> Verifying…
              </>
            ) : (
              "Login"
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Default credentials are documented in{" "}
            <span className="font-mono">src/data/admin-credentials.json</span>.
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
