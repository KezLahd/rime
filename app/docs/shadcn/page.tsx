import type { Metadata } from "next";
import Link from "next/link";
import { SHADCN_MAP, SHADCN_TOKENS } from "@/components/ui/_registry/shadcn-map";
import { installAddress } from "@/lib/site";
import styles from "../../_docs/Docs.module.css";
import { DocsShell } from "../../_docs/DocsShell";

export const metadata: Metadata = { title: "Coming from shadcn" };

const TOC = [
  { id: "same", label: "What is the same" },
  { id: "different", label: "What is different" },
  { id: "names", label: "Component names" },
  { id: "tokens", label: "Variable names" },
];

export default function ComingFromShadcn() {
  return (
    <DocsShell current="/docs/shadcn" toc={TOC}>
      <h1 className={styles.title}>Coming from shadcn</h1>
      <p className={styles.lede}>
        Rime installs, names and reads like shadcn/ui, so what you (and your AI agents) already know carries over. The components
        underneath are Rime&apos;s own: CSS Modules and tokens, no Tailwind.
      </p>

      <section className={styles.section} id="same" aria-labelledby="same-h">
        <h2 id="same-h" className={styles.h2}>
          What is the same
        </h2>
        <ul className={styles.list}>
          <li>
            <code className={styles.inlineCode}>npx shadcn@latest add {installAddress("button")}</code>: you own the copied source.
          </li>
          <li>Item names follow shadcn (button, dialog, dropdown-menu, input-otp, sonner...), and the shadcn MCP server works.</li>
          <li>Button variants and sizes accept shadcn&apos;s names; Card has the shadcn parts; asChild on buttons and triggers; data-slot on every part.</li>
          <li>shadcn&apos;s CSS variable names exist as aliases (shadcn-bridge.css), and the .dark class switches dark mode.</li>
          <li>Charts take a ChartConfig and the ChartContainer / ChartTooltipContent primitives, with the same gliding tooltip.</li>
        </ul>
      </section>

      <section className={styles.section} id="different" aria-labelledby="diff-h">
        <h2 id="diff-h" className={styles.h2}>
          What is different
        </h2>
        <ul className={styles.list}>
          <li>Each component is a folder: components/ui/Button/Button.tsx and Button.module.css. Style with tokens, not class strings.</li>
          <li>No Tailwind, Radix or cva. Install real shadcn components alongside only if a project already runs Tailwind (see the tailwind-bridge item).</li>
          <li>Every component documents its tokens; Rime Studio themes them, with frosted glass as the default.</li>
        </ul>
      </section>

      <section className={styles.section} id="names" aria-labelledby="names-h">
        <h2 id="names-h" className={styles.h2}>
          Component names
        </h2>
        <table>
          <thead>
            <tr>
              <th>shadcn</th>
              <th>Rime</th>
              <th>Install</th>
            </tr>
          </thead>
          <tbody>
            {SHADCN_MAP.map((r) => (
              <tr key={r.shadcn}>
                <td>
                  <code className={styles.inlineCode}>{r.shadcn}</code>
                </td>
                <td>
                  <Link href={`/components/${r.slug}`}>{r.rime}</Link>
                  {r.note ? <span className={styles.passThrough}> ({r.note})</span> : null}
                </td>
                <td>
                  <code className={styles.inlineCode}>{r.install}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section} id="tokens" aria-labelledby="tokens-h">
        <h2 id="tokens-h" className={styles.h2}>
          Variable names
        </h2>
        <p className={styles.note}>One way only: the shadcn names point at Rime tokens. Edit the Rime tokens (or theme.css), never the aliases.</p>
        <table>
          <thead>
            <tr>
              <th>shadcn</th>
              <th>Rime token</th>
            </tr>
          </thead>
          <tbody>
            {SHADCN_TOKENS.map(([a, b]) => (
              <tr key={a}>
                <td>
                  <code className={styles.inlineCode}>{a}</code>
                </td>
                <td>
                  <code className={styles.inlineCode}>{b}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DocsShell>
  );
}
