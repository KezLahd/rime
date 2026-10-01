"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { IconShield } from "@/components/ui/Icon/Icon";
import { TextInput } from "@/components/ui/TextInput/TextInput";
import { signIn, type FormState } from "@/lib/auth/actions";
import styles from "../Auth.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className={styles.form}>
      {state.error ? (
        <Alert tone="danger" live title="Couldn't sign in">
          {state.error}
        </Alert>
      ) : null}
      <Field label="Work email">
        <TextInput name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password">
        <TextInput name="password" type="password" revealable autoComplete="current-password" required />
      </Field>
      <p className={styles.mfaBadge}>
        <IconShield size={13} />
        <span>Protected by multi-factor authentication</span>
      </p>
      <Button type="submit" size="lg" fullWidth loading={pending} loadingLabel="Signing in…">
        Continue
      </Button>
      <p className={styles.legal}>
        By continuing, you agree to Acme&apos;s{" "}
        <a href="/terms" className={styles.legalLink}>
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className={styles.legalLink}>
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
