import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Reads the generated shadcn registry (registry.json, npm run
// registry:shadcn) on the server, for the Installation section of each
// component page: the item to install, its npm dependencies, the Rime items
// it pulls in, and its files with their source.

type RawItem = {
  name: string;
  files: Array<{ path: string; target: string }>;
  dependencies?: string[];
  registryDependencies?: string[];
  meta?: { docs?: string };
};

export type InstallInfo = {
  item: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{ path: string; target: string; source: string }>;
};

let cache: RawItem[] | null = null;
function items(): RawItem[] {
  if (cache) return cache;
  const p = join(process.cwd(), "registry.json");
  cache = existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")).items as RawItem[]) : [];
  return cache;
}

/** The registry item that documents a docs slug (by its markdown link). */
export function installInfo(slug: string): InstallInfo | null {
  const item = items().find((i) => i.files.length && !i.name.endsWith("-demo") && i.meta?.docs?.endsWith(`/md/${slug}.md`));
  if (!item) return null;
  return {
    item: item.name,
    dependencies: item.dependencies ?? [],
    registryDependencies: (item.registryDependencies ?? []).map((d) => d.split("/").pop() ?? d),
    files: item.files.map((f) => ({
      path: f.path,
      target: f.target.replace(/^~\//, ""),
      source: existsSync(join(process.cwd(), f.path)) ? readFileSync(join(process.cwd(), f.path), "utf8") : "",
    })),
  };
}
