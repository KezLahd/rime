"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import styles from "./Docs.module.css";

// A dark code block with a copy button and a small, dependency-free TSX/CSS
// highlighter: enough to read JSX and tokens at a glance, nothing clever.

const TSX = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|const|let|return|function|type|await|async|if|else|new|true|false|null|undefined)\b|(\b[a-zA-Z-]+(?==))|(\b\d+(?:\.\d+)?(?:px|ms|%)?\b)/g;
const CSS = /(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(--[\w-]+)|(\b\d+(?:\.\d+)?(?:px|ms|%|em|deg)?\b)|(#[0-9a-fA-F]{3,8}\b)/g;

function highlight(code: string, language: "tsx" | "css" | "text"): ReactNode[] {
  if (language === "text") return [code];
  const re = language === "css" ? CSS : TSX;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const cls =
      language === "css"
        ? m[1] ? styles.tkComment : m[2] ? styles.tkString : m[3] ? styles.tkAttr : styles.tkNumber
        : m[1] ? styles.tkComment : m[2] ? styles.tkString : m[3] ? styles.tkTag : m[4] ? styles.tkKeyword : m[5] ? styles.tkAttr : styles.tkNumber;
    out.push(
      <span key={i++} className={cls}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function useCopy() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (text: string, what = "Code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(`Couldn't copy ${what.toLowerCase()}`, { description: "The browser blocked the clipboard. Select the text and copy it instead." });
    }
  };
  return { copied, copy };
}

export function CodeBlock({
  code,
  language = "tsx",
  label = "Code",
  inFrame,
}: {
  code: string;
  language?: "tsx" | "css" | "text";
  /** Names the block for the copy button and the scroll region. */
  label?: string;
  /** Flush inside an example frame rather than standing alone. */
  inFrame?: boolean;
}) {
  const { copied, copy } = useCopy();
  return (
    <div className={cx(styles.code, inFrame ? styles.codeInFrame : styles.codeStandalone)}>
      <pre className={styles.pre} tabIndex={0} aria-label={label}>
        <code>{highlight(code, language)}</code>
      </pre>
      <button type="button" className={styles.copy} onClick={() => copy(code, label)} aria-label={`Copy ${label.toLowerCase()}`}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
