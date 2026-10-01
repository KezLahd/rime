"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { OtpInput } from "@/components/ui/OtpInput/OtpInput";
import type { FormState } from "@/lib/auth/actions";
import styles from "./Auth.module.css";

/** A 6-digit code form posting to a server action; factorId rides along for authenticator setup. */
export function CodeForm({
  action: serverAction,
  label,
  submit,
  factorId,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  label: string;
  submit: string;
  factorId?: string;
}) {
  const [code, setCode] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(serverAction, {});
  return (
    <form action={action} className={styles.form}>
      {state.error ? (
        <Alert tone="danger" live title="Couldn't verify">
          {state.error}
        </Alert>
      ) : null}
      <input type="hidden" name="code" value={code} />
      {factorId ? <input type="hidden" name="factorId" value={factorId} /> : null}
      <div className={styles.otp}>
        <OtpInput aria-label={label} value={code} onChange={setCode} />
      </div>
      <Button type="submit" size="lg" fullWidth disabled={code.length < 6} loading={pending} loadingLabel="Verifying…">
        {submit}
      </Button>
    </form>
  );
}
