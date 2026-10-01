import { llmsIndex } from "@/components/ui/_registry/markdown";

// The llms.txt index of the component docs, for AI agents. Served as plain text.
export async function GET(request: Request) {
  return new Response(llmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
