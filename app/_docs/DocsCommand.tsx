"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui";
import { entriesByCategory, PATTERNS } from "@/components/ui/_registry";
import { installCommand } from "@/lib/site";
import styles from "./Docs.module.css";
import { DOCS_SECTIONS, TOP_NAV } from "./nav";

// The docs' inline search: an input in the top bar with a dropdown of
// matches directly beneath it. Cmd or Ctrl K (or "/") focuses the input;
// Escape clears and blurs. Keyboard: arrow keys move the selection, Enter
// opens the page. Cmd or Ctrl C on a component result copies the install
// command.

type Row = {
  id: string;
  label: string;
  heading: string;
  keywords: string;
  href: string;
  isComponent?: boolean;
  slug?: string;
};

function buildIndex(): Row[] {
  const seenPages = new Set<string>();
  const pages: Row[] = [];

  pages.push({ id: "page:/", label: "Home", heading: "Pages", keywords: "", href: "/" });
  seenPages.add("/");

  for (const p of TOP_NAV) {
    pages.push({ id: `page:${p.href}`, label: p.label, heading: "Pages", keywords: p.description ?? "", href: p.href });
    seenPages.add(p.href);
  }
  for (const section of DOCS_SECTIONS) {
    for (const i of section.items) {
      if (seenPages.has(i.href)) continue;
      pages.push({ id: `page:${i.href}`, label: i.label, heading: "Pages", keywords: `docs ${section.title}`, href: i.href });
      seenPages.add(i.href);
    }
  }

  const components: Row[] = entriesByCategory().flatMap(([category, list]) =>
    list.map((e) => ({
      id: `component:${e.slug}`,
      label: e.name,
      heading: "Components",
      keywords: `${category} ${e.slug} ${e.summary}`,
      href: `/components/${e.slug}`,
      isComponent: true,
      slug: e.slug,
    })),
  );

  const patterns: Row[] = PATTERNS.map((p) => ({
    id: `pattern:${p.slug}`,
    label: p.name,
    heading: "Patterns",
    keywords: p.summary,
    href: `/patterns#${p.slug}`,
  }));

  return [...pages, ...components, ...patterns];
}

export function DocsCommand() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // Mac shows "⌘" for the Cmd key; everything else shows "Ctrl". Default to
  // "⌘" so the first paint doesn't flash, then correct on hydration.
  const [modSymbol, setModSymbol] = useState("⌘");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();
  const listboxId = useId();

  useEffect(() => {
    const nav = typeof navigator === "undefined" ? "" : (navigator.platform || navigator.userAgent || "");
    const isMac = /Mac|iPhone|iPod|iPad/.test(nav);
    setModSymbol(isMac ? "⌘" : "Ctrl");
  }, []);

  const rows = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Row[];
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored: Array<{ row: Row; score: number }> = [];
    for (const row of rows) {
      const hay = `${row.label} ${row.keywords}`.toLowerCase();
      let ok = true;
      let score = 0;
      for (const t of tokens) {
        if (!hay.includes(t)) {
          ok = false;
          break;
        }
        // Label hits rank higher than keyword hits; prefix hits highest.
        const labelLower = row.label.toLowerCase();
        if (labelLower.startsWith(t)) score += 3;
        else if (labelLower.includes(t)) score += 2;
        else score += 1;
      }
      if (ok) scored.push({ row, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30).map((s) => s.row);
  }, [rows, query]);

  // Focus input on Cmd/Ctrl K or "/" (outside fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!metaK && !slash) return;
      if (slash) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      }
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Cmd/Ctrl C on a highlighted component copies its install command.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "c") return;
      if (window.getSelection()?.toString()) return;
      const current = results[index];
      if (!current?.isComponent || !current.slug) return;
      e.preventDefault();
      const cmd = installCommand(current.slug);
      void navigator.clipboard?.writeText(cmd).then(
        () => toast.success("Install command copied", { description: cmd }),
        () => toast.error("Couldn't copy"),
      );
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, results, index, toast]);

  // Close the dropdown on click outside the search.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const wrap = wrapRef.current;
      if (wrap && !wrap.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => {
    setIndex(0);
  }, [results.length]);

  const commit = (row?: Row) => {
    const chosen = row ?? results[index];
    if (!chosen) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(chosen.href);
  };

  const showDropdown = open && query.trim().length > 0;

  // Group the flat results back under their heading for a scannable list.
  const grouped = useMemo(() => {
    const byHeading = new Map<string, Row[]>();
    results.forEach((r) => {
      const list = byHeading.get(r.heading) ?? [];
      list.push(r);
      byHeading.set(r.heading, list);
    });
    const order = ["Pages", "Components", "Patterns"];
    return order
      .map((heading) => ({ heading, items: byHeading.get(heading) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  // Index-to-row lookup for keyboard selection and ARIA.
  const flatIds = useMemo(() => results.map((r) => r.id), [results]);
  const activeId = flatIds[index] ? `${listboxId}-${flatIds[index]}` : undefined;

  return (
    <div ref={wrapRef} className={styles.searchWrap} data-open={showDropdown ? "" : undefined}>
      <Search size={14} aria-hidden="true" className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        className={styles.searchInput}
        placeholder="Search docs..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (results.length === 0) return;
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            if (query) {
              setQuery("");
              setOpen(false);
            } else {
              setOpen(false);
              inputRef.current?.blur();
            }
          }
        }}
      />
      {!query && (
        <kbd className={styles.searchKbd} aria-hidden="true">
          Ctrl K
        </kbd>
      )}

      {showDropdown && (
        <div className={styles.searchDropdown} role="listbox" id={listboxId} aria-label="Search results">
          {results.length === 0 ? (
            <p className={styles.searchEmpty}>No results. Try a component name, such as select or table.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.heading} className={styles.searchGroup}>
                <p className={styles.searchGroupHeading}>{group.heading}</p>
                <ul className={styles.searchList}>
                  {group.items.map((row) => {
                    const i = flatIds.indexOf(row.id);
                    const selected = i === index;
                    return (
                      <li key={row.id}>
                        <Link
                          id={`${listboxId}-${row.id}`}
                          href={row.href}
                          role="option"
                          aria-selected={selected}
                          data-selected={selected ? "" : undefined}
                          className={styles.searchItem}
                          onMouseEnter={() => setIndex(i)}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <span className={styles.searchItemLabel}>{row.label}</span>
                          {row.isComponent ? (
                            <span className={styles.searchItemHint}>
                              <kbd className={styles.searchItemKey}>{modSymbol}</kbd>
                              <kbd className={styles.searchItemKey}>C</kbd>
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
