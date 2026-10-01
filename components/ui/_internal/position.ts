/**
 * Places a fixed-position popup against its anchor, flipping above when there
 * is no room below. Writes straight to the element's style: position tracks
 * scroll and resize, and routing that through state would re-render on every
 * scroll frame.
 */
export function placePopup(
  anchor: HTMLElement,
  popup: HTMLElement,
  opts: { offset?: number; matchWidth?: boolean; align?: "start" | "end" | "center"; side?: "bottom" | "top" } = {},
): void {
  const { offset = 6, matchWidth = false, align = "start", side = "bottom" } = opts;
  const a = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;

  if (matchWidth) popup.style.minWidth = `${a.width}px`;
  const p = popup.getBoundingClientRect();

  const roomBelow = vh - a.bottom - offset - margin;
  const roomAbove = a.top - offset - margin;
  const placeBelow = side === "bottom" ? roomBelow >= p.height || roomBelow >= roomAbove : roomAbove < p.height && roomBelow > roomAbove;

  let top = placeBelow ? a.bottom + offset : a.top - offset - p.height;
  top = Math.max(margin, Math.min(top, vh - p.height - margin));

  let left = align === "end" ? a.right - p.width : align === "center" ? a.left + a.width / 2 - p.width / 2 : a.left;
  left = Math.max(margin, Math.min(left, vw - p.width - margin));

  popup.style.top = `${Math.round(top)}px`;
  popup.style.left = `${Math.round(left)}px`;
  popup.dataset.placement = placeBelow ? "bottom" : "top";
}

/** Focusable descendants, in DOM order, for focus traps and roving focus. */
export function focusableWithin(root: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type=hidden])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("inert") && el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null,
  );
}
