import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { buildDefaultWhatsAppLink } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground mt-20">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="h-14 w-auto rounded-xl overflow-hidden flex items-center bg-white p-0.5">
              <img
                src="/arc-logo.png"
                alt="ARC"
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </span>
            Abhay Road Carrier
          </div>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Reliable B2B road logistics from Vapi to industrial India. 18+ years of branch-led
            operations, transparent freight, on-time delivery.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/50">
            GST · 24AARPU0311R1Z7
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link to="/freight-rates" className="hover:text-accent">
                Freight Rate Dashboard
              </Link>
            </li>
            <li>
              <Link to="/deliveries" className="hover:text-accent">
                Delivery Success
              </Link>
            </li>
            <li>
              <Link to="/get-quote" className="hover:text-accent">
                Get Transport Quote
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link to="/about" className="hover:text-accent">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/branches" className="hover:text-accent">
                Branch Network
              </Link>
            </li>
            <li>
              <Link to="/industries" className="hover:text-accent">
                Industries Served
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Head Office</h4>
          <p className="text-sm text-white/70 leading-relaxed">
            Plot no.10, Param Industrial Hub,
            <br />
            opposite Evershine Industrial Park,
            <br />
            Karvad Road, Karvad, Vapi 396193
            <br />
            {/* Primary number first */}
            <a href="tel:+919033012792" className="hover:text-accent font-semibold">
              +91 90330 12792
            </a>
            <br />
            <a href="tel:+919429008362" className="hover:text-accent">
              +91 94290-08362
            </a>
            <br />
            <a href="mailto:business@abhayroadcarrier.in" className="hover:text-accent">
              business@abhayroadcarrier.in
            </a>
          </p>
          <a
            href={buildDefaultWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D366] hover:text-white"
          >
            <MessageCircle className="size-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Abhay Road Carrier. All rights reserved.</p>
          <p>Vapi · Raipur · Pune · Bhiwandi</p>
        </div>
      </div>
    </footer>
  );
}
