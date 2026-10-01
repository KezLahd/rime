<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. (Next.js 16 renamed middleware to proxy: see proxy.ts.)

<!-- END:nextjs-agent-rules -->

# Acme

UI: follow AGENTS.rime.md (installed by `npm run rime:sync`).

## Project rules

- Gate access in each page.tsx with `requireAal2()` (lib/auth/gate.ts), never in a layout.tsx: a layout gate leaks the page into the RSC payload.
- Every auth step runs on the server (lib/auth/actions.ts). Never keep a session in localStorage.
- proxy.ts only refreshes the Supabase session; it never decides access.
- Rime files (components/ui, components/shell, components/charts, components/blocks, app/styles/tokens.css, base.css, shadcn-bridge.css) come from the registry. Don't edit them in place; change the theme in app/styles/theme.css, and update Rime with `npm run rime:sync`.
- No em dashes in copy.
