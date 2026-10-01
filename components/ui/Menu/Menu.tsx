"use client";

import Link from "next/link";
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Portal } from "../_internal/portal";
import { placePopup } from "../_internal/position";
import { IconChevronDown } from "../Icon/Icon";
import styles from "./Menu.module.css";

export type MenuAction = {
  id: string;
  label: ReactNode;
  /** 16px, muted at rest, brand ink when the item is active. */
  icon?: ReactNode;
  description?: ReactNode;
  /** Internal route. Rendered as a Next <Link>. */
  href?: string;
  onSelect?: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
};

/** Hairline between groups. */
export type MenuSeparator = { separator: true; id: string };

/** Tiny caps label that opens a group: every action after it, up to the next
    heading or separator, is announced as part of that group. */
export type MenuHeading = { heading: ReactNode; id: string };

export type MenuEntry = MenuAction | MenuSeparator | MenuHeading;

export type MenuProps = {
  /** Trigger content. A chevron is appended unless iconOnly or hideChevron. */
  label: ReactNode;
  /** Accessible name when the trigger content is not descriptive (an avatar, an icon). */
  "aria-label"?: string;
  items: ReadonlyArray<MenuEntry>;
  /** Tinted block at the top of the menu: name and ID number, say. */
  header?: ReactNode;
  align?: "start" | "end";
  /**
   * Icon-only trigger (a "more" ellipsis): a square ghost button, no chevron.
   * Give it an aria-label.
   */
  iconOnly?: boolean;
  /** Drops the chevron from a custom trigger that signals the menu another way. */
  hideChevron?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  className?: string;
  /**
   * Render the menu open, in place, under its trigger: no portal, no focus
   * move, no outside-click listener. For docs and thumbnails.
   */
  inline?: boolean;
};

const isAction = (e: MenuEntry): e is MenuAction => !("separator" in e) && !("heading" in e);

type Block =
  | { kind: "group"; id: string; heading?: MenuHeading; actions: MenuAction[] }
  | { kind: "separator"; id: string };

/** Folds the flat entry list into groups so headed runs get role="group". */
function toBlocks(items: ReadonlyArray<MenuEntry>): Block[] {
  const blocks: Block[] = [];
  let current: Extract<Block, { kind: "group" }> | null = null;
  for (const entry of items) {
    if ("separator" in entry) {
      blocks.push({ kind: "separator", id: entry.id });
      current = null;
    } else if ("heading" in entry) {
      current = { kind: "group", id: entry.id, heading: entry, actions: [] };
      blocks.push(current);
    } else {
      if (!current) {
        current = { kind: "group", id: `g-${entry.id}`, actions: [] };
        blocks.push(current);
      }
      current.actions.push(entry);
    }
  }
  return blocks;
}

/**
 * Action menu (WAI-ARIA menu button). Arrow keys move, Home/End jump, a
 * printable key jumps to the next item starting with it, Esc and Tab close and
 * return focus to the trigger. Portalled, solid white, styled as Select's
 * listbox so every popup in the portal reads as one family.
 */
