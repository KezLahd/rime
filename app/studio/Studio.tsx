"use client";

import {
  Blend,
  Code,
  Component,
  Contrast,
  Droplets,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  MousePointer2,
  Palette,
  Redo2,
  RotateCcw,
  Save,
  Shapes,
  SquareStack,
  SunMedium,
  Trash2,
  Type,
  Undo2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, CountBadge, IconButton, SegmentedControl, Select, TextInput } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { LOGO_EVENT } from "../_docs/DocsLogo";
import { DocsTopBar } from "../_docs/DocsShell";
import { applyMode, applyPreset } from "../_docs/PresetSwitch";
import type { StudioApi, StudioFont } from "./api";
import { Notice } from "./controls";
import { parseColour, type Rgb } from "./engine/colour";
import { measure, type PairResult } from "./engine/contrast";
import { parseGradient } from "./engine/gradient";
import type { Overrides } from "./engine/macros";
import { baseTokens, makePerMode, readSources, type Mode, type Sources } from "./engine/source";
import {
  activeOverrides,
  lookName,
  loadSaved,
  loadWorking,
  parseThemeJson,
  pinCss,
  presetName,
  presetTheme,
  previewCss,
  PRESETS,
  storeSaved,
  storeWorking,
  type Preset,
  type StudioTheme,
} from "./engine/theme";
import { BrandPanel, ColourPanel, TypePanel } from "./panels/BrandPanel";
import { ComponentsPanel, ExportPanel, TokensPanel } from "./panels/DataPanels";
import { GradientPanel } from "./panels/GradientPanel";
import { ContrastPanel, ImagePanel } from "./panels/GuardPanels";
import { LayoutPanel, layoutOf, logoCornerOf } from "./panels/LayoutPanel";
import { GlassTab, HoverPanel, ShadowPanel, ShapePanel } from "./panels/SurfacePanels";
import styles from "./Studio.module.css";
import { ThemePreview } from "./ThemePreview";

type Section =
  | "brand"
  | "colour"
  | "type"
  | "shape"
  | "glass"
  | "shadows"
  | "gradients"
  | "hover"
  | "layout"
  | "components"
  | "image"
  | "contrast"
  | "export"
  | "tokens";

const NAV: ReadonlyArray<{ heading: string; items: ReadonlyArray<{ id: Section; label: string; icon: LucideIcon; lede: string }> }> = [
  {
    heading: "Theme",
    items: [
      { id: "brand", label: "Brand", icon: Palette, lede: "The brand colours and the logo." },
      { id: "colour", label: "Colour", icon: Droplets, lede: "Text, signals and the page field." },
      { id: "type", label: "Type", icon: Type, lede: "The body and heading families." },
      { id: "shape", label: "Shape", icon: Shapes, lede: "Corners, density, control sizes and dialog widths." },
      { id: "glass", label: "Glass", icon: SunMedium, lede: "Frosted surfaces: tint, opacity and blur per surface." },
      { id: "shadows", label: "Shadows", icon: SquareStack, lede: "Depth for everything at once, or one elevation at a time." },
      { id: "gradients", label: "Gradients", icon: Blend, lede: "Every gradient, stop by stop, and the page blooms." },
      { id: "hover", label: "Hover", icon: MousePointer2, lede: "Hover, press, washes and motion." },
    ],
  },
  {
    heading: "Shell",
    items: [{ id: "layout", label: "Layout", icon: LayoutDashboard, lede: "Sidebar, collapsed rail or header only, and the logo corner." }],
  },
  {
    heading: "Tools",
    items: [
      { id: "components", label: "Components", icon: Component, lede: "One component's own tokens, its usage and its CSS." },
      { id: "image", label: "Image", icon: ImageIcon, lede: "Drop a logo or a screenshot and build a theme from its colours." },
      { id: "contrast", label: "Contrast", icon: Contrast, lede: "Every text and control pair, measured live, with a fix for each failure." },
      { id: "export", label: "Export", icon: Code, lede: "theme.css and theme.json, ready for another project." },
    ],
  },
  {
    heading: "Advanced",
    items: [{ id: "tokens", label: "All tokens", icon: ListTree, lede: "Every token by name, searchable and editable as CSS." }],
  },
];

const ALL = NAV.flatMap((g) => g.items);

