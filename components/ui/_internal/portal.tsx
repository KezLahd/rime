"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/** True after hydration. The server snapshot is false, so portals never
    render during SSR and there is no hydration mismatch. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Renders into document.body. Every popup goes through here: backdrop-filter
 * on a glass panel creates a containing block for position:fixed, so a
 * dropdown left inside the panel is clipped by it instead of the viewport.
 *
 * Portalled content leaves any data-theme scope. The presets still reach it
 * because tokens.css also matches :root:has([data-theme="flat"]) (and dark),
 * which lifts the preset onto <html> while a themed subtree is mounted. No
 * attribute copying is needed here.
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(children, document.body);
}
