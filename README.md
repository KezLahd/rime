<div align="center">
  <img src="./assets/banner-hero.svg" alt="Rime: frosted-glass React components" width="100%"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-468CFB?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0F1620" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-94C4FB?style=for-the-badge&logo=react&logoColor=white&labelColor=0F1620" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-1F5BC4?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0F1620" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/CSS_Modules-no_Tailwind-C8DDF9?style=for-the-badge&logo=css3&logoColor=0F1620&labelColor=0F1620" alt="CSS Modules"/>
  <img src="https://img.shields.io/badge/MCP-Ready-468CFB?style=for-the-badge&labelColor=0F1620" alt="MCP ready"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/components-69-2B6CDB?style=flat-square&labelColor=0F1620" alt="69 components"/>
  <img src="https://img.shields.io/badge/blocks-6-2B6CDB?style=flat-square&labelColor=0F1620" alt="6 blocks"/>
  <img src="https://img.shields.io/badge/themes-Default_·_Flat-468CFB?style=flat-square&labelColor=0F1620" alt="Themes"/>
  <img src="https://img.shields.io/badge/modes-Light_·_Dark-94C4FB?style=flat-square&labelColor=0F1620" alt="Modes"/>
  <img src="https://img.shields.io/badge/install-shadcn_CLI-FFFFFF?style=flat-square&labelColor=0F1620" alt="shadcn CLI"/>
  <img src="https://img.shields.io/badge/fonts-self--hosted-C8DDF9?style=flat-square&labelColor=0F1620" alt="Self-hosted fonts"/>
  <a href="https://rime.mjsons.net"><img src="https://img.shields.io/badge/live-rime.mjsons.net-1F5BC4?style=flat-square&labelColor=0F1620" alt="Live docs"/></a>
</p>

<p align="center">
  <a href="https://rime.mjsons.net"><b>Live docs</b></a> ·
  <a href="https://rime.mjsons.net/components"><b>Components</b></a> ·
  <a href="https://rime.mjsons.net/blocks"><b>Blocks</b></a> ·
  <a href="https://rime.mjsons.net/charts"><b>Charts</b></a> ·
  <a href="https://rime.mjsons.net/themes"><b>Rime Studio</b></a> ·
  <a href="https://rime.mjsons.net/llms.txt"><b>llms.txt</b></a>
</p>

<br/>

> **Rime** is a React component kit with frosted-glass surfaces, its own docs site, and a theme studio — installed with the shadcn CLI, themed with one CSS file, and absolutely zero Tailwind underneath.

<br/>

<div align="center">
  <img src="https://img.shields.io/badge/-◆-468CFB?style=flat-square&logoColor=white&labelColor=0F1620" alt=""/>
  <img src="https://img.shields.io/badge/-◆-94C4FB?style=flat-square&labelColor=0F1620" alt=""/>
  <img src="https://img.shields.io/badge/-◆-C8DDF9?style=flat-square&labelColor=0F1620" alt=""/>
</div>

<br/>

## What this repo is (and isn't)

