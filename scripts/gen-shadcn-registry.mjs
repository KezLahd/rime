// Generates Rime's shadcn registry from the source, so `npx shadcn add`
// installs Rime components (CSS Modules, no Tailwind) byte for byte:
//
//   node scripts/gen-shadcn-registry.mjs        (npm run registry:shadcn)
//
// Every item is a universal item (type "registry:item", every file
// "registry:file" with an explicit "~/" target), which the shadcn CLI
// installs without components.json, framework detection or Tailwind. It
// writes:
//
// - registry.json at the repo root: the GitHub source registry. Installs as
//   `npx shadcn@latest add <owner>/rime/<item>` once the repo is on GitHub.
//   registryDependencies use the same full addresses (never bare names,
//   which would resolve to shadcn's own components).
// - public/r/<item>.json and public/r/registry.json: the built mirror with
//   file contents inlined, served by the docs site at <siteUrl>/r/. Its
//   registryDependencies are full URLs, so it works with no setup, and as
//   the @rime namespace (components.json) for the shadcn MCP server.
// - components.json: the namespace stub the shadcn MCP needs.
//
// Owner, repo, site URL and namespace come from rime.config.json. Dependencies
// are computed from each file's imports: a sibling component import becomes a
// registryDependency, _internal becomes "base", a bare npm import becomes a
// dependency at the version in package.json (react, react-dom and next are
// assumed). Run it after adding or changing a component, after
// `npm run registry` and `npm run docs:export`.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const config = JSON.parse(readFileSync(join(ROOT, "rime.config.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// RIME_SITE_URL overrides the site, e.g. a local test mirror (http://localhost:3100).
const SITE = (process.env.RIME_SITE_URL ?? config.siteUrl).replace(/\/$/, "");
const GH = `${config.owner}/${config.repo}`;
const posix = (p) => p.replaceAll("\\", "/");

// ── The docs registry, transpiled and imported (as export-ui-docs does) ──
async function loadDocsRegistry() {
  const SRC = "components/ui/_registry";
  const walk = (dir, out = []) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (p.endsWith(".ts")) out.push(p);
    }
    return out;
  };
  const tmp = mkdtempSync(join(tmpdir(), "rime-reg-"));
  try {
    for (const file of walk(SRC)) {
      const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        fileName: file,
      });
      const js = outputText.replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, (_, a, path, b) => {
        const target = join(dirname(file), path);
        const isDir = existsSync(target) && statSync(target).isDirectory();
        return `${a}${path}${isDir ? "/index" : ""}.mjs${b}`;
      });
      const out = join(tmp, relative(SRC, file)).replace(/\.ts$/, ".mjs");
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, js);
    }
    const reg = await import(pathToFileURL(join(tmp, "index.mjs")).href);
    const md = await import(pathToFileURL(join(tmp, "markdown.mjs")).href);
    return { REGISTRY: reg.REGISTRY, entryToMarkdown: md.entryToMarkdown };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const { REGISTRY } = await loadDocsRegistry();

// The site config for the docs registry (components/ui/_registry/site.ts).
writeFileSync(
  "components/ui/_registry/site.ts",
  `// GENERATED from rime.config.json by scripts/gen-shadcn-registry.mjs. Edit rime.config.json.
export const RIME_SITE = ${JSON.stringify({ url: SITE, owner: config.owner, repo: config.repo, namespace: config.namespace, package: config.package }, null, 2)} as const;
`,
);

// ── Units: one item per component folder, shell piece and the chart layer ─
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
const RENAME = { Scroll: "scroll-area" };
const filesIn = (dir) => readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile()).map((f) => posix(join(dir, f)));

const units = [];
for (const folder of readdirSync("components/ui")) {
  const dir = posix(join("components/ui", folder));
  if (!statSync(dir).isDirectory() || folder.startsWith("_")) continue;
  units.push({ name: RENAME[folder] ?? kebab(folder), key: `ui/${folder}`, files: filesIn(dir) });
}
for (const [name, base] of [
  ["sidebar-shell", "SidebarShell"],
  ["page-header", "PageHeader"],
  ["auth-card", "AuthCard"],
]) {
  units.push({ name, key: `shell/${base}`, files: [`components/shell/${base}.tsx`, `components/shell/${base}.module.css`] });
}
units.push({ name: "charts", key: "charts", files: filesIn("components/charts") });

// Neutral sample data some blocks and previews read (Acme invoices, projects).
units.push({ name: "sample-data", key: "lib/sample-data", files: ["lib/sample-data.ts"] });