export function Menu({
  label,
  "aria-label": ariaLabel,
  items,
  header,
  align = "end",
  iconOnly,
  hideChevron,
  disabled,
  triggerClassName,
  className,
  inline = false,
}: MenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const [openState, setOpen] = useState(false);
  const open = inline || openState;
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const actions = items.filter(isAction);
  const enabled = actions.map((a, i) => (a.disabled ? -1 : i)).filter((i) => i >= 0);

  const openAt = (where: "first" | "last") => {
    setActive(where === "first" ? (enabled[0] ?? 0) : (enabled[enabled.length - 1] ?? 0));
    setOpen(true);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const step = (dir: 1 | -1) => {
    const pos = enabled.indexOf(active);
    const next = enabled[(pos + dir + enabled.length) % enabled.length];
    if (next !== undefined) setActive(next);
  };

  // Typeahead: the next enabled item, after the active one, whose visible
  // label starts with the key. Read from the DOM because labels are nodes.
  const jumpTo = (key: string) => {
    const menu = menuRef.current;
    if (!menu || enabled.length === 0) return;
    const needle = key.toLocaleLowerCase();
    const start = enabled.indexOf(active);
    for (let n = 1; n <= enabled.length; n++) {
      const index = enabled[(start + n) % enabled.length];
      const text = menu.querySelector(`[data-index="${index}"] [data-label]`)?.textContent?.trim().toLocaleLowerCase();
      if (text?.startsWith(needle)) {
        setActive(index);
        return;
      }
    }
  };

  useLayoutEffect(() => {
    if (!open || inline || !triggerRef.current || !menuRef.current) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    const place = () => placePopup(trigger, menu, { align, offset: 8 });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, inline, align]);

  useEffect(() => {
    if (!open || inline) return;
    menuRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.focus();
  }, [open, inline, active]);

  useEffect(() => {
    if (!open || inline) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, inline]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        step(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        step(-1);
        break;
      case "Home":
        e.preventDefault();
        setActive(enabled[0] ?? 0);
        break;
      case "End":
        e.preventDefault();
        setActive(enabled[enabled.length - 1] ?? 0);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case "Tab":
        e.preventDefault();
        close(true);
        break;
      case " ":
        // Buttons activate on Space natively; links do not.
        if ((e.target as HTMLElement).tagName === "A") {
          e.preventDefault();
          (e.target as HTMLElement).click();
        }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.trim()) {
          e.preventDefault();
          jumpTo(e.key);
        }
    }
  };

  const indexOf = new Map(actions.map((a, i) => [a.id, i]));

  const renderAction = (entry: MenuAction) => {
    const index = indexOf.get(entry.id) ?? 0;
    const cls = cx(styles.item, entry.tone === "danger" && styles.danger, entry.disabled && styles.disabled);
    const inner = (
      <>
        {entry.icon ? (
          <span className={styles.icon} aria-hidden="true">
            {entry.icon}
          </span>
        ) : null}
        <span className={styles.text}>
          <span className={styles.label} data-label="">
            {entry.label}
          </span>
          {entry.description ? <span className={styles.description}>{entry.description}</span> : null}
        </span>
      </>
    );
    const common = {
      role: "menuitem" as const,
      tabIndex: -1,
      "data-index": index,
      className: cls,
      onMouseMove: () => {
        if (!entry.disabled && active !== index) setActive(index);
      },
    };
    if (entry.href && !entry.disabled) {
      return (
        <Link key={entry.id} href={entry.href} {...common} onClick={() => close(false)}>
          {inner}
        </Link>
      );
    }
    return (
      <button
        key={entry.id}
        type="button"
        {...common}
        aria-disabled={entry.disabled || undefined}
        onClick={() => {
          if (entry.disabled) return;
          close(true);
          entry.onSelect?.();
        }}
      >
        {inner}
      </button>
    );
  };

  const showChevron = !iconOnly && !hideChevron;

  const menu = (
    <div data-slot="menu"
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-labelledby={`${id}-trigger`}
      className={cx(styles.menu, inline && styles.menuInline, className)}
      onKeyDown={onMenuKeyDown}
    >
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.items}>
        {toBlocks(items).map((block) => {
          if (block.kind === "separator") return <div key={block.id} role="separator" className={styles.separator} />;
          if (!block.heading) return <Fragment key={block.id}>{block.actions.map(renderAction)}</Fragment>;
          const headingId = `${id}-h-${block.id}`;
          return (
            <div key={block.id} role="group" aria-labelledby={headingId} className={styles.group}>
              <div id={headingId} role="presentation" className={styles.heading}>
                {block.heading.heading}
              </div>
              {block.actions.map(renderAction)}
            </div>
          );
        })}
      </div>
    </div>
  );

  const trigger = (
      <button
        data-slot="menu-trigger"
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cx(
          styles.trigger,
          iconOnly ? styles.triggerIcon : !triggerClassName && styles.triggerLabelled,
          open && styles.triggerOpen,
          triggerClassName,
        )}
        onClick={() => {
          if (inline) return;
          if (open) close(false);
          else openAt("first");
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openAt("first");
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openAt("last");
          }
        }}
      >
        {label}
        {showChevron ? <IconChevronDown size={14} className={styles.chevron} aria-hidden="true" /> : null}
      </button>
  );

  if (inline) {
    return (
      <div className={styles.inlineWrap} data-align={align}>
        {trigger}
        {menu}
      </div>
    );
  }

  return (
    <>
      {trigger}
      {open ? <Portal>{menu}</Portal> : null}
    </>
  );
}

