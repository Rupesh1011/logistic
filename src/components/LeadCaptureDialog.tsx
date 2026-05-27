import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appendLead, type LeadContext, type LeadSource, setRevealState } from "@/lib/leads";
import { emailJsConfigured, sendLeadEmail } from "@/lib/emailjs";
import { Loader2 } from "lucide-react";

const MOBILE_RE = /^[+]?[0-9 ]{8,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "company" | "mobile" | "email" | "submit", string>>;

export type LeadCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: LeadSource; // defaults to "enquiry"
  context: LeadContext;
  title?: string;
  description?: string;
  onSuccess?: () => void;
};

export function LeadCaptureDialog({
  open,
  onOpenChange,
  source = "enquiry",
  context,
  title = "Unlock your final quote",
  description = "Share a few details and our branch team will reach out with the confirmed rate.",
  onSuccess,
}: LeadCaptureDialogProps) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    mobile: "",
    email: "",
    city: "",
    monthlyShipments: "",
    routes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (form.company.trim().length < 1) next.company = "Company is required.";
    if (!MOBILE_RE.test(form.mobile.trim())) next.mobile = "Enter a valid mobile number.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    setErrors((p) => ({ ...p, submit: undefined }));

    const leadData = {
      source,
      context,
      name: form.name.trim(),
      company: form.company.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      city: form.city.trim() || undefined,
      monthlyShipments: form.monthlyShipments.trim() || undefined,
      routes: form.routes.trim() || undefined,
    };

    try {
      if (emailJsConfigured) {
        await sendLeadEmail({
          ...leadData,
          context_surface: context.surface,
          context_payload: JSON.stringify(context.payload ?? {}),
        });
      }
      appendLead(leadData);
      setRevealState(true);
      if (emailJsConfigured) {
        toast.success("Lead submitted. We will reach out shortly.");
      } else {
        toast.warning("Saved locally. Email delivery is not configured yet.");
      }
      setSubmitting(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setSubmitting(false);
      setErrors((p) => ({
        ...p,
        submit: "Could not deliver your request. Please try again.",
      }));
      toast.error("Could not deliver your request. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 mt-1">
          <div className="grid gap-1.5">
            <Label
              htmlFor="lead-name"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Full Name *
            </Label>
            <Input
              id="lead-name"
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor="lead-company"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Company *
            </Label>
            <Input
              id="lead-company"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              aria-invalid={!!errors.company}
            />
            {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label
                htmlFor="lead-mobile"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Mobile *
              </Label>
              <Input
                id="lead-mobile"
                type="tel"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                aria-invalid={!!errors.mobile}
              />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="lead-email"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Email *
              </Label>
              <Input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label
                htmlFor="lead-city"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                City
              </Label>
              <Input
                id="lead-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="lead-monthly"
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Monthly Shipments
              </Label>
              <Input
                id="lead-monthly"
                value={form.monthlyShipments}
                onChange={(e) => set("monthlyShipments", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor="lead-routes"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Preferred Routes
            </Label>
            <Textarea
              id="lead-routes"
              rows={2}
              value={form.routes}
              onChange={(e) => set("routes", e.target.value)}
              placeholder="e.g. Vapi → Pune, Vapi → Raipur"
            />
          </div>
          {errors.submit && (
            <p className="text-sm text-destructive" role="alert">
              {errors.submit}
            </p>
          )}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" /> Submitting…
                </>
              ) : (
                "Unlock Final Quote"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
