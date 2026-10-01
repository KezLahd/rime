import type { Metadata } from "next";
import { CodeBlock } from "../../_docs/CodeBlock";
import styles from "../../_docs/Docs.module.css";
import { DocsShell } from "../../_docs/DocsShell";

export const metadata: Metadata = { title: "Dark mode" };

const TOC = [
  { id: "how", label: "How it works" },
  { id: "next", label: "Next.js setup" },
  { id: "next-themes", label: "With next-themes" },
];

export default function DarkMode() {
  return (
    <DocsShell current="/docs/dark-mode" toc={TOC}>
      <h1 className={styles.title}>Dark mode</h1>
      <p className={styles.lede}>
        Dark is a mode, not a preset: Rime Default and Rime Flat both have a dark mode. Press D anywhere on this site to try it.
      </p>

      <section className={styles.section} id="how" aria-labelledby="how-h">
        <h2 id="how-h" className={styles.h2}>
          How it works
        </h2>
        <p className={styles.note}>
          tokens.css repaints every colour under data-mode=&quot;dark&quot; or the .dark class, on &lt;html&gt; or any wrapper.
          The light channel (--rgb-white) points at the raised surface colour, so every translucent fill darkens with it; Flat stays
          opaque. Portalled overlays follow because the selectors also match :root:has(...).
        </p>
      </section>

      <section className={styles.section} id="next" aria-labelledby="next-h">
        <h2 id="next-h" className={styles.h2}>
          Next.js setup
        </h2>
        <p className={styles.note}>
          Set the attributes before paint so a reload never flashes: a tiny inline script in &lt;head&gt; that reads the stored
          choice, falling back to the system preference.
        </p>
        <CodeBlock
          label="app/layout.tsx"
          code={`const THEME_SCRIPT = \`try{var d=document.documentElement,m=localStorage.getItem("mode");
if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
if(m==="dark"){d.classList.add("dark");d.setAttribute("data-mode","dark")}d.style.colorScheme=m}catch(e){}\`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
        />
        <p className={styles.note} style={{ marginTop: 14 }}>
          To toggle: add or remove the dark class (and data-mode), store the choice, and switch transitions off for one frame so
          colours don&apos;t tween.
        </p>
      </section>

      <section className={styles.section} id="next-themes" aria-labelledby="nt-h">
        <h2 id="nt-h" className={styles.h2}>
          With next-themes
        </h2>
        <p className={styles.note}>Rime accepts the .dark class, so shadcn&apos;s setup works unchanged:</p>
        <CodeBlock
          code={`<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>`}
        />
      </section>
    </DocsShell>
  );
}
