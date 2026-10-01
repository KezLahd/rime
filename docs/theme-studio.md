# Theming and the Rime Studio

One component set for every project, each project re-themed rather than
rebuilt. This file explains the token layers, the presets, the Studio and how
to carry a theme into another project.

| Route | What |
|---|---|
| `/` | Docs: getting started, the rules, every component as a live thumbnail. |
| `/components/<slug>` | One component: examples with code, usage, API, theme tokens, accessibility, do and don't. |
| `/foundations` | Colour, type, radius, shadow, motion and icons, read live from the tokens. |
| `/patterns` | Composed patterns: list page, glass shell, summary card, modal scroll edges, auth card. |
| `/themes` | Rime Studio (`/studio` redirects). |
| `/llms.txt`, `/llms-full.txt`, `/md/<slug>.md` | The same docs as markdown, for AI agents. |
| `docs/ui/` | The same markdown in the repo (`npm run docs:export`). |
| `components/ui/_registry/` | The single source the docs, the Studio and the markdown render from. |

## Token layers

Every visual decision in `components/ui` and `components/shell` reads a CSS
custom property. Four layers, each defaulting to the one above it:

1. **Primitives** (`app/styles/tokens.css`, top). The palette (`--brand`,
   `--brand-strong`, `--brand-deep`, `--brand-soft`, `--support`,
   `--danger-base`, `--night`) and its rgb channels (`--rgb-brand: 79, 85, 217`,
   used as `rgba(var(--rgb-brand), 0.12)`), the bloom channels
   (`--rgb-bloom-a`, `--rgb-bloom-b`), the light and shade channels
   (`--rgb-white`, `--rgb-shade`, `--rgb-contact`), the fonts
   (`--font-display`, `--font-body`) and the logo (SidebarShell's `logo` or
   `logoSrc` prop, or the `--shell-logo` token).
2. **Semantic tokens.** Ink (`--ink-heading` to `--ink-disabled`), the accent
   gesture and gradients (`--brand-gradient`, `--logo-corner-bg`), status
   (`--danger-ink`, `--success-fill` and so on), surfaces and glass
   (`--page-background`, `--glass-fill`, `--surface-solid`, `--recess-fill`),
   lines, focus (`--focus-color`, `--focus-gap`, `--focus-ring`), washes,
   scrolling (`--scrollbar-*`, `--scroll-edge-*`).
