import type { Metadata } from "next";
import { PATTERNS } from "@/components/ui/_registry";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { PatternExample } from "./PatternPreview";

export const metadata: Metadata = {
  title: "Patterns",
};

// The composed patterns, rendered from components/ui/_registry/patterns.ts.
// Each is one example frame with Preview | Code tabs, the pattern filling the
// frame at its real width, and its rules beneath.
export default function PatternsPage() {
  return (
    <DocsShell current="patterns" toc={PATTERNS.map((p) => ({ id: p.slug, label: p.name }))}>
      <h1 className={styles.title}>Patterns</h1>
      <p className={styles.lede}>Several primitives with one job. Each is how the job is always done, so screens never reinvent it.</p>
      {PATTERNS.map((p) => (
        <div key={p.slug} className={styles.section}>
          <PatternExample slug={p.slug} name={p.name} summary={p.summary} description={p.description} code={p.code} />
          <ul className={`${styles.list} ${styles.listSpaced}`}>
            {p.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ))}
    </DocsShell>
  );
}
