"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

/** Email and password. Then the code step, or authenticator setup. */
export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "That email and password don't match. Try again." };
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  redirect(aal?.nextLevel === "aal2" ? "/login/mfa" : "/mfa/setup");
}

/** The 6-digit code from the authenticator app, against the verified TOTP factor. */
export async function verifyCode(_prev: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { error: "Enter the 6-digit code." };
  const supabase = await createClient();
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (listError || !factor) redirect("/mfa/setup");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: "That code didn't work. Check the time on your phone and try the newest code." };
  redirect("/dashboard");
}

/** Confirms a new authenticator (setup) with its first code; the session becomes aal2. */
export async function confirmMfaSetup(_prev: FormState, form: FormData): Promise<FormState> {
  const factorId = String(form.get("factorId") ?? "");
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  if (!factorId) return { error: "Start the setup again." };
  if (code.length !== 6) return { error: "Enter the 6-digit code from the app." };
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "That code didn't work. Try the newest code in the app." };
  redirect("/dashboard");
}
