"use client";

import { useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Toggle.module.css";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  /** Controlled pressed state. Leave unset (with defaultPressed) for uncontrolled. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** ghost (default) shows no edge at rest; outline keeps a hairline box. */
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  /** An icon before the label. An icon-only toggle needs aria-label. */
  icon?: ReactNode;
  children?: ReactNode;
};

/**
 * A two-state button: pressed or not, such as Bold in a toolbar or "Show
 * archived" above a list. It is a real <button> with aria-pressed. For a
 * setting that applies at once and reads as on or off, use Switch instead.
 */
export function Toggle({
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  variant = "ghost",
  size = "md",
  icon,
  children,
  className,
  onClick,
  type = "button",
  ...rest
}: ToggleProps) {
  const [own, setOwn] = useState(defaultPressed);
  const pressed = pressedProp ?? own;
  return (
    <button data-slot="toggle"
      type={type}
      aria-pressed={pressed}
      className={cx(styles.toggle, styles[variant], styles[size], !children && styles.iconOnly, className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (pressedProp === undefined) setOwn(!pressed);
        onPressedChange?.(!pressed);
      }}
      {...rest}
    >
      {icon}
      {children ? <span className={styles.label}>{children}</span> : null}
    </button>
  );
}

export type ToggleGroupItem = {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Required when the item has only an icon. */
  "aria-label"?: string;
  disabled?: boolean;
};

type ToggleGroupBase = {
  items: ReadonlyArray<ToggleGroupItem>;
  /** Names the group: "Text formatting", "Days". */
  "aria-label": string;
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  className?: string;
};

type ToggleGroupSingle = {
  /** single: at most one item pressed, like a radio group that can be cleared. */
  type: "single";
  value: string | null;
  onValueChange: (value: string | null) => void;
};

type ToggleGroupMultiple = {
  /** multiple: any number pressed, like a row of checkboxes. */
  type: "multiple";
  value: ReadonlyArray<string>;
  onValueChange: (value: string[]) => void;
};

export type ToggleGroupProps = ToggleGroupBase & (ToggleGroupSingle | ToggleGroupMultiple);

/**
 * A set of toggles sharing one value. single behaves as a radio group
 * (role="radiogroup", aria-checked) whose choice can be pressed again to
 * clear it; multiple is a group of aria-pressed buttons. One tab stop: the
 * arrow keys move between items, Home and End jump to the ends, and Space or
 * Enter presses.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const { items, variant = "outline", size = "md", orientation = "horizontal", disabled, className } = props;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const isOn = (v: string) => (props.type === "single" ? props.value === v : props.value.includes(v));
  const enabled = items.map((it, i) => (!disabled && !it.disabled ? i : -1)).filter((i) => i >= 0);
  const firstOn = items.findIndex((it) => isOn(it.value) && !it.disabled);
  const tabStop = focusIndex ?? (firstOn >= 0 ? firstOn : (enabled[0] ?? 0));

  const press = (v: string) => {
    if (props.type === "single") props.onValueChange(props.value === v ? null : v);
    else props.onValueChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const pos = enabled.indexOf(i);
    let target: number | undefined;
    if (e.key === next) target = enabled[(pos + 1) % enabled.length];
    else if (e.key === prev) target = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") target = enabled[0];
    else if (e.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    setFocusIndex(target);
    refs.current[target]?.focus();
  };

  const single = props.type === "single";
  return (
    <div data-slot="toggle-group"
      role={single ? "radiogroup" : "group"}
      aria-label={props["aria-label"]}
      aria-orientation={orientation}
      className={cx(styles.group, styles[`group_${orientation}`], className)}
    >
      {items.map((it, i) => {
        const on = isOn(it.value);
        return (
          <button
            key={it.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={single ? "radio" : undefined}
            aria-checked={single ? on : undefined}
            aria-pressed={single ? undefined : on}
            aria-label={it["aria-label"]}
            disabled={disabled || it.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            className={cx(styles.toggle, styles[variant], styles[size], !it.label && styles.iconOnly)}
            onClick={() => {
              setFocusIndex(i);
              press(it.value);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {it.icon}
            {it.label ? <span className={styles.label}>{it.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
