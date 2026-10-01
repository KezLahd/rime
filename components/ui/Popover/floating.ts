"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { placePopup } from "../_internal/position";

// Shared helpers for the floating overlays (Popover, HoverCard, Menubar):
// keep a portalled panel placed against its anchor while it is open, and
// close it on Esc or a press outside both.

export type FloatSide = "bottom" | "top";
export type FloatAlign = "start" | "center" | "end";

/** Places `popup` against `anchor` on open, then on every scroll and resize. */
export function useFloatingPlacement(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  popupRef: RefObject<HTMLElement | null>,
  opts: { side?: FloatSide; align?: FloatAlign; offset?: number; enabled?: boolean } = {},
) {
  const { side = "bottom", align = "start", offset = 8, enabled = true } = opts;
  useLayoutEffect(() => {
    if (!open || !enabled) return;
    const place = () => {
      const a = anchorRef.current;
      const p = popupRef.current;
      if (a && p) placePopup(a, p, { side, align, offset });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, enabled, side, align, offset, anchorRef, popupRef]);
}

/** Esc and a pointer press outside every given element call onDismiss. */
export function useDismiss(
  open: boolean,
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  onDismiss: (reason: "escape" | "outside") => void,
  enabled = true,
) {
  useEffect(() => {
    if (!open || !enabled) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && refs.some((r) => r.current?.contains(t))) return;
      onDismiss("outside");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onDismiss("escape");
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
    // refs are stable ref objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enabled, onDismiss]);
}

/** Controlled or uncontrolled open state, the shadcn way. */
export function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  const [inner, setInner] = useState(Boolean(defaultOpen));
  const value = open ?? inner;
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return [value, set] as const;
}
