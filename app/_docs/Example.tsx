"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { CodeBlock } from "./CodeBlock";
import styles from "./Docs.module.css";

type View = "preview" | "code";
const VIEWS: ReadonlyArray<[View, string]> = [
  ["preview", "Preview"],
  ["code", "Code"],
];

/**
 * One example, shadcn style: the title and note above, then a single frame
 * with Preview | Code tabs along its top edge. Preview is the live specimen;
 * Code is the snippet with its copy button, in the same frame. Used by every
 * component page and every pattern.
 */
export function Example({
  title,
  description,
  code,
  children,
  block,
  headingLevel = 3,
  id: anchor,
  className,
}: {
  title: string;
  description?: ReactNode;
  code: string;
  children: ReactNode;
  /** Let the specimen take the full width (tables, shells, patterns) instead of a wrapping row. */
  block?: boolean;
  /** h3 on component pages; patterns pass 2. */
  headingLevel?: 2 | 3;
  /** Anchor id for the section (patterns use their slug). */
  id?: string;
  className?: string;
}) {
  const [view, setView] = useState<View>("preview");
  const uid = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const Heading = `h${headingLevel}` as const;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + VIEWS.length) % VIEWS.length;
    setView(VIEWS[next][0]);
    tabs.current[next]?.focus();
  };

  return (
    <section id={anchor} className={cx(styles.exampleBlock, className)} aria-labelledby={`${uid}-t`}>
      <Heading id={`${uid}-t`} className={headingLevel === 2 ? styles.h2 : styles.exampleTitle}>
        {title}
      </Heading>
      {description ? <div className={styles.exampleNote}>{description}</div> : null}
      <div className={styles.example}>
        <div className={styles.exampleTabs} role="tablist" aria-label={`${title}: view`}>
          {VIEWS.map(([v, label], i) => (
            <button
              key={v}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-${v}-tab`}
              aria-selected={view === v}
              aria-controls={`${uid}-panel`}
              tabIndex={view === v ? 0 : -1}
              className={styles.exampleTab}
              onClick={() => setView(v)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {label}
            </button>
          ))}
        </div>
        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${view}-tab`}>
          {view === "preview" ? (
            <div className={cx(styles.stage, block && styles.stageBlock)}>{children}</div>
          ) : (
            <CodeBlock code={code} label={`${title} code`} inFrame />
          )}
        </div>
      </div>
    </section>
  );
}
