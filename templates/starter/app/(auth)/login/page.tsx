import type { Metadata } from "next";
import { AuthCard } from "@/components/shell/AuthCard";
import { IconLock } from "@/components/ui/Icon/Icon";
import { AuthFrame } from "../AuthFrame";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthFrame>
      <AuthCard
        icon={<IconLock size={22} />}
        title="Sign in"
        subtitle="Use your work email. You will confirm it is you with your authenticator next."
      >
        <LoginForm />
      </AuthCard>
    </AuthFrame>
  );
}
