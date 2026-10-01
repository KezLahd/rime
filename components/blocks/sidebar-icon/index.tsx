"use client";

import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { StatusPill } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { GlassPanel } from "@/components/ui/GlassPanel/GlassPanel";
import { IconBook, IconClipboard, IconFile, IconHome, IconPlus, IconUsers } from "@/components/ui/Icon/Icon";
import styles from "./SidebarIcon.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 3 },
  { href: "/invoices", label: "Invoices", icon: <IconFile size={16} /> },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/docs", label: "Docs", icon: <IconBook size={16} /> },
];

const PROJECTS = [
  { name: "Atlas redesign", owner: "Jane Cooper", due: "14 Oct", status: "On track", tone: "success" },
  { name: "Cobalt billing API", owner: "Wade Warren", due: "21 Oct", status: "At risk", tone: "warning" },
  { name: "Ember mobile app", owner: "Esther Howard", due: "2 Nov", status: "On track", tone: "success" },
  { name: "Fjord analytics", owner: "Robert Fox", due: "9 Nov", status: "Planning", tone: "neutral" },
] as const;

export type SidebarIconProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Sidebar that collapses to an icon rail: the panel button at the start of
 * the top bar folds it, and the choice is remembered (storageKey). Labels
 * stay as tooltips and for screen readers; counts move onto the icons.
 */
export default function SidebarIcon({ contained }: SidebarIconProps) {
  return (
    <SidebarShell
      contained={contained}
      collapsible
      defaultCollapsed
      storageKey="acme-sidebar-collapsed"
      navLabel="Main"
      nav={NAV}
      activeHref="/projects"
      title="Projects"
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
