"use client";

import { useEffect } from "react";

/**
 * Prevents clicks on internal links inside a block preview from navigating
 * the iframe to routes that do not exist on the docs site (/projects,
 * /invoices, etc.). External links and anything with target="_blank" still
 * work normally. In-page anchors (href starting with "#") also still work.
 */
export function PreviewClickGuard() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Skip if a modifier is held — browsers already treat those as "open
      // elsewhere" and we should let them.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Leave real external and new-tab navigations alone.
      if (/^(https?:)?\/\//.test(href)) return;
      if (anchor.getAttribute("target") === "_blank") return;
      // In-page hash jumps are fine inside the preview.
      if (href.startsWith("#")) return;
      e.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
