"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import styles from "./ContextMenu.module.css";
import { MenuList, type MenuListEntry } from "./menu-list";

export type { MenuListAction as ContextMenuAction, MenuListEntry as ContextMenuEntry } from "./menu-list";

export type ContextMenuProps = {
  /** The region that answers a right-click: a row, a card, a canvas. */
  children: ReactNode;
  /** The menu: actions, separators ({ id, separator: true }) and headings ({ id, heading }). */
  items: ReadonlyArray<MenuListEntry>;
  /** The menu's accessible name, e.g. "Actions for Invoice INV-0042". */
  label: string;
  /** ms a touch must be held to open it on phones and tablets. */
  longPressMs?: number;
  /**
   * Render the menu open in the page flow, over the region (docs, previews).
   * Nothing is interactive and no listeners are attached.
   */
  inline?: boolean;
  /** Inline only: the item drawn in its hover state. */
  highlightId?: string;
  className?: string;
};

/**
 * A menu of actions for a region, opened where the pointer is with a
 * right-click, with Shift+F10 or the Menu key while the region has focus, or
 * with a long press on touch. Focus moves to the first item; arrows, Home,
 * End and typeahead move; Enter runs; Esc or Tab closes and returns focus to
 * the region. Every action must also be reachable some other way: a context
 * menu is a shortcut, never the only route.
 */
export function ContextMenu({ children, items, label, longPressMs = 500, inline, highlightId, className }: ContextMenuProps) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const press = useRef(0);
  const id = useId();

  const close = (reason: "select" | "escape" | "tab" | "outside") => {
    setAt(null);
    if (reason === "escape" || reason === "select") regionRef.current?.focus();
  };

  // Keep the menu inside the viewport once it has a size.
  useLayoutEffect(() => {
    const m = menuRef.current;
    if (!at || !m) return;
    const r = m.getBoundingClientRect();
    const x = Math.max(8, Math.min(at.x, window.innerWidth - r.width - 8));
    const y = Math.max(8, Math.min(at.y, window.innerHeight - r.height - 8));
    m.style.left = `${x}px`;
    m.style.top = `${y}px`;
  }, [at]);

  useEffect(() => {
    if (!at) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      close("outside");
    };
    const onScroll = () => close("outside");
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [at]);

  if (inline) {
    return (
      <div className={cx(styles.inlineStage, className)}>
        <div className={styles.region} aria-hidden="true">
          {children}
        </div>
        <MenuList entries={items} label={label} onClose={() => {}} inert highlightId={highlightId} className={styles.inlineMenu} />
      </div>
    );
  }

  const openAt = (x: number, y: number) => setAt({ x, y });

  return (
    <>
      <div data-slot="context-menu"
        ref={regionRef}
        className={cx(styles.region, styles.live, className)}
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={Boolean(at)}
        aria-controls={at ? id : undefined}
        aria-description="Right-click or press Shift F10 for actions"
        onContextMenu={(e: MouseEvent<HTMLDivElement>) => {
          e.preventDefault();
          openAt(e.clientX, e.clientY);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
            e.preventDefault();
            const r = e.currentTarget.getBoundingClientRect();
            openAt(r.left + 16, r.top + 16);
          }
        }}
        onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
          if (e.pointerType !== "touch") return;
          const { clientX, clientY } = e;
          press.current = window.setTimeout(() => openAt(clientX, clientY), longPressMs);
        }}
        onPointerUp={() => window.clearTimeout(press.current)}
        onPointerCancel={() => window.clearTimeout(press.current)}
        onPointerMove={() => window.clearTimeout(press.current)}
      >
        {children}
      </div>
      {at ? (
        <Portal>
          <MenuList
            ref={menuRef}
            id={id}
            entries={items}
            label={label}
            autoFocus
            onClose={close}
            className={styles.floating}
            style={{ left: at.x, top: at.y }}
          />
        </Portal>
      ) : null}
    </>
  );
}
