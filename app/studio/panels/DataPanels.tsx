"use client";

import { ArrowRight, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { REGISTRY, tokenRows } from "@/components/ui/_registry";
import { inferKind, tokenMeta, TOKEN_GROUPS, type TokenGroup } from "@/components/ui/_registry/tokens";
import { Button, SearchField, Switch, TextInput } from "@/components/ui";
import { CodeBlock } from "../../_docs/CodeBlock";
import type { StudioApi } from "../api";
import { ColourRow, Group, Notice, Row, SelectRow, TextRow, useSetExportBundle } from "../controls";
import { parseChannel, parseColour, toChannel, toCss, type Rgb } from "../engine/colour";
import { defaultThemeName, exportCss, exportJson, PRESETS, slugify, type ExportOptions } from "../engine/theme";
import type { Sources } from "../engine/source";
import styles from "../Studio.module.css";

// ── Copy and download ─────────────────────────────────────────────────────

/** A code block (with its own Copy button) and, when a filename is given, a download. */
export function CopyBlock({ text, label, filename, mime = "text/plain" }: { text: string; label: string; filename?: string; mime?: string }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "theme.txt";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <CodeBlock code={text} label={label} language={mime === "text/css" ? "css" : "text"} />
      {filename ? (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" iconStart={<Download size={14} aria-hidden="true" />} onClick={download}>
            Download {filename}
          </Button>
        </div>
      ) : null}
    </>
  );
}

// ── An editor for any token, by kind ──────────────────────────────────────

function colourFrom(value: string): Rgb | null {
  return parseColour(value) ?? parseChannel(value);
}

export function TokenEditor({ api, name, current, label }: { api: StudioApi; name: string; current: string; label?: string }) {
  const kind = tokenMeta(name)?.kind ?? inferKind(name, current);
  const colour = (kind === "color" || kind === "channel") ? colourFrom(current) : null;
  const reset = () => api.reset([name]);
  if (colour) {
    return (
      <ColourRow
        label={label ?? tokenMeta(name)?.label ?? name}
        token={name}
        colour={colour}
        alpha={kind === "color"}
        changed={api.changed(name)}
        onChange={(c) => api.set({ [name]: kind === "channel" ? toChannel(c) : toCss(c) })}
        onReset={reset}
      />
    );
  }
  return (
    <TextRow
      label={label ?? tokenMeta(name)?.label ?? name}
      token={name}
      value={api.value(name) ?? current}
      changed={api.changed(name)}
      onCommit={(v) => api.set({ [name]: v })}
      onReset={reset}
    />
  );
}

// ── Per-component tokens ──────────────────────────────────────────────────

const WITH_HOOKS = REGISTRY.filter((e) => tokenRows(e).hooks.length > 0);

export function ComponentsPanel({ api, resolveExpr }: { api: StudioApi; resolveExpr: (expr: string) => string }) {
  const [slug, setSlug] = useState(WITH_HOOKS[0]?.slug ?? "button");
  const entry = WITH_HOOKS.find((e) => e.slug === slug) ?? WITH_HOOKS[0];
  const rows = tokenRows(entry);
  const current = (name: string, fallback?: string) => api.value(name) ?? resolveExpr(fallback ?? `var(${name})`);
  const cssBlock = `:root {\n${rows.hooks.map((h) => `  ${h.name}: ${current(h.name, h.defaults[0])};`).join("\n")}\n}`;
  const changedCount = rows.hooks.filter((h) => api.changed(h.name)).length;
  return (
    <>
      <Group title="Component" help="Each component reads its own tokens with a fallback in its CSS. Change one here and every instance in the preview follows.">
        <SelectRow stacked label="Component" value={entry.slug} options={WITH_HOOKS.map((e) => ({ value: e.slug, label: e.name }))} onChange={setSlug} />
        {changedCount ? (
          <div className={styles.actions}>
            <Button size="sm" variant="ghost" onClick={() => api.reset(rows.hooks.map((h) => h.name))}>
              Reset {changedCount} change{changedCount === 1 ? "" : "s"}
            </Button>
          </div>
        ) : null}
      </Group>
      <Group title="Its tokens">
        {rows.hooks.map((h) => (
          <TokenEditor key={h.name} api={api} name={h.name} current={current(h.name, h.defaults[0])} label={h.name.replace(/^--/, "")} />
        ))}
      </Group>
      <Group title="Usage">
        <CopyBlock text={`${entry.importLine}\n\n${entry.usage}`} label="usage" />
      </Group>
      <Group title="Its tokens, with the values now" note="Paste into theme.css to fix this component's look in another site.">
        <CopyBlock text={cssBlock} label="CSS" />
      </Group>
    </>
  );
}

// ── Every token ───────────────────────────────────────────────────────────

