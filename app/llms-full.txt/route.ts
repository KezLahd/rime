import { llmsFull } from "@/components/ui/_registry/markdown";

// Every component, pattern and rule in one file, for an agent's context.
export async function GET() {
  return new Response(llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
  });
}
