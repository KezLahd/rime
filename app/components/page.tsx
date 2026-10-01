import type { Metadata } from "next";
import { CATEGORIES, REGISTRY } from "@/components/ui/_registry";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { ComponentIndex } from "./ComponentIndex";

export const metadata: Metadata = {
  title: "Components",
  description: "Every Rime component as a live, centred preview: search or filter by category.",
};

export default function ComponentsPage() {
  const cards = REGISTRY.map((e) => ({
    slug: e.slug,
    name: e.name,
    summary: e.summary,
    full: e.depth === "full",
    exampleId: e.examples[0]?.id ?? null,
    block: e.layout === "block",
    category: e.category,
    keywords: `${e.name} ${e.slug} ${e.summary} ${e.category}`.toLowerCase(),
  }));
  const categories = CATEGORIES.filter((c) => cards.some((x) => x.category === c));
  return (
    <DocsShell current="/components" pager={false}>
      <h1 className={styles.title}>Components</h1>
      <p className={styles.lede}>
        {REGISTRY.length} components, each shown live: overlays render open, so you see the toast, the menu and the dialog
        themselves. Pick one for its examples, API, tokens and install command.
      </p>
      <div className={styles.section}>
        <ComponentIndex cards={cards} categories={[...categories]} />
      </div>
    </DocsShell>
  );
}
