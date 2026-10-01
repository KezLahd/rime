<div align="center">
  <img src="./public/rime/rime-lockup.svg" alt="Rime" width="340"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Next.js_16-468CFB?style=for-the-badge&labelColor=0F1620" alt="Next.js"/>
  <img src="https://img.shields.io/badge/UI-React_19-94C4FB?style=for-the-badge&labelColor=0F1620" alt="React"/>
  <img src="https://img.shields.io/badge/Styles-CSS_Modules-C8DDF9?style=for-the-badge&labelColor=0F1620" alt="CSS Modules"/>
  <img src="https://img.shields.io/badge/Install-shadcn_CLI-468CFB?style=for-the-badge&labelColor=0F1620" alt="shadcn CLI"/>
  <img src="https://img.shields.io/badge/Docs-rime.mjsons.net-1F5BC4?style=for-the-badge&labelColor=0F1620" alt="Docs"/>
</p>

<p align="center">
  <a href="https://rime.mjsons.net"><b>Live docs</b></a> ·
  <a href="https://rime.mjsons.net/components"><b>Components</b></a> ·
  <a href="https://rime.mjsons.net/blocks"><b>Blocks</b></a> ·
  <a href="https://rime.mjsons.net/themes"><b>Rime Studio</b></a> ·
  <a href="https://rime.mjsons.net/llms.txt"><b>llms.txt</b></a>
</p>

<br/>

> **Rime** is a React component kit with frosted-glass surfaces, its own docs site, and a theme studio — installed with the shadcn CLI, themed with one CSS file, no Tailwind underneath.

<br/>

## What this repo is (and isn't)