const HISTORY = 60;
/** Slider drags inside this window are one undo step. */
const COALESCE_MS = 500;

const baseOfDocument = (): Preset => (document.documentElement.getAttribute("data-theme") === "flat" ? "flat" : "default");
const modeOfDocument = (): Mode => {
  const html = document.documentElement;
  return html.classList.contains("dark") || html.getAttribute("data-mode") === "dark" || html.getAttribute("data-theme") === "dark" ? "dark" : "light";
};

/**
 * Rime Studio, a page of the kit like any other: the kit's own top bar
 * (logo, navigation, preset switch), then a section rail, the controls for
 * the section, and every component inside the dashboard frame as the live
 * preview.
 *
 * Theme = preset x mode, with one source of truth: the document. The top
 * bar's preset switch writes data-theme, its mode toggle (and the D key)
 * writes data-mode and the .dark class. The Studio watches both and moves
 * the theme with them (overrides kept); its own preset select and mode
 * switch, an opened or imported theme and Reset all write them through
 * applyPreset / applyMode and re-mount the top bar so it shows the same.
 * Edits in dark mode go to the theme's dark overrides; shared tokens
 * (radius, density, blur, fonts) apply to both modes.
 *
 * The edited theme is one style element (PREVIEW_SELECTOR) that reaches the
 * whole document while the Studio is open, so the top bar and portalled
 * overlays preview it too. The control panel is pinned (pinCss): it
 * re-declares the base preset's tokens on itself and un-declares any
 * component hook the theme sets, so the controls stay readable whatever the
 * theme does, while still following the preset and mode in force.
 */
