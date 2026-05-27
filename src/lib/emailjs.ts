// Thin wrapper around the EmailJS browser SDK with lazy import so the public
// site doesn't pay the SDK cost up front.

const SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "").trim();
const TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "").trim();
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "").trim();

export const emailJsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

const TIMEOUT_MS = 15_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("EmailJS request timed out")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function sendLeadEmail(payload: Record<string, unknown>): Promise<void> {
  if (!emailJsConfigured) {
    throw new Error("EmailJS environment variables are not configured.");
  }
  const { default: emailjs } = await import("@emailjs/browser");
  await withTimeout(emailjs.send(SERVICE_ID, TEMPLATE_ID, payload, PUBLIC_KEY), TIMEOUT_MS);
}
