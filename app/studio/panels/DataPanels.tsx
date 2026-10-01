"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { REGISTRY, tokenRows } from "@/components/ui/_registry";
import { inferKind, tokenMeta, TOKEN_GROUPS, type TokenGroup } from "@/components/ui/_registry/tokens";
import { Button, SearchField, Switch } from "@/components/ui";
import { CodeBlock } from "../../_docs/CodeBlock";
import type { StudioApi } from "../api";
import { ColourRow, Group, Notice, SelectRow, TextRow } from "../controls";
import { parseChannel, parseColour, toChannel, toCss, type Rgb } from "../engine/colour";
import { exportCss, exportJson, presetName, slugify, type ExportOptions } from "../engine/theme";
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

export function ExportPanel({ api, sources }: { api: StudioApi; sources: Sources | null }) {
  const [opts, setOpts] = useState<ExportOptions>({ scope: "root", content: "overrides" });
  if (!sources) return <p className={styles.empty}>Reading the stylesheets…</p>;
  const css = exportCss(api.source, sources, opts);
  const slug = slugify(api.theme.name);
  const count = Object.keys(api.source.overrides).length + Object.keys(api.source.overridesDark).length + (api.source.logo ? 1 : 0);
  return (
    <>
      <Group title="theme.css" note={`${count} token${count === 1 ? "" : "s"} changed from ${presetName(api.theme.base)}, across light and dark.`}>
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
        <CopyBlock text={css} label="theme.css" filename={`${slug}.theme.css`} mime="text/css" />
      </Group>
      <Group title="theme.json" note="The theme as data: import it back here, or keep it in the repo beside theme.css.">
        <CopyBlock text={exportJson(api.source)} label="theme.json" filename={`${slug}.theme.json`} mime="application/json" />
      </Group>
      <Group title="Use it in another site">
        <ol className={styles.howto}>
          <li>
            Copy <code>components/ui</code> (and <code>components/shell</code> if you want the frames), <code>app/styles/tokens.css</code> and the
            base rules in <code>app/globals.css</code>. components/ui imports nothing app-specific.
          </li>
          <li>
            Save this as <code>app/styles/theme.css</code> and import it after tokens.css in <code>globals.css</code>.
          </li>
          <li>
            Fonts: load them with next/font in the root layout and keep the family names in --font-body and --font-display.
            {api.theme.controls.fontBodyName ? ` This theme uses ${String(api.theme.controls.fontBodyName)}.` : ""}
          </li>
          <li>
            Shell: pass <code>layout="{String(api.theme.controls.layout ?? "sidebar")}"</code> and <code>logoCorner="{api.theme.controls.logoCorner === "fill" ? "fill" : "glass"}"</code> to SidebarShell, and your logo as <code>logo</code> or <code>logoSrc</code> (with <code>logoAlt</code>).
          </li>
          <li>
            Check it: read the Contrast tab here, and keep the rules in /llms.txt next to the code.
          </li>
        </ol>
      </Group>
    </>
  );
}
