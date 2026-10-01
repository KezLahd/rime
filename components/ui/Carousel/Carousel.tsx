"use client";

import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { IconChevronLeft, IconChevronRight } from "../Icon/Icon";
import styles from "./Carousel.module.css";

export type CarouselProps = {
  /** One child per slide. */
  children: ReactNode;
  /** Names the carousel region: "Featured projects". */
  "aria-label": string;
  /** Slides visible at once on wide screens. Narrow screens show one. Default 1. */
  perView?: 1 | 2 | 3 | 4;
  /** Gap between slides in px. Default 12. */
  gap?: number;
  /** Prev and next buttons. On by default. */
  controls?: boolean;
  /** The dot row under the track. On by default. */
  dots?: boolean;
  /** Advance every n ms. Off by default; pauses on hover and focus, and has a pause button. */
  autoplay?: number;
  /** Start again from the first slide after the last. Default false. */
  loop?: boolean;
  onIndexChange?: (index: number) => void;
  className?: string;
};

/**
 * A row of slides on a native scroll-snap track: swipe, trackpad and
 * scrollbar all work with no script, and the buttons, dots and arrow keys
 * scroll it. Built to the WAI-ARIA carousel pattern: a region with
 * aria-roledescription="carousel", each slide a group labelled "2 of 5", and
 * autoplay (off by default) that stops on hover, on focus and from its own
 * pause button. Reduced motion scrolls instantly.
 */
export function Carousel({
  children,
  "aria-label": ariaLabel,
  perView = 1,
  gap = 12,
  controls = true,
  dots = true,
  autoplay,
  loop = false,
  onIndexChange,
  className,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);

  const lastStart = Math.max(0, count - perView);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = loop ? (i > lastStart ? 0 : i < 0 ? lastStart : i) : Math.max(0, Math.min(lastStart, i));
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (!slide) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: reduce ? "auto" : "smooth" });
    },
    [lastStart, loop],
  );

  // The index follows the scroll position, however the track was scrolled.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = track.children[0] as HTMLElement | undefined;
        if (!first) return;
        const step = first.offsetWidth + gap;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        const next = atEnd ? lastStart : Math.round(track.scrollLeft / step);
        setIndex((prev) => (prev === next ? prev : next));
      });
    };
    track.addEventListener("scroll", read, { passive: true });
    return () => {
      track.removeEventListener("scroll", read);
      cancelAnimationFrame(frame);
    };
  }, [gap, lastStart]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const running = Boolean(autoplay) && !paused && !hovered && !focused;
  useEffect(() => {
    if (!running || !autoplay) return;
    const t = window.setInterval(() => scrollTo(index >= lastStart ? 0 : index + 1), autoplay);
    return () => window.clearInterval(t);
  }, [running, autoplay, index, lastStart, scrollTo]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollTo(index - 1);
    }
  };

  const style = { "--carousel-per-view": perView, "--carousel-gap": `${gap}px` } as CSSProperties;
  const pages = lastStart + 1;

  return (
    <section data-slot="carousel"
      className={cx(styles.root, className)}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div className={styles.viewport}>
        <div
          ref={trackRef}
          className={styles.track}
          tabIndex={0}
          aria-live={running ? "off" : "polite"}
          aria-label={`${ariaLabel}, slides`}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              inert={i < index || i >= index + perView ? true : undefined}
            >
              {slide}
            </div>
          ))}
        </div>
        {controls && count > perView ? (
          <>
            <button
              type="button"
              className={cx(styles.nav, styles.prev)}
              onClick={() => scrollTo(index - 1)}
              disabled={!loop && index <= 0}
              aria-label="Previous slide"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={cx(styles.nav, styles.next)}
              onClick={() => scrollTo(index + 1)}
              disabled={!loop && index >= lastStart}
              aria-label="Next slide"
            >
              <IconChevronRight size={18} />
            </button>
          </>
        ) : null}
      </div>
      {(dots && pages > 1) || autoplay ? (
        <div className={styles.footer}>
          {autoplay ? (
            <button type="button" className={styles.pause} onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              {paused ? "Play" : "Pause"}
            </button>
          ) : null}
          {dots && pages > 1 ? (
            <div className={styles.dots}>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.dot}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => scrollTo(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
