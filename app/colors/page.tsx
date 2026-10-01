import type { Metadata } from "next";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { FAMILIES } from "./tailwind-palette";
import { TailwindColors } from "./TailwindColors";

export const metadata: Metadata = {
  title: "Colors",
  description: "The full Tailwind palette in HEX, HSL, RGB and OKLCH. 22 families, 11 shades each. Click any tile to copy the value.",
};

export default function ColorsPage() {
  return (
    <DocsShell
      current="/colors"
      toc={FAMILIES.map((f) => ({ id: `c-${f.slug}`, label: f.name }))}
    >
      <h1 className={styles.title}>Tailwind Colors</h1>
      <p className={styles.lede}>
        The complete Tailwind palette (22 families, 11 shades each) in HEX, HSL, RGB and OKLCH. Pick a format on each row, then
        click a tile to copy its value.
      </p>
      <TailwindColors />
    </DocsShell>
  );
}
