# ErrorSummary examples

The list of form errors at the top of a form, focused on submit, each linking to its field.

```tsx
import { ErrorSummary } from "@/components/ui";

<ErrorSummary errors={[{ id: "email", message: "Enter an email address" }]} focusKey={submitCount} />
```

## Default

```tsx
<ErrorSummary errors={errors} focusKey={attempt} />
```

Docs: https://rime.mjsons.net/components/error-summary
