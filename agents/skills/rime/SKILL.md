---
name: rime
description: Use for any UI work in a project that uses Rime (it has components/ui/_internal, app/styles/tokens.css or AGENTS.rime.md). Builds screens with Rime components and tokens, installs missing components with the shadcn CLI, and follows Rime's design rules.
---

# Rime

Rime is a React component kit (CSS Modules + CSS custom properties, no
Tailwind) installed with the shadcn CLI. Docs: https://rime.mjsons.net, as
markdown at https://rime.mjsons.net/llms.txt. In the project: docs/ui/llms.txt.

## Before you write UI

1. Read docs/ui/llms.txt (the rules, the shadcn name map, every component).
2. Check components/ui for the component. Missing? Install it:
   `npx shadcn@latest add <owner>/rime/<item>`. Item names follow shadcn.
3. Build with Rime components; style layout with CSS Modules and tokens.

## Name map (shadcn → Rime)

button → Button · card → Card · dialog → Modal · alert-dialog → AlertDialog ·
sheet/drawer → Sheet/Drawer · dropdown-menu → Menu · select → Select ·
combobox → Combobox · input → TextInput · input-otp → OtpInput · textarea ·
checkbox · switch · slider · radio-group · tabs → FolderTabs/SegmentedControl ·
toggle-group → ToggleGroup · badge → Badge/StatusPill · separator → Divider ·
progress → Meter · sonner → Toast (useToast) · table/data-table → Table +
FilterBar + Pagination · chart → components/charts · sidebar → SidebarShell.

## Tokens (shadcn name → Rime token)

--background → --page-base · --foreground → --ink-body · --muted-foreground →
--ink-muted · --primary → --brand-action · --border → --line · --ring →
--focus-color · --radius → --r-md. Prefer Rime names in new code.

## Rules that matter most

- Never restyle a primitive from a screen; theme it with tokens.
- One primary (gradient) button per view. One table look. No hover scale or
  lift. No bento grids, no left accent bars, no eyebrow over a title.
- Summary stats: one card with hairline cells (StatStrip).
- Lists: GlassPanel > FilterBar (full-width search + Select chips) + Table +
  centred Pagination.
- Every component needs loading, empty, error and disabled states.
- Text 4.5:1 minimum. No em dashes in copy.

## Patterns

List page, frosted glass shell (SidebarShell layouts: sidebar, rail, header
only, mobile drawer), summary card, modal with scroll edges, terms with a
scroll-gated accept, sign-in with MFA. Code for each: docs/ui/components/patterns.md.
