import { baseTokens, makePerMode, type Mode, type Preset, type Sources } from "./source";

// A studio theme is a preset (Rime Default or Rime Flat, read live from the
// CSS) in a mode (light or dark), plus overrides: token name to CSS value.
// Everything the studio's controls do ends up as overrides, so a theme is
// always explainable as "the preset, with these tokens changed", and its
// export is plain CSS.
//
// Overrides come in two maps. `overrides` holds the light-mode values and
// every shared token (radius, density, blur, fonts, motion: the same in both
// modes). `overridesDark` holds the dark-mode values of per-mode tokens
// (colours, channels, gradients, shadows). Editing in dark mode writes there.

export type { Mode, Preset };
/** @deprecated The preset; kept as the old name. */
export type Base = Preset;

export type StudioTheme = {
  version: 2;
  name: string;
  /** The preset: Rime Default or Rime Flat. */
  base: Preset;
  /** The mode being edited and previewed. */
  mode: Mode;
  /** Light-mode values and every shared token. Never holds the preset's own value. */
  overrides: Record<string, string>;
  /** Dark-mode values of per-mode tokens. */
  overridesDark: Record<string, string>;
  /** Another site's logo for the shell corner: a URL or a data URL (preview only). */
  logo: { src: string; alt: string } | null;
  /** The site's business name. Fills every "Acme Inc" placeholder in the
   *  live preview (workspace names, logo words, invoice rows, email domains)
   *  so the Studio stops reading as a generic demo once the user types it. */
  brand?: string;
  /** Control positions that are not tokens themselves (slider states, font ids). */
  controls: Record<string, number | string | boolean>;
};

export const PRESETS: ReadonlyArray<{ id: Preset; name: string; note: string }> = [
  { id: "default", name: "Rime Default", note: "tokens.css :root: neutral greys, the Frost accent, frosted glass." },
  { id: "flat", name: "Rime Flat", note: "The [data-theme=\"flat\"] layer: opaque surfaces, small radii, no blur, no glow." },
];

export const MODES: ReadonlyArray<{ id: Mode; name: string }> = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

export const presetName = (base: Preset) => PRESETS.find((p) => p.id === base)?.name ?? base;
export const modeName = (mode: Mode) => (mode === "dark" ? "Dark" : "Light");
/** "Rime Default, Dark". */
export const lookName = (base: Preset, mode: Mode) => `${presetName(base)}, ${modeName(mode)}`;

export function presetTheme(base: Preset, mode: Mode = "light"): StudioTheme {
  return { version: 2, name: presetName(base), base, mode, overrides: {}, overridesDark: {}, logo: null, controls: {} };
}

const PRESET_IDS: ReadonlyArray<string> = ["default", "flat"];

/**
 * The overrides in force for the theme's current mode: in light, the light
 * map; in dark, the shared tokens of the light map plus the dark map.
 */
export function activeOverrides(theme: StudioTheme, perMode: (name: string, value?: string) => boolean): Record<string, string> {
  if (theme.mode === "light") return theme.overrides;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme.overrides)) if (!perMode(k, v)) out[k] = v;
  return { ...out, ...theme.overridesDark };
}

/**
 * The preview scope. While the studio is mounted it sets data-theme on
 * <html> to the base preset, so the preset layer applies to the whole
 * document (portalled modals, menus and toasts included). The theme's
 * overrides then win with specificity (0,3,0), beating both :root (0,1,0)
 * and a preset layer's :root:has([data-theme]) (0,2,0); the second and
 * third selectors cover the preview wrapper and any themed subtree inside
 * it. Declared on the same elements as the composites, so --wash-hover and
 * friends recompute from an edited --rgb-brand. It exists only while the
 * studio is mounted: nothing reaches the docs.
 */
export const PREVIEW_SELECTOR = [
  ":root:root:has([data-theme-studio])",
  "[data-theme-studio][data-theme-studio]",
  "[data-theme-studio] [data-theme]",
].join(",\n");

const decls = (entries: Iterable<[string, string]>, indent = "  ") =>
  [...entries].map(([k, v]) => `${indent}${k}: ${v};`).join("\n");

const logoEntry = (theme: StudioTheme): Array<[string, string]> =>
  theme.logo?.src ? [["--shell-logo", `url("${theme.logo.src.replace(/"/g, "%22")}")`]] : [];

/** The light (and shared) overrides as a declaration list, logo included. */
export function overrideEntries(theme: StudioTheme): Array<[string, string]> {
  return [...Object.entries(theme.overrides), ...logoEntry(theme)];
}

/**
 * The preview: EVERY base token for the Studio's chosen preset + mode,
 * then the user's overrides on top. Writing the full base makes the
 * preview self-contained, so clicking the kit's top-bar Default / Flat
 * (which sets `data-theme` on `<html>`) can't leak the opposite preset
 * into the preview via inherited tokens. Light edits never leak into
 * dark because `active` already filters by the current mode.
 */
