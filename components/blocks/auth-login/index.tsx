"use client";

import { useState } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Field } from "@/components/ui/Field/Field";
import { IconLock, IconShield } from "@/components/ui/Icon/Icon";
import { OtpInput } from "@/components/ui/OtpInput/OtpInput";
import { TextInput } from "@/components/ui/TextInput/TextInput";
import styles from "./Auth.module.css";

type Step = "password" | "code" | "setup";

export type AuthLoginProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
  /** The step to open on. */
  initialStep?: Step;
};

function BrandMark() {
  return (
    <span className={styles.mark}>
      <span className={styles.glyph} aria-hidden="true">
        A
      </span>
      Acme
    </span>
  );
}

/** A stand-in QR code: a fixed pattern, drawn, never scannable. Use your QR renderer. */
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
 * Sign-in with multi-factor authentication: the brand bar, the card centred,
 * a security note in the footer, and three steps: password, the code from an
 * authenticator, and setting up a new authenticator. Wire Continue and
 * Verify to your auth provider; drop it at app/login.
 */
export default function AuthLogin({ contained, initialStep = "password" }: AuthLoginProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [code, setCode] = useState("");
  const [setupCode, setSetupCode] = useState("");

  return (
    <div className={contained ? styles.frame : undefined}>
      <AuthLayout
        contained={contained}
        header={
          <>
            <BrandMark />
            <a className={styles.help} href="#help">
              Need help?
            </a>
          </>
        }
        footer={
          <>
            <IconShield size={14} />
            Protected by multi-factor authentication. Acme never asks for your code by email or phone.
          </>
        }
      >
        {step === "password" ? (
          <AuthCard icon={<IconLock size={22} />} title="Sign in" subtitle="Use your work email. You will confirm it is you with your authenticator next.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("code");
              }}
              style={{ display: "contents" }}
            >
              <Field label="Work email">
                <TextInput type="email" autoComplete="username" defaultValue="jane@acme.example" />
              </Field>
              <Field label="Password">
                <TextInput type="password" revealable autoComplete="current-password" defaultValue="correct horse" />
              </Field>
              <div className={styles.between}>
                <Checkbox label="Keep me signed in" />
                <a className={styles.help} href="#reset" style={{ color: "var(--ink-brand)" }}>
                  Forgot password?
                </a>
              </div>
              <Button type="submit" size="lg" fullWidth>
                Continue
              </Button>
            </form>
          </AuthCard>
        ) : step === "code" ? (
          <AuthCard icon={<IconShield size={22} />} title="Enter your code" subtitle="Open your authenticator app and enter the 6-digit code for Acme.">
            <div className={styles.otp}>
              <OtpInput aria-label="Authentication code" value={code} onChange={setCode} />
            </div>
            <Button size="lg" fullWidth disabled={code.length < 6}>
              Verify
            </Button>
            <p className={styles.alt}>
              Lost your device?{" "}
              <button type="button" className={styles.link} onClick={() => setStep("setup")}>
                Set up a new authenticator
              </button>
            </p>
            <p className={styles.alt}>
              <button type="button" className={styles.link} onClick={() => setStep("password")}>
                Use a different account
              </button>
            </p>
          </AuthCard>
        ) : (
          <AuthCard
            width="md"
            icon={<IconShield size={22} />}
            title="Set up your authenticator"
            subtitle="Scan the code with an authenticator app, then enter the 6-digit code it shows."
          >
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
              <OtpInput aria-label="Code from your authenticator app" value={setupCode} onChange={setSetupCode} />
            </div>
            <Button size="lg" fullWidth disabled={setupCode.length < 6}>
              Turn on two-step sign-in
            </Button>
            <p className={styles.alt}>
              <button type="button" className={styles.link} onClick={() => setStep("password")}>
                Back to sign in
              </button>
            </p>
          </AuthCard>
        )}
      </AuthLayout>
    </div>
  );
}
