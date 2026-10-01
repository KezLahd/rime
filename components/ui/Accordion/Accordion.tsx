"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronDown } from "../Icon/Icon";
import styles from "./Accordion.module.css";

export type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export type AccordionProps = {
  items: ReadonlyArray<AccordionItem>;
  /** single = one section open at a time. multiple = any number. */
  type?: "single" | "multiple";
  /** Open ids, controlled. Pair with onValueChange. */
  value?: ReadonlyArray<string>;
  /** Open ids on first render, uncontrolled. */
  defaultValue?: ReadonlyArray<string>;
  onValueChange?: (value: string[]) => void;
  /** single only: false keeps one section open at all times. */
  collapsible?: boolean;
  /** Heading level the triggers sit in, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5;
  /** glass = a frosted panel with hairlines between sections. plain = hairlines only. */
  appearance?: "glass" | "plain";
  className?: string;
};

/**
 * Stacked sections that open and close in place (WAI-ARIA accordion). Each
 * header is a real heading holding a button with aria-expanded and
 * aria-controls; Up and Down move between headers, Home and End jump to the
 * ends. The panel animates its height with a grid row transition, which
 * reduced motion turns off.
 */
export function Accordion({
  items,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  headingLevel = 3,
  appearance = "glass",
  className,
}: AccordionProps) {
  const baseId = useId();
  const [inner, setInner] = useState<string[]>(() => [...(defaultValue ?? [])]);
  const open = value ? [...value] : inner;
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const Heading = `h${headingLevel}` as const;

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    let next: string[];
    if (type === "single") {
      if (isOpen) next = collapsible ? [] : open;
      else next = [id];
    } else next = isOpen ? open.filter((o) => o !== id) : [...open, id];
    if (!value) setInner(next);
    onValueChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(index);
    let target: number | undefined;
    if (e.key === "ArrowDown") target = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowUp") target = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") target = enabled[0];
    else if (e.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <div data-slot="accordion" className={cx(styles.root, styles[appearance], className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(item.id);
        const triggerId = `${baseId}-t-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;
        return (
          <div key={item.id} className={styles.item} data-state={isOpen ? "open" : "closed"}>
            <Heading className={styles.heading}>
              <button
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                type="button"
                id={triggerId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={(type === "single" && isOpen && !collapsible) || undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className={styles.title}>{item.title}</span>
                <IconChevronDown size={16} className={styles.chevron} aria-hidden="true" />
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={triggerId} className={styles.panel} data-open={isOpen || undefined}>
              <div className={styles.panelInner} inert={!isOpen}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
