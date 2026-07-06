import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/freight-rates", label: "Freight Rates" },
  { to: "/branches", label: "Branches" },
  { to: "/deliveries", label: "Deliveries" },
  { to: "/industries", label: "Industries" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 flex items-center h-16 gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-bold text-navy text-lg shrink-0"
        >
          <LogoMark className="shrink-0" />
          Abhay Road Carrier
        </Link>        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-navy transition-colors"
              activeProps={{ className: "text-navy" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/get-quote" className="hidden sm:block">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Get Quote
              </Button>
            </Link>
          )}
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-3 grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-navy"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/get-quote" onClick={() => setOpen(false)} className="flex-1">
                <Button size="sm" className="w-full bg-accent text-accent-foreground">
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Shows the ARC logo if public/arc-logo.png exists, otherwise the Truck icon.
// Logo has a black background so we display it without any extra container padding.
function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={`h-12 w-auto rounded-md overflow-hidden flex items-center ${className ?? ""}`}
    >
      <img
        src="/arc-logo.png"
        alt="ARC"
        className="h-12 w-auto object-contain"
        onError={(e) => {
          const parent = (e.currentTarget as HTMLImageElement).parentElement;
          if (!parent) return;
          parent.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#1e3a5f"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>';
        }}
      />
    </span>
  );
}
