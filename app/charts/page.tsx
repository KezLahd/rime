import type { Metadata } from "next";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { ChartsGallery } from "./ChartsGallery";

export const metadata: Metadata = {
  title: "Charts",
};

export default function ChartsPage() {
  return (
    <DocsShell current="/charts" sidebar={false} pager={false}>
      <h1 className={styles.title}>Charts</h1>
      <p className={styles.lede}>
        The high-level charts (LineChart, AreaChart, BarChart, DonutChart, StatStrip) and the shadcn-compatible primitives
        (ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend) on Rime&apos;s tokens. Every colour comes from the chart
        palette in tokens.css, so the preset, the mode and Rime Studio re-theme them. Move the pointer across a chart: the tooltip
        glides.
      </p>
      <ChartsGallery />
    </DocsShell>
  );
}
