# Rime starter

A minimal Next.js 16 App Router app with Rime (frosted-glass components),
Supabase auth with MFA (password, then an authenticator code, with
authenticator setup), the Rime dashboard behind the gate, and agent docs.
Themed, authed and running in about five minutes.

## Setup

1. **Get the files.** Create a repo from this template on GitHub, or copy
   this folder somewhere new.
2. **Install:**

   ```bash
   npm install
   npx shadcn@latest add <owner>/rime/kit <owner>/rime/agents
   ```

   The second command installs Rime (see "Installed by the CLI"). Run it
   again later as `npm run rime:sync` to take updates. Until the Rime repo is
   public on GitHub, copy those folders from your local Rime checkout instead.
3. **Add the dashboard block** (the starter's /dashboard uses it):

   ```bash
   npx shadcn@latest add <owner>/rime/dashboard
   ```

4. **Supabase:** copy `.env.example` to `.env.local` and fill in your
   project URL and anon (publishable) key. In Supabase Auth, turn on TOTP
   multi-factor authentication and create a user.
5. **Run it:** `npm run dev`, then open http://localhost:3000. You land on
   /login; after the password you set up an authenticator once, then sign in
   with codes.
6. **Theme it:** open Rime Studio (https://rime.mjsons.net/themes), make your
   theme, Export, and paste it into `app/styles/theme.css`. Dark mode and the
   Flat preset are attributes on `<html>` (see app/ThemeScript.tsx).

## What is here

| Path | What |
| --- | --- |
| `app/layout.tsx` | Inter (self-hosted), the no-flash theme script, ToastProvider |
| `app/globals.css` | Rime styles, then `styles/theme.css` |
| `app/(auth)/login`, `login/mfa`, `mfa/setup` | Password, code and authenticator setup, with server actions |
| `app/(app)/dashboard` | The Rime dashboard, gated with `requireAal2()` |
| `lib/auth/gate.ts`, `lib/auth/actions.ts` | The page gate and the auth server actions |
| `lib/supabase/*`, `proxy.ts` | Supabase SSR clients and the session refresh |
| `AGENTS.md`, `CLAUDE.md`, `.mcp.json`, `components.json` | Agent rules, the shadcn MCP server and the `@rime` namespace |

## Installed by the CLI (not committed here)

These come from the Rime registry, so the template stays small and always
gets the current version:

- `components/ui/**`, `components/shell/**`, `components/charts/**`, `components/blocks/**`
- `app/styles/tokens.css`, `app/styles/base.css`, `app/styles/shadcn-bridge.css`
- `docs/ui/**` (llms.txt for agents), `AGENTS.rime.md`, `.claude/skills/rime/SKILL.md`

Add them to version control in your own project as you would any source.

## Fill in

- `<owner>`: the GitHub owner of the Rime repo, in `package.json`
  (`rime:sync`), this README and the dashboard page comment.