export function TokensPanel({ api }: { api: StudioApi }) {
  const [query, setQuery] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const names = useMemo(() => [...new Set([...api.base.keys(), ...Object.keys(api.theme.overrides)])], [api.base, api.theme.overrides]);
  const q = query.trim().toLowerCase();
  const visible = names.filter((n) => (!q || n.includes(q) || (tokenMeta(n)?.label ?? "").toLowerCase().includes(q)) && (!onlyChanged || api.changed(n)));
  const grouped = new Map<TokenGroup | "Other", string[]>();
  for (const n of visible) {
    const g = tokenMeta(n)?.group ?? "Other";
    grouped.set(g, [...(grouped.get(g) ?? []), n]);
  }
  const order: Array<TokenGroup | "Other"> = [...TOKEN_GROUPS, "Other"];
  return (
    <>
      <div className={styles.tokenSearch}>
        <SearchField aria-label="Filter tokens" size="sm" placeholder={`Filter ${names.length} tokens`} value={query} onValueChange={setQuery} />
        <Switch label="Changed only" checked={onlyChanged} onChange={setOnlyChanged} />
      </div>
      {visible.length === 0 ? (
        <p className={styles.empty}>{onlyChanged ? "Nothing changed yet. Every token is the preset's." : `No token matches "${query}". Try part of a name, like "ink" or "radius".`}</p>
      ) : (
        order
          .filter((g) => grouped.has(g))
          .map((g) => (
            <Group key={g} title={g}>
              {(grouped.get(g) ?? []).map((n) => (
                <TokenEditor key={n} api={api} name={n} current={api.resolved(n) || (api.value(n) ?? "")} />
              ))}
            </Group>
          ))
      )}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────

/**
 * Export step, left side: name your theme first, pick scope + contents
 * if you need them, and the three export actions (download / copy /
 * terminal pipe) live on the right beside the preview. The split keeps
 * the left focused on CONFIG and the right on ACTION, so a user who's
 * done tweaking isn't scrolling past three options to reach a button.
 *
 * The bundle (name, slug, css, filenames) is pushed into context so the
 * right-side ExportShowcase renders against the exact same values.
 */
export function ExportPanel({ api, sources }: { api: StudioApi; sources: Sources | null }) {
  const [opts, setOpts] = useState<ExportOptions>({ scope: "root", content: "overrides" });
  const setExportBundle = useSetExportBundle();
  const suggested = defaultThemeName(api.theme.base, api.theme.brand);
  // A theme counts as "named" when the user has changed the field away
  // from the suggested default (plain "Rime", or "<brand> Rime" once the
  // business name is set on the logo step) and left at least one visible
  // character. Legacy preset names ("Rime Default" / "Rime Flat") still
  // read as unnamed so a theme carried over from before the Export
  // rework doesn't trick the UI into thinking it has a real name.
  const trimmed = api.theme.name.trim();
  const isLegacyPreset = PRESETS.some((p) => p.name === trimmed);
  const hasName = trimmed.length > 0 && trimmed !== suggested && !isLegacyPreset;

  const css = useMemo(() => (sources ? exportCss(api.source, sources, opts) : ""), [api.source, sources, opts]);
  const jsonText = useMemo(() => exportJson(api.source), [api.source]);
  const slug = slugify(api.theme.name || "theme");
  const cssFilename = `${slug}.theme.css`;
  const jsonFilename = `${slug}.theme.json`;
  const count = Object.keys(api.source.overrides).length + Object.keys(api.source.overridesDark).length + (api.source.logo ? 1 : 0);

  // Push the bundle to context on every render where it changed; clear
  // it on unmount so leaving the Export step doesn't leave stale data
  // in the right-side showcase.
  useEffect(() => {
    if (!sources) {
      setExportBundle(null);
      return;
    }
    setExportBundle({
      name: api.theme.name,
      slug,
      hasName,
      css,
      cssFilename,
      jsonText,
      jsonFilename,
      changedCount: count,
    });
    return () => setExportBundle(null);
  }, [api.theme.name, slug, hasName, css, cssFilename, jsonText, jsonFilename, count, sources, setExportBundle]);

  if (!sources) return <p className={styles.empty}>Reading the stylesheets…</p>;

  return (
    <>
      {/* The name field leads the step — no group header on top of it,
          because the "STEP 12 OF 12 · Export" strip above already names
          the step and a second heading just doubles up on the label. */}
      <div className={styles.exportNameBlock}>
        <Row label="Theme name" stacked>
          <TextInput
            size="sm"
            aria-label="Theme name"
            value={api.theme.name}
            maxLength={60}
            placeholder={suggested}
            onChange={(e) => api.setName(e.target.value)}
          />
        </Row>
        <p className={styles.exportNameHint}>
          {hasName ? (
            <span className={styles.exportNameOk}>
              <ArrowRight size={13} aria-hidden="true" /> Looks good. Pick an export option on the right.
            </span>
          ) : (
            <>Give it a name {api.theme.brand ? "" : "(or set a business name on the Logo step)"} before you export.</>
          )}
        </p>
      </div>

      <Group title="Options" help="Defaults suit most projects. Scope the CSS to a subtree, or dump every token instead of just the ones you changed, if you need to.">
        <SelectRow
          stacked
          label="Scope"
          value={opts.scope}
          options={[
            { value: "root", label: ":root (the whole site)" },
            { value: "data-theme", label: `[data-theme="${slug}"] (a subtree)` },
          ]}
          onChange={(scope) => setOpts({ ...opts, scope })}
        />
        <SelectRow
          stacked
          label="Contents"
          value={opts.content}
          options={[
            { value: "overrides", label: "Only what changed (load after tokens.css)" },
            { value: "full", label: "Every token (stands alone)" },
          ]}
          onChange={(content) => setOpts({ ...opts, content })}
        />
        {opts.scope === "data-theme" && opts.content === "overrides" ? (
          <Notice tone="warn">
            Scoped and partial: composites like --wash-hover were computed on :root and will not follow a scoped --rgb-brand. Export every token for a scoped theme.
          </Notice>
        ) : null}
      </Group>

      <Group title="theme.json" help="A data export of the entire theme. Download it to keep a backup, or import it later from the theme-switcher at the top of the Studio to pick up where you left off.">
        <Button
          variant="secondary"
          iconStart={<Download size={14} aria-hidden="true" />}
          disabled={!hasName}
          onClick={() => {
            const url = URL.createObjectURL(new Blob([jsonText], { type: "application/json" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = jsonFilename;
            a.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download {hasName ? jsonFilename : "after naming"}
        </Button>
      </Group>
    </>
  );
}
