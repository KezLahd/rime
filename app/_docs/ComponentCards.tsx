"use client";

import Link from "next/link";
import { FitPreview } from "./FitPreview";
import { PREVIEWS } from "./previews";
import styles from "./Docs.module.css";

export type ComponentCardData = {
  slug: string;
  name: string;
  summary: string;
  full: boolean;
  /** The registry's first example, shown as the card's live thumbnail. */
  exampleId: string | null;
  block: boolean;
};

/**
 * The overview's component grid: each card shows the live component, whole
 * and centred, scaled down only as far as it must be to fit (FitPreview),
 * above its name and summary. Overlays (toasts, modals, menus, popovers)
 * render open and inline in their first example, so the card shows the
 * thing itself, never its trigger. The specimen is inert (no focus, no
 * clicks, hidden from assistive tech), so the card has exactly one control:
 * its title link, stretched over the whole card.
 */
export function ComponentCards({ cards }: { cards: ComponentCardData[] }) {
  return (
    <div className={styles.cards}>
      {cards.map((c) => {
        const Render = c.exampleId ? PREVIEWS[c.slug]?.[c.exampleId] : undefined;
        return (
          <div key={c.slug} className={styles.card}>
            <div className={styles.thumb} aria-hidden="true" inert>
              {Render ? (
                <FitPreview block={c.block}>
                  <Render />
                </FitPreview>
              ) : null}
            </div>
            <span className={styles.cardTitle}>
              <Link href={`/components/${c.slug}`} className={styles.cardLink}>
                {c.name}
              </Link>
            </span>
            <span className={styles.cardBody}>{c.summary}</span>
          </div>
        );
      })}
    </div>
  );
}
