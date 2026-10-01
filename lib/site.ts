import config from "@/rime.config.json";

// Where Rime is published, from rime.config.json. BASE_PATH is "" in local
// dev and the site URL's path (e.g. "/rime") when built for hosting
// (RIME_HOST=1 npm run build), set by next.config.mjs.

export const SITE = {
  name: "Rime",
  url: config.siteUrl.replace(/\/$/, ""),
  owner: config.owner,
  repo: config.repo,
  namespace: config.namespace,
};

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** A public/ file's URL, with the base path when hosted under a subpath. */
export const asset = (path: string) => `${BASE_PATH}${path}`;

/** The shadcn CLI address of a Rime item on GitHub: <owner>/rime/<item>. */
export const installAddress = (item: string) => `${SITE.owner}/${SITE.repo}/${item}`;

/** The full install command for an item. */
export const installCommand = (item: string, pm: "npm" | "pnpm" | "yarn" | "bun" = "npm") => {
  const runner = { npm: "npx", pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx --bun" }[pm];
  return `${runner} shadcn@latest add ${installAddress(item)}`;
};
