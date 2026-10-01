import type { RegistryEntry } from "../types";

export const ACTIONS: RegistryEntry[] = [
  {
    slug: "button",
    name: "Button",
    category: "Actions",
    summary: "The action control: primary gradient, glass secondary, ghost, and two danger forms, in three sizes.",
    description: [
      "Button is every pressable action that is not an icon on its own. Primary carries the brand gesture (the brand gradient with a soft glow) and appears at most once per view. Secondary is glass on the page and a white tile with a brand ring inside solid surfaces (a Card, a Modal, an auth card), switched automatically by the nearest data-surface=\"solid\" ancestor. Ghost is for low-emphasis actions in rows and toolbars.",
      "Danger is the irreversible action, in the danger gradient. dangerSecondary is its inverse (danger ink on the secondary's glass) for destructive steps that are not the last one, such as \"Review deletion\" before the final \"Delete project\".",
      "Pass href to render a Next Link with the same look. A disabled or loading link drops its href and leaves the tab order, as a disabled button would. Loading shows a spinner, sets aria-busy, blocks presses and can swap the label (loadingLabel).",
    ],
    importLine: `import { Button } from "@/components/ui";`,
    usage: `<Button onClick={save}>Save changes</Button>`,
    props: ["Button"],
    defaults: { Button: { variant: `"primary"`, size: `"md"`, type: `"button"` } },
    css: ["components/ui/Button/Button.module.css"],
    examples: [
      {
        id: "variants",
        title: "Variants",
        description: "One primary per view. Secondary switches to a white tile inside solid surfaces.",
        code: `<Button>Create invoice</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="dangerSecondary">Review deletion</Button>
<Button variant="danger">Delete project</Button>`,
      },
      {
        id: "sizes",
        title: "Sizes",
        description: "sm for table rows and toolbars, md everywhere else, lg for the one action on an auth card.",
        code: `<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>`,
      },
      {
        id: "icons",
        title: "With icons",
        code: `<Button iconStart={<IconPlus size={15} />}>Add team member</Button>
<Button variant="secondary" iconEnd={<IconArrowRight size={15} />}>Continue</Button>`,
      },
      {
        id: "states",
        title: "Loading and disabled",
        description: "Loading keeps the fill, dulls it and swaps the label. Disabled is a flat tint, not a faded gradient.",
        code: `<Button loading loadingLabel="Saving…">Save</Button>
<Button disabled>Submit</Button>
<Button href="/projects" variant="secondary">Link as button</Button>`,
      },
      {
        id: "aliases",
        title: "shadcn names",
        description: "shadcn's variant and size names work as aliases: default is primary, destructive is danger, outline is secondary; link is an inline text link; icon, icon-sm and icon-lg are square. buttonVariants is buttonClassName.",
        code: `<Button variant="default">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Read the terms</Button>
<Button variant="outline" size="icon" aria-label="Settings"><Settings size={16} /></Button>`,
      },
      {
        id: "as-child",
        title: "asChild",
        description: "asChild renders the single child (a Next Link, an <a>) with the button's look, as shadcn does. href remains the shorter way for internal links.",
        code: `import Link from "next/link";

<Button asChild>
  <Link href="/projects/new">New project</Link>
</Button>
<Button variant="destructive" size="icon" asChild>
  <Link href="/trash" aria-label="Open trash"><Trash2 size={16} /></Link>
</Button>`,
      },
    ],
    accessibility: [
      "Renders a real <button type=\"button\"> (or a Next <Link>), so Enter and Space work and the role is right with no ARIA.",
      "Focus is a 2px ring with a white gap (--focus-ring), drawn with box-shadow so it follows the radius.",
      "Loading sets aria-busy and disables the button; keep the loadingLabel short and present tense (\"Saving…\").",
      "A link with disabled renders a non-focusable span with role=\"link\" and aria-disabled, never a dead href.",
      "Square icon sizes have no text: give them aria-label (or use IconButton, which requires a label).",
      "Every button carries data-slot=\"button\", data-variant and data-size, for styling from a CSS Module without new props.",
      "Primary text must hold 4.5:1 on the gradient's light stop; re-check it in the Studio's Contrast tab when a theme changes the gradient.",
    ],
    dos: [
      "Use one primary per view: the action the screen exists for.",
      "Write labels as verbs plus the object: \"Add team member\", \"Send question\".",
      "Use dangerSecondary for the step that leads to a destructive confirm, and danger only on the confirm itself.",
    ],
    donts: [
      "Never scale a button on hover; hover deepens the glow (no lift: --button-lift is 0 in the default theme).",
      "Don't put two primary buttons side by side; demote one to secondary.",
      "Don't fade a disabled gradient; the flat tint is the disabled state.",
      "Don't use Button for navigation inside text; use a plain link.",
    ],
    related: ["icon-button", "modal"],
    depth: "full",
  },
  {
    slug: "icon-button",
    name: "IconButton",
    category: "Actions",
    summary: "A square action with only an icon, a required accessible label and a tooltip-friendly hit area.",
    description: [
      "IconButton is for compact, well-known actions (close, more, print, remove) where a label would crowd the layout. It takes the same variants as Button, minus the danger secondary, and a pressed state for toggles.",
    ],
    importLine: `import { IconButton, IconX } from "@/components/ui";`,
    usage: `<IconButton label="Close" icon={<IconX size={18} />} onClick={onClose} />`,
    props: ["IconButton"],
    css: ["components/ui/IconButton/IconButton.module.css"],
    examples: [
      {
        id: "variants",
        title: "Variants and states",
        code: `<IconButton label="More actions" icon={<IconMoreHorizontal size={18} />} />
<IconButton label="Print invoice" icon={<IconPrinter size={17} />} variant="secondary" />
<IconButton label="Add project" icon={<IconPlus size={17} />} variant="primary" />
<IconButton label="Filter" icon={<IconFilter size={16} />} pressed />
<IconButton label="Loading" icon={<IconMail size={16} />} loading />`,
      },
    ],
    accessibility: [
      "label is required and becomes the accessible name (aria-label); the icon is hidden from assistive tech.",
      "pressed sets aria-pressed for toggle buttons.",
      "sm is 28px: only inside dense rows. Use md (36px) or lg (44px) where it is the main target on touch.",
    ],
    dos: ["Pair an unfamiliar icon with a Tooltip carrying the same label."],
    donts: ["Don't use an IconButton for the primary action of a screen; it needs words."],
    related: ["button", "tooltip"],
    depth: "summary",
  },
];
