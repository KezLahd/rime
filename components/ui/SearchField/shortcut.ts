"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

/**
 * "⌘ K" on Apple platforms, "Ctrl K" elsewhere. The server snapshot is the
 * Ctrl form, so SSR and the first client render agree; Macs swap after
 * hydration without a mismatch warning.
 */
export function useShortcutLabel(key: string | undefined): string | null {
  const apple = useSyncExternalStore(subscribe, isApple, () => false);
  if (!key) return null;
  return `${apple ? "⌘" : "Ctrl"} ${key.toUpperCase()}`;
}

/**
 * Ctrl/⌘ + key anywhere on the page runs the handler. Ignored while a modal
 * dialog is open, so a shortcut can't pull focus out from behind a focus trap.
 */
export function useGlobalShortcut(key: string | undefined, handler: () => void): void {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    if (!key) return;
    const want = key.toLowerCase();
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== want) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      latest.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key]);
}
