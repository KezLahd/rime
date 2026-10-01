"use client";

import { useState } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { IconShield } from "@/components/ui/Icon/Icon";
import { OtpInput } from "@/components/ui/OtpInput/OtpInput";
import styles from "./Auth.module.css";

export type AuthMfaSetupProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/** A stand-in QR code: a fixed pattern, never scannable. Render your otpauth:// URL with a QR library. */
function QrPlaceholder() {
  const n = 21;
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (finder) {
        const fx = x >= n - 7 ? x - (n - 7) : x;
        const fy = y >= n - 7 ? y - (n - 7) : y;
        if (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)) cells.push([x, y]);
      } else if ((x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
    }
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={styles.qr} role="img" aria-label="QR code for your authenticator app">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#ffffff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#14161d" />
      ))}
    </svg>
  );
}

/**
 * Turn on two-step sign-in: scan a TOTP QR code (or type the key), then
 * confirm with the first code. Drop it at app/security/mfa.
 */
export default function AuthMfaSetup({ contained }: AuthMfaSetupProps) {
  const [code, setCode] = useState("");
  return (
    <div className={contained ? styles.frame : undefined}>
      <AuthLayout
        contained={contained}
        header={
          <span className={styles.mark}>
            <span className={styles.glyph} aria-hidden="true">
              A
            </span>
            Acme
          </span>
        }
        footer={
          <>
            <IconShield size={14} />
            Protected by multi-factor authentication.
          </>
        }
      >
        <AuthCard width="md" icon={<IconShield size={22} />} title="Set up your authenticator" subtitle="Scan the code with an authenticator app, then enter the 6-digit code it shows.">
          <div className={styles.setup}>
            <QrPlaceholder />
            <div className={styles.steps}>
              <p>
                <strong>1.</strong> Install an authenticator app on your phone.
              </p>
              <p>
                <strong>2.</strong> Scan the QR code, or enter this key:
              </p>
              <code className={styles.secret}>JBSW Y3DP EHPK 3PXP</code>
              <p>
                <strong>3.</strong> Enter the code from the app.
              </p>
            </div>
          </div>
          <div className={styles.otp}>
            <OtpInput aria-label="Code from your authenticator app" value={code} onChange={setCode} />
          </div>
          <Button size="lg" fullWidth disabled={code.length < 6}>
            Turn on two-step sign-in
          </Button>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
