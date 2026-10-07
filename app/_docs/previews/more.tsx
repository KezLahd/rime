"use client";

import { useState, type ReactNode } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { PageHeader } from "@/components/shell/PageHeader";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CountBadge,
  DangerZone,
  DangerZoneRow,
  DateField,
  DateRangeFilter,
  Divider,
  EmptyState,
  ErrorSummary,
  Field,
  FileDrop,
  FolderTabs,
  GlassPanel,
  IconButton,
  IconClipboard,
  IconFilter,
  IconMail,
  IconMoreHorizontal,
  IconPlus,
  IconPrinter,
  IconUsers,
  IconX,
  ImpactPreview,
  Menu,
  Meter,
  NavSearch,
  OtpInput,
  PrefixedInput,
  ProgressBar,
  ProgressSteps,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Skeleton,
  SkeletonText,
  Spinner,
  StatusPill,
  Stepper,
  Switch,
  TextInput,
  Textarea,
  TimeField,
  TimeRangeField,
  DateTimeField,
  DateTimeRangeField,
  Toggletip,
  ToastStackPreview,
  Tooltip,
  TypeToConfirmModal,
  useToast,
  type DateRange,
  type DateTime,
  type DateTimeRange,
  type ImpactItem,
  type IsoDate,
  type Time,
  type TimeRange,
} from "@/components/ui";
import styles from "./Previews.module.css";

// Specimens for the summary-depth entries: one honest example each, states
// included where the component has them. Sample data only.

const IMPACT: ImpactItem[] = [
  { id: "signout", severity: "destructive", title: "Jane Cooper is signed out everywhere", description: "Coming back needs a new invite." },
  { id: "projects", severity: "none", title: "No open projects to reassign" },
];

function Toasts() {
  const toast = useToast();
  return (
    <div className={styles.toastRow}>
      <Button variant="secondary" onClick={() => toast.success("Invoice sent", { description: "INV-1042 is on its way to Jane Cooper." })}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.error("Couldn't send", { description: "Check your connection.", action: { label: "Retry", onClick: () => {} } })}>
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          void toast.promise(new Promise((r) => window.setTimeout(r, 1500)), {
            loading: "Saving changes…",
            success: "Changes saved",
            error: "Couldn't save",
          })
        }
      >
        In flight
      </Button>
    </div>
  );
}

function ToastsOpen() {
  return (
    <ToastStackPreview
      expanded
      items={[
        { id: 1, tone: "loading", title: "Saving changes…" },
        { id: 2, tone: "error", title: "Couldn't send", description: "Check your connection.", action: { label: "Retry", onClick: () => {} } },
        { id: 3, tone: "success", title: "Invoice sent", description: "INV-1042 is on its way to Jane Cooper." },
      ]}
    />
  );
}

const MENU_ITEMS = [
  { id: "edit", label: "Edit details", onSelect: () => {} },
  { id: "print", label: "Print invoice", icon: <IconPrinter size={16} />, onSelect: () => {} },
  { id: "sep", separator: true as const },
  { id: "void", label: "Void invoice", tone: "danger" as const, onSelect: () => {} },
];

const NAV_ITEMS = [
  { id: "dash", label: "Dashboard", href: "/", group: "Pages" },
  { id: "team", label: "Team", href: "/", group: "Pages", icon: <IconUsers size={14} /> },
  { id: "inv", label: "Invoices", href: "/", group: "Pages", icon: <IconClipboard size={14} /> },
  { id: "new", label: "New project", href: "/", group: "Actions", icon: <IconPlus size={14} /> },
];

function Tabs() {
  const [tab, setTab] = useState("open");
  return (
    <div className={styles.block}>
      <FolderTabs
        aria-label="Orders"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "open", label: "Open", count: 12 },
          { id: "review", label: "In review", count: 4, colour: "amber" },
          { id: "cancelled", label: "Cancelled", count: 1, colour: "rose" },
        ]}
      >
        <p>Showing the {tab} queue.</p>
      </FolderTabs>
    </div>
  );
}

function Segmented() {
  const [v, setV] = useState("chart");
  return (
    <SegmentedControl
      aria-label="View"
      value={v}
      onChange={setV}
      options={[
        { value: "chart", label: "Chart" },
        { value: "table", label: "Table" },
      ]}
    />
  );
}

