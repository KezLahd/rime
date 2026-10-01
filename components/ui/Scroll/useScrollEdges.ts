"use client";

import { useEffect, useRef, type RefObject } from "react";

export type ScrollEdgesOptions = {
  /**
   * The element that gets the attributes. Defaults to the scroller itself.
   * Modal puts them on the panel, so its header and footer (siblings of the
   * scrolling body) can draw the edge shadows.
   */
  target?: RefObject<HTMLElement | null>;
  /** Which way the content scrolls. "x" for wide tables. */
  axis?: "y" | "x";
  /** Off until the scroller exists (a portal before hydration, a body-less modal). */
  enabled?: boolean;
  /**
   * Called whenever the reader reaches the far edge (data-more clears), and
   * straight away when the content does not overflow at all. Gate an
   * "I agree" on it: the terms have been scrolled to the end.
   */
  onEnd?: () => void;
};

/**
 * Scroll-aware edges, written straight to the DOM so scrolling never
 * re-renders React:
 *
 * - `data-scrolled` while the content has moved off its start edge, so the
 *   leading edge (a header, the top of a list) can draw a hairline and shade;
 * - `data-more` while there is content past the far edge, so the trailing
 *   edge (a footer, the bottom of a list) can say "keep going".
 *
 * A passive scroll listener plus a ResizeObserver on the scroller and its
 * first child, so content that grows (an error appearing, a step changing)
 * updates the edges without a scroll. Pair it with ScrollArea, or style
 * `[data-scrolled]` / `[data-more]` yourself with --scroll-edge-top and
 * --scroll-edge-bottom.
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>, options: ScrollEdgesOptions = {}) {
  const { target, axis = "y", enabled = true, onEnd } = options;
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const scroller = ref.current;
    if (!enabled || !scroller) return;
    const el = target?.current ?? scroller;
    const content = scroller.firstElementChild;

    const update = () => {
      const pos = axis === "y" ? scroller.scrollTop : Math.abs(scroller.scrollLeft);
      const max = axis === "y"
        ? scroller.scrollHeight - scroller.clientHeight
        : scroller.scrollWidth - scroller.clientWidth;
      el.toggleAttribute("data-scrolled", pos > 1);
      const more = max - pos > 1;
      el.toggleAttribute("data-more", more);
      if (!more) onEndRef.current?.();
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    if (content) ro.observe(content);
    return () => {
      scroller.removeEventListener("scroll", update);
      ro.disconnect();
      el.removeAttribute("data-scrolled");
      el.removeAttribute("data-more");
    };
  }, [ref, target, axis, enabled]);
}
