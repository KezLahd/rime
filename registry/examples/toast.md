# Toast examples

Frosted toasts for success, error, info and in-flight work, stacked as a deck that fans out on hover.

```tsx
import { useToast } from "@/components/ui";

const toast = useToast();
await toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
```

## The stack

ToastStackPreview draws the real stack in place, with no timers and no live region: loading, an error with an action, and a success.

```tsx
<ToastStackPreview
  expanded
  items={[
    { id: 1, tone: "loading", title: "Saving changes…" },
    { id: 2, tone: "error", title: "Couldn't send", description: "Check your connection.", action: { label: "Retry", onClick: retry } },
    { id: 3, tone: "success", title: "Invoice sent", description: "INV-1042 is on its way to Jane Cooper." },
  ]}
/>
```

## Tones

```tsx
toast.success("Invoice sent", { description: "INV-1042 is on its way to Jane Cooper." });
toast.error("Couldn't send", { action: { label: "Retry", onClick: retry } });
```

Docs: https://rime.mjsons.net/components/toast
