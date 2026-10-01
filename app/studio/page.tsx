import type { Metadata } from "next";
import { dmSans, fraunces, jakarta, nunito, plex, sourceSans, sourceSerif } from "../fonts/fonts";
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
  { id: "source-serif", name: "Source Serif 4", family: sourceSerif.style.fontFamily, kind: "serif", variable: sourceSerif.variable },
  { id: "fraunces", name: "Fraunces", family: fraunces.style.fontFamily, kind: "serif", variable: fraunces.variable },
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
