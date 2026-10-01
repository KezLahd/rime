"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronDown } from "../Icon/Icon";
import styles from "./NavigationMenu.module.css";

export type NavigationMenuLink = {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
};

export type NavigationMenuItem = {
  id: string;
  label: ReactNode;
  /** A plain top-level link. */
  href?: string;
  /** A dropdown panel of links. */
  links?: ReadonlyArray<NavigationMenuLink>;
  /** An optional feature block at the start of the panel (a highlighted card). */
  feature?: ReactNode;
  /** Panel columns. Default 2 when there are 4 or more links, else 1. */
  columns?: 1 | 2 | 3;
};

export type NavigationMenuProps = {
  items: ReadonlyArray<NavigationMenuItem>;
  "aria-label"?: string;
  /** The panel open on first render, by item id. */
  defaultValue?: string | null;
  /**
   * Renders the open panel in normal flow under the bar instead of floating
   * over the page: for docs and previews, where the menu must show open.
   */
  inline?: boolean;
  /** The current page, for aria-current on the matching link. */
  activeHref?: string;
  className?: string;
};

/**
 * Site navigation with dropdown panels, built as the WAI-ARIA disclosure
 * navigation pattern (not role="menu": these are links). Each panel opens
 * from a button with aria-expanded; Esc closes it and returns focus to the
 * button, Left and Right move between top-level items, Down moves into the
 * open panel, and focus or a click leaving the menu closes it.
 */
export function NavigationMenu({
  items,
  "aria-label": ariaLabel = "Main",
  defaultValue = null,
  inline,
  activeHref,
  className,
}: NavigationMenuProps) {
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(defaultValue);
  const rootRef = useRef<HTMLElement>(null);
  const tops = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!open || inline) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, inline]);

  const onTopKey = (e: KeyboardEvent<HTMLElement>, i: number, item: NavigationMenuItem) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
      tops.current[next]?.focus();
    } else if (e.key === "ArrowDown" && item.links) {
      e.preventDefault();
      setOpen(item.id);
      requestAnimationFrame(() => document.getElementById(`${baseId}-${item.id}`)?.querySelector<HTMLElement>("a")?.focus());
    }
  };

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a"));
    const at = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(null);
      tops.current[i]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = at + (e.key === "ArrowDown" ? 1 : -1);
      if (next < 0) tops.current[i]?.focus();
      else links[Math.min(next, links.length - 1)]?.focus();
    }
  };

  return (
    <nav data-slot="navigation-menu"
      ref={rootRef}
      aria-label={ariaLabel}
      className={cx(styles.root, inline && styles.inline, className)}
      onBlur={(e) => {
        if (!inline && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <ul className={styles.bar}>
        {items.map((item, i) => {
          const isOpen = open === item.id;
          const panelId = `${baseId}-${item.id}`;
          if (!item.links) {
            return (
              <li key={item.id}>
                <Link
                  ref={(el) => {
                    tops.current[i] = el;
                  }}
                  href={item.href ?? "#"}
                  className={styles.top}
                  aria-current={activeHref && item.href === activeHref ? "page" : undefined}
                  onKeyDown={(e) => onTopKey(e, i, item)}
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const cols = item.columns ?? (item.links.length >= 4 ? 2 : 1);
          return (
            <li key={item.id} className={styles.slot}>
              <button
                ref={(el) => {
                  tops.current[i] = el;
                }}
                type="button"
                className={styles.top}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && isOpen) {
                    e.preventDefault();
                    setOpen(null);
                  } else onTopKey(e, i, item);
                }}
              >
                {item.label}
                <IconChevronDown size={14} className={styles.chevron} aria-hidden="true" />
              </button>
              <div
                id={panelId}
                className={cx(styles.panel, item.feature ? styles.withFeature : undefined)}
                hidden={!isOpen}
                onKeyDown={(e) => onPanelKey(e, i)}
              >
                {item.feature ? <div className={styles.feature}>{item.feature}</div> : null}
                <ul className={styles.links} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {item.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={styles.link}
                        aria-current={activeHref === l.href ? "page" : undefined}
                        onClick={() => setOpen(null)}
                      >
                        <span className={styles.linkTitle}>
                          {l.icon ? <span className={styles.linkIcon}>{l.icon}</span> : null}
                          {l.title}
                        </span>
                        {l.description ? <span className={styles.linkDescription}>{l.description}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
