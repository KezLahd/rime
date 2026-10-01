"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./Docs.module.css";

/**
 * The docs sidebar wrapper. Holds the scrollable list and two edge fades
 * (top and bottom) that reveal only when there is more content to scroll
 * in that direction. A pure CSS gradient draws the vertical separator on
 * the right, which fades out at the top and bottom of the sidebar's
 * clipped height.
 */
export function DocsSidebar({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    const wrap = wrapRef.current;
    if (!scroll || !wrap) return;

    const update = () => {
      const canScrollUp = scroll.scrollTop > 2;
      const canScrollDown = scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 2;
      wrap.toggleAttribute("data-scroll-up", canScrollUp);
      wrap.toggleAttribute("data-scroll-down", canScrollDown);
    };

    update();
    scroll.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(scroll);
    ro.observe(wrap);

    return () => {
      scroll.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.navWrap}>
      <div ref={scrollRef} className={styles.navScroll}>
        {children}
      </div>
      <div className={styles.navFadeTop} aria-hidden="true" />
      <div className={styles.navFadeBottom} aria-hidden="true" />
    </div>
  );
}
