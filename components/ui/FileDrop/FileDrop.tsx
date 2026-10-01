"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import { mergeDescribedBy, useField } from "../Field/Field";
import { Button } from "../Button/Button";
import { IconAlertCircle, IconCheckCircle, IconFile, IconUpload, IconX } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import styles from "./FileDrop.module.css";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type FileChipProps = {
  name: string;
  size: number;
  /** ready = attached, not yet sent. */
  status?: "ready" | "uploading" | "done" | "error";
  /** Shown under the name; required when status is "error". */
  message?: ReactNode;
  onRemove?: () => void;
  className?: string;
};

export function FileChip({ name, size, status = "ready", message, onRemove, className }: FileChipProps) {
  const ext = name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 4) : "FILE";
  return (
    <li data-slot="file-chip" className={cx(styles.chip, styles[`chip_${status}`], className)}>
      <span className={styles.chipIcon} aria-hidden="true">
        {status === "uploading" ? (
          <Spinner size={16} />
        ) : status === "done" ? (
          <IconCheckCircle size={17} />
        ) : status === "error" ? (
          <IconAlertCircle size={17} />
        ) : (
          <span className={styles.ext}>{ext}</span>
        )}
      </span>
      <span className={styles.chipText}>
        <span className={styles.chipName} title={name}>
          {name}
        </span>
        <span className={styles.chipMeta}>
          {status === "uploading" ? "Uploading… " : null}
          {message ?? formatBytes(size)}
        </span>
      </span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          disabled={status === "uploading"}
        >
          <IconX size={14} />
        </button>
      ) : null}
    </li>
  );
}

export type FileDropProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Extensions including the dot. Checked by name and MIME type both. */
  accept?: string[];
  maxSizeBytes?: number;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  title?: ReactNode;
  /** Defaults to a sentence built from accept and maxSizeBytes. */
  description?: ReactNode;
  /** Per-file upload state, keyed by file name. */
  statusFor?: (file: File) => Pick<FileChipProps, "status" | "message"> | undefined;
  id?: string;
  className?: string;
  /** Holds the drag-over state without a drag. For the styleguide only. */
  forceDragOver?: boolean;
};

const MIME: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

function describeTypes(accept: string[]): string {
  const names = Array.from(new Set(accept.map((a) => (a === ".jpeg" ? "JPG" : a.replace(".", "").toUpperCase()))));
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
}

/**
 * Drag-and-drop or choose. Rejected files are named with the reason
 * ("over 10 MB", "not a PDF, JPG or PNG") in a polite live region, and the
 * accepted ones list below as removable chips. The browser's accept filter is
 * a convenience only; the type and size checks here are the client-side gate,
 * and the server must check again.
 */
export function FileDrop({
  files,
  onFilesChange,
  accept = [".pdf", ".jpg", ".jpeg", ".png"],
  maxSizeBytes = 10 * 1024 * 1024,
  multiple = true,
  disabled,
  invalid: invalidProp,
  title = "Drop the file here",
  description,
  statusFor,
  id: idProp,
  className,
  forceDragOver = false,
}: FileDropProps) {
  const field = useField();
  const invalid = invalidProp ?? field?.invalid ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragOver, setDragging] = useState(false);
  const dragging = dragOver || forceDragOver;
  const [rejected, setRejected] = useState<string[]>([]);
  const id = idProp ?? field?.id;
  const rejectId = id ? `${id}-rejected` : undefined;
  const typeText = describeTypes(accept);
  const sizeText = formatBytes(maxSizeBytes);

  const take = (list: FileList | null) => {
    if (!list || disabled) return;
    const accepted: File[] = [];
    const reasons: string[] = [];
    for (const file of Array.from(list)) {
      const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      const typeOk = accept.includes(ext) && (!file.type || (MIME[ext] ?? [file.type]).includes(file.type));
      if (!typeOk) reasons.push(`${file.name} was not added: it is not a ${typeText}.`);
      else if (file.size > maxSizeBytes) reasons.push(`${file.name} was not added: it is over ${sizeText}.`);
      else if (file.size === 0) reasons.push(`${file.name} was not added: the file is empty.`);
      else accepted.push(file);
    }
    setRejected(reasons);
    if (accepted.length === 0) return;
    const next = multiple ? [...files, ...accepted.filter((a) => !files.some((f) => f.name === a.name && f.size === a.size))] : [accepted[0]];
    onFilesChange(next);
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    depth.current += 1;
    setDragging(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    take(e.dataTransfer.files);
  };

  return (
    <div data-slot="file-drop" className={cx(styles.root, className)}>
      <div
        className={cx(styles.zone, dragging && styles.dragging, invalid && styles.invalid, disabled && styles.disabled)}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={(e) => {
          // The whole zone is a pointer target; the button is the keyboard one.
          if (e.target === e.currentTarget) inputRef.current?.click();
        }}
      >
        <span className={styles.zoneIcon} aria-hidden="true">
          <IconUpload size={20} />
        </span>
        <p className={styles.zoneTitle}>{dragging ? "Release to attach" : title}</p>
        <p className={styles.zoneHint}>{description ?? `${typeText}, up to ${sizeText}${multiple ? " each" : ""}.`}</p>
        <Button
          variant="secondary"
          size="sm"
          iconStart={<IconFile size={14} />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          aria-describedby={mergeDescribedBy(field?.describedBy, rejected.length ? rejectId : undefined)}
          id={id}
        >
          Choose {multiple ? "files" : "a file"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          accept={accept.join(",")}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            take(e.target.files);
            // Reset so choosing the same file again still fires change.
            e.target.value = "";
          }}
        />
      </div>

      <div id={rejectId} aria-live="polite" className={styles.rejections}>
        {rejected.map((r) => (
          <p key={r} className={styles.rejection}>
            <IconAlertCircle size={14} />
            <span>{r}</span>
          </p>
        ))}
      </div>

      {files.length > 0 ? (
        <ul className={styles.list} aria-label="Attached files">
          {files.map((file, i) => {
            const s = statusFor?.(file);
            return (
              <FileChip
                key={`${file.name}-${file.size}-${i}`}
                name={file.name}
                size={file.size}
                status={s?.status}
                message={s?.message}
                onRemove={disabled ? undefined : () => onFilesChange(files.filter((_, j) => j !== i))}
              />
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