export function Studio({ fonts, fontClasses }: { fonts: ReadonlyArray<StudioFont>; fontClasses: string }) {
  const [theme, setTheme] = useState<StudioTheme>(() => presetTheme("default"));
  const [past, setPast] = useState<StudioTheme[]>([]);
  const [future, setFuture] = useState<StudioTheme[]>([]);
  const lastPush = useRef(0);
  const [sources, setSources] = useState<Sources | null>(null);
  const [resolvedMap, setResolvedMap] = useState<Record<string, string>>({});
  const [results, setResults] = useState<PairResult[] | null>(null);
  const [section, setSection] = useState<Section>("brand");
  const [saved, setSaved] = useState<StudioTheme[]>([]);
  const [status, setStatus] = useState("");
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [barKey, setBarKey] = useState(0);
  const probeRef = useRef<HTMLSpanElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The latest theme for event handlers, kept in step after each commit.
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  /** Every change goes through here, so undo sees it. Slider drags coalesce into one step. */
  const commit = useCallback((next: (t: StudioTheme) => StudioTheme) => {
    const t = themeRef.current;
    const n = next(t);
    if (n === t) return;
    const now = Date.now();
    if (now - lastPush.current > COALESCE_MS) setPast((p) => [...p.slice(-HISTORY + 1), t]);
    lastPush.current = now;
    setFuture([]);
    themeRef.current = n;
    setTheme(n);
  }, []);

  /** Writes the preset and mode to the document (and the docs' memory), then re-mounts the top bar. */
  const showLook = useCallback((b: Preset, m: Mode) => {
    let changed = false;
    if (baseOfDocument() !== b) {
      applyPreset(b);
      changed = true;
    }
    if (modeOfDocument() !== m) {
      applyMode(m);
      changed = true;
    }
    if (changed) setBarKey((k) => k + 1);
  }, []);

  // Read the presets from the stylesheets, and restore the last working theme
  // on the document's preset.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSources(readSources());
      setSaved(loadSaved());
      const docBase = baseOfDocument();
      const docMode = modeOfDocument();
      const working = loadWorking();
      const start = working ? { ...working, base: docBase, mode: docMode } : presetTheme(docBase, docMode);
      themeRef.current = start;
      setTheme(start);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // The top bar's preset switch moves the base; overrides are kept.
  useEffect(() => {
    const html = document.documentElement;
    const mo = new MutationObserver(() => {
      const b = baseOfDocument();
      const m = modeOfDocument();
      const t0 = themeRef.current;
      if (b !== t0.base || m !== t0.mode) {
        // A mode switch is a view change, not an edit: no undo step.
        if (b === t0.base) {
          const n = { ...t0, mode: m };
          themeRef.current = n;
          setTheme(n);
        } else commit((t) => ({ ...t, base: b, mode: m, name: t.name === presetName(t.base) ? presetName(b) : t.name }));
        setStatus(`Editing ${lookName(b, m)}`);
      }
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme", "data-mode", "class"] });
    return () => mo.disconnect();
  }, [commit]);

  // Keep the working theme across reloads (debounced: a logo's data URL makes
  // every write large), and tell the docs' logo slot when the logo changes.
  const lastLogo = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const t = window.setTimeout(() => {
      storeWorking(theme);
      const src = theme.logo?.src ?? null;
      if (lastLogo.current !== undefined && lastLogo.current !== src) window.dispatchEvent(new Event(LOGO_EVENT));
      lastLogo.current = src;
    }, 400);
    return () => window.clearTimeout(t);
  }, [theme]);

  const base = useMemo(
    () => (sources ? baseTokens(sources, theme.base, theme.mode) : new Map<string, string>()),
    [sources, theme.base, theme.mode],
  );
  const perMode = useMemo(() => (sources ? makePerMode(sources) : () => false), [sources]);
  /** The overrides in force for the current mode. */
  const active = useMemo(() => activeOverrides(theme, perMode), [theme, perMode]);
  /** What the panels see: the theme with the current mode's overrides. */
  const view = useMemo<StudioTheme>(() => ({ ...theme, overrides: active }), [theme, active]);

  const api: StudioApi = useMemo(
    () => ({
      theme: view,
      source: theme,
      base,
      value: (name) => active[name] ?? base.get(name),
      resolved: (name) => resolvedMap[name] ?? "",
      changed: (name) => name in active,
      set: (patch: Overrides, controls) =>
        commit((t) => {
          const overrides = { ...t.overrides };
          const overridesDark = { ...t.overridesDark };
          for (const [k, v] of Object.entries(patch)) {
            if (!/^--[\w-]+$/.test(k) || /[{}<]/.test(v)) continue;
            // In dark mode, per-mode tokens are written to the dark map.
            const map = t.mode === "dark" && perMode(k, v || base.get(k)) ? overridesDark : overrides;
            if (base.get(k) === v) delete map[k];
            else map[k] = v;
          }
          return { ...t, overrides, overridesDark, controls: controls ? { ...t.controls, ...controls } : t.controls };
        }),
      reset: (names, controls) =>
        commit((t) => {
          const overrides = { ...t.overrides };
          const overridesDark = { ...t.overridesDark };
          for (const n of names) {
            if (t.mode === "dark" && perMode(n, overrides[n] ?? base.get(n))) delete overridesDark[n];
            else delete overrides[n];
          }
          const c = { ...t.controls };
          for (const k of controls ?? []) delete c[k];
          return { ...t, overrides, overridesDark, controls: c };
        }),
      setControls: (controls) => commit((t) => ({ ...t, controls: { ...t.controls, ...controls } })),
      setLogo: (logo) => commit((t) => ({ ...t, logo })),
      fonts,
    }),
    [view, theme, active, perMode, base, resolvedMap, commit, fonts],
  );

  // ── Resolving values in the preview ────────────────────────────────────
  const resolveColour = useCallback((expr: string): Rgb | null => {
    const probe = probeRef.current;
    if (!probe) return null;
    probe.style.backgroundColor = "";
    probe.style.backgroundColor = expr;
    if (!probe.style.backgroundColor) return parseColour(expr);
    return parseColour(getComputedStyle(probe).backgroundColor);
  }, []);

  const resolveExpr = useCallback((expr: string): string => {
    const probe = probeRef.current;
    if (!probe) return "";
    probe.style.setProperty("--studio-probe", expr);
    return getComputedStyle(probe).getPropertyValue("--studio-probe").trim();
  }, []);

  const stops = useCallback(
    (expr: string): Rgb[] => {
      const value = resolveExpr(expr);
      const layers = value ? parseGradient(value) : null;
      if (!layers) {
        const c = resolveColour(expr);
        return c ? [c] : [];
      }
      return layers.flatMap((l) => (l.kind === "colour" ? [l.color] : l.stops.map((s) => s.color))).map(resolveColour).filter((c): c is Rgb => c !== null);
    },
    [resolveExpr, resolveColour],
  );

  const css = previewCss(theme, active);
  const pin = pinCss(active, base);

  // After each change has painted: re-read every token and re-run the guard.
  useEffect(() => {
    if (!sources) return;
    const frame = requestAnimationFrame(() => {
      const cs = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const name of new Set([...base.keys(), ...Object.keys(active)])) next[name] = cs.getPropertyValue(name).trim();
      setResolvedMap(next);
      setResults(measure({ colour: resolveColour, stops }));
    });
    return () => cancelAnimationFrame(frame);
  }, [css, sources, base, active, resolveColour, stops]);

  const failing = results?.filter((r) => !r.pass).length ?? 0;
  const changes =
    Object.keys(theme.overrides).length + Object.keys(theme.overridesDark).length + (theme.logo ? 1 : 0) + (layoutOf({ theme }) !== "sidebar" ? 1 : 0) + (logoCornerOf({ theme }) === "fill" ? 1 : 0);

  // ── Toolbar actions ────────────────────────────────────────────────────
  const say = (msg: string) => setStatus(msg);
  const goTo = (t: StudioTheme) => {
    showLook(t.base, t.mode);
    themeRef.current = t;
    setTheme(t);
  };
  const undo = () => {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast(past.slice(0, -1));
    setFuture([theme, ...future]);
    goTo(prev);
    say("Undone");
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture(future.slice(1));
    setPast([...past, theme]);
    goTo(next);
    say("Redone");
  };
  const startFrom = (b: Preset) => {
    const m = themeRef.current.mode;
    showLook(b, m);
    commit(() => presetTheme(b, m));
    say(`Started from ${presetName(b)}`);
  };
  const switchMode = (m: Mode) => {
    showLook(themeRef.current.base, m);
  };
  const open = (t: StudioTheme) => {
    showLook(t.base, t.mode);
    commit(() => t);
  };
  const save = () => {
    const list = [...saved.filter((t) => t.name !== theme.name), theme];
    if (storeSaved(list)) {
      setSaved(list);
      setStorageWarning(null);
      say(`Saved "${theme.name}"`);
    } else {
      setStorageWarning("This browser's storage is full or blocked, so the theme was not saved. Export theme.json instead (a large logo is the usual cause).");
    }
  };
  const remove = (name: string) => {
    const list = saved.filter((t) => t.name !== name);
    storeSaved(list);
    setSaved(list);
    say(`Deleted "${name}"`);
  };
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseThemeJson(await file.text());
    if (!parsed) {
      setStorageWarning("That file is not a Rime Studio theme.json (version 1 or 2).");
      return;
    }
    setStorageWarning(null);
    open(parsed);
    say(`Imported "${parsed.name}"`);
  };

  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  useEffect(() => {
    undoRef.current = undo;
    redoRef.current = redo;
  });

  // Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z, unless typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      (e.shiftKey ? redoRef : undoRef).current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = ALL.find((s) => s.id === section) ?? ALL[0];
  const choose = (id: Section) => {
    setSection(id);
    bodyRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className={cx(styles.studio, fontClasses)}>
      {css ? <style>{css}</style> : null}
      {pin ? <style>{pin}</style> : null}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {status}
      </p>

      <DocsTopBar key={barKey} current="studio" />

      <div className={styles.workspace}>
        <nav className={styles.sectionNav} aria-label="Studio sections" data-studio-panel="">
          {NAV.map((g) => (
            <div key={g.heading} className={styles.navGroup}>
              <p className={styles.navHeading}>{g.heading}</p>
              <div className={styles.navList}>
                {g.items.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={styles.navLink}
                      aria-current={section === s.id ? "page" : undefined}
                      onClick={() => choose(s.id)}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span>{s.label}</span>
                      {s.id === "contrast" && failing ? <CountBadge count={failing} tone="danger" label={`${failing} failing`} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <aside className={styles.panel} aria-label="Theme controls" data-studio-panel="">
          <div className={styles.panelHead}>
            <div className={styles.headRow}>
              <TextInput
                size="sm"
                aria-label="Theme name"
                boxClassName={styles.grow}
                value={theme.name}
                maxLength={60}
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                placeholder="Theme name"
              />
              <Button size="sm" iconStart={<Save size={14} aria-hidden="true" />} onClick={save} disabled={!theme.name.trim()}>
                Save
              </Button>
            </div>
            <div className={styles.headRow}>
              <Select
                size="sm"
                aria-label="Start from a preset"
                className={styles.grow}
                value={null}
                placeholder="Start from a preset"
                onChange={(v) => startFrom(v as Preset)}
                options={PRESETS.map((p) => ({ value: p.id, label: p.name, description: p.note }))}
              />
              <SegmentedControl
                aria-label="Mode being edited"
                size="sm"
                value={theme.mode}
                onChange={switchMode}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
              {saved.length ? (
                <Select
                  size="sm"
                  aria-label="Open a saved theme"
                  className={styles.grow}
                  value={null}
                  placeholder={`Saved (${saved.length})`}
                  onChange={(name) => {
                    const t = saved.find((s) => s.name === name);
                    if (t) {
                      open(t);
                      say(`Opened "${t.name}"`);
                    }
                  }}
                  options={saved.map((t) => ({ value: t.name, label: t.name, description: lookName(t.base, t.mode) }))}
                />
              ) : null}
            </div>
            <div className={styles.headRow}>
              <span className={styles.changeCount}>{changes ? `${changes} change${changes === 1 ? "" : "s"} on ${lookName(theme.base, theme.mode)}` : `${lookName(theme.base, theme.mode)}, unchanged`}</span>
              <span className={styles.toolbarGroup}>
                <IconButton size="sm" label="Undo" icon={<Undo2 size={15} aria-hidden="true" />} onClick={undo} disabled={!past.length} />
                <IconButton size="sm" label="Redo" icon={<Redo2 size={15} aria-hidden="true" />} onClick={redo} disabled={!future.length} />
                <IconButton size="sm" label="Reset to the preset" icon={<RotateCcw size={15} aria-hidden="true" />} onClick={() => startFrom(theme.base)} disabled={!changes} />
                <IconButton size="sm" label="Import theme.json" icon={<Upload size={15} aria-hidden="true" />} onClick={() => importRef.current?.click()} />
                {saved.some((t) => t.name === theme.name) ? (
                  <IconButton size="sm" variant="danger" label={`Delete saved theme ${theme.name}`} icon={<Trash2 size={15} aria-hidden="true" />} onClick={() => remove(theme.name)} />
                ) : null}
              </span>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className={styles.srOnly}
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  void importFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div ref={bodyRef} className={styles.panelBody} role="region" aria-labelledby="studio-section-title" tabIndex={-1}>
            <header className={styles.sectionHead}>
              <h2 id="studio-section-title" className={styles.sectionTitle}>
                {current.label}
              </h2>
              <p className={styles.sectionLede}>{current.lede}</p>
            </header>
            {storageWarning ? <Notice tone="warn">{storageWarning}</Notice> : null}
            {!sources ? (
              <p className={styles.empty}>Reading the presets from the stylesheets…</p>
            ) : section === "brand" ? (
              <BrandPanel api={api} />
            ) : section === "colour" ? (
              <ColourPanel api={api} />
            ) : section === "type" ? (
              <TypePanel api={api} />
            ) : section === "image" ? (
              <ImagePanel api={api} />
            ) : section === "shape" ? (
              <ShapePanel api={api} />
            ) : section === "gradients" ? (
              <GradientPanel api={api} resolveColour={resolveColour} />
            ) : section === "glass" ? (
              <GlassTab api={api} />
            ) : section === "shadows" ? (
              <ShadowPanel api={api} />
            ) : section === "hover" ? (
              <HoverPanel api={api} />
            ) : section === "layout" ? (
              <LayoutPanel api={api} />
            ) : section === "components" ? (
              <ComponentsPanel api={api} resolveExpr={resolveExpr} />
            ) : section === "tokens" ? (
              <TokensPanel api={api} />
            ) : section === "contrast" ? (
              <ContrastPanel api={api} results={results} />
            ) : (
              <ExportPanel api={api} sources={sources} />
            )}
          </div>
        </aside>

        <section className={styles.preview} aria-label="Live preview">
          <div className={styles.previewScroll} data-theme-studio="">
            <span ref={probeRef} aria-hidden="true" className={styles.srOnly} />
            <ThemePreview logoSrc={theme.logo?.src} logoAlt={theme.logo?.alt} logoCorner={logoCornerOf(api)} layout={layoutOf(api)} />
          </div>
        </section>
      </div>
    </div>
  );
}
