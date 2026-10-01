"use client";

import { Copy, FilePlus2, FolderOpen, Pencil, Redo2, Save, Scissors, Share2, Trash2, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  Avatar,
  Button,
  Command,
  CommandDialog,
  ContextMenu,
  Drawer,
  Field,
  HoverCard,
  IconCalendar,
  IconFile,
  IconHome,
  IconMail,
  IconPlus,
  IconUser,
  IconUsers,
  Menubar,
  Popover,
  Sheet,
  Switch,
  TextInput,
  useToast,
  type CommandGroup,
  type ContextMenuEntry,
  type MenubarMenu,
} from "@/components/ui";

// Live specimens for the overlay components added to match the shadcn/ui
// set. The first example of each renders the open panel inline, so the
// overview thumbnail shows the overlay itself, not its trigger.

const flex = (gap: number, extra?: React.CSSProperties): React.CSSProperties => ({ display: "flex", flexDirection: "column", gap, ...extra });

// ── Popover ──────────────────────────────────────────────────────────────

function DimensionsForm() {
  return (
    <div style={flex(12)}>
      <div style={flex(2)}>
        <strong style={{ color: "var(--ink-heading)" }}>Dimensions</strong>
        <span style={{ color: "var(--ink-muted)" }}>Set the size of the project canvas.</span>
      </div>
      <Field label="Width">
        <TextInput size="sm" defaultValue="1280" trailing="px" inputMode="numeric" />
      </Field>
      <Field label="Height">
        <TextInput size="sm" defaultValue="720" trailing="px" inputMode="numeric" />
      </Field>
    </div>
  );
}

function PopoverInline() {
  return (
    <Popover inline label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
      <DimensionsForm />
    </Popover>
  );
}

function PopoverLive() {
  return (
    <Popover label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
      <DimensionsForm />
    </Popover>
  );
}

// ── HoverCard ────────────────────────────────────────────────────────────

function ProfileCard() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Avatar name="Jane Cooper" />
      <div style={flex(4)}>
        <strong style={{ color: "var(--ink-heading)" }}>Jane Cooper</strong>
        <span>Design lead on Project Atlas. Reviews every release before it ships.</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-muted)", fontSize: "var(--text-caption)" }}>
          <IconCalendar size={13} /> Joined March 2024
        </span>
      </div>
    </div>
  );
}

const personLink = (
  <a href="#jane-cooper" onClick={(e) => e.preventDefault()}>
    @janecooper
  </a>
);

function HoverCardInline() {
  return (
    <HoverCard inline trigger={personLink}>
      <ProfileCard />
    </HoverCard>
  );
}

function HoverCardLive() {
  return (
    <p>
      Assigned to{" "}
      <HoverCard trigger={personLink}>
        <ProfileCard />
      </HoverCard>{" "}
      for review. Hover or focus the name.
    </p>
  );
}

// ── ContextMenu ──────────────────────────────────────────────────────────

const FILE_ACTIONS: ContextMenuEntry[] = [
  { id: "open", label: "Open", icon: <FolderOpen />, shortcut: "Enter" },
  { id: "rename", label: "Rename", icon: <Pencil />, shortcut: "F2" },
  { id: "copy", label: "Duplicate", icon: <Copy />, shortcut: "Ctrl D" },
  { id: "share", label: "Share", icon: <Share2 /> },
  { id: "sep", separator: true },
  { id: "delete", label: "Move to bin", icon: <Trash2 />, tone: "danger", shortcut: "Del" },
];

function ContextMenuInline() {
  return (
    <ContextMenu inline label="Actions for Invoice INV-0042" items={FILE_ACTIONS} highlightId="rename">
      Invoice INV-0042.pdf
    </ContextMenu>
  );
}

function ContextMenuLive() {
  const toast = useToast();
  const items = FILE_ACTIONS.map((e) =>
    "label" in e ? { ...e, onSelect: () => toast.info(`${e.label}: Invoice INV-0042`) } : e,
  );
  return (
    <ContextMenu label="Actions for Invoice INV-0042" items={items}>
      Right-click here, or focus it and press Shift F10
    </ContextMenu>
  );
}

