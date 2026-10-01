import type { Metadata } from "next";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { COLOUR_GROUPS } from "../foundations/colour-groups";
import { Colours } from "../foundations/Foundations";

export const metadata: Metadata = {
  title: "Colors",
  description: "Rime's palette and every colour token, read live from the page in the current preset and mode.",
};

export default function ColorsPage() {
  return (
    <DocsShell current="/colors" toc={COLOUR_GROUPS.map((g) => ({ id: `c-${g.title.toLowerCase()}`, label: g.title }))}>
      <h1 className={styles.title}>Colors</h1>
      <p className={styles.lede}>
        Every colour token, read live from this page: switch the preset or press D for dark mode and the values follow. Click a
        swatch to copy its var(). Change them in app/styles/tokens.css or a theme.css from Rime Studio, never in a component.
      </p>
      <Colours />
    </DocsShell>
  );
}