export function previewCss(theme: StudioTheme, active: Record<string, string>, baseTokens: ReadonlyMap<string, string>): string {
  // Order matters: base first, then overrides win within the same selector.
  const entries: Array<[string, string]> = [...baseTokens, ...Object.entries(active), ...logoEntry(theme)];
  return entries.length ? `${PREVIEW_SELECTOR} {\n${decls(entries)}\n}` : "";
}

/**
 * Pins the Studio's own control panel to the base preset, so it stays
 * readable whatever the edited theme does: every base token is re-declared
 * on [data-studio-panel] AND on every descendant inside it, so the edited
 * theme can't leak in via CSS inheritance from an ancestor like :root
 * (which the first arm of PREVIEW_SELECTOR writes to). Any token the
 * theme sets that the base does not declare (a component hook such as
 * --button-radius) is un-declared with "initial", so the components fall
 * back to their defaults inside the panel. Same for --shell-logo if the
 * user has uploaded one.
 *
 * The descendant selector is required because the preview CSS writes
 * tokens to :root. Inheritance normally picks the nearest ancestor, so
 * [data-studio-panel] on its own should be enough — but if any Studio
 * subtree has a direct declaration (CSS Module scoped class, or an
 * inline style) between the panel and the leaf, inheritance can snap
 * back to :root. Setting the pinned tokens on the subtree directly
 * means the Studio chrome can never see the edited values.
 */
export function pinCss(active: Record<string, string>, base: ReadonlyMap<string, string>, theme?: StudioTheme): string {
  const keys = Object.keys(active);
  const hasLogo = Boolean(theme?.logo?.src);
  if (!keys.length && !hasLogo) return "";
  if (!base.size) return "";
  const entries: Array<[string, string]> = [...base];
  for (const k of keys) if (!base.has(k)) entries.push([k, "initial"]);
  if (hasLogo && !base.has("--shell-logo")) entries.push(["--shell-logo", "initial"]);
  const block = decls(entries);
  return `[data-studio-panel][data-studio-panel],
[data-studio-panel][data-studio-panel] * {
${block}
}`;
}

export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "theme";

export type ExportOptions = {
  /** :root replaces the defaults site-wide; [data-theme] scopes it to a subtree. */
  scope: "root" | "data-theme";
  /** full = every token, ready to stand alone; overrides = only what differs, loaded after tokens.css. */
  content: "full" | "overrides";
};

/** theme.css: a comment header, the light block, the dark block, and (full) the reduced-motion block. */
export function exportCss(theme: StudioTheme, sources: Sources, opts: ExportOptions): string {
  const slug = slugify(theme.name);
  const light = opts.scope === "root" ? ":root" : `[data-theme="${slug}"]`;
  // Dark beats the light block by specificity on <html> (:root.dark is 0,2,0),
  // and .dark / [data-mode="dark"] cover a dark wrapper.
  const dark =
    opts.scope === "root"
      ? ':root.dark,\n:root[data-mode="dark"],\n.dark,\n[data-mode="dark"]'
      : `[data-theme="${slug}"].dark,\n[data-theme="${slug}"][data-mode="dark"],\n.dark [data-theme="${slug}"],\n[data-mode="dark"] [data-theme="${slug}"]`;
  const perMode = makePerMode(sources);
  const lightBase = baseTokens(sources, theme.base, "light");
  const darkBase = baseTokens(sources, theme.base, "dark");
  const overrides = overrideEntries(theme);
  // In dark, a per-mode light override must not leak: restate the dark
  // preset's own value unless the theme sets a dark one.
  const darkEntries = new Map<string, string>();
  for (const [k, v] of Object.entries(theme.overrides)) {
    if (perMode(k, v) && !(k in theme.overridesDark)) {
      const d = darkBase.get(k);
      if (d !== undefined) darkEntries.set(k, d);
    }
  }
  for (const [k, v] of Object.entries(theme.overridesDark)) darkEntries.set(k, v);
  const total = overrides.length + Object.keys(theme.overridesDark).length;
  const flatNote = theme.base === "flat" ? `, with data-theme="flat" on <html> for the ${presetName(theme.base)} preset` : "";
  const header = [
    `/* ${theme.name}: generated by Rime Studio (/studio). */`,
    `/* Base: ${presetName(theme.base)}, light and dark modes. ${total} token${total === 1 ? "" : "s"} changed (${Object.keys(theme.overridesDark).length} in dark). */`,
    opts.content === "overrides"
      ? `/* Load after app/styles/tokens.css${flatNote}. Dark mode: the .dark class or data-mode="dark" on <html>. */`
      : "/* Complete: every token the components read, light and dark. Load it instead of the base files, or after them. */",
    theme.controls.fontBodyName ? `/* Body font: ${theme.controls.fontBodyName}. Load it with next/font and keep the family name below. */` : "",
    theme.controls.fontDisplayName ? `/* Display font: ${theme.controls.fontDisplayName}. */` : "",
    `/* Layout: <SidebarShell layout="${theme.controls.layout === "rail" || theme.controls.layout === "header" ? theme.controls.layout : "sidebar"}" />. */`,
    theme.controls.logoCorner === "fill" ? "/* Logo corner: brand fill. Pass logoCorner=\"fill\" to SidebarShell; the colour is --logo-corner-bg. */" : "/* Logo corner: match glass (SidebarShell default). */",
    theme.logo ? "/* Logo: pass logoSrc to SidebarShell, or keep --shell-logo below (a data URL here is a preview; host the file). */" : "",
  ].filter(Boolean);

  if (opts.content === "overrides") {
    let css = `${header.join("\n")}\n\n/* Light (and every shared token) */\n${light} {\n${decls(overrides)}\n}\n`;
    if (darkEntries.size) css += `\n/* Dark mode */\n${dark} {\n${decls(darkEntries)}\n}\n`;
    // Loaded after tokens.css, a changed duration would outrank its
    // reduced-motion block (same specificity, later wins): restate it.
    const motion = [...sources.reducedMotion].filter(([k]) => overrides.some(([o]) => o === k));
    if (motion.length) css += `\n@media (prefers-reduced-motion: reduce) {\n  ${light} {\n${decls(motion, "    ")}\n  }\n}\n`;
    return css;
  }
  const fullLight = new Map(lightBase);
  for (const [k, v] of overrides) fullLight.set(k, v);
  const fullDark = new Map(darkBase);
  for (const [k, v] of Object.entries(theme.overrides)) if (!perMode(k, v)) fullDark.set(k, v);
  for (const [k, v] of Object.entries(theme.overridesDark)) fullDark.set(k, v);
  const darkDiff = [...fullDark].filter(([k, v]) => fullLight.get(k) !== v);
  let css = `${header.join("\n")}\n\n/* Light */\n${light} {\n${decls(fullLight)}\n}\n\n/* Dark mode */\n${dark} {\n${decls(darkDiff)}\n}\n`;
  if (sources.reducedMotion.size) {
    css += `\n@media (prefers-reduced-motion: reduce) {\n  ${light} {\n${decls(sources.reducedMotion, "    ")}\n  }\n}\n`;
  }
  return css;
}

