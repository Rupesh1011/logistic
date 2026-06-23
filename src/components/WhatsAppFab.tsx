import { MessageCircle } from "lucide-react";
import { buildDefaultWhatsAppLink } from "@/lib/whatsapp";

const DEFAULT_MESSAGE =
  "Hi, I'd like to enquire about logistics service for our company. Could you please share more details?";

/**
 * Bottom-right WhatsApp button shown on every page. Pre-fills a friendly
 * enquiry message — the visitor still has to tap WhatsApp's send button
 * (third-party auto-send is intentionally blocked by WhatsApp).
 */
export function WhatsAppFab() {
  void DEFAULT_MESSAGE; // used in buildDefaultWhatsAppLink internally
  const href = buildDefaultWhatsAppLink();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-lg shadow-[#25D366]/30 hover:bg-[#1ebe5d] transition-colors"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline text-sm font-semibold">Chat on WhatsApp</span>
    </a>
  );
}
