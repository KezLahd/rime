"use client";

import { Copy } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { Button } from "../Button/Button";
import { IconAlertCircle, IconCheck } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { ImpactPreview, type ImpactItem, type ImpactPreviewProps } from "../ImpactPreview/ImpactPreview";
import { Modal, type ModalProps } from "../Modal/Modal";
import { TextInput } from "../TextInput/TextInput";
import { useToast } from "../Toast/Toast";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./TypeToConfirm.module.css";

export type TypeToConfirmModalProps = {
  open: boolean;
  /** Cancel, Esc, scrim, the close button, and a confirm that went through. */
  onClose: () => void;
  title: ReactNode;
  /** A quiet line under the title: the record's name or reference. */
  meta?: ReactNode;
  description?: ReactNode;
  /** Render the open dialog in place (see Modal's inline). */
  inline?: boolean;
  /**
   * What the action does, one row per consequence, in the impact panel
   * above the phrase. Pass the rows, or the full ImpactPreview props for a
   * preview that loads from the server (loading, error, onRetry).
   */
  impact?: ImpactItem[] | ImpactPreviewProps;
  /**
   * Prose consequences. Still supported: shown as plain text inside the
   * impact panel, above any rows. Prefer `impact` for new dialogs.
   */
  consequences?: ReactNode;
  /** The compact danger line heading the impact panel. */
  consequencesTitle?: ReactNode;
  /**
   * What the user types to arm the button. Keep it specific to the thing
   * being destroyed ("delete atlas redesign"), so muscle memory can't confirm
   * the wrong record. Shown verbatim; lower-case reads best.
   */
  phrase: string;
  /** Default false: "Jane Cooper" matches "jane cooper". */
  caseSensitive?: boolean;
  /** Extra required fields (a training date). Rendered between the impact panel and the phrase. */
  children?: ReactNode;
  /** Validity of the children. The button arms only when this and the phrase both hold. */
  canConfirm?: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  /** Replaces the confirm label while onConfirm is in flight, e.g. "Deleting…". */
  busyLabel?: string;
  /**
   * The irreversible request. While a returned promise is pending the dialog
   * is locked (no Esc, scrim, close or Cancel). When it resolves the dialog
   * closes through onClose; when it rejects the dialog stays open and
   * unlocked, the typed phrase kept, and an error toast says so.
   */
  onConfirm: () => void | Promise<unknown>;
  /** Title of the failure toast. The description always says nothing changed. */
  errorTitle?: ReactNode;
  size?: ModalProps["size"];
  mobile?: ModalProps["mobile"];
};

/** How long the copy button shows its check. */
const COPIED_MS = 2000;

/** Trimmed, internal runs of whitespace collapsed, lower-cased unless case counts. */
function normalise(text: string, caseSensitive: boolean): string {
  const tidy = text.trim().replace(/\s+/g, " ");
  return caseSensitive ? tidy : tidy.toLowerCase();
}

/**
 * Last resort when the async Clipboard API is missing (http, an old
 * browser) or refused. The textarea goes inside `host`, which sits in the
 * dialog, so focus never leaves the focus trap; the caller puts it back.
 */
