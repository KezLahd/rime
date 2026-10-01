import { entryBySlug } from "@/components/ui/_registry";
import { THEME_MARKDOWN, entryToMarkdown, patternsMarkdown } from "@/components/ui/_registry/markdown";

// /md/<slug>.md: one component's docs as markdown; patterns.md and
// theme.md for the rest. The same text scripts/export-ui-docs.mjs writes to
// docs/ui/.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.md$/, "");
  let body: string | null = null;
  if (slug === "patterns") body = patternsMarkdown();
  else if (slug === "theme") body = THEME_MARKDOWN;
  else {
    const entry = entryBySlug(slug);
    body = entry ? entryToMarkdown(entry) : null;
  }
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
