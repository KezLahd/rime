"use client";

import { useEffect } from "react";

/**
 * Watches the page footer. When the footer enters the viewport (minus the
 * top-bar height), it sets `data-footer-visible` on <html>, which the CSS
 * uses to slide the sticky top bar up and out of view. Removes the attribute
 * when the footer leaves. Pure client-side, zero layout cost.
 */
export function FooterReveal() {
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.toggleAttribute(
          "data-footer-visible",
          entry.isIntersecting,
        );
      },
      // Subtract the top-bar height so the hide fires when the footer's top
      // edge reaches just below the bar, not when it hits the viewport top.
      { rootMargin: "-60px 0px 0px 0px", threshold: 0 },
    );
    io.observe(footer);

    return () => {
      io.disconnect();
      document.documentElement.removeAttribute("data-footer-visible");
    };
  }, []);

  return null;
}