function legacyCopy(text: string, host: HTMLElement): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  host.appendChild(area);
  area.select();
  let ok = false;
  try {
    // Deprecated, and still the only synchronous copy there is.
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

type MatchState = "empty" | "partial" | "mismatch" | "match";

/**
 * The irreversible-action confirm, as production apps ship it: a danger
 * dialog that previews the impact, takes any extra required fields, then asks for
 * an exact phrase before the solid danger button arms. Typing the name of
 * the thing is the point: a stray Enter or a double-click cannot destroy
 * anything.
 *
 * The phrase sits inline in the instruction sentence, in mono, with a small
 * copy button after it. Pasting is allowed: the friction is reading the
 * phrase, not retyping it.
 */
export function TypeToConfirmModal({
  open,
  onClose,
  title,
  meta,
  description,
  inline,
  impact,
  consequences,
  consequencesTitle = "This action cannot be undone",
  phrase,
  caseSensitive = false,
  children,
  canConfirm = true,
  confirmLabel,
  cancelLabel = "Cancel",
  busyLabel,
  onConfirm,
  errorTitle = "That didn't go through",
  size = "md",
  mobile,
}: TypeToConfirmModalProps) {
  const toast = useToast();
  const formId = useId();
  const inputId = useId();
  const labelId = useId();
  const phraseId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const instructionRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  // Guards a second Enter landing before React has re-rendered the button.
  const inFlight = useRef(false);

  const [typed, setTyped] = useState("");
  // Blurred or tried to submit: a mismatch now reads as an error.
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  // Each opening starts blank. Reset while rendering, not in an effect, so
  // the first frame of a reopened dialog never shows the last attempt.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTyped("");
      setChecked(false);
      setCopied(false);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(t);
  }, [copied]);

  const target = normalise(phrase, caseSensitive);
  const entered = normalise(typed, caseSensitive);
  const state: MatchState =
    entered === "" ? "empty" : entered === target ? "match" : checked ? "mismatch" : "partial";
  const matched = state === "match";
  const ready = matched && canConfirm && !pending;

  const copy = async () => {
    let ok = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("No async clipboard");
      await navigator.clipboard.writeText(phrase);
      ok = true;
    } catch {
      ok = instructionRef.current ? legacyCopy(phrase, instructionRef.current) : false;
      copyRef.current?.focus({ preventScroll: true });
    }
    if (ok) {
      setCopied(true);
    } else {
      toast.error("Couldn't copy the phrase", {
        description: "Your browser blocked the clipboard. Type the phrase in instead.",
      });
    }
  };

  const confirm = async () => {
    if (inFlight.current) return;
    if (!matched || !canConfirm) {
      setChecked(true);
      return;
    }
    inFlight.current = true;
    try {
      const result = onConfirm();
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(true);
        await result;
      }
      onClose();
    } catch {
      toast.error(errorTitle, {
        description: "Nothing was changed. Try again, or contact the program team if it keeps happening.",
      });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void confirm();
  };

  // Implicit submission does nothing while the button is disabled, so an
  // Enter on a mismatch would be silent. Turn it into the error instead.
  const onPhraseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || ready) return;
    e.preventDefault();
    setChecked(true);
  };

  // A bare array is the common case; the object form carries loading/error.
  const impactProps: ImpactPreviewProps | null = impact ? (Array.isArray(impact) ? { items: impact } : impact) : null;
  const showImpact = Boolean(impactProps || consequences);

  const announcement =
    state === "match"
      ? canConfirm
        ? `Phrase matches. ${confirmLabel} is available.`
        : "Phrase matches. Complete the other fields to continue."
      : state === "mismatch"
        ? "The phrase doesn't match."
        : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      tone="danger"
      title={title}
      meta={meta}
      description={description}
      inline={inline}
      busy={pending}
      size={size}
      mobile={mobile}
      // With extra fields the first of them takes focus (the Modal default);
      // with none, focus lands where the typing happens, not on Copy.
      initialFocus={children ? undefined : inputRef}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="danger"
            disabled={!ready && !pending}
            loading={pending}
            loadingLabel={busyLabel}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={onSubmit} noValidate>
        {/* A native fieldset disables every control inside, the caller's
            fields included, while the request is in flight. */}
        <fieldset className={styles.fieldset} disabled={pending}>
          {showImpact ? (
            <ImpactPreview statement={consequencesTitle} {...(impactProps ?? {})}>
              {consequences ?? impactProps?.children}
            </ImpactPreview>
          ) : null}

          {children}

          <div className={styles.confirm}>
            {/* A sentence, not a <label>: a label may not hold the copy
                button. The input takes its name from the two ids below, so
                the button's own name never joins it. */}
            <p ref={instructionRef} className={styles.instruction}>
              <span id={labelId}>To confirm, type</span>{" "}
              <code id={phraseId} className={styles.phrase}>
                {phrase}
              </code>
              {/* Word joiner: the button never wraps away from the phrase. */}
              {"⁠"}
              <Tooltip content={copied ? "Copied" : "Copy"} side="top">
                <IconButton
                  ref={copyRef}
                  size="sm"
                  variant="ghost"
                  label="Copy confirmation text"
                  className={cx(styles.copy, copied && styles.copied)}
                  icon={
                    copied ? <IconCheck size={14} /> : <Copy size={14} aria-hidden="true" focusable="false" />
                  }
                  onClick={() => void copy()}
                />
              </Tooltip>
            </p>

            <TextInput
              ref={inputRef}
              id={inputId}
              mono
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onBlur={() => {
                if (typed.trim()) setChecked(true);
              }}
              onKeyDown={onPhraseKeyDown}
              aria-labelledby={`${labelId} ${phraseId}`}
              aria-describedby={statusId}
              invalid={state === "mismatch"}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              boxClassName={matched ? styles.matchedBox : undefined}
              trailing={
                matched ? (
                  <span className={styles.trailingCheck} aria-hidden="true">
                    <IconCheck size={16} />
                  </span>
                ) : null
              }
            />

            <p id={statusId} className={cx(styles.status, styles[state])}>
              {state === "partial" ? "Doesn't match yet" : null}
              {state === "mismatch" ? (
                <>
                  <IconAlertCircle size={14} />
                  <span>
                    Doesn&rsquo;t match. Type it exactly as shown{caseSensitive ? ", capitals included" : ""}.
                  </span>
                </>
              ) : null}
              {state === "match" ? (
                <>
                  <IconCheck size={14} />
                  <span>Matches</span>
                </>
              ) : null}
            </p>

            {/* The visible line changes on every keystroke; this only speaks
                when the state is worth hearing. */}
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Phrase copied to the clipboard." : ""}
            </span>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
