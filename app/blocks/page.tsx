import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { BLOCKS, type BlockMeta } from "@/components/blocks";
import { installCommand } from "@/lib/site";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { BlockViewer } from "./BlockViewer";

export const metadata: Metadata = {
  title: "Blocks",
};

const CATEGORIES: Array<[BlockMeta["category"], string]> = [
  ["dashboard", "Dashboard"],
  ["apps", "Apps"],
  ["data", "Data"],
  ["settings", "Settings"],
  ["layout", "Layouts"],
  ["auth", "Authentication"],
];

/** A block's files, read at build time for the code view. */
function filesOf(name: string) {
  const dir = join(process.cwd(), "components/blocks", name);
  return readdirSync(dir)
    .filter((f) => /\.(tsx?|css|json)$/.test(f))
    .sort((a, b) => (a === "index.tsx" ? -1 : b === "index.tsx" ? 1 : a.localeCompare(b)))
    .map((f) => ({ name: f, path: `components/blocks/${name}/${f}`, code: readFileSync(join(dir, f), "utf8") }));
}

// Blocks: whole pages built from Rime components, each a registry item you
// install with one command and own afterwards.
export default function BlocksPage() {
  const groups = CATEGORIES.map(([id, label]) => [label, BLOCKS.filter((b) => b.category === id)] as const).filter(([, list]) => list.length);
  return (
    <DocsShell current="/blocks" sidebar={false} pager={false} toc={BLOCKS.map((b) => ({ id: b.name, label: b.title }))}>
      <h1 className={styles.title}>Blocks</h1>
      <p className={styles.lede}>
        Whole pages built from Rime components: a dashboard, an inbox, a data table, settings, shell layouts and the sign-in set.
        Install one with the shadcn CLI and it lands in components/blocks as code you own. Every block works in each preset and in light
        and dark mode.
      </p>
      {groups.map(([label, list]) => (
        <section key={label} className={styles.section} aria-label={label}>
          <h2 className={styles.h2}>{label}</h2>
          {list.map((b) => (
            <BlockViewer key={b.name} block={b} files={filesOf(b.name)} install={installCommand(b.name)} />
          ))}
        </section>
      ))}
    </DocsShell>
  );
}
