import { readFileSync } from "node:fs";

// Rime is hosted under rime.config.json's siteUrl. Local dev runs at the root
// (http://localhost:3100); `RIME_HOST=1 npm run build` builds for the hosted
// path (basePath = the site URL's path, e.g. "/rime").
const config = JSON.parse(readFileSync(new URL("./rime.config.json", import.meta.url), "utf8"));
const hostedPath = new URL(config.siteUrl).pathname.replace(/\/$/, "");
const basePath = process.env.RIME_HOST ? hostedPath : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Old routes from before the site restructure.
  async redirects() {
    return [{ source: "/studio", destination: "/themes", permanent: false }];
  },
  // Markdown twins of the docs pages, as shadcn serves them.
  async rewrites() {
    return [
      { source: "/components/:slug.md", destination: "/md/:slug.md" },
      { source: "/patterns.md", destination: "/md/patterns.md" },
      { source: "/docs.md", destination: "/llms.txt" },
      { source: "/foundations.md", destination: "/md/theme.md" },
    ];
  },
};

export default nextConfig;
