"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/site";
import styles from "./Docs.module.css";

// The docs' logo slot: the Rime lockup from public/rime/ (rime-lockup.svg,
// and rime-lockup-white.svg in dark mode), shown as drawn. Swap the SVG files
// to rebrand; no code changes. It is theme-able:
// when the Rime Studio's working theme has a logo, the docs show that.
// The Studio writes its working theme to localStorage and fires
// LOGO_EVENT on change, so the top bar updates live while it is open.

export const LOGO_EVENT = "ui-kit-logo-change";
const WORKING = "ui-kit-theme-studio-working-v1";

type Logo = { src: string; alt: string } | null;

function readLogo(): Logo {
  try {
    const raw = window.localStorage.getItem(WORKING);
    if (!raw) return null;
    const t = JSON.parse(raw) as { logo?: { src?: unknown; alt?: unknown } | null };
    const src = t.logo?.src;
    return typeof src === "string" && /^(data:image\/|\/|https?:)/.test(src) ? { src, alt: String(t.logo?.alt ?? "") } : null;
  } catch {
    return null;
  }
}

export function DocsLogo() {
  const [logo, setLogo] = useState<Logo>(null);
  useEffect(() => {
    const update = () => setLogo(readLogo());
    const frame = requestAnimationFrame(update);
    window.addEventListener(LOGO_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(LOGO_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element -- a user's logo (data URL or path)
    return <img src={logo.src} alt={logo.alt || "Rime"} className={styles.logoImg} />;
  }
  // The real Rime lockup, full colour, no tile behind it: the three-tone
  // mark and the Ice wordmark as drawn. Dark mode swaps in the white
  // artwork through CSS, so there is no flash of the wrong one; narrow
  // screens show the mark alone.
  return (
    <span className={styles.lockup}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
      <img src={asset("/rime/rime-lockup.svg")} alt="Rime" width={86} height={30} className={`${styles.lockupFull} ${styles.onLight}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
      <img src={asset("/rime/rime-lockup-white.svg")} alt="" aria-hidden="true" width={86} height={30} className={`${styles.lockupFull} ${styles.onDark}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
      <img src={asset("/rime/rime-mark.svg")} alt="" aria-hidden="true" width={30} height={30} className={`${styles.lockupMark} ${styles.onLight}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
      <img src={asset("/rime/rime-mark-white.svg")} alt="" aria-hidden="true" width={30} height={30} className={`${styles.lockupMark} ${styles.onDark}`} />
    </span>
  );
}
