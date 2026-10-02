"use client";

import { asset } from "@/lib/site";
import styles from "./Docs.module.css";

// The docs' logo slot: always the real Rime lockup from public/rime/
// (rime-lockup.svg, and rime-lockup-white.svg in dark mode). This slot
// used to read the Rime Studio's working theme from localStorage and
// swap in the user's uploaded logo, which bled the Studio's preview
// out into the kit's own top bar. The preview on the right of the
// Studio is now the only place that shows a user-uploaded logo; this
// top-bar slot always shows Rime.
//
// LOGO_EVENT is kept for callers that still dispatch it; nothing
// listens for it any more.

export const LOGO_EVENT = "ui-kit-logo-change";

export function DocsLogo() {
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
