import type { RegistryEntry } from "../types";

export const OVERLAYS: RegistryEntry[] = [
  {
    slug: "modal",
    name: "Modal",
    category: "Overlays",
    summary: "A frosted dialog with a focus trap, scroll lock, inert page, scroll-aware edges and a bottom sheet on phones.",
    description: [
      "Modal portals a dialog over a deep scrim: focus moves in (to initialFocus, the first field, or the first button), Tab is trapped, Esc and a scrim click close it unless dismissible is false or busy is set, the page behind goes inert, and focus returns to whatever opened it.",
      "Everything in the header sits on one left edge: the tone's icon tile and the close button on one row, then the title and description full width beneath; nothing is stacked over the title. tone tints the header wash and the tile (danger, success, info); progress draws a segmented step rule for multi-step flows.",
      "The body scrolls on its own. Its scroll edges are the portable pattern from components/ui/Scroll: a hairline and soft shade under the header once content has scrolled (data-scrolled) and over the footer while there is more below (data-more), written straight to the DOM by useScrollEdges with a passive listener, plus thin tinted scrollbars and contained overscroll. Under 640px every size becomes a bottom sheet (or the full screen with mobile=\"fullscreen\").",
      "Widths are tokens: --modal-width-sm 480px, -md 640px, -lg 880px. meta puts a quiet line under the title (a reference, \"Step 1 of 2\"); nothing is stacked over the title. inline renders the open panel in place, with no portal, scrim, focus trap or scroll lock, for docs and design reviews.",
    ],
    importLine: `import { Button, Modal } from "@/components/ui";`,
    usage: `<Modal
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
</Modal>`,
    props: ["Modal", "ConfirmModal"],
    defaults: {
      Modal: { size: `"md"`, mobile: `"sheet"`, tone: `"default"`, dismissible: "true", busy: "false", closeLabel: `"Close"` },
    },
    css: ["components/ui/Modal/Modal.module.css", "components/ui/Scroll/Scroll.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline renders the panel in place: no portal, scrim, focus trap or scroll lock. For docs and reviews.", code: `<Modal inline open onClose={close} title="Contact support" meta="Invoice INV-1042" description="Ask a question about this invoice." footer={…}>
  <Field label="Your question"><TextInput /></Field>
</Modal>` }, 
      {
        id: "form",
        title: "Form in a modal",
        code: `<Modal open={open} onClose={close} title="Contact support" footerStart="Recorded on the activity log." footer={…}>
  <Field label="What is it about?" required><Select … /></Field>
</Modal>`,
      },
      {
        id: "long",
        title: "Long content: scroll edges",
        description: "Scroll the body: the header shade appears once content passes under it, and the footer shade shows while there is more.",
        code: `<Modal open={open} onClose={close} size="lg" title="Workspace terms" footer={<Button onClick={close}>I agree</Button>}>
  {terms}
</Modal>`,
      },
      {
        id: "terms",
        title: "Terms with a scroll-gated accept",
        description: "Accept stays disabled until the body has been scrolled to the end. onScrollEnd comes from useScrollEdges, the same listener that clears data-more when nothing is left below. Open it and scroll.",
        code: `const [read, setRead] = useState(false);
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
</Modal>`,
      },
      {
        id: "confirm",
        title: "ConfirmModal, danger, two steps",
        description: "The irreversible button only appears on the review step, so a stray Enter cannot confirm.",
        code: `<ConfirmModal
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
</ConfirmModal>`,
      },
    ],
    accessibility: [
      "role=\"dialog\" (\"alertdialog\" for tone=\"danger\") with aria-modal, aria-labelledby on the title and aria-describedby on the description.",
      "Focus trap with Tab and Shift+Tab, Esc to close, focus returned to the opener; the background is inert, except live regions (toasts) so failures are still announced.",
      "busy locks dismissal and sets aria-busy while a request is in flight.",
      "Reduced motion: everything fades in place; nothing travels or scales.",
    ],
    dos: [
      "Keep one primary action, last in the footer.",
      "Use ConfirmModal for any irreversible action; TypeToConfirmModal when the blast radius is large.",
      "Use footerStart for a line of context or a Back button.",
    ],
    donts: [
      "Don't stack modals unless the second is a confirm of the first.",
      "Don't put a coloured side bar or a filled header on a modal; tone is a soft wash only.",
      "Don't open a modal on page load.",
    ],
    related: ["button", "scroll-area", "type-to-confirm"],
    depth: "full",
  },
  {
    slug: "type-to-confirm",
    name: "TypeToConfirmModal and DangerZone",
    category: "Overlays",
    summary: "The heaviest confirm: an impact preview and a typed phrase; and the Danger zone section that leads to it.",
    description: [
      "TypeToConfirmModal shows what will change (ImpactPreview), asks for a typed phrase (copyable, case-insensitive by default) and runs an async onConfirm, showing an error in place if it fails.",
      "DangerZone is the section at the foot of a settings or record page that holds destructive actions, one DangerZoneRow each, each opening its confirm.",
    ],
    importLine: `import { DangerZone, DangerZoneRow, TypeToConfirmModal } from "@/components/ui";`,
    usage: `<DangerZone>
  <DangerZoneRow title="Remove team member" actionLabel="Remove team member" confirm={{ title: "Remove Jane Cooper?", phrase: "remove jane cooper", confirmLabel: "Remove team member", onConfirm: remove, impact: ITEMS }} />
</DangerZone>`,
    props: ["TypeToConfirmModal", "DangerZone", "DangerZoneRow"],
    css: ["components/ui/TypeToConfirm/TypeToConfirm.module.css", "components/ui/DangerZone/DangerZone.module.css"],
    examples: [{ id: "open", title: "Open", description: "The confirm itself, rendered in place with inline.", code: `<TypeToConfirmModal inline open onClose={close} title="Remove Jane Cooper?" meta="Team member · Design" phrase="remove jane cooper" confirmLabel="Remove team member" impact={ITEMS} onConfirm={remove} />` }, { id: "default", title: "Danger zone", code: `<DangerZone>…</DangerZone>` }],
    accessibility: ["The confirm button stays disabled until the phrase matches; progress toward the phrase is announced through a polite status region."],
    dos: ["Make the phrase name the thing being destroyed."],
    donts: ["Don't use it for everyday deletes; ConfirmModal is enough."],
    depth: "summary",
    layout: "block",
  },
];
