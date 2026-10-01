import type { ReactNode } from "react";

// Presentational only. Access is decided in each page.tsx (requireAal2):
// a gate here would leak the page into the RSC payload.
export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
