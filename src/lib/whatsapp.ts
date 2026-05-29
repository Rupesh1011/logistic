// WhatsApp deep-link helper. wa.me opens the chat with the message
// pre-filled in the input box; WhatsApp's own UX requires the user to
// tap "send" — third-party auto-send is intentionally not allowed.

const FALLBACK_NUMBER = "918094225674"; // 91 = India country code

function normalizeNumber(input: string): string {
  // Strip everything that isn't a digit. wa.me wants digits only, no `+`.
  const digits = input.replace(/\D/g, "");
  if (!digits) return FALLBACK_NUMBER;
  // If it looks like an Indian 10-digit number, prefix the country code.
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function getDefaultWhatsAppNumber(): string {
  const env = (import.meta.env.VITE_CONTACT_WHATSAPP_NUMBER ?? "").trim();
  return normalizeNumber(env || FALLBACK_NUMBER);
}

export function buildWhatsAppLink(number: string, message: string): string {
  const n = normalizeNumber(number);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${encoded}`;
}

/** Convenience for the per-branch CTAs. */
export function buildBranchWhatsAppLink(opts: {
  branchPhone?: string;
  branchCity: string;
}): string {
  const number = opts.branchPhone ? normalizeNumber(opts.branchPhone) : getDefaultWhatsAppNumber();
  const message = `Hi, I'd like to enquire about logistics services from your ${opts.branchCity} branch.`;
  return buildWhatsAppLink(number, message);
}
