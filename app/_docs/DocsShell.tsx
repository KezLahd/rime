import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { SITE } from "@/lib/site";
import styles from "./Docs.module.css";
import { DocsCommand } from "./DocsCommand";
import { DocsLogo } from "./DocsLogo";
import { DocsSidebar } from "./DocsSidebar";
import { FooterReveal } from "./FooterReveal";
import { GITHUB_URL, TOP_NAV, neighbours, normaliseCurrent, sidebarSections } from "./nav";
import { ModeToggle, PresetSwitch } from "./PresetSwitch";
import { Toc, type TocItem } from "./Toc";

/**
 * The current page as a path ("/docs/installation", "/components/button").
 * Area names from older callers ("overview", "component:button") still work.
 */
export type DocsCurrent = string;

/**
 * The docs frame: the frosted top bar, the docs sidebar as a flush frosted
 * rail (getting started, guides, then every component, its scrollbar hidden
 * until hover), the page, an optional "on this page" rail, and previous /
 * next links under docs and component pages. `sidebar={false}` for full-width
 * galleries (blocks, charts, the home page).
 */
export function DocsShell({
  current,
  toc,
  children,
  sidebar = true,
  pager = true,
  wide = false,
}: {
  current: DocsCurrent;
  toc?: ReadonlyArray<TocItem>;
  children: ReactNode;
  sidebar?: boolean;
  pager?: boolean;
  /** Full-bleed content (the home page): no side padding cap. */
  wide?: boolean;
}) {
  const path = normaliseCurrent(current);
  const { prev, next } = pager ? neighbours(path) : {};
  return (
    <div className={styles.frame}>
      <DocsTopBar current={path} />
      <div className={cx(styles.columns, !toc?.length && styles.noToc, !sidebar && styles.noSidebar, wide && styles.wide)}>
        {sidebar ? (
          <DocsSidebar>
            <nav aria-label="Docs" className={styles.nav}>
              {sidebarSections().map((section) => (
                <div key={section.title} className={styles.navGroup}>
                  <p className={styles.navHeading}>{section.title}</p>
                  <div className={styles.navList}>
                    {section.items.map((item) => (
                      <NavLink key={item.href} href={item.href} active={path === item.href}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </DocsSidebar>
        ) : null}
        <main id="main" className={styles.main}>
          {children}
          {prev || next ? (
            <nav aria-label="Previous and next" className={styles.pager}>
              {prev ? (
                <Link href={prev.href} className={styles.pagerLink}>
                  <ArrowLeft size={15} aria-hidden="true" />
                  <span>{prev.label}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={next.href} className={cx(styles.pagerLink, styles.pagerNext)}>
                  <span>{next.label}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </main>
        {toc?.length ? <Toc items={toc} /> : null}
      </div>
      <DocsFooter />
      {/* Watches the footer: when it enters the viewport, sets
          data-footer-visible on <html> so the sticky top bar slides out of
          view. Works on every page length, short or long. */}
      <FooterReveal />
    </div>
  );
}

/**
 * Site footer: Rime brand on the left, three link columns in the middle,
 * "another kez curation" on the right, and a thin bottom row with the
 * current year. Lives outside the sticky region so the top bar scrolls off
 * exactly when the footer enters the viewport.
 */
function DocsFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerMark} aria-label="Rime, home">
              <DocsLogo />
            </Link>
            <p className={styles.footerTagline}>
              Frosted-glass React components you own. Installed with the shadcn CLI, themed with one CSS file.
            </p>
          </div>
          <nav aria-label="Footer" className={styles.footerNav}>
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Explore</p>
              <ul className={styles.footerLinks}>
                <li><Link href="/docs" className={styles.footerLink}>Docs</Link></li>
                <li><Link href="/components" className={styles.footerLink}>Components</Link></li>
                <li><Link href="/blocks" className={styles.footerLink}>Blocks</Link></li>
                <li><Link href="/charts" className={styles.footerLink}>Charts</Link></li>
                <li><Link href="/themes" className={styles.footerLink}>Rime Studio</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Foundations</p>
              <ul className={styles.footerLinks}>
                <li><Link href="/foundations" className={styles.footerLink}>Foundations</Link></li>
                <li><Link href="/colors" className={styles.footerLink}>Colors</Link></li>
                <li><Link href="/patterns" className={styles.footerLink}>Patterns</Link></li>
                <li><Link href="/docs/theming" className={styles.footerLink}>Theming</Link></li>
                <li><Link href="/docs/dark-mode" className={styles.footerLink}>Dark mode</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Resources</p>
              <ul className={styles.footerLinks}>
                <li><Link href="/docs/installation" className={styles.footerLink}>Installation</Link></li>
                <li><Link href="/docs/shadcn" className={styles.footerLink}>Coming from shadcn</Link></li>
                <li><Link href="/docs/ai" className={styles.footerLink}>AI agents</Link></li>
                <li><a href="/llms.txt" className={styles.footerLink}>llms.txt</a></li>
                <li><a href={GITHUB_URL} className={styles.footerLink} target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerMeta}>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <a
            href="https://instagram.com/kieranjxn"
            target="_blank"
            rel="noopener noreferrer"
            className={cx(styles.footerMeta, styles.footerCuration)}
          >
            another kez curation
          </a>
        </div>
      </div>
    </footer>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={styles.navLink} aria-current={active ? "page" : undefined}>
      <span>{children}</span>
    </Link>
  );
}

/**
 * The frosted top bar shared by every page, Rime Studio included: the Rime
 * lockup, the site navigation, search (Cmd or Ctrl K, or /), GitHub, the
 * preset switch and the mode toggle.
 */
export function DocsTopBar({ current, className }: { current: DocsCurrent; className?: string }) {
  const path = normaliseCurrent(current);
  const active = (href: string) => path === href || path.startsWith(`${href}/`) || (href === "/docs" && ["/foundations", "/patterns"].includes(path));
  return (
    <header className={cx(styles.topbar, className)}>
      <div className={styles.bar}>
        <Link href="/" className={styles.mark} aria-label="Rime, home">
          <DocsLogo />
        </Link>
        <nav aria-label="Site" className={styles.barLinks}>
          {TOP_NAV.map((l) => (
            <Link key={l.href} href={l.href} className={styles.barLink} aria-current={active(l.href) ? "page" : undefined} title={l.description}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={styles.barTools}>
          <DocsCommand />
          <span className={styles.barRule} aria-hidden="true" />
          <a className={styles.barIcon} href={GITHUB_URL} aria-label="Rime on GitHub" title="Rime on GitHub">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
          <PresetSwitch />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
