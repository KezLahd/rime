import type { ReactNode } from "react";
import { AuthLayout } from "@/components/shell/AuthCard";
import { IconShield } from "@/components/ui/Icon/Icon";
import styles from "./Auth.module.css";

/** The sign-in page frame: the brand bar, the card centred, the security note below. */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      header={<span className={styles.brand}>Acme</span>}
      footer={
        <>
          <IconShield size={14} />
          Protected by multi-factor authentication. Acme never asks for your code by email or phone.
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
