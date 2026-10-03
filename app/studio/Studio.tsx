"use client";

import {
  Blend,
  ChevronLeft,
  ChevronRight,
  Code,
  Component,
  Contrast,
  Droplets,
  GripVertical,
  Image as ImageIcon,
  Layers,
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
import { BrandPaletteProvider, ColourCategoryProvider, ExportBundleProvider, ExportBundleSetterProvider, FontHoverProvider, GradientSelectionProvider, HoverCategoryProvider, Notice, PeekProvider, ShadowSelectionProvider, type BrandPalette, type ColourCategory, type ExportBundle, type FontHoverState, type HoverCategory } from "./controls";
import { toHex } from "./engine/colour";
import { parseColour, type Rgb } from "./engine/colour";
import { measure, type PairResult } from "./engine/contrast";
import { parseGradient } from "./engine/gradient";
import type { Overrides } from "./engine/macros";
import { baseTokens, makePerMode, readSources, type Mode, type Sources } from "./engine/source";
import {
  activeOverrides,
  lookName,
  loadSaved,
  defaultThemeName,
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
import { ColoursPanel, TypePanel } from "./panels/BrandPanel";
import { LogoPanel } from "./panels/LogoPanel";
import { ComponentsPanel, ExportPanel, TokensPanel } from "./panels/DataPanels";
import { BackgroundPanel } from "./panels/BackgroundPanel";
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
  | "background"
  | "hover"
  | "layout"
  | "components"
  | "image"
  | "contrast"
  | "export"
  | "tokens";

type Step = {
  id: Section;
  label: string;
  icon: LucideIcon;
  lede: string;
  /** Which component categories to spotlight in the preview on this step. */
  previewFocus: PreviewFocus;
};

export type PreviewFocus =
  | "logo"
  | "colour"
  | "type"
  | "shape"
  | "gradients"
  | "background"
  | "glass"
  | "shadows"
  | "hover"
  | "layout"
  | "image"
  | "contrast"
  | "components"
  | "export"
  | "tokens";

/** Ordered steps for the walkthrough: logo first, then paint, then shape,
 *  then details. The sidebar renders them as a numbered stepper. */
const STEPS: ReadonlyArray<Step> = [
  { id: "brand", label: "Logo", icon: ImageIcon, lede: "Upload your logo. The theme can derive its colours from it next.", previewFocus: "logo" },
  { id: "colour", label: "Colours", icon: Palette, lede: "Pick the brand, text, status and page colours.", previewFocus: "colour" },
  { id: "type", label: "Fonts", icon: Type, lede: "Choose the body and heading families.", previewFocus: "type" },
  { id: "shape", label: "Shape", icon: Shapes, lede: "Corner radius, density and control sizes.", previewFocus: "shape" },
  { id: "gradients", label: "Gradients", icon: Blend, lede: "Brand, danger and success gradients plus the sign-in and admin surfaces.", previewFocus: "gradients" },
  { id: "background", label: "Background", icon: Layers, lede: "The page backdrop: two soft blooms over a base colour. Flatten to a single colour, or move the blooms around.", previewFocus: "background" },
  { id: "glass", label: "Glass", icon: SunMedium, lede: "Frosted surfaces: tint, opacity and blur per surface.", previewFocus: "glass" },
  { id: "shadows", label: "Shadows", icon: SquareStack, lede: "Depth at every elevation, from cards to dialogs.", previewFocus: "shadows" },
  { id: "hover", label: "Hover", icon: MousePointer2, lede: "Hover, press, washes and motion.", previewFocus: "hover" },
  { id: "layout", label: "Layout", icon: LayoutDashboard, lede: "Sidebar, collapsed rail or header-only, and the logo corner.", previewFocus: "layout" },
  { id: "contrast", label: "Contrast", icon: Contrast, lede: "Every text and control pair, measured live, with a fix for each failure.", previewFocus: "contrast" },
  { id: "export", label: "Export", icon: Code, lede: "theme.css and theme.json, ready for another project.", previewFocus: "export" },
];

/** Secondary tools accessible without being part of the main flow. */
const ADVANCED: ReadonlyArray<Step> = [
  { id: "image", label: "Palette from image", icon: ImageIcon, lede: "Drop a logo or screenshot and build a theme from its colours.", previewFocus: "image" },
  { id: "components", label: "Per-component tokens", icon: Component, lede: "One component's own tokens, its usage and its CSS.", previewFocus: "components" },
  { id: "tokens", label: "All tokens", icon: ListTree, lede: "Every token by name, searchable and editable as CSS.", previewFocus: "tokens" },
];

const ALL_STEPS: ReadonlyArray<Step> = [...STEPS, ...ADVANCED];
const NAV = { steps: STEPS, advanced: ADVANCED };

const ALL = ALL_STEPS;

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

  // ── Inspector width ────────────────────────────────────────────────────
  // The inspector (section rail + controls) is one draggable unit; the
  // preview takes the rest. Width persists across reloads. Rail labels
  // collapse to icons only when the inspector is narrow (< INSPECTOR_RAIL_PX).
  const INSPECTOR_MIN_PX = 420;
  const INSPECTOR_DEFAULT_PX = 616;
  const INSPECTOR_RAIL_PX = 540; // below this, hide rail labels
  const INSPECTOR_STORAGE_KEY = "rime-studio-inspector-w";
  const [inspectorWidth, setInspectorWidth] = useState<number>(INSPECTOR_DEFAULT_PX);
  const [collapsed, setCollapsed] = useState(false);
  const resizeStartRef = useRef<{ x: number; w: number } | null>(null);
  // Live width during a drag: setInspectorWidth is async + batched, so the
  // onResizeEnd closure would otherwise commit the pre-drag width into
  // localStorage and the next render would snap the sidebar back. The ref
  // tracks the real-time value the pointermove handler wrote, and
  // onResizeEnd reads from it on release.
  const latestWidthRef = useRef<number>(INSPECTOR_DEFAULT_PX);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(INSPECTOR_STORAGE_KEY);
      if (saved) {
        const n = Number.parseInt(saved, 10);
        if (Number.isFinite(n) && n >= INSPECTOR_MIN_PX) {
          setInspectorWidth(n);
          latestWidthRef.current = n;
        }
      }
    } catch {
      // Storage blocked; the default stands.
    }
  }, []);

  const commitInspectorWidth = useCallback((w: number) => {
    setInspectorWidth(w);
    latestWidthRef.current = w;
    try {
      window.localStorage.setItem(INSPECTOR_STORAGE_KEY, String(w));
    } catch {
      // Storage blocked; width only lasts for the session.
    }
  }, []);

  const onResizeMove = useCallback((e: PointerEvent) => {
    const start = resizeStartRef.current;
    if (!start) return;
    const max = Math.max(INSPECTOR_MIN_PX, Math.floor(window.innerWidth * 0.72));
    const next = Math.max(INSPECTOR_MIN_PX, Math.min(max, start.w + (e.clientX - start.x)));
    latestWidthRef.current = next;
    setInspectorWidth(next);
  }, []);

  const onResizeEnd = useCallback(() => {
    const start = resizeStartRef.current;
    resizeStartRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", onResizeEnd);
    // Commit the LIVE width captured during the drag, not the stale
    // closure value, so the sidebar stays where the user dropped it.
    if (start) commitInspectorWidth(latestWidthRef.current);
  }, [onResizeMove, commitInspectorWidth]);

  const startResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed) return;
    resizeStartRef.current = { x: e.clientX, w: latestWidthRef.current };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onResizeMove);
    window.addEventListener("pointerup", onResizeEnd);
  }, [collapsed, onResizeMove, onResizeEnd]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  /** Which token is being hovered in the controls panel — the Colours
   *  showcase rings matching elements so the user can see where each
   *  token is used. */
  const [peekToken, setPeekToken] = useState<string | null>(null);

  /** Which font is being hovered in the Fonts dropdown — the preview
   *  temporarily swaps to that font so the user sees it live before
   *  clicking to select. Cleared on mouse-leave or blur. */
  const [fontHover, setFontHover] = useState<FontHoverState>(null);

  /** Which gradient token is being edited in the Gradients panel — the
   *  preview renders only that gradient's specimen on the right. */
  const [gradientSelection, setGradientSelection] = useState<string | null>(null);

  /** Which shadow token is being edited in the Shadows panel — the preview
   *  renders only the specimen that uses it (one card, one modal, etc.). */
  const [shadowSelection, setShadowSelection] = useState<string | null>(null);

  /** Which category is open on the Colours step; the preview spotlights
   *  only the components that read that category's tokens. */
  const [colourCategory, setColourCategory] = useState<ColourCategory | null>(null);

  /** Which category is open on the Hover step; the preview shows only
   *  the components whose hover behaviour reads those tokens. */
  const [hoverCategory, setHoverCategory] = useState<HoverCategory | null>(null);

  /** Current Export bundle: computed by ExportPanel from its scope +
   *  contents options, consumed by ExportShowcase on the right side. */
  const [exportBundle, setExportBundle] = useState<ExportBundle | null>(null);

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
      // Preview defaults to Light; the kit's dark toggle in the top bar
      // controls the chrome, not the preview. Base defaults to Default
      // too — the user picks Frosted / Flat on the Glass step.
      const working = loadWorking();
      // Themes saved before the Export rework kept the preset's own name
      // ("Rime Default" / "Rime Flat") as a placeholder. Migrate those to
      // the new brand-aware default so the Export step reads as unnamed
      // until the user actually types one.
      const migrateName = (t: StudioTheme): string => {
        const legacy = PRESETS.some((p) => p.name === t.name);
        return legacy ? defaultThemeName(t.base, t.brand) : t.name;
      };
      const start: StudioTheme = working
        ? { ...working, base: working.base ?? "default", mode: working.mode ?? "light", name: migrateName(working) }
        : presetTheme("default", "light");
      themeRef.current = start;
      setTheme(start);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // The preview is now fully isolated from the kit's top bar. Preset and
  // mode changes on <html> flow into the chrome via chromePreset /
  // chromeMode state above; the preview reads theme.base / theme.mode
  // which only the Studio's own controls change (Frosted / Flat on the
  // Glass step; mode toggle lives in the chrome, not yet in the preview).

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

  // The kit's top-bar + chrome tracks whatever `<html>` says (Default
  // / Flat and Light / Dark). The preview tracks the Studio's own
  // theme.base / theme.mode. Keeping these two separate lets the top
  // bar control the site (and the Studio chrome) without reaching into
  // the preview, and the Glass step's Frosted / Flat toggle to control
  // the preview without flipping the site.
  const [chromePreset, setChromePreset] = useState<Preset>("default");
  const [chromeMode, setChromeMode] = useState<Mode>("light");
  useEffect(() => {
    const read = () => {
      setChromePreset(baseOfDocument());
      setChromeMode(modeOfDocument());
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode", "class"] });
    return () => mo.disconnect();
  }, []);

  // `base` is the preview's base: tokens for the Studio's chosen preset
  // + mode. Drives previewCss (the preview reads these) and the Studio's
  // internal comparisons (changed, reset, etc.).
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
      // "Changed" means "different from the user's intended baseline".
      // If a logo-palette baseline has been snapshotted for this token,
      // the baseline wins; otherwise the preset's own value is the
      // baseline. So a token sitting at exactly the applied-palette
      // colour reads as "not changed" and the reset chip hides.
      changed: (name) => {
        if (!(name in active)) return false;
        const baseline = view.baseline?.[name];
        const expected = baseline ?? base.get(name);
        return active[name] !== expected;
      },
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
          // When the user applied a logo-derived palette on step 1, we
          // snapshot the resulting token values into theme.baseline.
          // "Reset" then means "back to the baseline the palette set"
          // for anything the palette touched, and falls back to the
          // Rime Default preset for everything else — matching the
          // user's mental model that reset should undo their tweak,
          // not their palette.
          const baseline = t.baseline;
          for (const n of names) {
            const isDarkTarget = t.mode === "dark" && perMode(n, overrides[n] ?? base.get(n));
            if (baseline && n in baseline) {
              const v = baseline[n];
              if (isDarkTarget) overridesDark[n] = v;
              else overrides[n] = v;
            } else {
              if (isDarkTarget) delete overridesDark[n];
              else delete overrides[n];
            }
          }
          const c = { ...t.controls };
          for (const k of controls ?? []) delete c[k];
          return { ...t, overrides, overridesDark, controls: c };
        }),
      setControls: (controls) => commit((t) => ({ ...t, controls: { ...t.controls, ...controls } })),
      setLogo: (logo) => commit((t) => ({ ...t, logo })),
      setBrand: (name) =>
        commit((t) => {
          // Keep whatever the user is typing — including a trailing space
          // before the second word. Only strip to undefined when the field
          // is wholly empty so brandNames() falls back to Acme.
          const nextBrand = name.length === 0 ? undefined : name.slice(0, 60);
          // When the theme name is still the default we were showing (the
          // preset's name, or an older "<prev brand> Rime"), slide the
          // default forward to track the new brand. A theme name the user
          // typed themselves is left alone.
          const wasDefault = t.name === defaultThemeName(t.base, t.brand);
          return {
            ...t,
            brand: nextBrand,
            name: wasDefault ? defaultThemeName(t.base, nextBrand) : t.name,
          };
        }),
      setBase: (next) =>
        commit((t) => ({
          ...t,
          base: next,
          // Rename the theme to the new preset's default only when the
          // user hadn't typed one themselves.
          name: t.name === defaultThemeName(t.base, t.brand) ? defaultThemeName(next, t.brand) : t.name,
        })),
      setName: (name) => commit((t) => ({ ...t, name: name.slice(0, 60) })),
      setBaseline: (overrides) =>
        commit((t) => ({
          ...t,
          baseline: { ...(t.baseline ?? {}), ...overrides },
        })),
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

  // `chromeBase` tracks the kit's own preset + mode (whatever the
  // top-bar is set to). The chrome inherits those tokens, so clicking
  // Flat up top makes the Studio shell itself look Flat (matching the
  // rest of the kit site), while the preview stays on whatever
  // theme.base the user picked.
  const chromeBase = useMemo(
    () => (sources ? baseTokens(sources, chromePreset, chromeMode) : base),
    [sources, chromePreset, chromeMode, base],
  );
  const css = previewCss(theme, active, base);
  const pin = pinCss(active, chromeBase, theme);

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

  // Brand palette for the ColorPicker's quick-pick swatches. Derived from
  // the resolved stylesheet so it tracks any override the user applies on
  // the Brand/Colour panels. Four slots: Brand, Deep, Accent, Neutral.
  // Converted through parseColour → toHex to normalise rgb(a,b,c) strings
  // into #rrggbb hex, so clicking a swatch writes a hex the ColorPicker
  // can round-trip without the parser rejecting a non-literal form.
  const brandPalette: BrandPalette | null = useMemo(() => {
    const toHexSafe = (expr: string | undefined) => {
      if (!expr) return null;
      const c = parseColour(expr);
      return c ? toHex(c) : null;
    };
    const brand = toHexSafe(resolvedMap["--brand"]);
    const deep = toHexSafe(resolvedMap["--brand-deep"]);
    const accent = toHexSafe(resolvedMap["--brand-soft"]);
    const neutral = toHexSafe(resolvedMap["--support"]);
    if (!brand || !deep || !accent || !neutral) return null;
    return { brand, deep, accent, neutral };
  }, [resolvedMap]);

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
    // Reflect the current step in the URL hash so a reload / shared
    // link lands on the same page instead of snapping back to Logo.
    if (typeof window !== "undefined") {
      const nextHash = `#${id}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    }
  };

  // On mount: read the URL hash and jump to that step. On back / forward:
  // sync the section to whatever the browser is showing. Uses the
  // setState callback form so the hashchange listener always compares
  // against the current section without needing a dep on `section`
  // (which would re-wire the listener on every step change).
  useEffect(() => {
    const sectionIds = new Set<string>(ALL.map((s) => s.id));
    const sectionFromHash = (): Section | null => {
      if (typeof window === "undefined") return null;
      const slug = window.location.hash.replace(/^#/, "");
      return sectionIds.has(slug) ? (slug as Section) : null;
    };
    const initial = sectionFromHash();
    if (initial) setSection(initial);
    const onHash = () => {
      const next = sectionFromHash();
      if (next) setSection((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className={cx(styles.studio, fontClasses)}>
      {css ? <style>{css}</style> : null}
      {pin ? <style>{pin}</style> : null}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {status}
      </p>

      {/* Pin the kit's top bar to the base preset: the theme being edited
          should NEVER paint the chrome around the preview, only the
          preview itself. The DocsTopBar wrapper carries data-studio-panel
          so pinCss re-declares every base token on it, blocking the
          edited theme from leaking into the kit's own navigation. */}
      <div data-studio-panel="">
        <DocsTopBar key={barKey} current="studio" />
      </div>

      <div
        className={cx(styles.workspace, collapsed && styles.workspaceCollapsed)}
        style={{ ["--inspector-w" as string]: `${inspectorWidth}px` }}
        data-rail-only={inspectorWidth < INSPECTOR_RAIL_PX ? "" : undefined}
      >
        <div className={styles.inspector} data-studio-panel="">
        <nav className={styles.sectionNav} aria-label="Theme steps" data-studio-panel="">
          <p className={styles.stepperLabel}>
            Step {Math.max(1, STEPS.findIndex((s) => s.id === section) + 1)} of {STEPS.length}
          </p>
          <ol className={styles.stepperList}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = section === s.id;
              const stepsIndex = STEPS.findIndex((x) => x.id === section);
              const isDone = stepsIndex > i;
              return (
                <li key={s.id} className={styles.stepperItem}>
                  <button
                    type="button"
                    className={cx(styles.stepperLink, isActive && styles.stepperLinkActive, isDone && styles.stepperLinkDone)}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => choose(s.id)}
                  >
                    <span className={styles.stepperNumber} aria-hidden="true">
                      {isDone ? "✓" : i + 1}
                    </span>
                    <Icon className={styles.stepperIcon} size={14} aria-hidden="true" />
                    <span className={styles.stepperLabelInline}>{s.label}</span>
                    {s.id === "contrast" && failing ? <CountBadge count={failing} tone="danger" label={`${failing} failing`} /> : null}
                  </button>
                </li>
              );
            })}
          </ol>

          <details className={styles.advanced}>
            <summary className={styles.advancedSummary}>Advanced</summary>
            <ol className={styles.stepperList}>
              {ADVANCED.map((s) => {
                const Icon = s.icon;
                const isActive = section === s.id;
                return (
                  <li key={s.id} className={styles.stepperItem}>
                    <button
                      type="button"
                      className={cx(styles.stepperLink, isActive && styles.stepperLinkActive)}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => choose(s.id)}
                    >
                      <Icon className={styles.stepperIcon} size={14} aria-hidden="true" />
                      <span className={styles.stepperLabelInline}>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </details>
        </nav>

        <aside className={styles.panel} aria-label="Theme controls" data-studio-panel="">
          {/* The Save / open-saved / undo-redo toolbar used to sit above
              every step and now never renders inline — autosave handles
              working-state persistence (storeWorking fires on every
              commit), Export's own panel owns the Theme name field,
              and Import still works through the hidden file input
              below (triggered from Advanced if we ever surface it).
              Keeping the toolbar gone means the Export step opens
              directly on "Theme name", not on three stacked chrome
              rows that doubled up on the field below. */}
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

          <div ref={bodyRef} className={styles.panelBody} role="region" aria-labelledby="studio-section-title" tabIndex={-1}>
            {/* The section header (h2 + lede) is intentionally gone from
                every step. The stepper on the left already shows which
                step the user is on, every group below carries its own
                title + help, and the lede was mostly restating the
                step name. Removing it reclaims ~50 px of vertical
                space at the top of every panel. */}
            {storageWarning ? <Notice tone="warn">{storageWarning}</Notice> : null}
            <PeekProvider onPeek={setPeekToken}>
            <FontHoverProvider onHover={setFontHover}>
            <GradientSelectionProvider onSelect={setGradientSelection}>
            <ShadowSelectionProvider onSelect={setShadowSelection}>
            <ColourCategoryProvider onSelect={setColourCategory}>
            <HoverCategoryProvider onSelect={setHoverCategory}>
            <ExportBundleProvider bundle={exportBundle}>
            <ExportBundleSetterProvider onSet={setExportBundle}>
            <BrandPaletteProvider palette={brandPalette}>
            {!sources ? (
              <p className={styles.empty}>Reading the presets from the stylesheets…</p>
            ) : section === "brand" ? (
              <LogoPanel api={api} />
            ) : section === "colour" ? (
              <ColoursPanel api={api} />
            ) : section === "type" ? (
              <TypePanel api={api} />
            ) : section === "image" ? (
              <ImagePanel api={api} />
            ) : section === "shape" ? (
              <ShapePanel api={api} />
            ) : section === "gradients" ? (
              <GradientPanel api={api} resolveColour={resolveColour} />
            ) : section === "background" ? (
              <BackgroundPanel api={api} resolveColour={resolveColour} />
            ) : section === "glass" ? (
              <GlassTab api={api} />
            ) : section === "shadows" ? (
              <ShadowPanel api={api} />
            ) : section === "hover" ? (
              <HoverPanel api={api} />
            ) : section === "layout" ? (
              <LayoutPanel api={api} resolveColour={resolveColour} />
            ) : section === "components" ? (
              <ComponentsPanel api={api} resolveExpr={resolveExpr} />
            ) : section === "tokens" ? (
              <TokensPanel api={api} />
            ) : section === "contrast" ? (
              <ContrastPanel api={api} results={results} />
            ) : (
              <ExportPanel api={api} sources={sources} />
            )}
            </BrandPaletteProvider>
            </ExportBundleSetterProvider>
            </ExportBundleProvider>
            </HoverCategoryProvider>
            </ColourCategoryProvider>
            </ShadowSelectionProvider>
            </GradientSelectionProvider>
            </FontHoverProvider>
            </PeekProvider>
          </div>

          {/* Walkthrough footer: previous / next buttons for the ordered
              steps. Advanced sections (image, components, tokens) are not in
              the sequence and don't change the footer labels. */}
          {STEPS.some((s) => s.id === section) ? (
            <div className={styles.panelFoot}>
              {(() => {
                const idx = STEPS.findIndex((s) => s.id === section);
                const prev = idx > 0 ? STEPS[idx - 1] : null;
                const next = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
                return (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconStart={<ChevronLeft size={14} aria-hidden="true" />}
                      disabled={!prev}
                      onClick={() => prev && choose(prev.id)}
                    >
                      {prev ? prev.label : "Previous"}
                    </Button>
                    <span className={styles.stepperLabel}>
                      Step {idx + 1} of {STEPS.length}
                    </span>
                    <Button
                      size="sm"
                      iconEnd={<ChevronRight size={14} aria-hidden="true" />}
                      disabled={!next}
                      onClick={() => next && choose(next.id)}
                    >
                      {next ? next.label : "Done"}
                    </Button>
                  </>
                );
              })()}
            </div>
          ) : null}
        </aside>

        </div>
        {/* Resize handle between the inspector and the preview, with a
            grip glyph in the middle. Drag to resize. The chevron collapses
            the inspector to zero so the preview fills the screen; a click
            again brings it back. */}
        <div
          className={styles.handle}
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize inspector"
          data-studio-panel=""
        >
          <button
            type="button"
            className={styles.handleCollapse}
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand inspector" : "Collapse inspector"}
            aria-expanded={!collapsed}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {collapsed ? <ChevronRight size={13} aria-hidden="true" /> : <ChevronLeft size={13} aria-hidden="true" />}
          </button>
          <span className={styles.handleGrip} aria-hidden="true">
            <GripVertical size={14} />
          </span>
        </div>

        <section className={styles.preview} aria-label="Live preview">
          <div
            className={styles.previewScroll}
            data-theme-studio=""
            // Font-hover live preview: hovering a font in the picker sets
            // --font-body or --font-display inline so the type specimen on
            // the right swaps immediately. Inline style wins over the
            // theme CSS <style> tag so no !important needed.
            style={
              fontHover
                ? {
                    [fontHover.slot === "body" ? "--font-body" : "--font-display"]:
                      fontHover.family,
                  } as React.CSSProperties
                : undefined
            }
          >
            <span ref={probeRef} aria-hidden="true" className={styles.srOnly} />
            <ThemePreview brand={theme.brand} logoSrc={theme.logo?.src} logoAlt={theme.logo?.alt} logoCorner={logoCornerOf(api)} layout={layoutOf(api)} focus={current.previewFocus} peekToken={peekToken} gradientSelection={gradientSelection} shadowSelection={shadowSelection} colourCategory={colourCategory} hoverCategory={hoverCategory} />
          </div>
        </section>
      </div>
    </div>
  );
}
