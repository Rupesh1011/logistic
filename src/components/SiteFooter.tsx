import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground mt-20">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="size-9 rounded-md bg-accent text-accent-foreground grid place-items-center">
              <Truck className="size-5" />
            </span>
            Trinetra Logistics
          </div>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Reliable 3PL road logistics from Vapi to industrial India. Branch-led operations,
            transparent freight, on-time delivery.
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
            Plot 12, GIDC Industrial Estate,
            <br />
            Vapi, Gujarat 396195
            <br />
            <a href="tel:+919800000001" className="hover:text-accent">
              +91 98XXXXXX01
            </a>
            <br />
            <a href="mailto:vapi@trinetralogistics.in" className="hover:text-accent">
              vapi@trinetralogistics.in
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Trinetra Logistics Pvt. Ltd. All rights reserved.</p>
          <p>Vapi · Raipur · Pune · Bhiwandi</p>
        </div>
      </div>
    </footer>
  );
}