export function exportJson(theme: StudioTheme): string {
  return JSON.stringify(theme, null, 2);
}

const cleanMap = (raw: unknown): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    // Only custom properties with plain values: nothing that could close the block.
    if (/^--[\w-]+$/.test(k) && typeof v === "string" && !/[{}<]/.test(v)) out[k] = v;
  }
  return out;
};

/**
 * Validates an imported theme.json; returns null when it is not one of ours.
 * Version 1 themes migrate: a "dark" base becomes Rime Default in dark mode,
 * its overrides the dark ones.
 */
export function parseThemeJson(text: string): StudioTheme | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown> & { logo?: { src?: unknown; alt?: unknown } | null; brand?: unknown };
    if (raw.version !== 1 && raw.version !== 2) return null;
    const legacyDark = raw.version === 1 && raw.base === "dark";
    const base = legacyDark ? "default" : (raw.base as string);
    if (!PRESET_IDS.includes(base)) return null;
    const mode: Mode = legacyDark || raw.mode === "dark" ? "dark" : "light";
    const logo =
      raw.logo && typeof raw.logo.src === "string" && /^(https?:|data:image\/|\/)/.test(raw.logo.src)
        ? { src: raw.logo.src, alt: String(raw.logo.alt ?? "") }
        : null;
    return {
      version: 2,
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 60) : "Imported theme",
      base: base as Preset,
      mode,
      overrides: legacyDark ? {} : cleanMap(raw.overrides),
      overridesDark: legacyDark ? cleanMap(raw.overrides) : cleanMap(raw.overridesDark),
      logo,
      brand: typeof raw.brand === "string" && raw.brand.trim() ? raw.brand.trim().slice(0, 60) : undefined,
      controls: typeof raw.controls === "object" && raw.controls ? (raw.controls as StudioTheme["controls"]) : {},
    };
  } catch {
    return null;
  }
}

// ── Saved themes (localStorage) ──────────────────────────────────────────

const STORE = "ui-kit-theme-studio-v1";

export function loadSaved(): StudioTheme[] {
  try {
    const raw = window.localStorage.getItem(STORE);
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown[];
    return Array.isArray(list) ? list.map((t) => parseThemeJson(JSON.stringify(t))).filter((t): t is StudioTheme => t !== null) : [];
  } catch {
    return [];
  }
}

/** False when storage is unavailable or full (a big logo data URL can fill it). */
export function storeSaved(list: StudioTheme[]): boolean {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

const WORKING = "ui-kit-theme-studio-working-v1";

export function loadWorking(): StudioTheme | null {
  try {
    const raw = window.localStorage.getItem(WORKING);
    return raw ? parseThemeJson(raw) : null;
  } catch {
    return null;
  }
}

export function storeWorking(theme: StudioTheme): void {
  try {
    window.localStorage.setItem(WORKING, JSON.stringify(theme));
  } catch {
    // Storage full or blocked: the working theme simply isn't restored next time.
  }
}
