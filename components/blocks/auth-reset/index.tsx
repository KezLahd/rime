"use client";

import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { IconLock, IconShield } from "@/components/ui/Icon/Icon";
import { TextInput } from "@/components/ui/TextInput/TextInput";
import styles from "./Auth.module.css";

export type AuthResetProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/** Reset a password: ask for the email, send a link. Drop it at app/reset-password. */
export default function AuthReset({ contained }: AuthResetProps) {
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
            For your security, the link works once and expires after an hour.
          </>
        }
      >
        <AuthCard icon={<IconLock size={22} />} title="Reset your password" subtitle="Enter the email you sign in with. We will send you a link to choose a new password." back={{ href: "#login", label: "Back to sign in" }}>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "contents" }}>
            <Field label="Work email">
              <TextInput type="email" autoComplete="email" placeholder="jane@acme.example" />
            </Field>
            <Button type="submit" size="lg" fullWidth>
              Send reset link
            </Button>
          </form>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
