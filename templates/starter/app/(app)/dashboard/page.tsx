import type { Metadata } from "next";
import Dashboard from "@/components/blocks/dashboard";
import { requireAal2 } from "@/lib/auth/gate";

export const metadata: Metadata = { title: "Dashboard" };

// The Rime dashboard block (npx shadcn@latest add <owner>/rime/dashboard),
// behind the MFA gate. Replace its sample data with your own queries.
export default async function DashboardPage() {
  await requireAal2();
  return <Dashboard />;
}
