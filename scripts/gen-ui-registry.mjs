// Generates components/ui/_registry/generated.ts: the facts the /ui docs,
// the Rime Studio and the AI-readable docs read straight from the source,
// so they can never drift from it.
//
//   node scripts/gen-ui-registry.mjs
//
// Run it after changing a component's props or its CSS. It writes:
// - props: every exported *Props type in components/ui and components/shell,
//   with each prop's authored type, optional flag, JSDoc and the default
//   from the component's destructuring. Props inherited from React's DOM
//   attribute types are not listed one by one; their source types are named
//   in `passThrough` ("also takes every <button> attribute").
// - css: per CSS Module, the custom properties it reads. `hooks` are
//   per-component tokens read with a fallback (var(--button-radius,
//   var(--r-md))): undeclared by default, so the fallback IS the default.
//   A hook can default differently per variant, so each lists its fallbacks.
//   `reads` are system tokens read bare (var(--ink-body)). Properties the
//   module declares itself (--tab-from, --card-pad) are its own internals and
//   are left out of both.
//
// Hand-written content (descriptions, examples, rules) lives beside it in
// components/ui/_registry/entries/*.ts and never in this file.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import ts from "typescript";

const ROOTS = ["components/ui", "components/shell", "components/charts"];
const OUT = "components/ui/_registry/generated.ts";

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (f !== "_registry") walk(p, out);
    } else out.push(p.replaceAll("\\", "/"));
  }
  return out;
};
const files = ROOTS.flatMap((r) => walk(r));
const tsxFiles = files.filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".d.ts"));
const cssFiles = files.filter((f) => f.endsWith(".module.css"));

// ── Props ──────────────────────────────────────────────────────────────────
const program = ts.createProgram(tsxFiles, {
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  noEmit: true,
  baseUrl: ".",
  paths: { "@/*": ["./*"] },
});
const checker = program.getTypeChecker();
const clean = (s) => s.replace(/\s+/g, " ").trim();

/** Defaults from `function X({ a = 1 })` and `const { a = 1 } = props` inside X. */
function defaultsOf(sf, name) {
  const out = {};
  const collect = (pattern) => {
    for (const el of pattern.elements) {
      if (!el.initializer) continue;
      const key = (el.propertyName ?? el.name).getText(sf);
      out[key] = clean(el.initializer.getText(sf));
    }
  };
  const visitFn = (fn) => {
    const p = fn.parameters?.[0];
    if (p && ts.isObjectBindingPattern(p.name)) collect(p.name);
    const walkBody = (n) => {
      if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer?.getText(sf).startsWith("props")) {
        collect(n.name);
      }
      ts.forEachChild(n, walkBody);
    };
    if (fn.body) walkBody(fn.body);
  };
  ts.forEachChild(sf, (n) => {
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) visitFn(n);
  });
  return out;
}

const props = {};
for (const file of tsxFiles) {
  const sf = program.getSourceFile(file);
  if (!sf) continue;
  ts.forEachChild(sf, (node) => {
    const isAlias = ts.isTypeAliasDeclaration(node);
    if (!(isAlias || ts.isInterfaceDeclaration(node))) return;
    if (!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return;
    const typeName = node.name.text;
    if (!typeName.endsWith("Props")) return;
    const component = typeName.slice(0, -"Props".length);
    const type = checker.getTypeAtLocation(node.name);
    const members = type.isUnion() ? type.types : [type];
    const seen = new Map();
    const passThrough = new Set();
    for (const t of members) {
      for (const sym of checker.getPropertiesOfType(t)) {
        const decl = sym.declarations?.[0];
        if (!decl) continue;
        const from = decl.getSourceFile().fileName.replaceAll("\\", "/");
        if (from.includes("node_modules")) {
          const parent = decl.parent;
          const owner = parent && (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) ? parent.name.text : "DOM attributes";
          if (!["key", "ref"].includes(sym.name)) passThrough.add(owner);
          continue;
        }
        const declType = decl.type ? clean(decl.type.getText(decl.getSourceFile())) : clean(checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, node)));
        // A prop on several union branches (Button's href) lists each branch's type once.
        if (seen.has(sym.name)) {
          const prev = seen.get(sym.name);
          if (!prev.type.split(" | ").includes(declType)) prev.type = `${prev.type} | ${declType}`;
          if (!prev.description) prev.description = clean(ts.displayPartsToString(sym.getDocumentationComment(checker)));
          continue;
        }
        seen.set(sym.name, {
          name: sym.name,
          type: declType,
          required: !(sym.flags & ts.SymbolFlags.Optional),
          description: clean(ts.displayPartsToString(sym.getDocumentationComment(checker))),
        });
      }
    }
    const defaults = defaultsOf(sf, component);
    const list = [...seen.values()].map((p) => (defaults[p.name] !== undefined ? { ...p, default: defaults[p.name] } : p));
    // Members of a union that are not on every branch are optional in practice.
    if (type.isUnion()) for (const p of list) if (!members.every((m) => checker.getPropertyOfType(m, p.name))) p.required = false;
    props[component] = {
      file,
      props: list,
      passThrough: [...passThrough].sort(),
    };
  });
}

// ── CSS custom properties ─────────────────────────────────────────────────
/** The text of the balanced (...) that starts at s[i] === "(". */
function balanced(s, i) {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "(") depth++;
    else if (s[j] === ")" && --depth === 0) return s.slice(i + 1, j);
  }
  return s.slice(i + 1);
}

const css = {};
for (const file of cssFiles) {
  const src = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const own = new Set([...src.matchAll(/(?:^|[;{\s])(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const hooks = new Map();
  const reads = new Set();
  for (let i = src.indexOf("var("); i !== -1; i = src.indexOf("var(", i + 4)) {
    const inner = balanced(src, i + 3);
    const comma = inner.indexOf(",");
    const name = clean(comma === -1 ? inner : inner.slice(0, comma));
    if (own.has(name)) continue;
    if (comma === -1) reads.add(name);
    else {
      // One hook can default differently per variant (--button-radius: r-sm, r-md, r-lg).
      const fallback = clean(inner.slice(comma + 1));
      const list = hooks.get(name) ?? [];
      if (!list.includes(fallback)) list.push(fallback);
      hooks.set(name, list);
    }
  }
  const key = relative(".", file).replaceAll("\\", "/");
  css[key] = {
    component: basename(dirname(file)) === "shell" ? basename(file, ".module.css") : basename(dirname(file)),
    hooks: [...hooks].map(([name, fallbacks]) => ({ name, fallbacks })).sort((a, b) => a.name.localeCompare(b.name)),
    reads: [...reads].filter((n) => !hooks.has(n)).sort(),
  };
}

const header = `// GENERATED by scripts/gen-ui-registry.mjs. Do not edit by hand: change the
// component (its props, JSDoc or CSS Module) and run the script again.
`;
const body = `
export type GeneratedProp = { name: string; type: string; required: boolean; description: string; default?: string };
export type GeneratedProps = { file: string; props: GeneratedProp[]; passThrough: string[] };
export type GeneratedCss = { component: string; hooks: { name: string; fallbacks: string[] }[]; reads: string[] };

export const GENERATED_PROPS: Record<string, GeneratedProps> = ${JSON.stringify(props, null, 2)};

export const GENERATED_CSS: Record<string, GeneratedCss> = ${JSON.stringify(css, null, 2)};
`;
writeFileSync(OUT, header + body);
console.log(`props: ${Object.keys(props).length} types, css: ${Object.keys(css).length} modules -> ${OUT}`);
