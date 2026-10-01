# OtpInput examples

A six-cell one-time code entry with paste, auto-advance and onComplete.

```tsx
import { OtpInput } from "@/components/ui";

<OtpInput aria-label="Authenticator code" value={code} onChange={setCode} onComplete={verify} />
```

## Default

```tsx
<OtpInput value={code} onChange={setCode} aria-label="Authenticator code" />
```

Docs: https://rime.mjsons.net/components/otp-input
