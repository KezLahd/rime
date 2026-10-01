"use client";

import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Menu, Tooltip, useToast } from "@/components/ui";
import { SITE, asset } from "@/lib/site";
import styles from "./Docs.module.css";

/**
 * The header actions of a docs page, as shadcn's: a Copy page split button
 * (copies the page's markdown; the menu views it, or opens it in Claude or
 * ChatGPT with a prompt) and icon previous / next links.
 */
export function PageActions({
  markdownPath,
  pageTitle,
  prev,
  next,
}: {
  /** e.g. "/md/button.md". */
  markdownPath: string;
  pageTitle: string;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const absolute = `${SITE.url}${markdownPath}`;
  const prompt = `I'm looking at the Rime UI documentation for ${pageTitle}: ${absolute}. Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`;

  const copyPage = async () => {
    try {
      const res = await fetch(asset(markdownPath));
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the page");
    }
  };

  return (
    <div className={styles.pageActions}>
      <div className={styles.split}>
        <button type="button" className={styles.splitMain} onClick={() => void copyPage()}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy page"}
        </button>
        <Menu
          label={<ChevronDown size={14} aria-hidden="true" />}
          aria-label="More page actions"
          hideChevron
          align="end"
          triggerClassName={styles.splitMore}
          items={[
            { id: "md", label: "View as Markdown", href: asset(markdownPath) },
            { id: "claude", label: "Open in Claude", href: `https://claude.ai/new?q=${encodeURIComponent(prompt)}` },
            { id: "chatgpt", label: "Open in ChatGPT", href: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}` },
          ]}
        />
      </div>
      {prev ? (
        <Tooltip content={prev.label}>
          <Link href={prev.href} className={styles.pageArrow} aria-label={`Previous: ${prev.label}`}>
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        </Tooltip>
      ) : null}
      {next ? (
        <Tooltip content={next.label}>
          <Link href={next.href} className={styles.pageArrow} aria-label={`Next: ${next.label}`}>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Tooltip>
      ) : null}
    </div>
  );
}
