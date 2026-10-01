import { parseChannel, parseColour, toChannel, toCss, toHex, type Rgb } from "./colour";
import { scaleAlphas } from "./shadow";
import type { TokenSource } from "./source";

// One control, many tokens. Each macro takes the base tokens (the preset,
// read from the CSS) and returns the overrides it implies, so moving a
// slider back to its start returns exactly the preset's values.

export type Overrides = Record<string, string>;

/** Palette entries whose rgb channel must move with them. */
export const CHANNEL_OF: Record<string, string> = {
  "--brand-deep": "--rgb-brand-deep",
  "--brand": "--rgb-brand",
  "--support": "--rgb-support",
  "--brand-soft": "--rgb-brand-soft",
  "--danger-base": "--rgb-danger",
};

export function setColour(name: string, value: Rgb): Overrides {
  const out: Overrides = { [name]: name.startsWith("--rgb-") ? toChannel(value) : toCss(value) };
  const channel = CHANNEL_OF[name];
  if (channel) out[channel] = toChannel(value);
  return out;
}

/** The colour a token resolves to, for a picker: hex or channel; null for anything else. */
export function colourOf(value: string | undefined): Rgb | null {
  if (!value) return null;
  return parseColour(value) ?? parseChannel(value);
}

// ── Radius ────────────────────────────────────────────────────────────────

export const RADIUS_STEPS = ["--r-2xs", "--r-xs", "--r-sm", "--r-md", "--r-lg", "--r-xl", "--r-2xl"] as const;
/** The default scale: the shape a "roundness 1" theme gets, whatever its base. */
const RADIUS_PX = [4, 6, 8, 10, 12, 16, 20];

/**
 * roundness 0 = square, 1 = the default scale, 2 = twice as soft. pill
 * turns buttons, fields and chips into pills on top of whatever scale.
 */
export function radiusScale(roundness: number, pill: boolean): Overrides {
  const out: Overrides = {};
  RADIUS_STEPS.forEach((n, i) => (out[n] = `${Math.round(RADIUS_PX[i] * roundness)}px`));
  if (roundness === 0) {
    out["--r-full"] = "0";
    out["--r-flat"] = "0";
    out["--r-circle"] = "0";
  } else {
    out["--r-full"] = "999px";
    // The flat layer pins these at 0; "initial" un-declares them, so each
    // component's own fallback radius comes back.
    out["--r-flat"] = "initial";
    out["--r-circle"] = "initial";
  }
  if (pill) {
    for (const n of ["--button-radius", "--input-radius", "--chip-radius", "--icon-button-radius", "--segmented-radius"]) out[n] = "999px";
  }
  return out;
}

// ── Size ──────────────────────────────────────────────────────────────────

const CONTROL_H: Record<string, number> = {
  "--control-h-sm": 32,
  "--control-h-md": 40,
  "--control-h-lg": 48,
  "--field-h-sm": 36,
  "--field-h-md": 44,
};

export function controlHeights(scale: number): Overrides {
  const out: Overrides = {};
  for (const [n, v] of Object.entries(CONTROL_H)) out[n] = `${Math.round(v * scale)}px`;
  return out;
}

// ── Depth ─────────────────────────────────────────────────────────────────

const SHADOW_TOKENS = [
  "--shadow-hairline-card",
  "--shadow-control",
  "--shadow-recess",
  "--shadow-input",
  "--shadow-panel-light",
  "--shadow-panel",
  "--shadow-float",
  "--shadow-lift",
  "--shadow-menu",
  "--popover-shadow",
  "--modal-shadow",
  "--shadow-chrome",
  "--shadow-chrome-open",
  "--shadow-auth-card",
  "--glow-sm",
  "--glow-md",
  "--glow-md-hover",
  "--glow-lg",
  "--glow-danger",
  "--glow-danger-hover",
  "--glow-success",
];

