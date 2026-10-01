"use client";

import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Field } from "@/components/ui/Field/Field";
import { IconShield, IconUser } from "@/components/ui/Icon/Icon";
import { TextInput } from "@/components/ui/TextInput/TextInput";
import styles from "./Auth.module.css";

export type AuthSignupProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/** Create an account: name, work email, a password and the terms. Drop it at app/signup. */
export default function AuthSignup({ contained }: AuthSignupProps) {
  return (
    <div className={contained ? styles.frame : undefined}>
      <AuthLayout
        contained={contained}
        header={
          <>
            <span className={styles.mark}>
              <span className={styles.glyph} aria-hidden="true">
                A
              </span>
              Acme
            </span>
            <a className={styles.help} href="#login">
              Sign in
            </a>
          </>
        }
        footer={
          <>
            <IconShield size={14} />
            You will set up multi-factor authentication after creating your account.
          </>
        }
      >
        <AuthCard width="md" icon={<IconUser size={22} />} title="Create your account" subtitle="Start a free workspace for your team. No card needed.">
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "contents" }}>
            <div className={styles.row}>
              <Field label="First name">
                <TextInput autoComplete="given-name" placeholder="Jane" />
              </Field>
              <Field label="Last name">
                <TextInput autoComplete="family-name" placeholder="Cooper" />
              </Field>
            </div>
            <Field label="Work email">
              <TextInput type="email" autoComplete="email" placeholder="jane@acme.example" />
            </Field>
            <Field label="Password" hint="At least 12 characters.">
              <TextInput type="password" revealable autoComplete="new-password" />
            </Field>
            <Checkbox label="I accept the terms and the privacy policy" />
            <Button type="submit" size="lg" fullWidth>
              Create account
            </Button>
            <p className={styles.alt}>
              Already have an account?{" "}
              <a className={styles.link} href="#login">
                Sign in
              </a>
            </p>
          </form>
        </AuthCard>
      </AuthLayout>
    </div>
  );
}
