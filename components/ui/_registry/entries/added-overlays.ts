import type { RegistryEntry } from "../types";

// Components added to match the shadcn/ui set (overlays group). Each takes an
// `inline` prop that renders it open in the page flow, which is what the
// first example (and the overview thumbnail) shows.

const INLINE_NOTE =
  "inline renders the open panel in the page flow: no portal, scrim, focus trap, scroll lock or outside-click listener. It exists for docs, previews and static mock-ups; never ship it as the live overlay.";

export const ADDED_OVERLAYS: RegistryEntry[] = [
  {
    slug: "popover",
    name: "Popover",
    category: "Overlays",
    summary: "An anchored frosted panel for arbitrary content: a short form, a set of options, a details block.",
    description: [
      "Popover opens a panel against its trigger, in the same frosted glass as Select and Menu. The trigger is any button you pass; Popover adds aria-expanded, aria-controls and the click handler. It flips above when there is no room below and follows scroll and resize.",
      "Focus moves to the first focusable element inside (or the panel) but is not trapped. Esc closes it and returns focus to the trigger; a press outside closes it too. Open state is uncontrolled by default, or controlled with open and onOpenChange.",
      INLINE_NOTE,
    ],
    importLine: `import { Button, Popover } from "@/components/ui";`,
    usage: `<Popover label="Canvas dimensions" trigger={<Button variant="secondary">Dimensions</Button>}>
  …fields…
</Popover>`,
    props: ["Popover"],
    css: ["components/ui/Popover/Popover.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        description: "The panel under its trigger, drawn inline.",
        code: `<Popover inline label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
  <Field label="Width"><TextInput size="sm" defaultValue="1280" trailing="px" /></Field>
  <Field label="Height"><TextInput size="sm" defaultValue="720" trailing="px" /></Field>
</Popover>`,
      },
      {
        id: "trigger",
        title: "From its trigger",
        description: "Press the button. Esc or a press outside closes it.",
        code: `<Popover label="Canvas dimensions" width={260} trigger={<Button variant="secondary">Dimensions</Button>}>
  …
</Popover>`,
      },
    ],
    accessibility: [
      "The panel is role=\"dialog\" named by label (or by a heading you give it); the trigger carries aria-expanded and aria-controls.",
      "Focus moves into the panel on open and back to the trigger on Esc. It is non-modal: Tab can leave it.",
      "Do not put the only route to an action in a popover that opens on hover; Popover opens on press only.",
    ],
    dos: ["Keep it to one small task: a few fields, a choice, a summary.", "Give it a label when the content has no heading."],
    donts: ["Don't use it for a list of actions; that is Menu.", "Don't put a long form in it; use Sheet or Modal."],
    related: ["hover-card", "menu", "tooltip"],
    depth: "full",
  },
  {
    slug: "hover-card",
    name: "HoverCard",
    category: "Overlays",
    summary: "A rich preview on hover or keyboard focus of a link: a person, a project, a record.",
    description: [
      "HoverCard opens after a short delay (openDelay, 500ms) when the pointer rests on its trigger or the trigger takes keyboard focus, and closes a little after the pointer leaves (closeDelay, 200ms), so the pointer can travel onto the card. Touch never opens it: the trigger must work on its own.",
      "The card is supplementary. It is tied to the trigger with aria-describedby while open and Esc dismisses it.",
      INLINE_NOTE,
    ],
    importLine: `import { HoverCard } from "@/components/ui";`,
    usage: `<HoverCard trigger={<a href="/team/jane-cooper">@janecooper</a>}>
  …profile…
</HoverCard>`,
    props: ["HoverCard"],
    css: ["components/ui/HoverCard/HoverCard.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        code: `<HoverCard inline trigger={<a href="/team/jane-cooper">@janecooper</a>}>
  <Avatar name="Jane Cooper" />
  <strong>Jane Cooper</strong>
  <span>Design lead on Project Atlas.</span>
</HoverCard>`,
      },
      {
        id: "trigger",
        title: "On hover and focus",
        description: "Hover the name, or Tab to it.",
        code: `<p>Assigned to <HoverCard trigger={<a href="/team/jane-cooper">@janecooper</a>}>…</HoverCard> for review.</p>`,
      },
    ],
    accessibility: [
      "Opens on keyboard focus as well as hover, and the card describes its trigger (aria-describedby).",
      "Esc closes it. Nothing inside it should be the only way to reach an action.",
      "Respects reduced motion: it fades in place.",
    ],
    dos: ["Use it on links whose target needs a glance before a click: people, projects, references."],
    donts: ["Don't put buttons or forms in a hover card; use Popover.", "Don't use it on touch-first screens as the only way to see the detail."],
    related: ["popover", "tooltip", "avatar"],
    depth: "full",
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    category: "Overlays",
    summary: "A menu of actions for a region, opened at the pointer with a right-click, Shift+F10 or a long press.",
    description: [
      "ContextMenu wraps a region (a row, a card, a file) and opens the shared menu list where the pointer is. The region is focusable, so keyboard users open it with Shift+F10 or the Menu key; on touch a long press (longPressMs, 500ms) opens it.",
      "Items take an icon, a shortcut hint (display only), a danger tone and a disabled state; separators and headings group them. It is the same popover glass and item rhythm as Menu.",
      INLINE_NOTE,
    ],
    importLine: `import { ContextMenu } from "@/components/ui";`,
    usage: `<ContextMenu label="Actions for Invoice INV-0042" items={[
  { id: "open", label: "Open", onSelect: open },
  { id: "rename", label: "Rename", shortcut: "F2", onSelect: rename },
  { id: "sep", separator: true },
  { id: "delete", label: "Move to bin", tone: "danger", onSelect: remove },
]}>
  Invoice INV-0042.pdf
</ContextMenu>`,
    props: ["ContextMenu"],
    css: ["components/ui/ContextMenu/ContextMenu.module.css", "components/ui/ContextMenu/MenuList.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        description: "The menu over its region, drawn inline with one item highlighted.",
        code: `<ContextMenu inline label="Actions for Invoice INV-0042" items={ITEMS} highlightId="rename">
  Invoice INV-0042.pdf
</ContextMenu>`,
      },
      {
        id: "region",
        title: "On a region",
        description: "Right-click it, or focus it and press Shift F10.",
        code: `<ContextMenu label="Actions for Invoice INV-0042" items={ITEMS}>…</ContextMenu>`,
      },
    ],
    accessibility: [
      "The menu is role=\"menu\" with role=\"menuitem\" items: arrows, Home, End and typeahead move; Enter or Space runs; Esc closes and returns focus to the region; Tab closes.",
      "The region is focusable and opens on Shift+F10 and the Menu key, so a mouse is never required.",
      "Every action in a context menu must also be reachable some other way (a row Menu, a toolbar).",
    ],
    dos: ["Put destructive items last, after a separator.", "Keep it to the actions for that one thing."],
    donts: ["Don't make it the only route to an action.", "Don't override the browser's menu on text people need to copy."],
    related: ["menu", "menubar"],
    depth: "full",
  },
  {
    slug: "sheet",
    name: "Sheet and Drawer",
    category: "Overlays",
    summary: "A panel that slides in from an edge over a scrim, and a bottom Drawer with a drag handle.",
    description: [
      "Sheet is a dialog flush to one edge (side: right, left, top or bottom) for secondary tasks that keep the page in view: a record's details, filters, settings. It traps focus, locks page scroll, closes on Esc, the scrim and the close button, and returns focus to whatever opened it.",
      "Drawer is the bottom sheet, centred to a readable width on wide screens, with a grab handle. With dragToClose (on by default) a downward drag on the handle past about a third of its height dismisses it.",
      "The header keeps one left edge: title and description stacked flush left, the close button at the right. The body scrolls on its own with the themed scrollbar; footer buttons sit along the bottom edge, primary last. Size is size (any CSS length) or --sheet-size.",
      INLINE_NOTE,
    ],
    importLine: `import { Button, Drawer, Sheet } from "@/components/ui";`,
    usage: `<Sheet
  open={open}
  onClose={() => setOpen(false)}
  title="Edit team member"
  footer={<Button onClick={save}>Save changes</Button>}
>
  …fields…
</Sheet>`,
    props: ["Sheet", "Drawer"],
    defaults: { Sheet: { side: `"right"`, closeLabel: `"Close"` } },
    css: ["components/ui/Sheet/Sheet.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        description: "The panel itself, drawn inline.",
        code: `<Sheet inline open onClose={close} title="Edit team member" description="Changes apply as soon as you save." footer={…}>
  …fields…
</Sheet>`,
      },
      {
        id: "sides",
        title: "From each edge",
        code: `<Sheet open={open} side="left" onClose={close} title="Filters">…</Sheet>`,
      },
      {
        id: "drawer-open",
        title: "Drawer, open",
        code: `<Drawer inline open onClose={close} title="Order ORD-2041" footer={<Button>Mark as shipped</Button>}>…</Drawer>`,
      },
      {
        id: "drawer",
        title: "Drawer with drag to close",
        description: "Drag the handle down to dismiss.",
        code: `<Drawer open={open} onClose={() => setOpen(false)} title="Order ORD-2041">…</Drawer>`,
      },
    ],
    accessibility: [
      "role=\"dialog\" with aria-modal, labelled by the title and described by the description.",
      "Focus moves in on open, Tab is trapped, Esc closes, and focus returns to the opener. The drag handle is pointer-only; Esc and the close button are always there.",
      "Reduced motion: it fades in place instead of sliding.",
    ],
    dos: ["Use a right sheet for detail and edit panels, a bottom drawer on phones.", "Keep one primary action in the footer."],
    donts: ["Don't stack a sheet on a modal.", "Don't hide navigation in a sheet on desktop; that is the sidebar."],
    related: ["modal", "alert-dialog"],
    depth: "full",
  },
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    category: "Overlays",
    summary: "A short interrupting confirm with Cancel and one action; focus starts on Cancel and the scrim never dismisses it.",
    description: [
      "AlertDialog asks one question with two answers. It is role=\"alertdialog\": focus starts on Cancel, so a stray Enter never confirms; Esc cancels; Tab is trapped; a click on the scrim does nothing, because the choice must be made.",
      "tone=\"danger\" draws a warning tile and the danger button. busy locks both buttons and shows a spinner on the action while it runs. The header keeps one left edge. It wears the --modal-* glass, so it matches Modal in every preset.",
      INLINE_NOTE,
    ],
    importLine: `import { AlertDialog } from "@/components/ui";`,
    usage: `<AlertDialog
  open={open}
  tone="danger"
  title="Delete Project Atlas?"
  description="Its 12 tasks and 48 files are deleted with it."
  actionLabel="Delete project"
  onCancel={() => setOpen(false)}
  onAction={remove}
  busy={pending}
/>`,
    props: ["AlertDialog"],
    css: ["components/ui/AlertDialog/AlertDialog.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        code: `<AlertDialog inline open tone="danger" title="Delete Project Atlas?" description="…" actionLabel="Delete project" onCancel={…} onAction={…} />`,
      },
      {
        id: "danger",
        title: "Danger, with a busy state",
        code: `<AlertDialog open={open} tone="danger" … busy={pending} busyLabel="Deleting…" />`,
      },
      {
        id: "default",
        title: "Default tone",
        code: `<AlertDialog open={open} title="Discard this draft?" actionLabel="Discard draft" cancelLabel="Keep editing" … />`,
      },
    ],
    accessibility: [
      "role=\"alertdialog\" with aria-modal, labelled by the title and described by the description, so both are read on open.",
      "Initial focus is Cancel. Esc cancels; the scrim does not.",
      "busy sets aria-busy and disables both buttons until the action settles.",
    ],
    dos: ["Name the action with a verb and the object: \"Delete project\".", "Say in the description what is lost."],
    donts: [
      "Don't use it for forms; that is Modal.",
      "Don't use it for very large irreversible changes; that is TypeToConfirmModal.",
      "Never label the action \"OK\" or \"Yes\".",
    ],
    related: ["modal", "type-to-confirm"],
    depth: "full",
  },
  {
    slug: "command",
    name: "Command",
    category: "Overlays",
    summary: "A command palette: a search box over grouped actions with shortcuts, keyboard-first, inline or as a Ctrl+K dialog.",
    description: [
      "Command is a combobox over a grouped listbox. Typing filters every group (every word must appear in the label or the item's keywords), Up and Down move the highlight, Enter runs it, and an empty state says when nothing matches. Focus stays in the input throughout; the highlighted option is announced through aria-activedescendant.",
      "CommandDialog lifts it over the page in the modal glass and toggles it with Ctrl+K or Cmd+K (shortcut, on by default). Running a command closes it; Esc and the scrim close it too, and focus returns to where it was.",
      INLINE_NOTE,
    ],
    importLine: `import { Command, CommandDialog } from "@/components/ui";`,
    usage: `<CommandDialog
  open={open}
  onOpenChange={setOpen}
  groups={[
    { heading: "Suggestions", items: [{ id: "invoice", label: "Create invoice", shortcut: "Ctrl N", onSelect: create }] },
    { heading: "Go to", items: [{ id: "orders", label: "Orders", onSelect: () => router.push("/orders") }] },
  ]}
/>`,
    props: ["Command", "CommandDialog"],
    css: ["components/ui/Command/Command.module.css"],
    examples: [
      {
        id: "palette",
        title: "Palette",
        description: "Type to filter; arrows and Enter run a command.",
        code: `<Command groups={GROUPS} label="Search commands" />`,
      },
      {
        id: "dialog",
        title: "As a dialog with Ctrl+K",
        description: "Press the button, or Ctrl K anywhere on this page.",
        code: `<CommandDialog open={open} onOpenChange={setOpen} groups={GROUPS} />`,
      },
    ],
    accessibility: [
      "The input is role=\"combobox\" with aria-controls and aria-activedescendant; results are role=\"listbox\" with role=\"group\" sections labelled by their headings and role=\"option\" rows.",
      "The result count is announced through a polite status region as you type.",
      "CommandDialog is a modal dialog: focus moves to the input, Tab is trapped, Esc closes, focus returns.",
    ],
    dos: ["Add keywords for the words people actually type (\"new\", \"add\").", "Show the real shortcut beside each command that has one."],
    donts: ["Don't make the palette the only way to reach a page.", "Don't fill it with every possible action; keep the top group to what is likely now."],
    related: ["nav-search", "menu"],
    depth: "full",
  },
  {
    slug: "menubar",
    name: "Menubar",
    category: "Overlays",
    summary: "A desktop application menu bar (File, Edit, View) with keyboard navigation across and within its menus.",
    description: [
      "Menubar is the WAI-ARIA menubar pattern on the recessed control fill. It is one tab stop: Left and Right move across the titles, Down, Enter or Space open a menu at its first item and Up at its last. While a menu is open, Left and Right move to the neighbouring menu and hovering another title switches to it.",
      "Each menu is the shared menu list: icons, shortcut hints, separators, headings and danger items in the popover glass.",
      INLINE_NOTE,
    ],
    importLine: `import { Menubar } from "@/components/ui";`,
    usage: `<Menubar
  aria-label="Editor"
  menus={[
    { id: "file", label: "File", items: [{ id: "new", label: "New project", shortcut: "Ctrl N", onSelect: create }] },
    { id: "edit", label: "Edit", items: [{ id: "undo", label: "Undo", shortcut: "Ctrl Z", onSelect: undo }] },
  ]}
/>`,
    props: ["Menubar"],
    css: ["components/ui/Menubar/Menubar.module.css", "components/ui/ContextMenu/MenuList.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        description: "The File menu drawn open under its title.",
        code: `<Menubar inline aria-label="Editor" menus={MENUS} inlineOpenId="file" inlineHighlightId="open" />`,
      },
      {
        id: "live",
        title: "Interactive",
        description: "Click a title, then use the arrow keys.",
        code: `<Menubar aria-label="Editor" menus={MENUS} />`,
      },
    ],
    accessibility: [
      "role=\"menubar\" holding role=\"menuitem\" titles with aria-haspopup and aria-expanded; each menu is role=\"menu\" labelled by its title.",
      "Roving tab index: the bar is a single tab stop. Esc closes a menu and returns focus to its title; Tab closes it and moves on.",
    ],
    dos: ["Use it for desktop tools and editors with many commands.", "Mirror the real keyboard shortcuts in the hints."],
    donts: ["Don't use it for site navigation; that is NavigationMenu or the sidebar.", "Don't nest submenus; keep each menu flat."],
    related: ["context-menu", "menu", "command"],
    depth: "full",
  },
];
