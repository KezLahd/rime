import type { Metadata } from "next";
import { AuthCard } from "@/components/shell/AuthCard";
import { IconShield } from "@/components/ui/Icon/Icon";
import { verifyCode } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/gate";
import { AuthFrame } from "../../AuthFrame";
import { CodeForm } from "../../CodeForm";

export const metadata: Metadata = { title: "Enter your code" };

export default async function MfaPage() {
  await requireSession();
  return (
    <AuthFrame>
      <AuthCard
        icon={<IconShield size={22} />}
        title="Enter your code"
        subtitle="Open your authenticator app and enter the 6-digit code for Acme."
        back={{ href: "/login", label: "Use a different account" }}
      >
        <CodeForm action={verifyCode} label="Authentication code" submit="Verify" />
      </AuthCard>
    </AuthFrame>
  );
}