// Blocks: whole screens, one item each (components/blocks/blocks.json).
const BLOCKS = existsSync("components/blocks/blocks.json") ? JSON.parse(readFileSync("components/blocks/blocks.json", "utf8")) : [];
for (const b of BLOCKS) {
  const dir = `components/blocks/${b.name}`;
  if (!existsSync(dir)) continue;
  units.push({ name: b.name, key: `blocks/${b.name}`, files: filesIn(dir), block: b });
}

const unitOfFile = new Map();
for (const u of units) for (const f of u.files) unitOfFile.set(f, u);

/** The unit an import resolves to, from the importing file. */
function resolveImport(spec, fromFile) {
  if (spec.startsWith("@/")) spec = spec.slice(2);
  else if (spec.startsWith(".")) spec = posix(join(dirname(fromFile), spec));
  else return { npm: spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0] };
  if (spec.startsWith("components/ui/_internal")) return { unit: "base" };
  if (spec === "components/ui" || spec === "components/ui/index") return { barrel: true };
  const ui = spec.match(/^components\/ui\/([^/]+)/);
  if (ui) return { unit: units.find((u) => u.key === `ui/${ui[1]}`)?.name };
  const shell = spec.match(/^components\/shell\/([A-Za-z]+)/);
  if (shell) return { unit: units.find((u) => u.key === `shell/${shell[1]}`)?.name };
  if (spec.startsWith("components/charts")) return { unit: "charts" };
  if (spec === "lib/sample-data") return { unit: "sample-data" };
  const block = spec.match(/^components\/blocks\/([^/]+)/);
  if (block) return { unit: units.find((u) => u.key === `blocks/${block[1]}`)?.name };
  return {};
}

const IMPORT = /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
const ASSUMED = new Set(["react", "react-dom", "next"]);
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
const problems = [];

for (const u of units) {
  u.registryDeps = new Set(["base"]);
  u.npm = new Set();
  for (const f of u.files) {
    if (!/\.(tsx?|mjs)$/.test(f)) continue;
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(IMPORT)) {
      const r = resolveImport(m[1] ?? m[2], f);
      if (r.barrel) problems.push(`${f} imports the barrel "@/components/ui"; import the component file instead`);
      if (r.unit && r.unit !== u.name) u.registryDeps.add(r.unit);
      if (r.npm && !ASSUMED.has(r.npm)) {
        const v = allDeps[r.npm];
        if (!v) problems.push(`${f} imports ${r.npm}, which is not in package.json`);
        u.npm.add(v ? `${r.npm}@${v}` : r.npm);
      }
    }
  }
}

// ── Docs entries for titles, descriptions and the markdown link ─────────
const entryFor = (u) =>
  REGISTRY.find((e) => e.css?.some((c) => u.files.includes(c))) ??
  REGISTRY.find((e) => e.slug === u.name);

// shadcn names that map onto a differently named Rime item.
const ALIASES = {
  dialog: "modal",
  "dropdown-menu": "menu",
  input: "text-input",
  "input-otp": "otp-input",
  sonner: "toast",
  separator: "divider",
  progress: "meter",
  sidebar: "sidebar-shell",
  empty: "empty-state",
  calendar: "date-field",
  "date-picker": "date-field",
  chart: "charts",
  drawer: "sheet",
  "toggle-group": "toggle",
  pagination: "table",
  "data-table": "table",
  "navigation-menu": "navigation-menu",
};

const addr = (name) => `${GH}/${name}`;
const url = (name) => `${SITE}/r/${name}.json`;
const file = (path) => ({ path, type: "registry:file", target: `~/${path}` });

const items = [];

// base
const baseFiles = ["app/styles/tokens.css", "app/styles/base.css", "app/styles/shadcn-bridge.css"].filter((p) => existsSync(p));
items.push({
  name: "base",
  type: "registry:item",
  title: "Rime base: tokens and base styles",
  description: "Design tokens (Default and Flat presets, light and dark modes), base element rules, the shadcn variable bridge and the shared internals. Install first.",
  files: [...baseFiles, ...filesIn("components/ui/_internal")].map(file),
  dependencies: [`lucide-react@${allDeps["lucide-react"]}`],
  registryDependencies: [],
  docs: `Import the styles in app/globals.css, before anything else: ${baseFiles.map((p) => `@import "${p.replace("app/", "./")}";`).join(" ")} Add your theme.css (from Rime Studio) after them. Requires the "@/*": ["./*"] path alias and no src/ directory.`,
  meta: { docs: `${SITE}/md/theme.md` },
});