**This repo is the component kit.** 69 components, blocks (whole screens), charts, patterns, and a theme studio, all built from CSS Modules and CSS custom properties. The shadcn CLI copies the source into your project — you own what you install. The repo also doubles as the live docs site at [rime.mjsons.net](https://rime.mjsons.net).

**This repo is *not* a Tailwind preset or a shadcn fork.** Rime emits a shadcn-compatible registry so the install flow feels identical (`npx shadcn@latest add KezLahd/rime/<item>`), but every component underneath is Rime's own — no Radix, no Tailwind, no shadcn primitives. Themes swap one `theme.css`; the rest of the kit stays put.

<br/>

## What it does

- **Frosted glass by default** — translucent panels, lit edges, soft two-layer shadows over a tinted field. Rime Flat is the opaque variant; both ship light and dark.
- **Rime Studio** (`/themes`) — start from a preset, drop a logo to extract a palette, tune glass / shape / shadows / hover, check contrast, export `theme.css`.
- **Blocks** — whole screens you install with one command: Dashboard, Inbox, Settings, Data Table, Auth cards, shells.
- **Charts** — line, area, bar, donut, stat strips, segmented tooltips, built on Recharts.
- **AI ready** — every page has a markdown twin (`add .md` to the URL), the whole site is in `/llms.txt`, the registry speaks shadcn MCP, and an `AGENTS.rime.md` + Claude skill ship with the agents item.
- **Starter template** — `npx shadcn@latest add KezLahd/rime/starter` scaffolds a Next.js 16 app with Supabase auth (password + TOTP), the dashboard behind the gate, agent docs wired in.

<br/>

## Stack

| Layer | Tech |
|---|---|
| App framework | **Next.js 16** (App Router) · React 19 · TypeScript |
| Styles | **CSS Modules** · CSS custom properties · zero Tailwind |
| Install flow | **shadcn CLI** — Rime emits its own registry at `/r/*.json` |
| Charts | Recharts |
| Icons | lucide-react |
| Fonts | Inter (self-hosted under `app/fonts/`, SIL OFL) |
| Dev server | `npm run dev` → <http://localhost:3100> |

<br/>

## Running locally

```bash
# 1. Clone
git clone https://github.com/KezLahd/rime.git
cd rime

# 2. Install (Node 20+, developed on 24)
npm install

# 3. Dev — the docs site at http://localhost:3100
npm run dev

# 4. Production build
npm run build
npm start
```

**After editing a component:**

```bash
npm run registry        # regenerate props + token tables
npm run docs:export     # write docs/ui markdown (llms.txt + per-component .md)
npm run registry:shadcn # rebuild registry.json, public/r mirror, components.json
```

<br/>

## Use Rime in another project

With the shadcn CLI (talking to the GitHub source, or the hosted mirror at `rime.mjsons.net/r`):

```bash
npx shadcn@latest add KezLahd/rime/kit       # everything
npx shadcn@latest add KezLahd/rime/button    # one component + what it needs
npx shadcn@latest add KezLahd/rime/dashboard # the dashboard block
npx shadcn@latest add KezLahd/rime/agents    # AGENTS.rime.md + Claude skill + docs/ui
npx shadcn@latest add KezLahd/rime/starter   # the full Supabase starter template
```

Then import the styles first in `app/globals.css`:

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/shadcn-bridge.css";
@import "./styles/theme.css"; /* your theme from Rime Studio */
```

Wrap the app in `<ToastProvider>`. Dark mode is the `.dark` class (or `data-mode="dark"`) on `<html>`; Rime Flat is `data-theme="flat"`.

<br/>

## Project layout

```
app/                     Next.js App Router (the docs site)
  _docs/                 docs shell: top bar, sidebar, TOC, search, previews
  _home/                 home page sections
  components/            index + [slug] pages (one per registry entry)
  blocks/                block gallery + /view route for the iframe previews
  charts/, patterns/     gallery pages
  foundations/, colors/  tokens explorer
  studio/                Rime Studio (theming engine + panels)
  styles/
    tokens.css           every token: Rime Default, Rime Flat, light + dark
    base.css             reset, type, focus, keyframes
    shadcn-bridge.css    shadcn variable names aliased to Rime tokens

components/
  ui/                    the components (69 of them) + _registry/
  shell/                 SidebarShell, PageHeader, AuthCard
  charts/                charts and the shadcn-style chart primitives
  blocks/                whole screens shipped as registry items

agents/                  AGENTS.rime.md + Claude skill (installed by the "agents" item)
templates/starter/       Next.js 16 + Supabase MFA starter project

registry.json            the generated GitHub registry
public/r/                the generated registry mirror served from rime.mjsons.net/r
rime.config.json         publishing settings (owner, site URL, namespace, package)
```

<br/>

## For AI agents

- `/llms.txt` — the index, the rules, the shadcn name map, and the install lines. Start here.
- `/llms-full.txt` — everything in one file.
- Any page as markdown — add `.md` (e.g. `/components/button.md`).
- `docs/ui/` — the same files in the repo (`npm run docs:export`).
- The `agents` item installs them into a project with `AGENTS.rime.md` and a Claude skill.

A good instruction for an agent:

> Read `docs/ui/llms.txt` (or <https://rime.mjsons.net/llms.txt>) first, follow its rules, and build only with Rime components and tokens.

<br/>

## Rime brand

| Token | Hex | Role |
|---|---|---|
| Frost | `#468CFB` | `--brand`, the glass accent |
| Ice | `#94C4FB` | `--brand-soft`, field blooms |
| Mist | `#C8DDF9` | `--brand-wash`, field tint |
| Brand action | `#2B6CDB` | gradient start, strong CTA |
| Ink brand | `#1F5BC4` | links and brand text (6.27:1 on white) |

Artwork lives in `public/rime/`; the master is in `brand/rime-source/`.

<br/>

## Design rules carried by the kit

- No eyebrow or small label stacked over a title.
- No bento grids of cards. No left accent bars. No hover scale or lift by default.
- Summary stats are one card with hairline cells, never a grid of separate stat cards.
- Filters are dropdowns plus one full-width search; sortable headers are the whole cell; pagination is centred.
- Text uses the full width of its column — no narrow measure caps.
- The docs sidebar is transparent (the frosted sidebar belongs to `SidebarShell`, the dashboard rail).
- No em dashes in copy.

<br/>

<p align="center">
  <sub>Built in Sydney · <a href="https://instagram.com/kezlahd">another kez curation</a></sub>
</p>
