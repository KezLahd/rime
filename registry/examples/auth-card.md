# AuthCard and AuthLayout examples

The sign-in card: a solid card on a deep field, with a logo slot, icon tile, title, footer strip and back link.

```tsx
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";

<AuthLayout>
  <AuthCard logo={<Logo />} title="Sign in" subtitle="Use the email you signed up with.">
    …form…
  </AuthCard>
</AuthLayout>
```

## Sign in with multi-factor authentication

A brand bar in the header, the card centred, the security note in the footer. Switch between the password, MFA code and authenticator setup steps.

```tsx
<AuthLayout
  header={<Logo />}
  footer={<><IconShield size={14} /> Protected by multi-factor authentication.</>}
>
  <AuthCard icon={<IconLock size={22} />} title="Sign in" subtitle="Use your work email.">
    <Field label="Work email"><TextInput type="email" autoComplete="username" /></Field>
    <Field label="Password"><TextInput type="password" revealable autoComplete="current-password" /></Field>
    <Button size="lg" fullWidth>Continue</Button>
  </AuthCard>
</AuthLayout>
```

## MFA code step

```tsx
<AuthCard icon={<IconShield size={22} />} title="Enter your code" subtitle="Open your authenticator app and enter the 6-digit code.">
  <OtpInput aria-label="Authentication code" value={code} onChange={setCode} onComplete={verify} />
  <Button size="lg" fullWidth disabled={code.length < 6}>Verify</Button>
</AuthCard>
```

## Authenticator setup step

```tsx
<AuthCard width="md" icon={<IconShield size={22} />} title="Set up your authenticator">
  <QrCode value={otpauthUrl} />
  <code>{secret}</code>
  <OtpInput aria-label="Code from your authenticator app" value={code} onChange={setCode} />
  <Button size="lg" fullWidth>Turn on two-step sign-in</Button>
</AuthCard>
```

Docs: https://rime.mjsons.net/components/auth-card