// ── Sheet and Drawer ─────────────────────────────────────────────────────

function ProfileFields() {
  return (
    <div style={flex(14)}>
      <Field label="Name">
        <TextInput defaultValue="Jane Cooper" />
      </Field>
      <Field label="Email">
        <TextInput type="email" defaultValue="jane@example.com" />
      </Field>
      <Switch label="Email me when an order ships" checked onChange={() => {}} />
    </div>
  );
}

function SheetInline() {
  return (
    <Sheet
      inline
      open
      onClose={() => {}}
      title="Edit team member"
      description="Changes apply as soon as you save."
      footer={
        <>
          <Button variant="secondary">Cancel</Button>
          <Button>Save changes</Button>
        </>
      }
    >
      <ProfileFields />
    </Sheet>
  );
}

function SheetLive() {
  const [side, setSide] = useState<"right" | "left" | "top" | "bottom" | null>(null);
  const close = () => setSide(null);
  return (
    <>
      {(["right", "left", "top", "bottom"] as const).map((s) => (
        <Button key={s} variant="secondary" onClick={() => setSide(s)}>
          From the {s}
        </Button>
      ))}
      <Sheet
        open={side !== null}
        side={side ?? "right"}
        onClose={close}
        title="Edit team member"
        description="Changes apply as soon as you save."
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save changes</Button>
          </>
        }
      >
        <ProfileFields />
      </Sheet>
    </>
  );
}

function DrawerLive() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Order ORD-2041"
        description="Drag the handle down, press Esc or tap outside to close."
        footer={<Button onClick={() => setOpen(false)}>Mark as shipped</Button>}
      >
        <p>3 items, ships to Jane Cooper. Paid by card on 14 August.</p>
      </Drawer>
    </>
  );
}

function DrawerInline() {
  return (
    <Drawer inline open onClose={() => {}} title="Order ORD-2041" description="3 items, ready to ship." footer={<Button>Mark as shipped</Button>}>
      <p>Ships to Jane Cooper. Paid by card on 14 August.</p>
    </Drawer>
  );
}

// ── AlertDialog ──────────────────────────────────────────────────────────

function AlertInline() {
  return (
    <AlertDialog
      inline
      open
      tone="danger"
      title="Delete Project Atlas?"
      description="Its 12 tasks and 48 files are deleted with it. This cannot be undone."
      actionLabel="Delete project"
      onCancel={() => {}}
      onAction={() => {}}
    />
  );
}

function AlertLive() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <AlertDialog
        open={open}
        tone="danger"
        title="Delete Project Atlas?"
        description="Its 12 tasks and 48 files are deleted with it. This cannot be undone."
        actionLabel="Delete project"
        busy={busy}
        busyLabel="Deleting…"
        onCancel={() => setOpen(false)}
        onAction={() => {
          setBusy(true);
          window.setTimeout(() => {
            setBusy(false);
            setOpen(false);
            toast.success("Project deleted");
          }, 1000);
        }}
      />
    </>
  );
}

function AlertDefault() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Discard draft
      </Button>
      <AlertDialog
        open={open}
        title="Discard this draft?"
        description="The invoice you started is not saved anywhere else."
        actionLabel="Discard draft"
        cancelLabel="Keep editing"
        onCancel={() => setOpen(false)}
        onAction={() => setOpen(false)}
      />
    </>
  );
}

// ── Command ──────────────────────────────────────────────────────────────

