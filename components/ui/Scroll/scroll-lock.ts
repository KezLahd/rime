"use client";

import { useEffect } from "react";

// ── Scroll lock ──────────────────────────────────────────────────────────
// Lifted out of Modal so drawers, sheets and any future overlay share one
// counter: nested or back-to-back overlays must not unlock early. The
// scrollbar's width is paid back as body padding, so the page never shifts
// sideways when it disappears.

let lockCount = 0;
let savedOverflow = "";
let savedPadding = "";

export function lockScroll() {
  if (lockCount++ > 0) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  savedOverflow = document.body.style.overflow;
  savedPadding = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
}

export function unlockScroll() {
  if (--lockCount > 0) return;
  lockCount = 0;
  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPadding;
}

/**
 * Locks page scroll while `active` (default: for the whole mount). Modal
 * holds it through its exit animation, so the scrollbar does not come back
 * under a panel that is still fading.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
