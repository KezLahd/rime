"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronRight, IconMoreHorizontal } from "../Icon/Icon";
import { Menu } from "../Menu/Menu";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  label: ReactNode;
  /** Omit on the current page (the last item). */
  href?: string;
  icon?: ReactNode;
};

export type BreadcrumbProps = {
  items: ReadonlyArray<BreadcrumbItem>;
  /**
   * Past this many items the middle folds into an ellipsis menu: the first
   * item, the menu, then the last (maxItems - 2). Default 4.
   */
  maxItems?: number;
  /** Between items. Defaults to a small chevron; "/" is the other common choice. */
  separator?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

/**
 * Where this page sits: a nav landmark holding an ordered list of links,
 * the last item marked aria-current="page" and not a link. Long trails fold
 * their middle into a Menu so the row never wraps.
 */
export function Breadcrumb({ items, maxItems = 4, separator, "aria-label": ariaLabel = "Breadcrumb", className }: BreadcrumbProps) {
  const fold = items.length > maxItems && maxItems >= 3;
  const tail = fold ? items.slice(items.length - (maxItems - 2)) : [];
  const hidden = fold ? items.slice(1, items.length - (maxItems - 2)) : [];
  const shown: Array<BreadcrumbItem | "fold"> = fold ? [items[0], "fold", ...tail] : [...items];
  const sep = (
    <li className={styles.sep} role="presentation" aria-hidden="true">
      {separator ?? <IconChevronRight size={13} />}
    </li>
  );

  return (
    <nav data-slot="breadcrumb" aria-label={ariaLabel} className={cx(styles.root, className)}>
      <ol className={styles.list}>
        {shown.map((item, i) => {
          const last = i === shown.length - 1;
          return (
            <ItemFragment key={i} sep={i > 0 ? sep : null}>
              {item === "fold" ? (
                <li className={styles.item}>
                  <Menu
                    label={<IconMoreHorizontal size={16} />}
                    aria-label={`Show ${hidden.length} more`}
                    iconOnly
                    items={hidden.map((h, j) => ({ id: `h${j}`, label: h.label, href: h.href }))}
                  />
                </li>
              ) : (
                <li className={styles.item}>
                  {last || !item.href ? (
                    <span className={cx(styles.current, !last && styles.plain)} aria-current={last ? "page" : undefined}>
                      {item.icon}
                      {item.label}
                    </span>
                  ) : (
                    <Link href={item.href} className={styles.link}>
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </li>
              )}
            </ItemFragment>
          );
        })}
      </ol>
    </nav>
  );
}

function ItemFragment({ sep, children }: { sep: ReactNode; children: ReactNode }) {
  return (
    <>
      {sep}
      {children}
    </>
  );
}
