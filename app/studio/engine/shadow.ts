import { splitTop } from "./gradient";

// Shadows as parameters: a direction (angle the light comes from), a
// distance, blur, spread, a tinted colour, and one to three layers (a tight
// contact shadow under a wide fall, plus an optional top shade). Also the
// global "depth" knob: every alpha in a shadow token scaled by one factor.

export type ShadowParams = {
  /** Degrees the shadow falls toward: 180 = straight down. */
  angle: number;
  distance: number;
  blur: number;
  spread: number;
  /** A channel token (--rgb-brand-deep) or "r, g, b". */
  channel: string;
  opacity: number;
  /** 1 = the fall only; 2 = fall plus contact; 3 = shade above too. */
  layers: 1 | 2 | 3;
  /** Keep the white top inner light line (glass surfaces). */
  specular: boolean;
};

const r1 = (n: number) => Math.round(n * 10) / 10;
const px = (n: number) => (n === 0 ? "0" : `${r1(n)}px`);

const rgba = (channel: string, a: number) =>
  `rgba(${channel.startsWith("--") ? `var(${channel})` : channel}, ${Number(Math.max(0, Math.min(1, a)).toFixed(3))})`;

export function buildShadow(p: ShadowParams): string {
  const rad = ((p.angle - 90) * Math.PI) / 180;
  const dx = Math.cos(rad) * p.distance;
  const dy = Math.sin(rad) * p.distance;
  const parts: string[] = [];
  if (p.layers >= 3) parts.push(`${px(-dx * 0.4)} ${px(-dy * 0.4)} ${px(p.blur * 0.45)} ${px(-p.blur * 0.25)} ${rgba(p.channel, p.opacity * 0.55)}`);
  parts.push(`${px(dx)} ${px(dy)} ${px(p.blur)} ${px(p.spread)} ${rgba(p.channel, p.opacity)}`);
  if (p.layers >= 2) parts.push(`${px(dx * 0.15)} ${px(dy * 0.15 + 1)} ${px(Math.max(2, p.blur * 0.18))} ${px(-1)} ${rgba("--rgb-contact", Math.min(0.2, p.opacity * 0.45))}`);
  if (p.specular) parts.push(`inset 0 1px 0 ${rgba("--rgb-white", 0.9)}`);
  return parts.join(", ");
}

/** Best-effort parameters from an existing two-layer token, for the editor's starting point. */
export function guessParams(value: string): ShadowParams {
  const layers = splitTop(value).filter((l) => !l.startsWith("inset"));
  const lengthsOf = (layer: string) =>
    layer
      .replace(/(rgba?|hsla?|var)\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}\b|transparent/gi, " ")
      .trim()
      .split(/\s+/)
      .map((t) => parseFloat(t))
      .filter((n) => Number.isFinite(n));
  const alphaOfLayer = (layer: string) => Number(layer.match(/,\s*([\d.]+)\)\s*$/)?.[1] ?? 0);

  // Identify the FALL layer. The old implementation picked the layer
  // with the biggest blur, which broke the moment the user dropped
  // Softness to 0 — the contact layer's `Math.max(2, blur * 0.18)`
  // kept a blur of 2, so the contact got picked as "main" and the
  // Strength readout snapped to the contact's alpha (0.135). Instead,
  // exclude the contact layer by its channel (--rgb-contact) and
  // then pick the layer with the HIGHEST alpha: that's the fall,
  // because buildShadow writes alpha * 0.55 for the shade and the
  // raw alpha for the fall.
  const nonContact = layers.filter((l) => !/--rgb-contact/.test(l));
  const main =
    nonContact.sort((a, b) => alphaOfLayer(b) - alphaOfLayer(a))[0] ?? layers[0] ?? "";
  const [x = 0, y = 8, blur = 24, spread = 0] = lengthsOf(main);
  const alpha = Number(main.match(/,\s*([\d.]+)\)\s*$/)?.[1] ?? 0.16);
  const channel = main.match(/var\((--rgb-[\w-]+)\)/)?.[1] ?? "--rgb-brand-deep";
  const angle = Math.round((Math.atan2(y, x) * 180) / Math.PI + 90);
  return {
    angle: Number.isFinite(angle) ? angle : 180,
    distance: Math.round(Math.hypot(x, y)),
    blur,
    spread,
    channel,
    opacity: alpha,
    layers: (Math.min(3, Math.max(1, layers.length)) as 1 | 2 | 3),
    specular: /inset 0 1px 0/.test(value),
  };
}

/** Every rgba() alpha in a value scaled by k (clamped to 1). Hairline rings (1px, no blur) keep theirs. */
export function scaleAlphas(value: string, k: number): string {
  if (k === 1) return value;
  return splitTop(value)
    .map((layer) => {
      if (/^(inset\s+)?0 0 0 1px/.test(layer)) return layer;
      return layer.replace(/(rgba\((?:[^()]|\([^()]*\))*?,\s*)([\d.]+)\)/g, (_, head: string, a: string) => `${head}${Number(Math.min(1, Number(a) * k).toFixed(3))})`);
    })
    .join(", ");
}