**This repo is the component kit.** 69 components, 6 blocks (whole screens), charts, patterns, and a theme studio, all built from CSS Modules and CSS custom properties. The shadcn CLI copies the source into your project — you own what you install. The repo also doubles as the live docs site at [rime.mjsons.net](https://rime.mjsons.net).

**This repo is *not* a Tailwind preset or a shadcn fork.** Rime emits a shadcn-compatible registry so the install flow feels identical (`npx shadcn@latest add KezLahd/rime/<item>`), but every component underneath is Rime's own — no Radix, no Tailwind, no shadcn primitives. Themes swap one `theme.css`; the rest of the kit stays put.

<br/>

## ✦ What it does

<table>
<tr>
<td width="33%" valign="top">

### 🧊 Frosted by default
Translucent panels, lit edges, soft two-layer shadows over a tinted field.
**Rime Flat** is the opaque variant. Both ship light and dark.

</td>
<td width="33%" valign="top">

### 🎨 Rime Studio
Start from a preset, drop a logo to **extract a palette**, tune glass, shape, shadows, hover. Check contrast. Export one `theme.css`.

</td>
<td width="33%" valign="top">

### 🧩 Blocks
Whole screens, one command: **Dashboard · Inbox · Settings · Data Table · Auth · Shells**. Install and own the source.

</td>
</tr>
<tr>
<td valign="top">

### 📈 Charts
Line, area, bar, donut, stat strips, segmented tooltips. Built on **Recharts** with Rime tokens.

</td>
<td valign="top">

### 🤖 AI ready
Every page has a markdown twin (`add .md`). Whole site in `/llms.txt`. **MCP namespace** `@rime`, `AGENTS.rime.md`, Claude skill.

</td>
<td valign="top">

### 🚀 Starter template
`npx shadcn add KezLahd/rime/starter` scaffolds a Next.js 16 app with Supabase auth, TOTP, dashboard behind the gate.

</td>
</tr>
</table>

<br/>

## ✦ Install Rime

```bash
npx shadcn@latest add KezLahd/rime/kit       # everything
npx shadcn@latest add KezLahd/rime/button    # one component + what it needs
npx shadcn@latest add KezLahd/rime/dashboard # the dashboard block
npx shadcn@latest add KezLahd/rime/agents    # AGENTS.rime.md + Claude skill + docs/ui
npx shadcn@latest add KezLahd/rime/starter   # the full Supabase MFA starter template
```

Then import the styles in `app/globals.css`:

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/shadcn-bridge.css";
@import "./styles/theme.css"; /* your theme from Rime Studio */
```

Wrap your app in `<ToastProvider>`. Dark mode: `.dark` class on `<html>`. Rime Flat: `data-theme="flat"`.

<br/>

## ✦ Stack

<table>
<tr><td><b>App framework</b></td><td><a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-468CFB?style=flat-square&logo=next.js&logoColor=white&labelColor=0F1620"/></a> App Router · React 19 · TypeScript 5.9</td></tr>
<tr><td><b>Styles</b></td><td><img src="https://img.shields.io/badge/CSS_Modules-C8DDF9?style=flat-square&labelColor=0F1620"/> <img src="https://img.shields.io/badge/custom_properties-94C4FB?style=flat-square&labelColor=0F1620"/> <img src="https://img.shields.io/badge/no_Tailwind-E24329?style=flat-square&labelColor=0F1620"/></td></tr>
<tr><td><b>Install flow</b></td><td><img src="https://img.shields.io/badge/shadcn_CLI-FFFFFF?style=flat-square&labelColor=0F1620"/> Rime emits its own registry at <code>/r/*.json</code></td></tr>
<tr><td><b>Charts</b></td><td><img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&labelColor=0F1620"/></td></tr>
<tr><td><b>Icons</b></td><td><img src="https://img.shields.io/badge/lucide--react-F56565?style=flat-square&labelColor=0F1620"/></td></tr>
<tr><td><b>Fonts</b></td><td>Inter · self-hosted under <code>app/fonts/</code> · SIL OFL</td></tr>
<tr><td><b>Dev server</b></td><td><code>npm run dev</code> → <code>http://localhost:3100</code></td></tr>
</table>

<br/>

## ✦ Running locally

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

## ✦ Rime brand

The palette the kit is built from. Default theme reads these; Rime Studio lets you swap them.

<table>
<tr>
<td align="center" width="20%">
<img src="https://img.shields.io/badge/-%20%20%20%20%20%20-468CFB?style=for-the-badge" alt=""/>
<br/><b>Frost</b><br/>
<code>#468CFB</code><br/>
<sub><code>--brand</code> · glass accent</sub>
</td>
<td align="center" width="20%">
<img src="https://img.shields.io/badge/-%20%20%20%20%20%20-94C4FB?style=for-the-badge" alt=""/>
<br/><b>Ice</b><br/>
<code>#94C4FB</code><br/>
<sub><code>--brand-soft</code> · field blooms</sub>
</td>
<td align="center" width="20%">
<img src="https://img.shields.io/badge/-%20%20%20%20%20%20-C8DDF9?style=for-the-badge" alt=""/>
<br/><b>Mist</b><br/>
<code>#C8DDF9</code><br/>
<sub><code>--brand-wash</code> · field tint</sub>
</td>
<td align="center" width="20%">
<img src="https://img.shields.io/badge/-%20%20%20%20%20%20-2B6CDB?style=for-the-badge" alt=""/>
<br/><b>Action</b><br/>
<code>#2B6CDB</code><br/>
<sub><code>--brand-action</code> · CTA</sub>
</td>
<td align="center" width="20%">
<img src="https://img.shields.io/badge/-%20%20%20%20%20%20-1F5BC4?style=for-the-badge" alt=""/>
<br/><b>Ink</b><br/>
<code>#1F5BC4</code><br/>
<sub><code>--ink-brand</code> · links · 6.27:1</sub>
</td>
</tr>
</table>

<br/>

## ✦ Project layout

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

## ✦ For AI agents

| Resource | What it is |
|---|---|
| [`/llms.txt`](https://rime.mjsons.net/llms.txt) | The index, the rules, the shadcn name map, install lines. **Start here.** |
| [`/llms-full.txt`](https://rime.mjsons.net/llms-full.txt) | Everything in one file. |
| `/components/<slug>.md` | Any page as markdown (just add `.md`). |
| `docs/ui/` | The same files in the repo (`npm run docs:export`). |
| `agents` item | Installs `AGENTS.rime.md` + Claude skill into a project. |

A good instruction for an agent:

> Read `docs/ui/llms.txt` (or <https://rime.mjsons.net/llms.txt>) first, follow its rules, and build only with Rime components and tokens.

<br/>

## ✦ Design rules carried by the kit

- No eyebrow or small label stacked over a title.
- No bento grids of cards. No left accent bars. No hover scale or lift by default.
- Summary stats are **one card with hairline cells**, never a grid of separate stat cards.
- Filters are dropdowns plus one full-width search. Sortable headers are the whole cell. Pagination is centred.
- Text uses the full width of its column — **no narrow measure caps.**
- The docs sidebar is transparent (the frosted sidebar belongs to `SidebarShell`, the dashboard rail).
- No em dashes in copy.

<br/>

<div align="center">
  <img src="https://img.shields.io/badge/-◆-468CFB?style=flat-square&labelColor=0F1620" alt=""/>
  <img src="https://img.shields.io/badge/-◆-94C4FB?style=flat-square&labelColor=0F1620" alt=""/>
  <img src="https://img.shields.io/badge/-◆-C8DDF9?style=flat-square&labelColor=0F1620" alt=""/>
</div>

<br/>

<p align="center">
  <sub>Built in Sydney · <a href="https://instagram.com/kieranjxn"><b>another kez curation</b></a></sub>
</p>