for (const u of units) {
  if (u.block) {
    // A page that renders the block at its route, so the install gives a working screen.
    const pagePath = `registry/pages/${u.name}.tsx`;
    mkdirSync("registry/pages", { recursive: true });
    const comp = u.name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
    writeFileSync(pagePath, `import ${comp} from "@/components/blocks/${u.name}";

export default function Page() {
  return <${comp} />;
}
`);
    items.push({
      name: u.name,
      type: "registry:item",
      title: u.block.title,
      description: u.block.description,
      categories: ["blocks", u.block.category],
      files: [...u.files.map(file), { path: pagePath, type: "registry:file", target: `~/app${u.block.route}/page.tsx` }],
      dependencies: [...u.npm].sort(),
      registryDependencies: [...u.registryDeps].sort(),
      docs: `Open ${u.block.route} to see it. The page is app${u.block.route}/page.tsx; gate access inside it if the screen needs a signed-in user.`,
      meta: { page: `${SITE}/blocks#${u.name}`, route: u.block.route },
    });
    continue;
  }
  const e = entryFor(u);
  items.push({
    name: u.name,
    type: "registry:item",
    title: e?.name ?? u.name,
    description: e?.summary ?? `Rime ${u.name}.`,
    categories: e ? [kebab(e.category.replace(/ /g, ""))] : undefined,
    files: u.files.map(file),
    dependencies: [...u.npm].sort(),
    registryDependencies: [...u.registryDeps].sort(),
    meta: {
      import: u.key.startsWith("ui/")
        ? `import { ${u.key.slice(3)} } from "@/components/ui/${u.key.slice(3)}/${u.key.slice(3)}";`
        : u.key === "charts"
          ? `import { LineChart, AreaChart, BarChart, DonutChart } from "@/components/charts";`
          : `import { ${u.key.slice(6)} } from "@/components/${u.key}";`,
      docs: e ? `${SITE}/md/${e.slug}.md` : undefined,
      page: e ? `${SITE}/components/${e.slug}` : undefined,
    },
  });
}

// shadcn-named aliases
for (const [alias, target] of Object.entries(ALIASES)) {
  if (items.some((i) => i.name === alias)) continue;
  if (!items.some((i) => i.name === target)) {
    problems.push(`alias ${alias} points at missing item ${target}`);
    continue;
  }
  items.push({
    name: alias,
    type: "registry:item",
    title: `${alias} (Rime ${target})`,
    description: `The shadcn name "${alias}": installs Rime's ${target}.`,
    files: [],
    registryDependencies: [target],
    meta: { aliasOf: target },
  });
}

// Examples, one per documented component, so the MCP can return usage code.
mkdirSync("registry/examples", { recursive: true });
for (const e of REGISTRY) {
  const owner = items.find((i) => i.meta?.docs === `${SITE}/md/${e.slug}.md`);
  if (!owner || !e.examples.length) continue;
  const path = `registry/examples/${e.slug}.md`;
  const body = [
    `# ${e.name} examples`,
    "",
    `${e.summary}`,
    "",
    "```tsx",
    e.importLine,
    "",
    e.usage,
    "```",
    "",
    ...e.examples.flatMap((x) => [`## ${x.title}`, "", ...(x.description ? [x.description, ""] : []), "```tsx", x.code, "```", ""]),
    `Docs: ${SITE}/components/${e.slug}`,
    "",
  ].join("\n");
  writeFileSync(path, body);
  items.push({
    name: `${e.slug}-demo`,
    type: "registry:item",
    title: `${e.name} examples`,
    description: `Usage examples for ${e.name}.`,
    files: [{ path, type: "registry:file", target: `~/docs/ui/examples/${e.slug}.md` }],
    registryDependencies: [owner.name],
  });
}

// kit: everything
const blockNames = new Set(BLOCKS.map((b) => b.name));
const componentNames = items.filter((i) => i.files.length && !i.name.endsWith("-demo") && i.name !== "base" && !blockNames.has(i.name)).map((i) => i.name);
items.push({
  name: "kit",
  type: "registry:item",
  title: "Rime: everything",
  description: "Base, every component, the shells, the charts and the barrel (import { Button } from \"@/components/ui\"). One command to bootstrap or re-sync a project.",
  files: ["components/ui/index.ts", ...filesIn("components/ui/_barrels")].map(file),
  registryDependencies: ["base", ...componentNames].sort(),
  docs: "Then add your theme: export theme.css from Rime Studio into app/styles/theme.css and import it after the base styles.",
});

