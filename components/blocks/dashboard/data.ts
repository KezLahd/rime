// Sample data for the dashboard block. Made up; replace with your own.

export type Range = "7d" | "30d" | "90d";

export type Invoice = {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  issuedAt: string;
  status: "draft" | "sent" | "paid" | "overdue";
};

const DAY = 86_400_000;
const END = Date.UTC(2026, 8, 30);

/** 90 days of orders, online and in store, with a gentle weekly rhythm. */
export const DAILY = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(END - (89 - i) * DAY).toISOString().slice(0, 10);
  const weekday = new Date(date).getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 0.7 : 1;
  const online = Math.round((140 + i * 1.4 + 22 * Math.sin(i / 4)) * weekend);
  const store = Math.round((90 + i * 0.6 + 14 * Math.cos(i / 5)) * weekend);
  return { date, online, store };
});

export const rangeDays: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

export const INVOICES: Invoice[] = [
  { id: "1", reference: "INV-1042", customer: "Jane Cooper", amount: 1280, issuedAt: "2026-09-29", status: "paid" },
  { id: "2", reference: "INV-1041", customer: "Wade Warren", amount: 640, issuedAt: "2026-09-27", status: "sent" },
  { id: "3", reference: "INV-1040", customer: "Esther Howard", amount: 2150, issuedAt: "2026-09-24", status: "overdue" },
  { id: "4", reference: "INV-1039", customer: "Cameron Williamson", amount: 395, issuedAt: "2026-09-22", status: "paid" },
  { id: "5", reference: "INV-1038", customer: "Brooklyn Simmons", amount: 980, issuedAt: "2026-09-19", status: "draft" },
  { id: "6", reference: "INV-1037", customer: "Leslie Alexander", amount: 1720, issuedAt: "2026-09-16", status: "paid" },
  { id: "7", reference: "INV-1036", customer: "Jenny Wilson", amount: 260, issuedAt: "2026-09-12", status: "sent" },
  { id: "8", reference: "INV-1035", customer: "Guy Hawkins", amount: 1340, issuedAt: "2026-09-09", status: "paid" },
  { id: "9", reference: "INV-1034", customer: "Robert Fox", amount: 875, issuedAt: "2026-09-05", status: "overdue" },
  { id: "10", reference: "INV-1033", customer: "Kristin Watson", amount: 1990, issuedAt: "2026-09-02", status: "paid" },
];

export const STATUS = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "warning" },
} as const;

export const money = (n: number) => new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
