"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { GlassPanel, type GlassPanelProps } from "../GlassPanel/GlassPanel";
import styles from "./Tabs.module.css";

/** Pastel fill, deep same-hue ink. The colour means status, so it never changes on selection. */
export type TabColour = "brand" | "stone" | "rose" | "green" | "amber" | "slate";

export type FolderTab = {
  id: string;
  label: ReactNode;
  /** Always show the count: the shape of the workload should read without opening each tab. */
  count?: number;
  colour?: TabColour;
};

export type FolderTabsProps = {
  tabs: ReadonlyArray<FolderTab>;
  value: string;
  onChange: (id: string) => void;
  "aria-label": string;
  /** Content of the active tab's panel. */
  children: ReactNode;
  panelPadding?: GlassPanelProps["padding"];
  panelVariant?: GlassPanelProps["variant"];
  className?: string;
};

/**
 * the reference folder tabs: pastel tabs sitting on the top edge of a glass
 * panel. Active is carried by weight, full opacity and an upward lift, never
 * by hue. Arrow keys move and activate (automatic activation).
 */
export function FolderTabs({
  tabs,
  value,
  onChange,
  "aria-label": ariaLabel,
  children,
  panelPadding = "md",
  panelVariant = "page",
  className,
}: FolderTabsProps) {
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = `${base}-panel`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((t) => t.id === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onChange(tabs[next].id);
    listRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(tabs[next].id))}`)?.focus();
  };

  return (
    <div data-slot="folder-tabs" className={cx(styles.folder, className)}>
      <div ref={listRef} role="tablist" aria-label={ariaLabel} className={styles.tabRow} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              id={tabId(tab.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cx(styles.tab, styles[`tab_${tab.colour ?? "brand"}`], selected && styles.tabActive)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.count !== undefined ? <span className={styles.tabCount}>({tab.count})</span> : null}
            </button>
          );
        })}
      </div>
      <GlassPanel
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(value)}
        tabIndex={0}
        variant={panelVariant}
        padding={panelPadding}
        className={styles.panel}
      >
        {children}
      </GlassPanel>
    </div>
  );
}

export type SegmentedOption<V extends string = string> = { value: V; label: ReactNode; disabled?: boolean };

export type SegmentedControlProps<V extends string = string> = {
  options: ReadonlyArray<SegmentedOption<V>>;
  value: V;
  onChange: (value: V) => void;
  "aria-label": string;
  size?: "sm" | "md";
  className?: string;
};

/**
 * View toggle in a recessed track. The selected thumb is a raised white tile,
 * not the brand gradient: the gradient is kept for the view's primary action.
 */
export function SegmentedControl<V extends string = string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  size = "md",
  className,
}: SegmentedControlProps<V>) {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = options.filter((o) => !o.disabled);
    const index = enabled.findIndex((o) => o.value === value);
    let next: SegmentedOption<V> | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(index + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(index - 1 + enabled.length) % enabled.length];
    if (!next) return;
    e.preventDefault();
    onChange(next.value);
    ref.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  return (
    <div data-slot="segmented-control"
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(styles.track, styles[`track_${size}`], className)}
      onKeyDown={onKeyDown}
    >
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={o.value}
            tabIndex={checked ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cx(styles.segment, checked && styles.segmentActive)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
