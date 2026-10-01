import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/shell/AuthCard";
import { IconShield } from "@/components/ui/Icon/Icon";
import { confirmMfaSetup } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/gate";
import { removeFactor, startTotpSetup } from "@/lib/auth/totp";
import { AuthFrame } from "../../AuthFrame";
import styles from "../../Auth.module.css";
import { CodeForm } from "../../CodeForm";

export const metadata: Metadata = { title: "Set up your authenticator" };

/**
 * Authenticator setup: a new TOTP factor (QR code and key), confirmed with
 * its first code. Unverified factors from abandoned attempts are removed
 * first, so they never pile up.
 */
export default async function MfaSetupPage() {
  const { supabase } = await requireSession();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((f) => f.status === "verified")) redirect("/login/mfa");
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified") await removeFactor(supabase.auth.mfa, f.id);
  }
  const { data, error } = await startTotpSetup(supabase.auth.mfa, `Authenticator ${Date.now()}`);
  if (error || !data) throw new Error("Couldn't start authenticator setup. Check that TOTP MFA is enabled in Supabase Auth.");

  return (
    <AuthFrame>
      <AuthCard
        width="md"
        icon={<IconShield size={22} />}
        title="Set up your authenticator"
        subtitle="Scan the code with an authenticator app, then enter the 6-digit code it shows."
        back={{ href: "/login", label: "Back to sign in" }}
      >
        <div className={styles.setup}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns the QR code as an SVG data URL */}
          <img src={data.totp.qr_code} alt="QR code for your authenticator app" className={styles.qr} />
          <div className={styles.steps}>
            <p>1. Install an authenticator app on your phone.</p>
            <p>2. Scan the QR code, or enter this key:</p>
            <code className={styles.secret}>{data.totp.secret}</code>
            <p>3. Enter the code from the app.</p>
          </div>
        </div>
        <CodeForm action={confirmMfaSetup} label="Code from your authenticator app" submit="Turn on two-step sign-in" factorId={data.id} />
      </AuthCard>
    </AuthFrame>
  );
}
