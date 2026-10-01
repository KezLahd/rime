"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Docs.module.css";

export type TocItem = { id: string; label: string; depth?: 2 | 3 };

/**
 * "On this page", with the heading in view highlighted, as shadcn's: an
 * IntersectionObserver flips the active entry as soon as a heading crosses
 * the top fifth of the viewport. Examples appear as indented entries.
 */
export function Toc({ items }: { items: ReadonlyArray<TocItem> }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "0% 0% -80% 0%" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <aside className={styles.toc} aria-label="On this page">
      <p className={styles.tocHeading}>On this page</p>
      <div className={styles.tocList}>
        {items.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={cx(styles.tocLink, t.depth === 3 && styles.tocSub)}
            data-active={active === t.id ? "" : undefined}
            aria-current={active === t.id ? "location" : undefined}
          >
            {t.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
