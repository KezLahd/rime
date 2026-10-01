import type { Metadata } from "next";
import Link from "next/link";
import { REGISTRY } from "@/components/ui/_registry";
import { UI_RULES } from "@/components/ui/_registry/markdown";
import { CodeBlock } from "../_docs/CodeBlock";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { InstallCommand } from "../_docs/Install";

export const metadata: Metadata = {
  title: "Introduction",
  description: "Rime: frosted-glass React components themed by CSS custom properties, installed with the shadcn CLI.",
};

const TOC = [
  { id: "what", label: "What Rime is" },
  { id: "quick-start", label: "Quick start" },
  { id: "rules", label: "The rules" },
  { id: "next", label: "Where next" },
];

export default function DocsIntro() {
  const full = REGISTRY.filter((e) => e.depth === "full").length;
  return (
    <DocsShell current="/docs" toc={TOC}>
      <h1 className={styles.title}>Introduction</h1>
      <p className={styles.lede}>
        Rime is a set of React components themed entirely by CSS custom properties: CSS Modules, no Tailwind and no component
        library underneath. A project keeps the components and swaps one theme file. {REGISTRY.length} components are documented
        ({full} in full), each with live examples, its API generated from the source, the tokens it reads, accessibility notes and
        rules.
      </p>

      <section className={styles.section} id="what" aria-labelledby="what-h">
        <h2 id="what-h" className={styles.h2}>
          What Rime is
        </h2>
        <div className={styles.prose}>
          <p>
            Rime installs like shadcn/ui: you copy the source into your project with the shadcn CLI and own it from then on. Unlike
            shadcn, every component is a folder with a .tsx file and a CSS Module, and every visual decision is a token. Two presets
            ship (Rime Default, frosted glass in Frost blue, and Rime Flat), each in light and dark mode. Rime Studio turns any brand
            into a theme.css.
          </p>
          <p>
            It is built for AI agents as much as people: every page has a markdown twin, the whole site is in /llms.txt, and the
            registry works with the shadcn MCP server.
          </p>
        </div>
      </section>

      <section className={styles.section} id="quick-start" aria-labelledby="qs-h">
        <h2 id="qs-h" className={styles.h2}>
          Quick start
        </h2>
        <p className={styles.note}>In a Next.js App Router project with the @/* path alias, add the base styles and everything:</p>
        <InstallCommand items={["kit"]} label="Install Rime" />
        <p className={styles.note} style={{ marginTop: 14 }}>
          Then import the styles first in app/globals.css, and wrap the app in ToastProvider:
        </p>
        <CodeBlock
          language="css"
          label="globals.css"
          code={`@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/shadcn-bridge.css";
@import "./styles/theme.css"; /* optional: your theme from Rime Studio */`}
        />
        <p className={styles.note} style={{ marginTop: 14 }}>
          Full steps, single components and the manual route are in <Link href="/docs/installation">Installation</Link>.
        </p>
      </section>

      <section className={styles.section} id="rules" aria-labelledby="rules-h">
        <h2 id="rules-h" className={styles.h2}>
          The rules
        </h2>
        <ul className={styles.list}>
          {UI_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} id="next" aria-labelledby="next-h">
        <h2 id="next-h" className={styles.h2}>
          Where next
        </h2>
        <ul className={styles.list}>
          <li>
            <Link href="/components">Components</Link>: every component as a live card, filterable by category.
          </li>
          <li>
            <Link href="/docs/theming">Theming</Link> and <Link href="/themes">Rime Studio</Link>: make a theme for your brand.
          </li>
          <li>
            <Link href="/docs/ai">AI agents</Link>: llms.txt, the registry, the MCP server and the Claude skill.
          </li>
          <li>
            <Link href="/docs/shadcn">Coming from shadcn</Link>: the name map and the variable bridge.
          </li>
        </ul>
      </section>
    </DocsShell>
  );
}
