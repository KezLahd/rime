"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { focusableWithin } from "../_internal/position";
import { useScrollLock } from "../Scroll/scroll-lock";

// Shared behaviour for the modal overlays added here (AlertDialog, Sheet,
// Drawer, CommandDialog): presence for the exit animation, focus moved in
// and returned, Tab trapped, Esc, and page scroll locked.

/** Keeps the overlay mounted for `ms` after open turns false, so it can animate out. */
export function usePresence(open: boolean, ms = 200): boolean {
  const [present, setPresent] = useState(open);
  const [prev, setPrev] = useState(open);
  if (open !== prev) {
    setPrev(open);
    if (open) setPresent(true);
  }
  useEffect(() => {
    if (open || !present) return;
    const t = window.setTimeout(() => setPresent(false), ms);
    return () => window.clearTimeout(t);
  }, [open, present, ms]);
  return present;
}

export function useDialogBehaviour({
  open,
  panelRef,
  onEscape,
  initialFocus,
  enabled = true,
}: {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
  /** Focused on open; defaults to the first focusable element, else the panel. */
  initialFocus?: RefObject<HTMLElement | null>;
  enabled?: boolean;
}) {
  const returnTo = useRef<HTMLElement | null>(null);
  useScrollLock(open && enabled);

  useEffect(() => {
    if (!open || !enabled) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const p = panelRef.current;
      if (!p) return;
      (initialFocus?.current ?? focusableWithin(p)[0] ?? p).focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      const back = returnTo.current;
      if (back && document.contains(back)) back.focus();
    };
    // initialFocus is a stable ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enabled]);

  /** Put on the panel: Esc and the Tab trap. */
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!enabled) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== "Tab") return;
    const p = panelRef.current;
    if (!p) return;
    const list = focusableWithin(p);
    if (!list.length) {
      e.preventDefault();
      p.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === p)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return { onKeyDown };
}