// starter: drops Rime's layout, globals and theme setup into a new project.
if (existsSync("templates/starter-item/manifest.json")) {
  const m = JSON.parse(readFileSync("templates/starter-item/manifest.json", "utf8"));
  items.push({
    name: m.name,
    type: "registry:item",
    title: m.title,
    description: m.description,
    files: m.files.map((f) => ({ path: f.path, type: "registry:file", target: f.target })),
    registryDependencies: m.registryDependencies,
    docs: m.docs,
  });
}

// tailwind-bridge: optional, for projects that also run Tailwind v4 + shadcn.
items.push({
  name: "tailwind-bridge",
  type: "registry:item",
  title: "Tailwind bridge",
  description: "Maps shadcn's Tailwind colour and radius utilities onto Rime's tokens, for projects that also use real shadcn components.",
  files: [file("app/styles/tailwind-bridge.css")],
  registryDependencies: ["base"],
  docs: 'Import it in your Tailwind CSS entry, after the Rime base styles: @import "./styles/tailwind-bridge.css";',
});

// agents (Phase 2 writes these files; included when present)
const agentFiles = [
  ["docs/ui/llms.txt", "~/docs/ui/llms.txt"],
  ["docs/ui/llms-full.txt", "~/docs/ui/llms-full.txt"],
  ["agents/AGENTS.rime.md", "~/AGENTS.rime.md"],
  ["agents/skills/rime/SKILL.md", "~/.claude/skills/rime/SKILL.md"],
].filter(([p]) => existsSync(p));
if (agentFiles.length) {
  items.push({
    name: "agents",
    type: "registry:item",
    title: "Rime agent docs",
    description: "docs/ui (llms.txt, llms-full.txt), the Rime Claude Code skill and an AGENTS.md block, so agents in a project build with Rime.",
    files: agentFiles.map(([path, target]) => ({ path, type: "registry:file", target })),
    registryDependencies: [],
    docs: "Add one line to your AGENTS.md: \"UI: follow AGENTS.rime.md.\" Re-run after kit updates.",
  });
}

// ── Validate the rules the CLI depends on ────────────────────────────────
const names = new Set(items.map((i) => i.name));
for (const i of items) {
  if (!/^[a-z0-9-]+$/.test(i.name)) problems.push(`${i.name}: item names must be kebab-case`);
  if (i.type !== "registry:item") problems.push(`${i.name}: not a universal item`);
  for (const f of i.files) {
    if (f.type !== "registry:file" || !f.target.startsWith("~/")) problems.push(`${i.name}: ${f.path} is not a universal file`);
    if (!existsSync(f.path)) problems.push(`${i.name}: ${f.path} does not exist`);
  }
  for (const d of i.registryDependencies ?? []) if (!names.has(d)) problems.push(`${i.name}: depends on unknown item ${d}`);
}
if (problems.length) {
  console.error(`Registry problems:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

// ── Write ────────────────────────────────────────────────────────────────
const clean = (o) => JSON.parse(JSON.stringify(o));
const forGithub = (i) => clean({ ...i, registryDependencies: i.registryDependencies?.map(addr) });
writeFileSync(
  "registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: config.name,
      homepage: SITE,
      items: items.map(forGithub),
    },
    null,
    2,
  ) + "\n",
);

rmSync("public/r", { recursive: true, force: true });
mkdirSync("public/r", { recursive: true });
for (const i of items) {
  const built = clean({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...i,
    registryDependencies: i.registryDependencies?.map(url),
    files: i.files.map((f) => ({ ...f, content: readFileSync(f.path, "utf8") })),
  });
  writeFileSync(`public/r/${i.name}.json`, JSON.stringify(built, null, 2) + "\n");
}
writeFileSync(
  "public/r/registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: config.name,
      homepage: SITE,
      items: items.map((i) => clean({ ...i, registryDependencies: i.registryDependencies?.map(url), files: i.files })),
    },
    null,
    2,
  ) + "\n",
);

// components.json: only needed for the namespace and the shadcn MCP server.
// The schema requires a tailwind block; Rime items never write to it.
writeFileSync(
  "components.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "new-york",
      rsc: true,
      tsx: true,
      tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true },
      aliases: { components: "@/components", ui: "@/components/ui", utils: "@/components/ui/_internal/cx", lib: "@/lib", hooks: "@/hooks" },
      registries: { [config.namespace]: `${SITE}/r/{name}.json` },
    },
    null,
    2,
  ) + "\n",
);

console.log(`registry.json: ${items.length} items (${componentNames.length} components, ${Object.keys(ALIASES).length} shadcn aliases); public/r mirror for ${SITE}/r`);
