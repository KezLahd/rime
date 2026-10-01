import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { CodeBlock } from "../../_docs/CodeBlock";
import styles from "../../_docs/Docs.module.css";
import { DocsShell } from "../../_docs/DocsShell";
import { InstallCommand } from "../../_docs/Install";

export const metadata: Metadata = { title: "Installation" };

const TOC = [
  { id: "requirements", label: "Requirements" },
  { id: "cli", label: "With the shadcn CLI" },
  { id: "styles", label: "Styles and providers" },
  { id: "single", label: "One component at a time" },
  { id: "namespace", label: "The @rime namespace and MCP" },
  { id: "manual", label: "Manual" },
];

export default function Installation() {
  return (
    <DocsShell current="/docs/installation" toc={TOC}>
      <h1 className={styles.title}>Installation</h1>
      <p className={styles.lede}>
        Rime is a shadcn registry of universal items: the shadcn CLI copies Rime&apos;s .tsx and CSS Module files into your project
        byte for byte, installs their npm dependencies and resolves the components they depend on. No Tailwind, no components.json
        required.
      </p>

      <section className={styles.section} id="requirements" aria-labelledby="req-h">
        <h2 id="req-h" className={styles.h2}>
          Requirements
        </h2>
        <ul className={styles.list}>
          <li>Next.js App Router (16 or newer), React 19, TypeScript.</li>
          <li>
            The path alias <code className={styles.inlineCode}>&quot;@/*&quot;: [&quot;./*&quot;]</code> in tsconfig.json, and no
            src/ directory (files land at <code className={styles.inlineCode}>components/ui/...</code> and{" "}
            <code className={styles.inlineCode}>app/styles/...</code>).
          </li>
        </ul>
      </section>

      <section className={styles.section} id="cli" aria-labelledby="cli-h">
        <h2 id="cli-h" className={styles.h2}>
          With the shadcn CLI
        </h2>
        <p className={styles.note}>
          Everything (base styles, every component, the shells, the charts and the barrel) in one command. Re-run it with --diff to
          see updates, then --overwrite to take them.
        </p>
        <InstallCommand items={["kit"]} label="Install everything" />
        <p className={styles.note} style={{ marginTop: 14 }}>
          The address is <code className={styles.inlineCode}>{SITE.owner}/{SITE.repo}/&lt;item&gt;</code>: the GitHub repo that
          holds registry.json. Until the repo is public on GitHub, replace {SITE.owner} in rime.config.json (or use the hosted
          mirror below).
        </p>
      </section>

      <section className={styles.section} id="styles" aria-labelledby="styles-h">
        <h2 id="styles-h" className={styles.h2}>
          Styles and providers
        </h2>
        <CodeBlock
          language="css"
          label="app/globals.css"
          code={`@import "./styles/tokens.css";        /* every token: Rime Default, Rime Flat, light and dark */
@import "./styles/base.css";          /* reset, type, focus, keyframes */
@import "./styles/shadcn-bridge.css"; /* shadcn variable names, aliased */
@import "./styles/theme.css";         /* optional: your theme from Rime Studio */`}
        />
        <CodeBlock
          label="app/layout.tsx"
          code={`import { ToastProvider } from "@/components/ui";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}`}
        />
        <p className={styles.note} style={{ marginTop: 14 }}>
          Dark mode and the Flat preset are attributes on &lt;html&gt;: see <Link href="/docs/dark-mode">Dark mode</Link>.
        </p>
      </section>

      <section className={styles.section} id="single" aria-labelledby="single-h">
        <h2 id="single-h" className={styles.h2}>
          One component at a time
        </h2>
        <p className={styles.note}>
          Every component page has its own install command. Items are named as shadcn names them where there is an equivalent
          (button, dialog, dropdown-menu, select, sheet...), so an agent trained on shadcn finds them.
        </p>
        <InstallCommand items={["base", "select", "dialog"]} label="Install a few" />
      </section>

      <section className={styles.section} id="namespace" aria-labelledby="ns-h">
        <h2 id="ns-h" className={styles.h2}>
          The {SITE.namespace} namespace and MCP
        </h2>
        <p className={styles.note}>
          The docs site serves a built mirror of the registry at {SITE.url}/r. Add it as a namespace in components.json to install
          with <code className={styles.inlineCode}>{SITE.namespace}/button</code> and to let the shadcn MCP server search Rime:
        </p>
        <CodeBlock
          language="text"
          label="components.json"
          code={`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "tailwind": { "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "ui": "@/components/ui", "utils": "@/components/ui/_internal/cx" },
  "registries": { "${SITE.namespace}": "${SITE.url}/r/{name}.json" }
}`}
        />
        <CodeBlock language="text" label=".mcp.json" code={`{ "mcpServers": { "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] } } }`} />
      </section>

      <section className={styles.section} id="manual" aria-labelledby="manual-h">
        <h2 id="manual-h" className={styles.h2}>
          Manual
        </h2>
        <ol className={styles.list}>
          <li>Copy app/styles (tokens.css, base.css, shadcn-bridge.css) and components/ui/_internal from this repo.</li>
          <li>Copy the component folders you need from components/ui (each component page lists its files and dependencies).</li>
          <li>Install lucide-react (and recharts for charts).</li>
          <li>Import the styles as above. Update the import paths if your alias differs.</li>
        </ol>
      </section>
    </DocsShell>
  );
}
