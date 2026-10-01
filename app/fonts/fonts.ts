import localFont from "next/font/local";

// Every font the kit uses, self-hosted from this folder (latin subset, SIL
// Open Font License), so the kit builds and runs offline on any laptop: no
// request to Google Fonts at build or run time. Inter is the kit's own face;
// the rest are the Rime Studio's font choices (not preloaded). Font loader
// options must be literals, so each call spells them out.

export const inter = localFont({
  src: "./inter-latin-100-900-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const jakarta = localFont({ display: "swap", preload: false, src: "./plus-jakarta-sans-latin-200-800-normal.woff2", weight: "200 800", variable: "--studio-jakarta" });
export const dmSans = localFont({ display: "swap", preload: false, src: "./dm-sans-latin-100-1000-normal.woff2", weight: "100 1000", variable: "--studio-dm-sans" });
export const sourceSans = localFont({ display: "swap", preload: false, src: "./source-sans-3-latin-200-900-normal.woff2", weight: "200 900", variable: "--studio-source-sans" });
export const plex = localFont({
  display: "swap",
  preload: false,
  src: [
    { path: "./ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--studio-plex",
});
export const nunito = localFont({ display: "swap", preload: false, src: "./nunito-sans-latin-200-1000-normal.woff2", weight: "200 1000", variable: "--studio-nunito" });
export const sourceSerif = localFont({ display: "swap", preload: false, src: "./source-serif-4-latin-200-900-normal.woff2", weight: "200 900", variable: "--studio-source-serif" });
export const fraunces = localFont({ display: "swap", preload: false, src: "./fraunces-latin-100-900-normal.woff2", weight: "100 900", variable: "--studio-fraunces" });
