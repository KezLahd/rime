import {
  Bricolage_Grotesque,
  EB_Garamond,
  Figtree,
  Instrument_Serif,
  Lexend,
  Lora,
  Manrope,
  Outfit,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
  Spectral,
  Work_Sans,
} from "next/font/google";
import localFont from "next/font/local";

// Every font the kit uses. Inter and the original seven come from WOFF2
// files in this folder (self-hosted so the kit works offline). The newer
// batch comes from next/font/google: Next.js downloads them at build time
// and serves them from the app, so there's still no request to Google
// Fonts at run time. Font loader options must be literals.

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

// ── Google fonts, bundled at build time ──────────────────────────────────
// Each is loaded with display: "swap", preload: false, and the full weight
// range so a theme can pick a heavier or lighter cut without extra config.

export const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-manrope" });
export const figtree = Figtree({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-figtree" });
export const outfit = Outfit({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-outfit" });
export const poppins = Poppins({ subsets: ["latin"], display: "swap", preload: false, weight: ["300", "400", "500", "600", "700", "800"], variable: "--studio-poppins" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-space-grotesk" });
export const workSans = Work_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-work-sans" });
export const lexend = Lexend({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-lexend" });
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-bricolage" });

export const lora = Lora({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-lora" });
export const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-playfair" });
export const spectral = Spectral({ subsets: ["latin"], display: "swap", preload: false, weight: ["200", "300", "400", "500", "600", "700", "800"], variable: "--studio-spectral" });
export const instrumentSerif = Instrument_Serif({ subsets: ["latin"], display: "swap", preload: false, weight: ["400"], variable: "--studio-instrument-serif" });
export const ebGaramond = EB_Garamond({ subsets: ["latin"], display: "swap", preload: false, variable: "--studio-eb-garamond" });
