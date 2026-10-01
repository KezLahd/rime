import type { Tone } from "@/components/ui/Badge/Badge";

// Neutral sample data for the docs specimens and the Rime Studio preview.
// Nothing here is real: invoices, projects and people are made up.

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type Invoice = {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  /** ISO date. */
  issuedAt: string;
  status: InvoiceStatus;
};

export const invoiceStatusMeta: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "warning" },
  void: { label: "Void", tone: "danger" },
};

export const invoices: Invoice[] = [
  { id: "i1", reference: "INV-1042", customer: "Jane Cooper", amount: 1280, issuedAt: "2026-09-29", status: "paid" },
  { id: "i2", reference: "INV-1041", customer: "Wade Warren", amount: 640, issuedAt: "2026-09-27", status: "sent" },
  { id: "i3", reference: "INV-1040", customer: "Esther Howard", amount: 2150, issuedAt: "2026-09-24", status: "overdue" },
  { id: "i4", reference: "INV-1039", customer: "Cameron Williamson", amount: 395, issuedAt: "2026-09-22", status: "paid" },
  { id: "i5", reference: "INV-1038", customer: "Brooklyn Simmons", amount: 980, issuedAt: "2026-09-19", status: "draft" },
  { id: "i6", reference: "INV-1037", customer: "Leslie Alexander", amount: 1720, issuedAt: "2026-09-16", status: "paid" },
  { id: "i7", reference: "INV-1036", customer: "Jenny Wilson", amount: 260, issuedAt: "2026-09-12", status: "void" },
  { id: "i8", reference: "INV-1035", customer: "Guy Hawkins", amount: 1340, issuedAt: "2026-09-09", status: "sent" },
  { id: "i9", reference: "INV-1034", customer: "Robert Fox", amount: 875, issuedAt: "2026-09-05", status: "paid" },
  { id: "i10", reference: "INV-1033", customer: "Kristin Watson", amount: 1990, issuedAt: "2026-09-02", status: "overdue" },
  { id: "i11", reference: "INV-1032", customer: "Courtney Henry", amount: 450, issuedAt: "2026-08-29", status: "paid" },
];

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const TOPICS = [
  { value: "billing", label: "Billing and invoices" },
  { value: "access", label: "Account access" },
  { value: "delivery", label: "Delivery details" },
  { value: "other", label: "Something else" },
];

export const PROJECTS = [
  { value: "atlas", label: "Atlas redesign", group: "Design", keywords: ["website"] },
  { value: "beacon", label: "Beacon onboarding", group: "Design" },
  { value: "cobalt", label: "Cobalt billing API", group: "Engineering" },
  { value: "delta", label: "Delta data migration", group: "Engineering" },
  { value: "ember", label: "Ember mobile app", group: "Engineering" },
  { value: "fjord", label: "Fjord analytics", group: "Research" },
  { value: "granite", label: "Granite pricing study", group: "Research", description: "Starts next quarter", disabled: true },
];

export const PEOPLE = ["Jane Cooper", "Wade Warren", "Esther Howard", "Cameron Williamson", "Brooklyn Simmons"];
