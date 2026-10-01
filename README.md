# Rime

Rime is the frost that forms on surfaces, and the name of this kit: an
unbranded React component kit with frosted-glass surfaces, its own docs site,
and Rime Studio for theming. It installs like shadcn/ui (the shadcn CLI copies
the source into your project) and themes with one CSS file.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, CSS Modules and CSS
  custom properties. No Tailwind, no Radix, no shadcn underneath: every
  component is built here, accessible and themed by tokens.
- **What's in it:** components, blocks (whole screens), charts on Recharts and
  patterns. Every component has a docs page with live examples, its API
  generated from the source, the tokens it reads, accessibility notes, do and
  don't rules, and an install command.
- **Theme = preset x mode:** Rime Default (frosted glass in the Rime blues)
  and Rime Flat (opaque, small radii, no blur), each in light and dark mode.
- **Rime Studio** (`/themes`): start from a preset, drop in a logo or
  screenshot to extract a palette, tune glass, shape, shadows and hover, check
  contrast in both modes, save themes by name, export `theme.css`.
- **AI ready:** `/llms.txt`, a markdown twin of every page (add `.md`), a
  shadcn registry with an MCP namespace, and a Claude skill.
- **Offline:** fonts are self-hosted in `app/fonts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3100
```

It runs on port **3100**, so it never clashes with another app on 3000.

| Script | What |
|---|---|
| `npm run dev` | The site at http://localhost:3100 |
| `npm run build` / `npm run start` | Production build, served on 3100 |
| `RIME_HOST=1 npm run build` | Build for hosting under the site URL's path (only needed if `siteUrl` has a path) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next config) |
| `npm run registry` | Regenerate props and token tables from the source (`components/ui/_registry/generated.ts`) |
| `npm run docs:export` | Write the docs as markdown to `docs/ui/` (llms.txt, llms-full.txt, one file per component) |
| `npm run registry:shadcn` | Generate the shadcn registry: `registry.json`, the `public/r/` mirror, `components.json`, and `components/ui/_registry/site.ts` |

After changing a component: `npm run registry && npm run docs:export && npm run registry:shadcn`.

## The site

| Route | What |
|---|---|
| `/` | Home: the pitch, the install command, live example apps (Dashboard, Inbox, Tasks, Settings, Authentication) |
| `/docs` | Introduction, Installation, Theming, Dark mode, AI agents, Coming from shadcn |
| `/components` | Every component as a live card, with search and a category filter; `/components/<slug>` for each |
| `/blocks` | Whole screens with a viewer (desktop, tablet, mobile), Preview / Code and the install command |
| `/charts` | Line, area, bar, donut and stats, plus every tooltip variant |
| `/themes` | Rime Studio (`/studio` redirects here) |
| `/colors`, `/foundations`, `/patterns` | Colour tokens, type and shape, composed patterns |
| `/llms.txt`, `/llms-full.txt`, `/md/<slug>.md`, `/components/<slug>.md` | The docs as markdown |
| `/r/registry.json`, `/r/<item>.json` | The built shadcn registry mirror |

Press Cmd or Ctrl K (or /) to search, and D to switch light and dark.

## Where things live

```
app/
  page.tsx, _home/         the home page and its showcase
  docs/                    the docs pages
  components/              the index and [slug] pages
  blocks/, charts/, colors/, foundations/, patterns/
  themes/ -> studio/       Rime Studio (engine/, panels/)
  llms.txt/, llms-full.txt/, md/[file]/   markdown for AI agents
  _docs/                   docs shell, nav, search, code blocks, previews
  fonts/                   self-hosted fonts (SIL Open Font License)
  styles/
    tokens.css             every token: Rime Default, Rime Flat, light and dark
    base.css               reset, type, focus, keyframes
    shadcn-bridge.css      shadcn variable names, aliased to Rime tokens
    tailwind-bridge.css    optional, for projects that also run Tailwind v4
    rime-site.css          Rime's own brand colours (the docs site)
components/
  ui/                      the components, _registry/ (docs source) and barrels
  shell/                   SidebarShell, PageHeader, AuthCard
  charts/                  charts and the shadcn-style chart primitives
  blocks/                  whole screens (blocks.json lists them)
agents/                    AGENTS.rime.md and the Claude skill, shipped by the "agents" item
templates/                 the starter project and the "starter" item
public/rime/               Rime brand assets
public/r/                  the generated registry mirror
registry.json              the generated GitHub registry
rime.config.json           publishing settings (owner, site URL, namespace, package)
brand/rime-source/         the master artwork and the scripts that make public/rime/
```

## Publishing settings

