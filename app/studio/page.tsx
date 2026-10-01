import type { Metadata } from "next";
import {
  bricolage,
  dmSans,
  ebGaramond,
  figtree,
  fraunces,
  instrumentSerif,
  jakarta,
  lexend,
  lora,
  manrope,
  nunito,
  outfit,
  playfair,
  plex,
  poppins,
  sourceSans,
  sourceSerif,
  spaceGrotesk,
  spectral,
  workSans,
} from "../fonts/fonts";
import type { StudioFont } from "./api";
import { Studio } from "./Studio";

export const metadata: Metadata = {
  title: "Rime Studio",
};

// The fonts a theme can pick, self-hosted from app/fonts. Not preloaded: a
// font downloads only once a theme uses it, and only on this page.

const FONTS: ReadonlyArray<StudioFont & { variable: string }> = [
  { id: "inter", name: "Inter", family: "var(--font-inter), Inter", kind: "sans", variable: "" },
  { id: "jakarta", name: "Plus Jakarta Sans", family: jakarta.style.fontFamily, kind: "sans", variable: jakarta.variable },
  { id: "dm-sans", name: "DM Sans", family: dmSans.style.fontFamily, kind: "sans", variable: dmSans.variable },
  { id: "source-sans", name: "Source Sans 3", family: sourceSans.style.fontFamily, kind: "sans", variable: sourceSans.variable },
  { id: "plex", name: "IBM Plex Sans", family: plex.style.fontFamily, kind: "sans", variable: plex.variable },
  { id: "nunito", name: "Nunito Sans", family: nunito.style.fontFamily, kind: "sans", variable: nunito.variable },
  { id: "manrope", name: "Manrope", family: manrope.style.fontFamily, kind: "sans", variable: manrope.variable },
  { id: "figtree", name: "Figtree", family: figtree.style.fontFamily, kind: "sans", variable: figtree.variable },
  { id: "outfit", name: "Outfit", family: outfit.style.fontFamily, kind: "sans", variable: outfit.variable },
  { id: "poppins", name: "Poppins", family: poppins.style.fontFamily, kind: "sans", variable: poppins.variable },
  { id: "space-grotesk", name: "Space Grotesk", family: spaceGrotesk.style.fontFamily, kind: "sans", variable: spaceGrotesk.variable },
  { id: "work-sans", name: "Work Sans", family: workSans.style.fontFamily, kind: "sans", variable: workSans.variable },
  { id: "lexend", name: "Lexend", family: lexend.style.fontFamily, kind: "sans", variable: lexend.variable },
  { id: "bricolage", name: "Bricolage Grotesque", family: bricolage.style.fontFamily, kind: "display", variable: bricolage.variable },
  { id: "source-serif", name: "Source Serif 4", family: sourceSerif.style.fontFamily, kind: "serif", variable: sourceSerif.variable },
  { id: "fraunces", name: "Fraunces", family: fraunces.style.fontFamily, kind: "serif", variable: fraunces.variable },
  { id: "lora", name: "Lora", family: lora.style.fontFamily, kind: "serif", variable: lora.variable },
  { id: "playfair", name: "Playfair Display", family: playfair.style.fontFamily, kind: "serif", variable: playfair.variable },
  { id: "spectral", name: "Spectral", family: spectral.style.fontFamily, kind: "serif", variable: spectral.variable },
  { id: "instrument-serif", name: "Instrument Serif", family: instrumentSerif.style.fontFamily, kind: "serif", variable: instrumentSerif.variable },
  { id: "eb-garamond", name: "EB Garamond", family: ebGaramond.style.fontFamily, kind: "serif", variable: ebGaramond.variable },
];

// Rime Studio. The theme it edits is applied only while it is mounted
// (see engine/theme.ts).
export default function StudioPage() {
  return (
    <Studio
      fonts={FONTS.map(({ id, name, family, kind }) => ({ id, name, family, kind }))}
      fontClasses={FONTS.map((f) => f.variable).filter(Boolean).join(" ")}
    />
  );
}