3. **Shape and space scales.** Radius (`--r-2xs` 4px to `--r-2xl` 20px,
   `--r-full`), `--density` (multiplies every primitive's padding), control
   heights (`--control-h-sm|md|lg` 32/40/48, `--field-h-sm|md` 36/44), border
   widths, shadows and glows (`--shadow-*`, `--glow-*`), blurs (`--blur-*`),
   motion (`--dur-*`, `--ease`), layout (`--topbar-height`).
4. **Per-component tokens.** `--button-radius`, `--input-height-md`,
   `--table-head-fill`, `--modal-width-md`, `--slider-track-h`,
   `--sheet-width` and the rest. They are **undeclared by default**: each
   module reads them with a fallback
   (`border-radius: var(--button-radius, var(--r-md))`), so the fallback is
   the default and setting none changes nothing. The full list per component
   is generated (`components/ui/_registry/generated.ts`) and shown on each
   component's docs page.

### The presets

`tokens.css` ships three presets:

- **Default (light glass)**: `:root`. Neutral greys with the faintest cool
  cast, one indigo accent, frosted glass panels over a softly lit grey field.
- **Flat**: `[data-theme="flat"]`. Opaque white planes on a light grey field,
  smaller radii, solid accent fills, no blur, no glow.
- **Dark**: `[data-theme="dark"]`. Glass over a near-black field, light inks,
  a lifted accent. The light channel `--rgb-white` points at the raised
  surface colour, so every translucent fill darkens with it.

Each layer is declared as `:root:has([data-theme="x"]), [data-theme="x"]`, so
`data-theme` on `<html>` (or any wrapper) applies it to the whole document,
portalled overlays included. The docs' top bar switches between them.

### The one CSS rule that matters

A custom property resolves `var()` where it is declared. `--wash-hover:
rgba(var(--rgb-brand), 0.05)` is declared on `:root`, so a theme that changes
`--rgb-brand` must also be declared on `:root` (then the wash recomputes), or
redeclare every composite it affects, as the flat and dark layers do. The
Studio's default export ("only what changed", at `:root`) is right; a theme
scoped to `[data-theme="x"]` should be exported with "every token".

## The Rime Studio

`/themes`. Every documented component, inside the dashboard frame, is the
live preview on the right; the panel on the left edits the theme.

- **Start from** a preset: Default, Flat or Dark, read live from the loaded
  stylesheet, so a preset is exactly the CSS it came from.
- **Brand**: palette (picker plus hex), signals, ink, fonts (all self-hosted
  in `app/fonts`: Inter, Plus Jakarta Sans, DM Sans, Source Sans 3, IBM Plex
  Sans, Nunito Sans, Source Serif 4, Fraunces) and the logo (upload, or a
  path on the site).
- **Image**: drop a logo, brand book page, screenshot or photo. The palette is
  extracted in the browser (k-means in OKLab), mapped to brand, deep, accent
  and neutral by contrast-aware rules, every other colour derived in OKLCH,
  and any ink that fails is nudged to the nearest passing shade with a note.
  Reassign any swatch to any role and apply again.
- **Shape**: roundness (square to soft), pill controls, each radius step,
  density, control height, border widths, top bar height, modal widths.
- **Gradients**: every gradient token: direction, stops, softness, and the
  page field's blooms.
- **Glass**: on or off; per surface the tint, opacity, blur and saturation;
  the top light line and the panel edge.
- **Shadows**: one depth knob for every shadow and glow, and an editor per
  elevation.
- **Hover**: hover lift (0 by default), hover lighten, press darken, hover
  glow, duration and easing, and the washes. There is no scale control: no
  theme scales on hover.
- **Components**: pick a component, edit its own tokens, copy its usage and
  its tokens with their current values.
- **All tokens**: every token, searchable, editable.
- **Contrast**: WCAG AA pairs measured live on the preview (glass at its
  worst), with a Fix per failure and Fix all.
- **Export**: theme.css (`:root` or `[data-theme]`, only the changes or every
  token) and theme.json, copy or download.

Themes save by name in the browser (localStorage); the working theme is
restored on reload; undo and redo (Ctrl or Cmd Z) cover every change. Import a
theme.json from the toolbar to move a theme between laptops.

How it stays out of the docs: the theme is one `<style>` element, rendered
only while the Studio is mounted, with the selector
`:root:root:has([data-theme-studio]), [data-theme-studio][data-theme-studio],
[data-theme-studio] [data-theme]`. That reaches the page field and every
portal while the Studio is open, beats the preset layers, and stops matching
the moment you leave. The Studio's own chrome is deliberately not on the
tokens, so it stays usable whatever the theme does.

## Theming a new project

1. Copy `components/ui` (it imports nothing app-specific: no auth, no data
   layer, no product copy), `app/styles/tokens.css`, and the base rules from
   `app/globals.css` (reset, body, headings, links, focus fallback,
   `.sr-only`, the bare-table look, the keyframes). `components/shell` and
   `components/charts` are optional.
2. Export the theme from the Studio as `app/styles/theme.css` ("only what
   changed", `:root`) and import it after tokens.css.
3. Load fonts with next/font in the root layout (copy `app/fonts` for
   offline builds); keep the family names the Studio wrote into
   `--font-body` and `--font-display`.
4. Pass your logo to SidebarShell (`logo` element or `logoSrc`).
5. Mount `ToastProvider` once in the root layout.
6. Point the project's AI agents at `docs/ui/llms.txt` (copy the folder), or
   at this kit's `/llms.txt` while it runs.

## The scroll pattern

Portable in `components/ui/Scroll`:

- `useScrollEdges(ref, { target, axis, enabled })`: a passive scroll listener
  and a ResizeObserver that write `data-scrolled` and `data-more` straight to
  the DOM, so scrolling never re-renders React.
- `--scroll-edge-top` / `-bottom` (and `-left` / `-right`): the hairline and
  soft shade a header or footer casts once those attributes are set.
- `themedScrollClass`: thin native scrollbars in the theme's tint and
  `overscroll-behavior: contain`.
- `useScrollLock(active)`: page scroll lock with a shared counter, so nested
  overlays nest, and the scrollbar's width paid back as padding.
- `ScrollArea`: all of it around any region (`axis="x"` for wide tables).

## Adding a token

1. Prefer a per-component hook read with a fallback over a new system token.
2. A system token goes in `tokens.css` `:root` with a comment saying what it
   is for. If the flat or dark preset needs a different value, declare it in
   that layer too.
3. Add it to `components/ui/_registry/tokens.ts` if the Studio should show it
   in a named group with a label.
4. Run `npm run registry` so the docs list it, and check Default, Flat and
   Dark before and after.
