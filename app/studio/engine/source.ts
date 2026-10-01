// The presets and modes, read straight from the loaded stylesheets. A theme
// is a preset (Rime Default or Rime Flat) in a mode (light or dark), and
// tokens.css declares four layers:
//
// - default:  :root
// - flat:     [data-theme="flat"] (and its :root:has() form)
// - dark:     [data-mode="dark"], .dark (and the legacy [data-theme="dark"])
// - flatDark: Flat in dark mode, declared after both
//
// Read as the author wrote them (var() references intact), so a preset is
// exactly the CSS it came from and an export keeps the relationships
// (--wash-hover stays rgba(var(--rgb-brand), 0.05)).

export type TokenSource = Map<string, string>;
export type Preset = "default" | "flat";
export type Mode = "light" | "dark";
export type LayerId = "default" | "flat" | "dark" | "flatDark";
export type Sources = { default: TokenSource; flat: TokenSource; dark: TokenSource; flatDark: TokenSource; reducedMotion: TokenSource };

/** One selector of a list, classified; null when it is somebody else's rule. */
function layerOf(part: string): LayerId | null {
  const p = part.trim();
  if (p === ":root") return "default";
  const flat = p.includes('data-theme="flat"');
  const dark = p.includes('data-mode="dark"') || /\.dark\b/.test(p) || p.includes('data-theme="dark"');
  // A class other than .dark means a component's own rule, not a token layer.
  if (p.replace(/\.dark\b/g, "").includes(".")) return null;
  if (flat && dark) return "flatDark";
  if (flat) return "flat";
  if (dark) return "dark";
  return null;
}

/** The layer a rule belongs to: every selector in its list must agree. */
function ruleLayer(selectorText: string): LayerId | null {
  const parts = selectorText.replace(/\s+/g, " ").split(",");
  const layers = new Set(parts.map(layerOf));
  if (layers.size !== 1) return null;
  return [...layers][0];
}

function collect(rules: CSSRuleList, out: Sources, inReducedMotion: boolean) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSMediaRule) {
      collect(rule.cssRules, out, inReducedMotion || /prefers-reduced-motion/.test(rule.conditionText));
      continue;
    }
    if (!(rule instanceof CSSStyleRule)) continue;
    const layer = ruleLayer(rule.selectorText);
    if (!layer) continue;
    const target = layer === "default" && inReducedMotion ? out.reducedMotion : out[layer];
    const style = rule.style;
    for (let i = 0; i < style.length; i++) {
      const name = style[i];
      if (name.startsWith("--")) target.set(name, style.getPropertyValue(name).trim());
    }
  }
}

export function readSources(): Sources {
  const out: Sources = { default: new Map(), flat: new Map(), dark: new Map(), flatDark: new Map(), reducedMotion: new Map() };
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // a cross-origin sheet; ours are same-origin
    }
    collect(rules, out, false);
  }
  return out;
}

/** The full token set a preset in a mode starts from: default, then flat, then dark, then flat-dark. */
export function baseTokens(sources: Sources, preset: Preset, mode: Mode = "light"): TokenSource {
  const merged = new Map(sources.default);
  const lay = (src: TokenSource) => {
    for (const [k, v] of src) merged.set(k, v);
  };
  if (preset === "flat") lay(sources.flat);
  if (mode === "dark") lay(sources.dark);
  if (preset === "flat" && mode === "dark") lay(sources.flatDark);
  return merged;
}

const MODAL_KINDS = /^(#|rgba?\(|hsla?\(|oklch\(|transparent$|linear-gradient|radial-gradient|conic-gradient)/;

/**
 * Whether a token is per-mode: dark mode repaints it (the dark layers
 * declare it), or it is a colour, a channel, a gradient or a shadow. Those
 * are edited separately for light and dark; everything else (radius,
 * density, blur, fonts, motion) is shared by both modes.
 */
export function makePerMode(sources: Sources): (name: string, value?: string) => boolean {
  return (name, value = "") => {
    if (sources.dark.has(name) || sources.flatDark.has(name)) return true;
    if (/^--rgb-/.test(name)) return true;
    if (/shadow|glow|ring|halo/.test(name) && /\d+px/.test(value)) return true;
    return MODAL_KINDS.test(value.trim());
  };
}
