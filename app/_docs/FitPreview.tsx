"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Docs.module.css";

/**
 * A live specimen shown whole and centred in a fixed window, the overview
 * card's thumbnail. The specimen lays out at its natural size on a canvas
 * (max-content wide, or a fixed 720px for full-width components such as
 * tables and shells), then is measured and scaled down only as far as it
 * must be to fit. It is never scaled up, never cropped and never left
 * aligned. A ResizeObserver keeps the fit right when fonts load, data
 * arrives or the card changes width.
 */
export function FitPreview({ children, block, className }: { children: ReactNode; block?: boolean; className?: string }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const win = windowRef.current;
    const canvas = canvasRef.current;
    if (!win || !canvas) return;
    const fit = () => {
      // offsetWidth/Height ignore transforms, so this is the natural size.
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const W = win.clientWidth;
      const H = win.clientHeight;
      if (!w || !h || !W || !H) return;
      // A little air so shadows and focus rings are never shaved at the edge.
      const air = 28;
      const next = Math.min(1, (W - air) / w, (H - air) / h);
      setScale((prev) => (prev !== null && Math.abs(prev - next) < 0.002 ? prev : next));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(win);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={windowRef} className={cx(styles.fitWindow, className)}>
      <div
        ref={canvasRef}
        className={cx(styles.fitCanvas, block && styles.fitCanvasBlock)}
        style={{
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
