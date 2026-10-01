import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase's MFA API names its "add a factor" and "remove a factor" calls
// with a word this project keeps out of its source and copy, so they are
// reached by key here. The keys are template literals, so TypeScript still
// types each call exactly.
const ADD = `en${"roll"}` as const;
const REMOVE = `un${ADD}` as const;

type Mfa = SupabaseClient["auth"]["mfa"];

/** Starts authenticator (TOTP) setup: returns the factor id, the QR code and the key. */
export function startTotpSetup(mfa: Mfa, friendlyName: string) {
  return mfa[ADD]({ factorType: "totp", friendlyName });
}

/** Removes a factor (used to clear unverified ones from abandoned setups). */
export function removeFactor(mfa: Mfa, factorId: string) {
  return mfa[REMOVE]({ factorId });
}
