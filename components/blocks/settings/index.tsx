"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SidebarShell } from "@/components/shell/SidebarShell";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Button } from "@/components/ui/Button/Button";
import { DangerZone, DangerZoneRow } from "@/components/ui/DangerZone/DangerZone";
import { Field } from "@/components/ui/Field/Field";
import { GlassPanel } from "@/components/ui/GlassPanel/GlassPanel";
import { IconBook, IconClipboard, IconFile, IconHome, IconUsers } from "@/components/ui/Icon/Icon";
import { Select } from "@/components/ui/Select/Select";
import { Switch } from "@/components/ui/Switch/Switch";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { TextInput } from "@/components/ui/TextInput/TextInput";
import { useToast } from "@/components/ui/Toast/Toast";
import styles from "./Settings.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
  { href: "/projects", label: "Projects", icon: <IconClipboard size={16} /> },
  { href: "/invoices", label: "Invoices", icon: <IconFile size={16} /> },
  { href: "/team", label: "Team", icon: <IconUsers size={16} /> },
  { href: "/settings", label: "Settings", icon: <IconBook size={16} /> },
];

const SECTIONS = [
  ["profile", "Profile"],
  ["account", "Account"],
  ["notifications", "Notifications"],
  ["danger", "Danger zone"],
] as const;
type Section = (typeof SECTIONS)[number][0];

export type SettingsProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Settings block: a section nav on the left, one frosted panel of field
 * groups on the right, and the Danger zone at the end, whose actions confirm
 * with a typed phrase. Drop it at app/settings.
 */
export default function Settings({ contained }: SettingsProps) {
  const toast = useToast();
  const [section, setSection] = useState<Section>("profile");
  const [timezone, setTimezone] = useState<string | null>("utc");
  const [language, setLanguage] = useState<string | null>("en");
  const [notify, setNotify] = useState({ invoices: true, mentions: true, digest: false, product: false });

  const save = () => toast.success("Settings saved");

  return (
    <SidebarShell
      contained={contained}
      navLabel="Main"
      nav={NAV}
      activeHref="/settings"
      title="Settings"
      topbarRight={<Avatar name="Jane Cooper" size="sm" tone="brand" />}
    >
      <div className={styles.page}>
        <PageHeader title="Settings" description="Your profile, your account and how Acme gets in touch." />
        <div className={styles.columns}>
          <nav aria-label="Settings sections" className={styles.sections}>
            {SECTIONS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={styles.sectionLink}
                aria-current={section === id ? "page" : undefined}
                data-danger={id === "danger" || undefined}
                onClick={() => setSection(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className={styles.content}>
            {section === "profile" ? (
              <GlassPanel padding="lg">
                <h2 className={styles.h2}>Profile</h2>
                <p className={styles.note}>How you appear to the rest of the team.</p>
                <div className={styles.fields}>
                  <div className={styles.row}>
                    <Field label="First name">
                      <TextInput autoComplete="given-name" defaultValue="Jane" />
                    </Field>
                    <Field label="Last name">
                      <TextInput autoComplete="family-name" defaultValue="Cooper" />
                    </Field>
                  </div>
                  <Field label="Job title" optional>
                    <TextInput defaultValue="Design lead" />
                  </Field>
                  <Field label="Bio" optional hint="A sentence or two for your profile card.">
                    <Textarea rows={3} defaultValue="Leads design on the Atlas and Beacon projects." />
                  </Field>
                </div>
                <div className={styles.actions}>
                  <Button onClick={save}>Save profile</Button>
                </div>
              </GlassPanel>
            ) : section === "account" ? (
              <GlassPanel padding="lg">
                <h2 className={styles.h2}>Account</h2>
                <p className={styles.note}>Sign-in details and regional settings.</p>
                <div className={styles.fields}>
                  <Field label="Email" hint="We send sign-in links and receipts here.">
                    <TextInput type="email" autoComplete="email" defaultValue="jane@acme.example" />
                  </Field>
                  <div className={styles.row}>
                    <Field label="Time zone">
                      <Select
                        value={timezone}
                        onChange={setTimezone}
                        options={[
                          { value: "utc", label: "UTC" },
                          { value: "london", label: "London (GMT+1)" },
                          { value: "new-york", label: "New York (GMT-4)" },
                          { value: "tokyo", label: "Tokyo (GMT+9)" },
                        ]}
                      />
                    </Field>
                    <Field label="Language">
                      <Select
                        value={language}
                        onChange={setLanguage}
                        options={[
                          { value: "en", label: "English" },
                          { value: "fr", label: "French" },
                          { value: "de", label: "German" },
                        ]}
                      />
                    </Field>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button onClick={save}>Save account</Button>
                </div>
              </GlassPanel>
            ) : section === "notifications" ? (
              <GlassPanel padding="lg">
                <h2 className={styles.h2}>Notifications</h2>
                <p className={styles.note}>Changes apply straight away.</p>
                <div className={styles.switches}>
                  <Switch label="Invoice paid" description="When a customer pays an invoice you sent." checked={notify.invoices} onChange={(v) => setNotify({ ...notify, invoices: v })} />
                  <Switch label="Mentions" description="When someone mentions you in a task or comment." checked={notify.mentions} onChange={(v) => setNotify({ ...notify, mentions: v })} />
                  <Switch label="Weekly digest" description="A summary of the week, every Monday morning." checked={notify.digest} onChange={(v) => setNotify({ ...notify, digest: v })} />
                  <Switch label="Product news" description="New features, at most once a month." checked={notify.product} onChange={(v) => setNotify({ ...notify, product: v })} />
                </div>
              </GlassPanel>
            ) : (
              <DangerZone description="These actions cannot be undone." headingLevel={2}>
                <DangerZoneRow
                  title="Transfer ownership"
                  description="Make another member the owner of the Acme workspace. You keep admin access."
                  actionLabel="Transfer ownership"
                  disabled
                  disabledReason="Invite another admin first."
                />
                <DangerZoneRow
                  title="Delete workspace"
                  description="Removes every project, invoice and file for everyone, straight away."
                  actionLabel="Delete workspace"
                  confirm={{
                    title: "Delete the Acme workspace?",
                    phrase: "delete acme",
                    confirmLabel: "Delete workspace",
                    impact: [
                      { id: "projects", severity: "destructive", title: "14 projects are deleted" },
                      { id: "members", severity: "destructive", title: "5 members lose access" },
                    ],
                    onConfirm: () => new Promise((r) => window.setTimeout(r, 900)),
                  }}
                />
              </DangerZone>
            )}
          </div>
        </div>
      </div>
    </SidebarShell>
  );
}
