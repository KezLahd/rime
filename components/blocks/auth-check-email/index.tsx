"use client";

import { useState } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { IconMail, IconShield } from "@/components/ui/Icon/Icon";
import styles from "./Auth.module.css";

export type AuthCheckEmailProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/** After a magic link or reset: "check your email", with resend. Drop it at app/check-email. */
export default function AuthCheckEmail({ contained }: AuthCheckEmailProps) {
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
            Acme never asks for your password or code by email.
          </>
        }
      >
        <AuthCard icon={<IconMail size={22} />} title="Check your email" subtitle="We sent a sign-in link to jane@acme.example. It works once and expires in 15 minutes." back={{ href: "#login", label: "Back to sign in" }}>
          <Button size="lg" fullWidth variant="secondary" href="mailto:">
            Open your email
          </Button>
          <p className={styles.alt} role="status">
            {sent ? (
              "Sent again. Check your spam folder too."
            ) : (
              <>
                Nothing yet?{" "}
                <button type="button" className={styles.link} onClick={() => setSent(true)}>
                  Send it again
                </button>
              </>
            )}
          </p>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
