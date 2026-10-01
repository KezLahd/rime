"use client";

import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { StatusPill } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { GlassPanel } from "@/components/ui/GlassPanel/GlassPanel";
import { IconPlus } from "@/components/ui/Icon/Icon";
import styles from "./HeaderOnly.module.css";

const NAV = [
  { href: "/overview", label: "Overview", exact: true },
  { href: "/projects", label: "Projects", count: 3 },
  { href: "/invoices", label: "Invoices" },
  { href: "/settings", label: "Settings" },
];

const PROJECTS = [
  { name: "Atlas redesign", owner: "Jane Cooper", due: "14 Oct", status: "On track", tone: "success" },
  { name: "Cobalt billing API", owner: "Wade Warren", due: "21 Oct", status: "At risk", tone: "warning" },
  { name: "Ember mobile app", owner: "Esther Howard", due: "2 Nov", status: "On track", tone: "success" },
  { name: "Fjord analytics", owner: "Robert Fox", due: "9 Nov", status: "Planning", tone: "neutral" },
] as const;

export type HeaderOnlyProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Header-only layout: no sidebar. The logo, a short horizontal nav and the
 * profile share one frosted top bar; the page runs full width beneath. For
 * products with five or fewer top-level sections.
 */
export default function HeaderOnly({ contained }: HeaderOnlyProps) {
  return (
    <SidebarShell
      contained={contained}
      layout="header"
      navLabel="Main"
      nav={NAV}
      activeHref="/projects"
      topbarRight={<Avatar name="Jane Cooper" size="sm" tone="brand" />}
    >
      <div className={styles.page}>
        <PageHeader title="Projects" description="Four active projects across two teams." actions={<Button iconStart={<IconPlus size={15} />}>New project</Button>} />
        <GlassPanel padding="none">
          <ul className={styles.list}>
            {PROJECTS.map((p) => (
              <li key={p.name} className={styles.row}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.meta}>
                  <Avatar name={p.owner} size="sm" tone="neutral" /> {p.owner}
                </span>
                <span className={styles.meta}>Due {p.due}</span>
                <StatusPill tone={p.tone}>{p.status}</StatusPill>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>
    </SidebarShell>
  );
}