/** Every shadow and glow token's alphas scaled from the base: 0 is flat, 1 the preset, 2 twice as deep. */
export function shadowDepth(base: TokenSource, k: number): Overrides {
  const out: Overrides = {};
  for (const n of SHADOW_TOKENS) {
    const v = base.get(n);
    if (v) out[n] = scaleAlphas(v, k);
  }
  return out;
}

// ── Glass ─────────────────────────────────────────────────────────────────

export type GlassSurface = {
  id: string;
  label: string;
  fills: string[];
  blur?: string;
  edge?: string;
};

export const GLASS_SURFACES: ReadonlyArray<GlassSurface> = [
  { id: "panels", label: "Panels", fills: ["--glass-fill", "--glass-fill-light", "--glass-fill-nested"], blur: "--blur-panel", edge: "--glass-edge" },
  { id: "sidebar", label: "Sidebar", fills: ["--chrome-sidebar"], blur: "--blur-chrome" },
  { id: "topbar", label: "Top bar", fills: ["--chrome-topbar", "--glass-fill-chrome"] },
  { id: "modals", label: "Modals", fills: ["--modal-surface"], blur: "--modal-blur" },
  { id: "popovers", label: "Menus and dropdowns", fills: ["--popover-surface"], blur: "--popover-blur", edge: "--popover-border" },
  { id: "toasts", label: "Toasts", fills: ["--toast-surface"], blur: "--toast-blur" },
];

export type GlassParams = { tint: Rgb; opacity: number; blur: number; saturate: number };

export function glassSurface(s: GlassSurface, p: GlassParams): Overrides {
  const out: Overrides = {};
  const fill = toCss({ ...p.tint, a: p.opacity });
  s.fills.forEach((f, i) => {
    // The light and nested panel fills keep their offsets from the main one.
    const delta = s.id === "panels" ? [0, -0.06, 0.08][i] : 0;
    out[f] = toCss({ ...p.tint, a: Math.max(0, Math.min(1, p.opacity + delta)) });
  });
  if (s.id === "topbar") out["--glass-fill-chrome"] = fill;
  if (s.blur) {
    const filter = p.blur === 0 && p.saturate === 100 ? "none" : `blur(${p.blur}px) saturate(${p.saturate}%)`;
    out[s.blur] = filter;
    if (s.id === "panels") {
      out["--blur-panel-light"] = p.blur === 0 ? "none" : `blur(${Math.round(p.blur * 0.62)}px)`;
      out["--blur-row"] = p.blur === 0 ? "none" : `blur(${Math.round(p.blur * 0.38)}px)`;
    }
  }
  return out;
}

/** Glass off: every frosted surface solid, every blur none. */
export function glassOff(solid = "#ffffff"): Overrides {
  const out: Overrides = {};
  for (const s of GLASS_SURFACES) for (const f of s.fills) out[f] = solid;
  for (const b of ["--blur-chrome", "--blur-panel", "--blur-panel-light", "--blur-pill", "--blur-row", "--blur-callout", "--blur-recess", "--popover-blur", "--modal-blur", "--toast-blur", "--modal-scrim-blur"]) out[b] = "none";
  out["--chrome-backdrop"] = "none";
  out["--button-secondary-bg"] = solid;
  return out;
}

/** "rgba(255, 255, 255, 0.42)" → tint and opacity, for the glass editor's start. */
export function readGlass(fill: string | undefined): { tint: Rgb; opacity: number } {
  const c = colourOf(fill) ?? { r: 255, g: 255, b: 255, a: 0.42 };
  return { tint: { ...c, a: 1 }, opacity: Number(c.a.toFixed(2)) };
}

export function readBlur(filter: string | undefined): { blur: number; saturate: number } {
  if (!filter || filter === "none") return { blur: 0, saturate: 100 };
  return {
    blur: Number(filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? 0),
    saturate: Number(filter.match(/saturate\(([\d.]+)%\)/)?.[1] ?? 100),
  };
}

export const hexOf = (c: Rgb | null) => (c ? toHex(c) : "#000000");
