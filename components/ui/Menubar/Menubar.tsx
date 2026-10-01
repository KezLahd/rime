"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { focusMenuItem, MenuList, type MenuListEntry } from "../ContextMenu/menu-list";
import { useDismiss, useFloatingPlacement } from "../Popover/floating";
import styles from "./Menubar.module.css";

export type MenubarMenu = {
  id: string;
  label: string;
  /** The menu: actions, separators ({ id, separator: true }) and headings ({ id, heading }). */
  items: ReadonlyArray<MenuListEntry>;
};

export type MenubarProps = {
  menus: ReadonlyArray<MenubarMenu>;
  /** The bar's accessible name, e.g. "Editor". */
  "aria-label": string;
  /**
   * Render one menu open in the page flow under its trigger (docs, previews).
   * Nothing is interactive and no listeners are attached.
   */
  inline?: boolean;
  /** Inline only: which menu is drawn open (default the first) and which item is highlighted. */
  inlineOpenId?: string;
  inlineHighlightId?: string;
  className?: string;
};

/**
 * A desktop application menu bar (File, Edit, View), per the WAI-ARIA
 * menubar pattern. One tab stop: Left and Right move across the bar, Down,
 * Enter or Space open a menu at its first item, Up at its last. While a menu
 * is open, Left and Right move to the neighbouring menu and open it, and
 * hovering another title switches to it. Esc closes and returns focus to the
 * title; Tab closes and moves on.
 */
export function Menubar({ menus, "aria-label": ariaLabel, inline, inlineOpenId, inlineHighlightId, className }: MenubarProps) {
  const id = useId();
  const [focusIndex, setFocusIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openAt, setOpenAt] = useState<"first" | "last">("first");
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const anchorRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [inlineOffset, setInlineOffset] = useState(0);

  const inlineIndex = Math.max(0, menus.findIndex((m) => m.id === inlineOpenId));
  const shownIndex = inline ? inlineIndex : openIndex;

  // Point the placement at the open title before it measures.
  useLayoutEffect(() => {
    anchorRef.current = openIndex !== null ? (triggerRefs.current[openIndex] ?? null) : null;
  }, [openIndex]);
  useFloatingPlacement(openIndex !== null, anchorRef, menuRef, { offset: 6, enabled: !inline });
  useDismiss(openIndex !== null, [barRef, menuRef], () => setOpenIndex(null), !inline);

  // Inline: line the open menu up under its title.
  useLayoutEffect(() => {
    if (!inline) return;
    const t = triggerRefs.current[inlineIndex];
    if (t) setInlineOffset(t.offsetLeft);
  }, [inline, inlineIndex]);

  // Open at the requested end.
  useEffect(() => {
    if (openIndex === null || inline) return;
    const frame = requestAnimationFrame(() => focusMenuItem(menuRef.current, openAt === "first" ? 0 : -1));
    return () => cancelAnimationFrame(frame);
  }, [openIndex, openAt, inline]);

  const focusTrigger = (i: number) => {
    const n = (i + menus.length) % menus.length;
    setFocusIndex(n);
    triggerRefs.current[n]?.focus();
    return n;
  };

  const open = (i: number, at: "first" | "last" = "first") => {
    setOpenAt(at);
    setOpenIndex(i);
    setFocusIndex(i);
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTrigger(i + 1);
        return;
      case "ArrowLeft":
        e.preventDefault();
        focusTrigger(i - 1);
        return;
      case "Home":
        e.preventDefault();
        focusTrigger(0);
        return;
      case "End":
        e.preventDefault();
        focusTrigger(-1);
        return;
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        open(i, "first");
        return;
      case "ArrowUp":
        e.preventDefault();
        open(i, "last");
        return;
    }
  };

  // Left and Right inside an open menu move to the neighbouring menu.
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (openIndex === null) return false;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return false;
    e.preventDefault();
    const n = (openIndex + (e.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length;
    open(n, "first");
    return true;
  };

  const closeMenu = (reason: "select" | "escape" | "tab") => {
    const i = openIndex;
    setOpenIndex(null);
    if (reason !== "tab" && i !== null) triggerRefs.current[i]?.focus();
  };

  const shown = shownIndex !== null ? menus[shownIndex] : null;

  return (
    <div data-slot="menubar" className={cx(styles.wrap, className)}>
      <div ref={barRef} role="menubar" aria-label={ariaLabel} aria-orientation="horizontal" className={styles.bar}>
        {menus.map((m, i) => {
          const isOpen = shownIndex === i;
          return (
            <button
              key={m.id}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              id={`${id}-t${i}`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? `${id}-m` : undefined}
              tabIndex={inline ? -1 : i === focusIndex ? 0 : -1}
              className={cx(styles.trigger, isOpen && styles.triggerOpen)}
              onClick={() => {
                if (inline) return;
                if (openIndex === i) setOpenIndex(null);
                else open(i);
              }}
              onPointerEnter={() => {
                if (!inline && openIndex !== null && openIndex !== i) open(i);
              }}
              onKeyDown={(e) => !inline && onTriggerKey(e, i)}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {shown && inline ? (
        <MenuList
          id={`${id}-m`}
          entries={shown.items}
          labelledBy={`${id}-t${shownIndex}`}
          onClose={() => {}}
          inert
          highlightId={inlineHighlightId}
          className={styles.inlineMenu}
          style={{ marginLeft: inlineOffset }}
        />
      ) : null}
      {shown && !inline ? (
        <Portal>
          <MenuList
            key={shown.id}
            ref={menuRef}
            id={`${id}-m`}
            entries={shown.items}
            labelledBy={`${id}-t${shownIndex}`}
            onClose={closeMenu}
            onKeyExtra={onMenuKey}
            className={styles.floating}
          />
        </Portal>
      ) : null}
    </div>
  );
}