export const MORE_PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  "icon-button": {
    variants: () => (
      <>
        <IconButton label="More actions" icon={<IconMoreHorizontal size={18} />} />
        <IconButton label="Print invoice" icon={<IconPrinter size={17} />} variant="secondary" />
        <IconButton label="Add project" icon={<IconPlus size={17} />} variant="primary" />
        <IconButton label="Remove" icon={<IconX size={16} />} variant="danger" />
        <IconButton label="Filter" icon={<IconFilter size={16} />} pressed />
        <IconButton label="Loading" icon={<IconMail size={16} />} loading />
        <IconButton label="Disabled" icon={<IconMail size={16} />} disabled />
      </>
    ),
  },
  textarea: {
    default: () => (
      <div className={styles.formCol}>
        <Field label="Note for the customer">
          <Textarea maxLength={280} showCount placeholder="Plain language." />
        </Field>
      </div>
    ),
  },
  "search-field": {
    default: function SearchDemo() {
      const [q, setQ] = useState("");
      return (
        <div className={styles.formCol}>
          <SearchField aria-label="Search invoices" value={q} onValueChange={setQ} placeholder="Customer or invoice number" shortcut="/" />
          <SearchField aria-label="Searching" value="INV-10" onValueChange={() => {}} loading size="sm" />
        </div>
      );
    },
  },
  checkbox: {
    default: () => (
      <div className={styles.formCol}>
        <Checkbox label="Email me updates" defaultChecked />
        <Checkbox variant="card" label="I accept the workspace terms" description="Required to create the account." />
        <Checkbox indeterminate label="Select all" />
        <Checkbox label="Disabled" disabled />
      </div>
    ),
  },
  "radio-group": {
    default: function RadioDemo() {
      const [v, setV] = useState<string | null>("monthly");
      return (
        <div className={styles.block}>
          <RadioGroup
            variant="cards"
            columns={3}
            aria-label="Billing period"
            value={v}
            onChange={setV}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
        </div>
      );
    },
  },
  switch: {
    default: function SwitchDemo() {
      const [on, setOn] = useState(true);
      return (
        <div className={styles.formCol}>
          <Switch label="Email me when an invoice is paid" checked={on} onChange={setOn} />
          <Switch label="Saving" description="A request is in flight." checked loading onChange={() => {}} />
          <Switch label="Disabled" checked={false} disabled onChange={() => {}} />
        </div>
      );
    },
  },
  "otp-input": {
    default: function OtpDemo() {
      const [code, setCode] = useState("49");
      return <OtpInput aria-label="Authenticator code" value={code} onChange={setCode} />;
    },
  },
  "date-field": {
    open: function DateOpen() {
      const [d, setD] = useState<IsoDate | null>("2026-10-14");
      return <DateField inline aria-label="Due date" value={d} onChange={setD} />;
    },
    default: function DateDemo() {
      const [d, setD] = useState<IsoDate | null>(null);
      return (
        <div className={styles.formCol}>
          <Field label="Due date">
            <DateField value={d} onChange={setD} />
          </Field>
        </div>
      );
    },
  },
  "date-range-filter": {
    open: function RangeOpen() {
      const [r, setR] = useState<DateRange>({ start: "2026-09-08", end: "2026-09-19" });
      return <DateRangeFilter inline aria-label="Issued" value={r} onChange={setR} />;
    },
    default: function RangeDemo() {
      const [r, setR] = useState<DateRange>({ start: null, end: null });
      return <DateRangeFilter aria-label="Issued" value={r} onChange={setR} />;
    },
  },
  "time-field": {
    open: function TimeOpen() {
      const [t, setT] = useState<Time | null>("09:30");
      return <TimeField inline aria-label="Opens at" value={t} onChange={setT} format="12h" step={15} />;
    },
    default: function TimeDemo() {
      const [t, setT] = useState<Time | null>(null);
      const [r, setR] = useState<TimeRange>({ start: "09:00", end: "17:00" });
      return (
        <div className={styles.formCol}>
          <Field label="Session start">
            <TimeField value={t} onChange={setT} format="12h" step={15} />
          </Field>
          <Field label="Opening hours">
            <TimeRangeField value={r} onChange={setR} format="12h" step={30} />
          </Field>
        </div>
      );
    },
  },
  "date-time-field": {
    default: function DateTimeDemo() {
      const [at, setAt] = useState<DateTime | null>("2026-11-08T19:00");
      const [range, setRange] = useState<DateTimeRange>({ start: "2026-11-08T19:00", end: "2026-11-08T22:00" });
      return (
        <div className={styles.formCol}>
          <Field label="Event starts">
            <DateTimeField value={at} onChange={setAt} format="12h" step={15} />
          </Field>
          <Field label="Show runs">
            <DateTimeRangeField value={range} onChange={setRange} format="12h" step={30} />
          </Field>
        </div>
      );
    },
  },
  "file-drop": {
    default: function DropDemo() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <div className={styles.stack}>
          <FileDrop files={files} onFilesChange={setFiles} description="PDF, JPG or PNG, up to 10 MB." />
        </div>
      );
    },
  },
  field: {
    default: () => (
      <div className={styles.formCol}>
        <Field label="Phone" optional hint="For delivery questions only.">
          <TextInput type="tel" autoComplete="tel" />
        </Field>
        <Field label="Email" required error="Enter an email address.">
          <TextInput type="email" invalid />
        </Field>
      </div>
    ),
  },
  "error-summary": {
    default: () => (
      <div className={styles.stack}>
        <ErrorSummary
          errors={[
            { id: "email", message: "Enter an email address" },
            { id: "invoice", message: "Enter a 6-digit invoice number" },
          ]}
        />
      </div>
    ),
  },
  "prefixed-input": {
    default: function PrefixedDemo() {
      const [v, setV] = useState("1042");
      return (
        <div className={styles.formCol}>
          <Field label="Invoice number">
            <PrefixedInput prefix="INV" length={6} value={v} onValueChange={(code) => setV(code)} />
          </Field>
        </div>
      );
    },
    alphanumeric: function AccountDemo() {
      const [v, setV] = useState("");
      return (
        <div className={styles.formCol}>
          <Field label="Account code" hint="Letters and numbers, as printed on your statement.">
            <PrefixedInput prefix="ACC-" length={8} charset="alphanumeric" value={v} onValueChange={(code) => setV(code)} />
          </Field>
        </div>
      );
    },
  },
  "status-pill": {
    default: () => (
      <>
        <StatusPill tone="neutral">Draft</StatusPill>
        <StatusPill tone="info">Sent</StatusPill>
        <StatusPill tone="warning" dot>
          Overdue
        </StatusPill>
        <StatusPill tone="success">Paid</StatusPill>
        <StatusPill tone="danger">Void</StatusPill>
        <Badge tone="brand" variant="solid">
          New
        </Badge>
        <Badge tone="warning">Pending</Badge>
        <CountBadge count={4} label="4 waiting" />
      </>
    ),
    aliases: () => (
      <>
        <Badge variant="default">New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="destructive">Overdue</Badge>
        <Badge variant="outline">Beta</Badge>
        <Badge variant="outline" asChild>
          <a href="#changelog">Changelog</a>
        </Badge>
      </>
    ),
  },
  avatar: {
    default: () => (
      <>
        <Avatar name="Jane Cooper" size="sm" />
        <Avatar name="Wade Warren" />
        <Avatar name="Esther Howard" size="lg" tone="neutral" />
      </>
    ),
  },
  meter: {
    default: () => (
      <div className={styles.stack}>
        <Meter label="Seats" value={3} max={5} valueText="3 of 5 used" />
        <ProgressBar label="Quarterly target" value={240} max={400} />
      </div>
    ),
  },
  "progress-steps": {
    default: () => (
      <div className={styles.stack}>
        <ProgressSteps
          aria-label="Shipments"
          steps={[
            { label: "Packed", detail: "2 boxes", meta: "Done 12 Oct", state: "done" },
            { label: "Shipped", detail: "Express", meta: "Due 14 Oct", state: "current" },
            { label: "Delivered", detail: "Signature", state: "upcoming" },
          ]}
        />
      </div>
    ),
  },
  stepper: {
    default: () => (
      <div className={styles.block}>
        <Stepper
          aria-label="Checkout"
          steps={[
            { id: "a", label: "Cart", state: "complete" },
            { id: "b", label: "Details", state: "current" },
            { id: "c", label: "Payment", state: "upcoming" },
            { id: "d", label: "Review", state: "upcoming" },
          ]}
        />
      </div>
    ),
  },
  skeleton: {
    default: () => (
      <div className={styles.stack}>
        <div className={styles.row}>
          <Skeleton variant="circle" width={36} height={36} />
          <Skeleton width={180} height={18} />
        </div>
        <SkeletonText lines={3} />
      </div>
    ),
  },
  tabs: { folder: Tabs, segmented: Segmented },
  menu: {
    open: () => <Menu inline label="Actions" items={MENU_ITEMS} />,
    default: () => <Menu label="Actions" items={MENU_ITEMS} />,
  },
  "nav-search": {
    open: () => <NavSearch inline shortcut={null} aria-label="Search pages and actions" items={NAV_ITEMS} onSelect={() => true} />,
    default: () => <NavSearch shortcut={null} aria-label="Search pages and actions" items={NAV_ITEMS} onSelect={() => true} />,
  },
  alert: {
    default: () => (
      <div className={styles.stack}>
        <Alert tone="info" title="Payment is processing">
          We will email you when the bank confirms it.
        </Alert>
        <Alert
          tone="danger"
          title="Couldn't save"
          action={
            <Button size="sm" variant="secondary">
              Try again
            </Button>
          }
        >
          Nothing was lost. Try again in a moment.
        </Alert>
      </div>
    ),
  },
  toast: { open: ToastsOpen, default: Toasts },
  spinner: {
    default: () => (
      <>
        <Spinner size={14} />
        <Spinner size={20} label="Loading invoices" />
      </>
    ),
  },
  "empty-state": {
    default: () => (
      <div className={styles.stack}>
        <EmptyState
          title="No projects yet"
          description="Create a project to start tracking work."
          action={<Button iconStart={<IconPlus size={15} />}>New project</Button>}
        />
        <EmptyState compact tone="positive" title="All caught up" description="Nothing is waiting for review." />
      </div>
    ),
  },
  tooltip: {
    open: () => (
      <>
        <Tooltip inline content="Print invoice" shortcut={["Ctrl", "P"]}>
          <IconButton label="Print" icon={<IconPrinter size={17} />} variant="secondary" />
        </Tooltip>
        <Toggletip inline label="About seats" title="Seats">
          Each plan includes five seats. Add more from Billing.
        </Toggletip>
      </>
    ),
    default: () => (
      <>
        <Tooltip content="Print invoice" shortcut={["Ctrl", "P"]}>
          <IconButton label="Print" icon={<IconPrinter size={17} />} variant="secondary" />
        </Tooltip>
        <Toggletip label="About seats">Each plan includes five seats. Add more from Billing.</Toggletip>
      </>
    ),
  },
  "impact-preview": {
    default: () => (
      <div className={styles.stack}>
        <ImpactPreview statement="This action cannot be undone" items={IMPACT} />
      </div>
    ),
  },
  "type-to-confirm": {
    open: () => (
      <TypeToConfirmModal
        inline
        open
        onClose={() => {}}
        title="Remove Jane Cooper?"
        meta="Team member · Design"
        phrase="remove jane cooper"
        confirmLabel="Remove team member"
        impact={IMPACT}
        onConfirm={() => {}}
      />
    ),
    default: () => (
      <div className={styles.block}>
        <DangerZone description="Actions here can't be undone.">
          <DangerZoneRow
            title="Remove team member"
            description="Signs them out everywhere and revokes their access."
            actionLabel="Remove team member"
            confirm={{
              title: "Remove Jane Cooper?",
              phrase: "remove jane cooper",
              confirmLabel: "Remove team member",
              impact: IMPACT,
              onConfirm: () => new Promise((r) => window.setTimeout(r, 1000)),
            }}
          />
        </DangerZone>
      </div>
    ),
  },
  "glass-panel": {
    default: () => (
      <div className={styles.stack}>
        <GlassPanel>Page</GlassPanel>
        <GlassPanel variant="light">Light</GlassPanel>
        <GlassPanel variant="nested" padding="sm">
          Nested
        </GlassPanel>
        <GlassPanel bloom>With bloom</GlassPanel>
      </div>
    ),
  },
  card: {
    default: () => (
      <div className={styles.stack}>
        <Card title="This month" description="Updated hourly" actions={<Button size="sm" variant="secondary">Export</Button>}>
          32 invoices paid
        </Card>
        <Card tone="highlight" title="Two invoices are overdue" description="Send a reminder or mark them paid." />
        <Card tone="muted" padding="sm">
          Secondary information sits in a sunken box.
        </Card>
      </div>
    ),
    parts: () => (
      <div className={styles.stack}>
        <Card>
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>Updated hourly</CardDescription>
            <CardAction>
              <Button size="sm" variant="secondary">
                Export
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>32 invoices paid</CardContent>
          <CardFooter>
            <Button size="sm">View all</Button>
          </CardFooter>
        </Card>
        <Card
          title="This month"
          description="Updated hourly"
          actions={
            <Button size="sm" variant="secondary">
              Export
            </Button>
          }
          footer={<Button size="sm">View all</Button>}
        >
          32 invoices paid
        </Card>
      </div>
    ),
  },
  divider: {
    default: () => (
      <div className={styles.stack}>
        <Divider />
        <Divider label="or" />
      </div>
    ),
  },
  "page-header": {
    default: () => (
      <div className={styles.block}>
        <PageHeader
          title="Atlas redesign"
          description="Started 12 Oct 2026 · 4 members"
          back={{ href: "/", label: "Projects" }}
          meta={<StatusPill tone="success">Active</StatusPill>}
          actions={<Button variant="secondary">Share</Button>}
        />
      </div>
    ),
  },
  "auth-card": {
    default: () => (
      <div className={styles.authFrame}>
        <AuthLayout contained>
          <AuthCard title="Sign in" subtitle="Use the email you signed up with." footer={<span className={styles.authFoot}>Protected by two-factor sign-in</span>}>
            <Field label="Email">
              <TextInput type="email" placeholder="jane@example.com" />
            </Field>
            <Button size="lg" fullWidth>
              Continue
            </Button>
          </AuthCard>
        </AuthLayout>
      </div>
    ),
  },
};
