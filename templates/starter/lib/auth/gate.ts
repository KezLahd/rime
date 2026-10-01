import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Call at the top of every protected page.tsx (never in a layout: a layout
 * gate leaks the page into the RSC payload). Signed out goes to /login; a
 * password-only session (aal1) goes to the code step, or to authenticator
 * setup if the user has none. Returns the verified claims.
 */
export async function requireAal2() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login");
  if (claims.aal !== "aal2") {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    redirect(aal?.nextLevel === "aal2" ? "/login/mfa" : "/mfa/setup");
  }
  return claims;
}

/** For the MFA screens: a signed-in session at any level, else /login. */
export async function requireSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return { supabase, claims: data.claims };
}
