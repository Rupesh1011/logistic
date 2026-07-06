// WhatsApp deep-link helper. wa.me opens the chat with the message
// pre-filled in the input box; WhatsApp's own UX requires the user to
// tap "send" — third-party auto-send is intentionally not allowed.

// Primary contact number for the floating button and footer.
const PRIMARY_NUMBER = "919033012792"; // +91 90330 12792

function normalizeNumber(input: string): string {
  // Strip everything that isn't a digit. wa.me wants digits only, no `+`.
  const digits = input.replace(/\D/g, "");
  if (!digits) return PRIMARY_NUMBER;
  // If it looks like an Indian 10-digit number, prefix the country code.
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function getDefaultWhatsAppNumber(): string {
  const env = (import.meta.env.VITE_CONTACT_WHATSAPP_NUMBER ?? "").trim();
  return normalizeNumber(env || PRIMARY_NUMBER);
}

export function buildWhatsAppLink(number: string, message: string): string {
  const n = normalizeNumber(number);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${encoded}`;
}

const DEFAULT_MESSAGE =
  "Hi, I'd like to enquire about logistics service for our company. Could you please share more details?";

/** Convenience for the per-branch CTAs — always routes to the primary number. */
export function buildBranchWhatsAppLink(opts: { branchCity: string }): string {
  const message = `Hi, I'd like to enquire about logistics service for our company from your ${opts.branchCity} branch. Could you please share more details?`;
  return buildWhatsAppLink(PRIMARY_NUMBER, message);
}

/** Default enquiry link — used by the floating button and footer. */
export function buildDefaultWhatsAppLink(): string {
  return buildWhatsAppLink(PRIMARY_NUMBER, DEFAULT_MESSAGE);
}
