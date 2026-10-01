import localFont from "next/font/local";

// Inter, self-hosted (SIL Open Font License), so the app builds offline.
// Rime's tokens point --font-body and --font-display at --font-inter.
export const inter = localFont({
  src: "./fonts/inter-latin-100-900-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});
