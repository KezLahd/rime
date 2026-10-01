# Modal examples

A frosted dialog with a focus trap, scroll lock, inert page, scroll-aware edges and a bottom sheet on phones.

```tsx
import { Button, Modal } from "@/components/ui";

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Contact support"
  description="Ask a question about invoice INV-1042."
  footer={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={send}>Send question</Button>
    </>
  }
>
  …form fields…
</Modal>
```

## Open

inline renders the panel in place: no portal, scrim, focus trap or scroll lock. For docs and reviews.

```tsx
<Modal inline open onClose={close} title="Contact support" meta="Invoice INV-1042" description="Ask a question about this invoice." footer={…}>
  <Field label="Your question"><TextInput /></Field>
</Modal>
```

## Form in a modal

```tsx
<Modal open={open} onClose={close} title="Contact support" footerStart="Recorded on the activity log." footer={…}>
  <Field label="What is it about?" required><Select … /></Field>
</Modal>
```

## Long content: scroll edges

Scroll the body: the header shade appears once content passes under it, and the footer shade shows while there is more.

```tsx
<Modal open={open} onClose={close} size="lg" title="Workspace terms" footer={<Button onClick={close}>I agree</Button>}>
  {terms}
</Modal>
```

## Terms with a scroll-gated accept

Accept stays disabled until the body has been scrolled to the end. onScrollEnd comes from useScrollEdges, the same listener that clears data-more when nothing is left below. Open it and scroll.

```tsx
const [read, setRead] = useState(false);
const onEnd = useCallback(() => setRead(true), []);

<Modal
  open={open}
  onClose={close}
  size="lg"
  title="Workspace terms"
  onScrollEnd={onEnd}
  footerStart={read ? <span role="status">You have reached the end</span> : <span role="status" id="terms-hint">Scroll to the end to accept</span>}
  footer={<Button disabled={!read} aria-describedby={read ? undefined : "terms-hint"} onClick={accept}>Accept terms</Button>}
>
  {terms}
</Modal>
```

## ConfirmModal, danger, two steps

The irreversible button only appears on the review step, so a stray Enter cannot confirm.

```tsx
<ConfirmModal
  open={open}
  onClose={close}
  tone="danger"
  title="Delete Atlas redesign"
  review={<p>Files are removed from the shared drive immediately.</p>}
  proceedLabel="Review deletion"
  confirmLabel="Delete project"
  onConfirm={remove}
  busy={pending}
>
  …reason fields…
</ConfirmModal>
```

Docs: https://rime.mjsons.net/components/modal
