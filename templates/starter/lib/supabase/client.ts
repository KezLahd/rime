import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase in the browser. Every auth step in this starter runs on the
 * server (server actions), so use this only for client-side reads that RLS
 * already allows.
 */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
