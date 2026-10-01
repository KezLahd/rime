<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rime

Rime is this component kit (frosted-glass React components, CSS Modules,
tokens). Read `docs/ui/llms.txt` (or http://localhost:3100/llms.txt) before writing UI
code here, and follow its rules. Components live in `components/ui`, documented
from `components/ui/_registry`. After changing a component's props or CSS run
`npm run registry`; after changing a registry entry run `npm run docs:export`.
Tokens are in `app/styles/tokens.css` (Default, plus the Flat and Dark layers).
Dev server: `npm run dev` on port 3100.

## Maintaining Rime

- After any component change: `npm run registry` (props and tokens),
  `npm run docs:export` (docs/ui markdown), `npm run registry:shadcn`
  (registry.json, public/r, components.json).
- Registry dependencies always use full addresses, never bare names.
- Item names follow the shadcn name map (components/ui/_registry/shadcn-map.ts).
- Publishing settings live in rime.config.json (owner, site URL, namespace).