function useCommandGroups(): CommandGroup[] {
  const toast = useToast();
  const run = (label: string) => () => toast.info(label);
  return [
    {
      heading: "Suggestions",
      items: [
        { id: "invoice", label: "Create invoice", icon: <IconPlus size={16} />, shortcut: "Ctrl N", keywords: ["new", "add"], onSelect: run("Create invoice") },
        { id: "calendar", label: "Open calendar", icon: <IconCalendar size={16} />, onSelect: run("Open calendar") },
        { id: "mail", label: "Compose message", icon: <IconMail size={16} />, keywords: ["email"], onSelect: run("Compose message") },
      ],
    },
    {
      heading: "Go to",
      items: [
        { id: "home", label: "Dashboard", icon: <IconHome size={16} />, shortcut: "G D", onSelect: run("Dashboard") },
        { id: "team", label: "Team members", icon: <IconUsers size={16} />, shortcut: "G T", onSelect: run("Team members") },
        { id: "orders", label: "Orders", icon: <IconFile size={16} />, shortcut: "G O", onSelect: run("Orders") },
        { id: "profile", label: "Profile", icon: <IconUser size={16} />, onSelect: run("Profile") },
      ],
    },
  ];
}

function CommandInline() {
  const groups = useCommandGroups();
  return <Command groups={groups} label="Search commands" />;
}

function CommandDialogLive() {
  const [open, setOpen] = useState(false);
  const groups = useCommandGroups();
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open palette <kbd style={{ marginLeft: 6, fontSize: "var(--text-caption)", color: "var(--ink-muted)" }}>Ctrl K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} groups={groups} />
    </>
  );
}

// ── Menubar ──────────────────────────────────────────────────────────────

function useMenus(): MenubarMenu[] {
  const toast = useToast();
  const run = (label: string) => () => toast.info(label);
  return [
    {
      id: "file",
      label: "File",
      items: [
        { id: "new", label: "New project", icon: <FilePlus2 />, shortcut: "Ctrl N", onSelect: run("New project") },
        { id: "open", label: "Open…", icon: <FolderOpen />, shortcut: "Ctrl O", onSelect: run("Open") },
        { id: "save", label: "Save", icon: <Save />, shortcut: "Ctrl S", onSelect: run("Save") },
        { id: "sep", separator: true },
        { id: "share", label: "Share", icon: <Share2 />, onSelect: run("Share") },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { id: "undo", label: "Undo", icon: <Undo2 />, shortcut: "Ctrl Z", onSelect: run("Undo") },
        { id: "redo", label: "Redo", icon: <Redo2 />, shortcut: "Ctrl Y", onSelect: run("Redo") },
        { id: "sep", separator: true },
        { id: "cut", label: "Cut", icon: <Scissors />, shortcut: "Ctrl X", onSelect: run("Cut") },
        { id: "copy", label: "Copy", icon: <Copy />, shortcut: "Ctrl C", onSelect: run("Copy") },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { id: "zoom-in", label: "Zoom in", shortcut: "Ctrl +", onSelect: run("Zoom in") },
        { id: "zoom-out", label: "Zoom out", shortcut: "Ctrl -", onSelect: run("Zoom out") },
        { id: "full", label: "Full screen", shortcut: "F11", onSelect: run("Full screen") },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [{ id: "docs", label: "Documentation", onSelect: run("Documentation") }],
    },
  ];
}

function MenubarInline() {
  return <Menubar inline aria-label="Editor" menus={useMenus()} inlineOpenId="file" inlineHighlightId="open" />;
}

function MenubarLive() {
  return <Menubar aria-label="Editor" menus={useMenus()} />;
}

export const ADDED_OVERLAYS_PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  popover: { open: PopoverInline, trigger: PopoverLive },
  "hover-card": { open: HoverCardInline, trigger: HoverCardLive },
  "context-menu": { open: ContextMenuInline, region: ContextMenuLive },
  sheet: { open: SheetInline, sides: SheetLive, "drawer-open": DrawerInline, drawer: DrawerLive },
  "alert-dialog": { open: AlertInline, danger: AlertLive, default: AlertDefault },
  command: { palette: CommandInline, dialog: CommandDialogLive },
  menubar: { open: MenubarInline, live: MenubarLive },
};
