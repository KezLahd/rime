"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Studio.module.css";

export type FontItem = {
  id: string;
  name: string;
  family: string;
  kind: "sans" | "serif" | "display";
};

const POPUP_MIN_WIDTH = 320;
const POPUP_MAX_HEIGHT = 420;

type PopupPos = { top: number; left: number; width: number };

const faceOf = (f: Pick<FontItem, "family" | "kind">) =>
  `${f.family}, ${f.kind === "serif" ? "Georgia, serif" : "system-ui, sans-serif"}`;

/**
 * Custom portal-based font dropdown. Trigger shows the current font in its
 * own face; the popup renders every option in its own family so users
 * preview before clicking. Hovering an option fires onHover({family}), so
 * the live preview on the right swaps to that font — pure inline-style
 * override, no theme write.
 *
 * - Click toggles. mousedown on an option commits before any blur so the
 *   click isn't eaten by the dismiss listener.
 * - Portal to document.body avoids any ancestor overflow-hidden clipping.
 * - Clear hover on close + mouse-leave so the preview reverts to the
 *   committed theme.
 */
export function FontDropdown({
  value,
  fonts,
  onPick,
  onHover,
}: {
  /** Current font id, or "preset" for the preset's font. */
  value: string;
  fonts: ReadonlyArray<FontItem>;
  onPick: (id: string) => void;
  onHover: (family: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selected = value === "preset" ? null : fonts.find((f) => f.id === value) ?? null;

  const computePos = (): PopupPos | null => {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    const GAP = 4;
    const PAD = 8;
    const width = Math.max(POPUP_MIN_WIDTH, rect.width);
    let left = rect.left;
    left = Math.max(PAD, Math.min(left, window.innerWidth - width - PAD));
    const spaceBelow = window.innerHeight - rect.bottom - GAP - PAD;
    const spaceAbove = rect.top - GAP - PAD;
    let top: number;
    if (spaceBelow >= Math.min(POPUP_MAX_HEIGHT, 240)) {
      top = rect.bottom + GAP;
    } else if (spaceAbove >= Math.min(POPUP_MAX_HEIGHT, 240)) {
      top = Math.max(PAD, rect.top - GAP - Math.min(POPUP_MAX_HEIGHT, spaceAbove));
    } else {
      top = Math.max(PAD, Math.min(rect.bottom + GAP, window.innerHeight - POPUP_MAX_HEIGHT - PAD));
    }
    return { top, left, width };
  };

  useLayoutEffect(() => {
    if (open) setPos(computePos());
  }, [open]);

  // Outside click, Escape, scroll reposition.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const reposition = () => setPos(computePos());
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    setPos(null);
    onHover(null);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.fontDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span
          className={styles.fontDropdownName}
          style={selected ? { fontFamily: faceOf(selected) } : undefined}
        >
          {selected ? selected.name : "The preset's font"}
        </span>
        {selected ? <span className={styles.fontDropdownKind}>{selected.kind}</span> : null}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cx(styles.fontDropdownIcon, open && styles.fontDropdownIconOpen)}
        />
      </button>

      {open && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              role="listbox"
              className={styles.fontMenuPopup}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: pos.width,
                maxHeight: POPUP_MAX_HEIGHT,
                zIndex: 2000,
              }}
              onMouseLeave={() => onHover(null)}
            >
              <button
                type="button"
                role="option"
                aria-selected={value === "preset"}
                className={cx(styles.fontMenuItem, value === "preset" && styles.fontMenuItemActive)}
                onMouseEnter={() => onHover(null)}
                onMouseDown={(e) => {
                  // prevent the dismiss listener firing before our click
                  e.preventDefault();
                  onPick("preset");
                  close();
                }}
              >
                <span className={styles.fontMenuItemName}>The preset&apos;s font</span>
                <span className={styles.fontMenuItemKind}>default</span>
              </button>
              {fonts.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="option"
                  aria-selected={value === f.id}
                  className={cx(styles.fontMenuItem, value === f.id && styles.fontMenuItemActive)}
                  onMouseEnter={() => onHover(faceOf(f))}
                  onFocus={() => onHover(faceOf(f))}
                  onBlur={() => onHover(null)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onPick(f.id);
                    close();
                  }}
                >
                  <span className={styles.fontMenuItemName} style={{ fontFamily: faceOf(f) }}>
                    {f.name}
                  </span>
                  <span className={styles.fontMenuItemKind}>{f.kind}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
