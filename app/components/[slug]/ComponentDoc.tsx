"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Button, Table, type Column } from "@/components/ui";
import type { PropTable, TokenRow } from "@/components/ui/_registry";
import type { GeneratedProp } from "@/components/ui/_registry/generated";
import type { RegistryEntry } from "@/components/ui/_registry/types";
import { PREVIEWS } from "../../_docs/previews";
import { CodeBlock } from "../../_docs/CodeBlock";
import styles from "../../_docs/Docs.module.css";
import { Example } from "../../_docs/Example";
import { Installation } from "../../_docs/Installation";
import { PageActions } from "../../_docs/PageActions";
import type { InstallInfo } from "@/lib/registry-items";

export function ComponentDoc({
  entry,
  propTables,
  tokens,
  markdownHref,
  install,
  prev,
  next,
}: {
  entry: RegistryEntry;
  propTables: PropTable[];
  tokens: { hooks: TokenRow[]; reads: TokenRow[] };
  markdownHref: string;
  install: InstallInfo | null;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  const previews = PREVIEWS[entry.slug] ?? {};
  return (
    <article>
      <div className={styles.pageHead}>
        <h1 className={styles.title}>{entry.name}</h1>
        <PageActions markdownPath={markdownHref} pageTitle={entry.name} prev={prev} next={next} />
      </div>
      <p className={styles.lede}>{entry.summary}</p>

      <div className={styles.section} id="overview">
        <div className={styles.prose}>
          {entry.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {install ? (
        <section className={styles.section} id="installation" aria-labelledby="install-h">
          <h2 id="install-h" className={styles.h2}>
            Installation
          </h2>
          <Installation info={install} />
        </section>
      ) : null}

      <section className={styles.section} id="usage" aria-labelledby="usage-h">
        <h2 id="usage-h" className={styles.h2}>
          Usage
        </h2>
        <CodeBlock code={`${entry.importLine}\n\n${entry.usage}`} label="Usage" />
      </section>

      {entry.composition ? (
        <section className={styles.section} id="composition" aria-labelledby="composition-h">
          <h2 id="composition-h" className={styles.h2}>
            Composition
          </h2>
          <CodeBlock code={entry.composition} label="Composition" />
        </section>
      ) : null}

      {entry.examples.length ? (
        <section className={styles.section} id="examples" aria-labelledby="examples-h">
          <h2 id="examples-h" className={styles.h2}>
            Examples
          </h2>
          {entry.examples.map((ex) => {
            const Render = previews[ex.id];
            return (
              <Example key={ex.id} id={`example-${ex.id}`} title={ex.title} description={ex.description} code={ex.code} block={entry.layout === "block"}>
                {Render ? (
                  <Render />
                ) : (
                  <Alert tone="info" title="No live specimen yet">
                    The code tab shows how this example is written.
                  </Alert>
                )}
              </Example>
            );
          })}
        </section>
      ) : null}

      {propTables.length ? (
        <section className={styles.section} id="api" aria-labelledby="api-h">
          <h2 id="api-h" className={styles.h2}>
            API
          </h2>
          <p className={styles.note}>
            Generated from the component&apos;s TypeScript types and JSDoc (scripts/gen-ui-registry.mjs), so it always matches the
            source.
          </p>
          {propTables.map((t) => (
            <ApiTable key={t.component} table={t} />
          ))}
        </section>
      ) : null}

      <section className={styles.section} id="tokens" aria-labelledby="tokens-h">
        <h2 id="tokens-h" className={styles.h2}>
          Theme tokens
        </h2>
        <p className={styles.note}>
          Per-component tokens are undeclared by default, so the default shown is the fallback the CSS uses. Set one at :root (or in
          theme.css) to restyle every instance. Live values are read from this page, so they follow the Rime Studio.
        </p>
        <TokenTable rows={tokens.hooks} caption={`${entry.name} per-component tokens`} empty="This component has no tokens of its own; it reads the system tokens below." />
        {tokens.reads.length ? (
          <>
            <h3 className={styles.h3}>System tokens it reads</h3>
            <TokenTable rows={tokens.reads} caption={`${entry.name} system tokens`} empty="" />
          </>
        ) : null}
      </section>

      <section className={styles.section} id="accessibility" aria-labelledby="a11y-h">
        <h2 id="a11y-h" className={styles.h2}>
          Accessibility
        </h2>
        <ul className={styles.list}>
          {entry.accessibility.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} id="rules" aria-labelledby="rules-h">
        <h2 id="rules-h" className={styles.h2}>
          Do and don&apos;t
        </h2>
        <div className={styles.rules}>
          <div className={styles.rule}>
            <p className={`${styles.ruleTitle} ${styles.ruleDo}`}>
              <Check size={16} aria-hidden="true" /> Do
            </p>
            <ul className={styles.ruleList}>
              {entry.dos.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div className={styles.rule}>
            <p className={`${styles.ruleTitle} ${styles.ruleDont}`}>
              <X size={16} aria-hidden="true" /> Don&apos;t
            </p>
            <ul className={styles.ruleList}>
              {entry.donts.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} id="for-ai" aria-labelledby="ai-h">
        <h2 id="ai-h" className={styles.h2}>
          For AI agents
        </h2>
        <p className={styles.note}>
          This page as markdown, rendered from the same registry entry. Point an agent at it (or add .md to this page's URL), or at /llms.txt for the index.
        </p>
        <Button href={markdownHref} variant="secondary" size="sm" prefetch={false}>
          Open {entry.slug}.md
        </Button>
        {entry.related?.length ? (
          <p className={styles.passThrough}>
            Related:{" "}
            {entry.related.map((r, i) => (
              <span key={r}>
                {i ? ", " : ""}
                <Link href={`/components/${r}`}>{r}</Link>
              </span>
            ))}
          </p>
        ) : null}
      </section>
    </article>
  );
}

const propColumns: Column<GeneratedProp>[] = [
  {
    key: "name",
    header: "Prop",
    cell: (p) => (
      <>
        <span className={styles.mono}>{p.name}</span>
        {p.required ? <span className={styles.required}>Required</span> : null}
      </>
    ),
    width: "22%",
  },
  { key: "type", header: "Type", cell: (p) => <span className={styles.typeCell}>{p.type}</span>, width: "26%" },
  { key: "default", header: "Default", cell: (p) => (p.default ? <span className={styles.mono}>{p.default}</span> : null), width: "12%" },
  { key: "description", header: "Description", cell: (p) => p.description || null },
];

function ApiTable({ table }: { table: PropTable }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.h3}>{table.component}</h3>
      <Table appearance="white" caption={`${table.component} props`} columns={propColumns} rows={table.props} rowKey={(p) => p.name} />
      {table.passThrough.length ? (
        <p className={styles.passThrough}>Also accepts the native attributes of {table.passThrough.join(", ")}.</p>
      ) : null}
    </div>
  );
}

type LiveRow = TokenRow & { live: string };

/** The resolved value of each token on this page, read after mount. Hooks resolve through their fallback. */
function useLive(rows: TokenRow[]): LiveRow[] {
  const [live, setLive] = useState<Record<string, string>>({});
  const signature = rows.map((r) => r.name).join("|");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const probe = document.createElement("div");
      probe.style.display = "none";
      document.body.appendChild(probe);
      const next: Record<string, string> = {};
      for (const r of rows) {
        const own = getComputedStyle(document.documentElement).getPropertyValue(r.name).trim();
        if (own) {
          next[r.name] = own;
        } else if (r.defaults[0]) {
          probe.style.setProperty("--probe", r.defaults[0]);
          next[r.name] = getComputedStyle(probe).getPropertyValue("--probe").trim();
        }
      }
      probe.remove();
      setLive(next);
    });
    return () => cancelAnimationFrame(frame);
    // rows is stable per page; the signature covers a change of entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return rows.map((r) => ({ ...r, live: live[r.name] ?? "" }));
}

const isColour = (v: string) => /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(v) && !/gradient|\)\s*,|px/.test(v);

const tokenColumns: Column<LiveRow>[] = [
  { key: "name", header: "Token", cell: (r) => <span className={styles.mono}>{r.name}</span>, width: "28%" },
  {
    key: "default",
    header: "Default",
    cell: (r) => (r.hook ? <span className={styles.mono}>{r.defaults.join(" / ")}</span> : <span className={styles.mono}>tokens.css</span>),
    width: "30%",
  },
  {
    key: "live",
    header: "Live value",
    cell: (r) =>
      r.live ? (
        <span className={styles.mono}>
          {isColour(r.live) ? <span className={styles.swatch} style={{ background: r.live }} aria-hidden="true" /> : null}
          {r.live}
        </span>
      ) : (
        <span className={styles.mono}>…</span>
      ),
  },
];

function TokenTable({ rows, caption, empty }: { rows: TokenRow[]; caption: string; empty: string }) {
  const live = useLive(rows);
  if (!rows.length) return empty ? <p className={styles.note}>{empty}</p> : null;
  return <Table appearance="white" caption={caption} columns={tokenColumns} rows={live} rowKey={(r) => r.name} />;
}
