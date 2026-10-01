"use client";

import { useState } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { IconMail, IconShield } from "@/components/ui/Icon/Icon";
import { OtpInput } from "@/components/ui/OtpInput/OtpInput";
import styles from "./Auth.module.css";

export type AuthOtpProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/** A one-time code sent by email: six boxes, auto-verify on the last digit, resend. Drop it at app/verify. */
export default function AuthOtp({ contained }: AuthOtpProps) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
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
            Codes expire after 10 minutes and work once.
          </>
        }
      >
        <AuthCard icon={<IconMail size={22} />} title="Check your email for a code" subtitle="We sent a 6-digit code to jane@acme.example.">
          <div className={styles.otp}>
            <OtpInput aria-label="Code from your email" value={code} onChange={setCode} />
          </div>
          <Button size="lg" fullWidth disabled={code.length < 6}>
            Verify
          </Button>
          <p className={styles.alt} role="status">
            {sent ? (
              "A new code is on its way."
            ) : (
              <>
                No email?{" "}
                <button type="button" className={styles.link} onClick={() => setSent(true)}>
                  Send a new code
                </button>
              </>
            )}
          </p>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
