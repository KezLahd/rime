import type { Metadata } from "next";
import Link from "next/link";
import { REGISTRY } from "@/components/ui/_registry";
import { SITE } from "@/lib/site";
import styles from "./_docs/Docs.module.css";
import { DocsShell } from "./_docs/DocsShell";
import { InstallCommand } from "./_docs/Install";
import home from "./_home/Home.module.css";
import { Showcase } from "./_home/Showcase";

export const metadata: Metadata = {
  title: { absolute: "Rime: frosted-glass React components" },
  description: "Rime is a React component kit with frosted-glass surfaces, installed with the shadcn CLI and themed with one CSS file.",
  metadataBase: new URL(SITE.url),
  openGraph: { title: "Rime", description: "Frosted-glass React components, installed with the shadcn CLI.", url: SITE.url, siteName: "Rime" },
};

const FEATURES = [
  {
    title: "Frosted glass, by default",
    body: "Translucent panels, a lit edge and a soft two-layer shadow over a gently tinted field. Rime Flat switches it all to opaque planes, and both presets have a dark mode.",
    href: "/foundations",
    cta: "See the foundations",
  },
  {
    title: "Rime Studio",
    body: "Start from a preset, drop in a logo to extract a palette, tune glass, shape, shadows and hover, check contrast in both modes, and export one theme.css.",
    href: "/themes",
    cta: "Open Rime Studio",
  },
  {
    title: "Ready for AI agents",
    body: "Every page has a markdown twin, the whole site is in llms.txt, the registry works with the shadcn MCP server, and a Claude skill ships with the agent docs.",
    href: "/docs/ai",
    cta: "Read the AI guide",
  },
];

// The home page: the pitch, the install line, a live showcase of example
// apps built only from Rime, and three short feature sections.
export default function Home() {
  return (
    <DocsShell current="/" sidebar={false} pager={false} wide>
      <section className={home.hero} aria-labelledby="hero-h">
        <h1 id="hero-h" className={home.heroTitle}>
          Frosted-glass components you own
        </h1>
        <p className={home.heroLede}>
          Rime is a React component kit that installs like shadcn/ui and themes with one CSS file. {REGISTRY.length} accessible
          components, blocks and charts, with no Tailwind underneath.
        </p>
        <div className={home.heroActions}>
          <Link href="/docs" className={home.ctaPrimary}>
            Get started
          </Link>
          <Link href="/components" className={home.ctaSecondary}>
            Browse components
          </Link>
        </div>
        <div className={home.heroInstall}>
          <InstallCommand items={["kit"]} label="Install Rime" />
        </div>
      </section>

      <Showcase />

      <section className={home.features} aria-label="Why Rime">
        {FEATURES.map((f) => (
          <div key={f.title} className={home.feature}>
            <h2 className={styles.h3}>{f.title}</h2>
            <p className={home.featureBody}>{f.body}</p>
            <Link href={f.href} className={home.featureLink}>
              {f.cta}
            </Link>
          </div>
        ))}
      </section>
    </DocsShell>
  );
}
