"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CommandDialog, useToast, type CommandGroup } from "@/components/ui";
import { entriesByCategory, PATTERNS } from "@/components/ui/_registry";
import { installCommand } from "@/lib/site";
import styles from "./Docs.module.css";
import { DOCS_SECTIONS, TOP_NAV } from "./nav";

// The docs' command palette, dogfooding Rime's own Command: Cmd or Ctrl K,
// or "/", opens it. Groups: Pages, Components, Patterns. Enter goes to the
// page; Cmd or Ctrl C on a highlighted component copies its install command.

const COPY_PREFIX = "component:";

export function DocsCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // "/" opens it too, outside fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Cmd or Ctrl C copies the highlighted component's install command.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "c") return;
      if (window.getSelection()?.toString()) return;
      const row = document.querySelector<HTMLElement>('[role="option"][aria-selected="true"][data-cmd-id]');
      const id = row?.dataset.cmdId ?? "";
      if (!id.startsWith(COPY_PREFIX)) return;
      e.preventDefault();
      const cmd = installCommand(id.slice(COPY_PREFIX.length));
      void navigator.clipboard?.writeText(cmd).then(
        () => toast.success("Install command copied", { description: cmd }),
        () => toast.error("Couldn't copy"),
      );
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, toast]);

  const groups = useMemo<CommandGroup[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      {
        heading: "Pages",
        items: [
          { id: "page:/", label: "Home", onSelect: go("/") },
          ...TOP_NAV.map((p) => ({ id: `page:${p.href}`, label: p.label, keywords: [p.description ?? ""], onSelect: go(p.href) })),
          ...DOCS_SECTIONS.flatMap((s) => s.items)
            .filter((i) => !TOP_NAV.some((t) => t.href === i.href))
            .map((i) => ({ id: `page:${i.href}`, label: i.label, keywords: ["docs"], onSelect: go(i.href) })),
        ],
      },
      {
        heading: "Components",
        items: entriesByCategory().flatMap(([category, list]) =>
          list.map((e) => ({
            id: `${COPY_PREFIX}${e.slug}`,
            label: e.name,
            keywords: [category, e.slug, e.summary],
            onSelect: go(`/components/${e.slug}`),
          })),
        ),
      },
      {
        heading: "Patterns",
        items: PATTERNS.map((p) => ({ id: `pattern:${p.slug}`, label: p.name, keywords: [p.summary], onSelect: go(`/patterns#${p.slug}`) })),
      },
    ];
  }, [router]);

  return (
    <>
      <button type="button" className={styles.searchTrigger} onClick={() => setOpen(true)} aria-label="Search the docs" aria-keyshortcuts="Control+K Meta+K /">
        <Search size={14} aria-hidden="true" />
        <span className={styles.searchLabel}>Search docs...</span>
        <kbd className={styles.searchKbd}>Ctrl K</kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        label="Search the docs"
        placeholder="Search documentation..."
        emptyText="No results. Try a component name, such as select or table."
        onSelect={() => setOpen(false)}
      />
    </>
  );
}