Everything about where Rime lives is in **`rime.config.json`**:

- `siteUrl` (`https://rime.mjsons.net`): the hosted docs. Used by the
  registry mirror (`/r`), absolute links in llms.txt, the `@rime` MCP
  namespace, Open in Claude and the page metadata.
- `owner` (`<owner>`): the GitHub owner. **Replace `<owner>`** once the repo
  exists on github.com, then run `npm run registry:shadcn && npm run docs:export`.
  Install addresses become `npx shadcn@latest add <owner>/rime/<item>`.
- `namespace` (`@rime`) and `package` (`@kezlahd/rime`).

## Use it in another project

With the shadcn CLI (once the repo is on GitHub, or through the hosted mirror):

```bash
npx shadcn@latest add <owner>/rime/kit      # everything
npx shadcn@latest add <owner>/rime/select   # one component and what it needs
npx shadcn@latest add <owner>/rime/agents   # docs/ui, AGENTS.rime.md, the Claude skill
```

Then import the styles first in `app/globals.css`:

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/shadcn-bridge.css";
@import "./styles/theme.css"; /* your theme from Rime Studio */
```

Wrap the app in `<ToastProvider>`. Dark mode is the `.dark` class (or
`data-mode="dark"`) on `<html>`; Rime Flat is `data-theme="flat"`. A complete
starting project is in `templates/starter` (Supabase auth with MFA, the
dashboard block, AGENTS.md, `.mcp.json`).

Manually: copy `app/styles/{tokens,base,shadcn-bridge}.css`,
`components/ui/_internal` and the component folders you need (each component
page lists its files and dependencies), and install `lucide-react` (and
`recharts` for charts). Keep the `@/*` path alias and no `src/` directory.

### A theme

Open `/themes`, start from a preset, adjust, check the Contrast tab in both
modes, save it by name, then Export `theme.css` into the project's
`app/styles/`. To move a theme between laptops, export `theme.json` and Import
it in the Studio on the other machine (saved themes live in each browser).

## For AI agents

- `/llms.txt`: the index, the rules, the shadcn name map and install lines. Start here.
- `/llms-full.txt`: everything in one file.
- Any page as markdown: add `.md` (for example `/components/button.md`), or use the Copy page menu.
- `docs/ui/`: the same files in the repo (`npm run docs:export`).
- The `agents` item installs them into a project with `AGENTS.rime.md` and a Claude skill.

A good instruction: "Read docs/ui/llms.txt (or https://rime.mjsons.net/llms.txt)
first, follow its rules, and build only with Rime components and tokens."

## Rime brand assets

Rime's own look (separate from the themes it ships):

- **Artwork:** `public/rime/`: `rime-mark.svg`, `rime-wordmark.svg`,
  `rime-lockup.svg`, their `-white` variants for dark mode, `rime-mark-mono.svg`,
  `icon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-icon.png`.
  The docs logo (`app/_docs/DocsLogo.tsx`) uses the lockup, and the mark alone
  on narrow screens. `app/icon.svg`, `app/apple-icon.png` and `app/favicon.ico`
  are copies (Next's app file conventions); `app/manifest.ts` uses the 192 and
  512 icons. To regenerate from the master: `brand/rime-source/README.md`.
- **Colours:** Frost `#468CFB`, Ice `#94C4FB`, Mist `#C8DDF9`, declared in
  `app/styles/rime-site.css`. Rime Default (in `app/styles/tokens.css`) is
  built from them: `--brand` is Frost, `--brand-soft` Ice, the field blooms
  Mist and Ice. Text never sits on Frost: `--brand-action` (#2B6CDB) starts the
  primary gradient and `--ink-brand` (#1F5BC4) carries links.

## Move it to another laptop

Clone it from GitHub (once Kieran has pushed it), then:

```bash
git clone https://github.com/<owner>/rime.git
cd rime
npm install
npm run dev        # http://localhost:3100
```

Or copy the folder (leave out `node_modules` and `.next`, they are rebuilt) and
run `npm install` then `npm run dev` in the copy. Node 20 or newer (developed
on Node 24).

## Design rules carried by the kit

- No eyebrow or small label stacked over a title.
- No bento grids of cards, no left accent bars.
- No hover scale or lift by default.
- Summary stats are one card with hairline cells.
- Filters are dropdowns plus one full-width search; sortable headers are the
  whole cell; pagination is centred.
- Text uses the full width of its column, with no narrow measure caps.
- The docs sidebar is a flush frosted rail with its scrollbar hidden until
  hover; modal and sheet headers keep one left edge.
- No em dashes in copy.
