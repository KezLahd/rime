"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { StatusPill } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { IconBook, IconClipboard, IconFile, IconHome, IconPlus, IconUsers } from "@/components/ui/Icon/Icon";
import { SegmentedControl } from "@/components/ui/Tabs/Tabs";
import styles from "./SidebarInset.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 3 },
  { href: "/invoices", label: "Invoices", icon: <IconFile size={16} /> },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/docs", label: "Docs", icon: <IconBook size={16} /> },
];

const PROJECTS = [
  { name: "Atlas redesign", owner: "Jane Cooper", due: "14 Oct", status: "On track", tone: "success", team: "design" },
  { name: "Beacon onboarding", owner: "Brooklyn Simmons", due: "18 Oct", status: "On track", tone: "success", team: "design" },
  { name: "Cobalt billing API", owner: "Wade Warren", due: "21 Oct", status: "At risk", tone: "warning", team: "engineering" },
  { name: "Ember mobile app", owner: "Esther Howard", due: "2 Nov", status: "On track", tone: "success", team: "engineering" },
] as const;

export type SidebarInsetProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Inset layout: the frosted sidebar and top bar, with the page set into one
 * frosted sheet inside the main area, and a secondary nav across its top.
 */
export default function SidebarInset({ contained }: SidebarInsetProps) {
  const [team, setTeam] = useState<"all" | "design" | "engineering">("all");
  const list = PROJECTS.filter((p) => team === "all" || p.team === team);
  return (
    <SidebarShell
      contained={contained}
      collapsible
      navLabel="Main"
      nav={NAV}
      activeHref="/projects"
      title="Projects"
      topbarRight={<Avatar name="Jane Cooper" size="sm" tone="brand" />}
    >
      <div className={styles.inset}>
        <div className={styles.secondary}>
          <SegmentedControl
            aria-label="Team"
            size="sm"
            value={team}
            onChange={setTeam}
            options={[
              { value: "all", label: "All teams" },
              { value: "design", label: "Design" },
              { value: "engineering", label: "Engineering" },
            ]}
          />
        </div>
        <PageHeader title="Projects" description={`${list.length} active projects.`} actions={<Button iconStart={<IconPlus size={15} />}>New project</Button>} />
        <ul className={styles.list}>
          {list.map((p) => (
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
      </div>
    </SidebarShell>
  );
}
