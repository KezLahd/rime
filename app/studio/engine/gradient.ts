// Gradient values as data the studio can edit, and back to CSS. Parses what
// the tokens actually use: linear-gradient(angle, stops) and
// radial-gradient(ellipse W H at X Y, stops), layered with commas, ending in
// an optional base colour. Stop colours stay as written (var(--brand),
// rgba(var(--rgb-bloom-a), 0.55), #ece4fb), so an untouched stop keeps
// following the palette. Anything else is "unparsed" and edited as text.

export type Stop = { color: string; pos: number | null };

export type LinearLayer = { kind: "linear"; angle: number; stops: Stop[] };
export type RadialLayer = { kind: "radial"; w: number; h: number; x: number; y: number; stops: Stop[] };
export type ColourLayer = { kind: "colour"; color: string };
export type Layer = LinearLayer | RadialLayer | ColourLayer;

/** Splits on commas at paren depth 0. */
export function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Strips /* comments *\/ the source may carry inside a value. */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\s+/g, " ").trim();

function parseStop(s: string): Stop {
  // The position is the trailing "<n>%" outside any parentheses.
  const m = s.match(/^(.*\S)\s+(-?[\d.]+)%$/);
  if (m && !/\($/.test(m[1])) return { color: m[1].trim(), pos: Number(m[2]) };
  return { color: s.trim(), pos: null };
}

function parseLayer(s: string): Layer | null {
  const lin = s.match(/^linear-gradient\((.*)\)$/);
  if (lin) {
    const parts = splitTop(lin[1]);
    let angle = 180;
    const first = parts[0];
    const deg = first.match(/^(-?[\d.]+)deg$/);
    const to = first.match(/^to (.+)$/);
    if (deg) {
      angle = Number(deg[1]);
      parts.shift();
    } else if (to) {
      const dirs: Record<string, number> = { top: 0, right: 90, bottom: 180, left: 270, "top right": 45, "right top": 45, "bottom right": 135, "right bottom": 135, "bottom left": 225, "left bottom": 225, "top left": 315, "left top": 315 };
      const a = dirs[to[1].trim()];
      if (a === undefined) return null;
      angle = a;
      parts.shift();
    }
    return { kind: "linear", angle, stops: parts.map(parseStop) };
  }
  const rad = s.match(/^radial-gradient\((.*)\)$/);
  if (rad) {
    const parts = splitTop(rad[1]);
    const spec = parts[0].match(/^ellipse\s+(-?[\d.]+)%\s+(-?[\d.]+)%\s+at\s+(-?[\d.]+)%\s+(-?[\d.]+)%$/);
    if (!spec) return null;
    parts.shift();
    return { kind: "radial", w: Number(spec[1]), h: Number(spec[2]), x: Number(spec[3]), y: Number(spec[4]), stops: parts.map(parseStop) };
  }
  if (!/gradient\(/.test(s)) return { kind: "colour", color: s };
  return null;
}

/** Null when any layer is beyond the editor (a conic gradient, a radial with a shape keyword). */
export function parseGradient(value: string): Layer[] | null {
  const layers = splitTop(stripComments(value)).map(parseLayer);
  return layers.every((l): l is Layer => l !== null) ? layers : null;
}

const fmtStop = (s: Stop) => (s.pos === null ? s.color : `${s.color} ${round(s.pos)}%`);
const round = (n: number) => Math.round(n * 100) / 100;

export function serializeLayer(l: Layer): string {
  if (l.kind === "colour") return l.color;
  if (l.kind === "linear") return `linear-gradient(${round(l.angle)}deg, ${l.stops.map(fmtStop).join(", ")})`;
  return `radial-gradient(ellipse ${round(l.w)}% ${round(l.h)}% at ${round(l.x)}% ${round(l.y)}%, ${l.stops.map(fmtStop).join(", ")})`;
}

export const serializeGradient = (layers: Layer[]) => layers.map(serializeLayer).join(", ");

/** Stops with explicit positions: missing ones are spread evenly between their neighbours. */
export function positioned(stops: Stop[]): Array<{ color: string; pos: number }> {
  const out = stops.map((s) => ({ ...s }));
  if (out[0] && out[0].pos === null) out[0].pos = 0;
  if (out.length > 1 && out[out.length - 1].pos === null) out[out.length - 1].pos = 100;
  for (let i = 1; i < out.length - 1; i++) {
    if (out[i].pos !== null) continue;
    let j = i;
    while (out[j].pos === null) j++;
    const a = out[i - 1].pos as number;
    const b = out[j].pos as number;
    for (let k = i; k < j; k++) out[k].pos = a + ((b - a) * (k - i + 1)) / (j - i + 1);
    i = j;
  }
  return out.map((s) => ({ color: s.color, pos: s.pos ?? 0 }));
}

/**
 * Softness: how much of the length the colours spend blending. 1 keeps the
 * stops where they are (the full blend); 0 pulls every stop toward the
 * midpoint of its neighbours until the bands meet hard-edged.
 */
export function applySoftness(stops: Stop[], softness: number): Stop[] {
  const p = positioned(stops);
  if (p.length < 2) return stops;
  const first = p[0].pos;
  const last = p[p.length - 1].pos;
  const mid = (first + last) / 2;
  return p.map((s, i) => {
    // Interior stops hold their place; the end stops move in toward the
    // middle, so the band of change narrows around the centre.
    if (i !== 0 && i !== p.length - 1) return s;
    return { color: s.color, pos: mid + (s.pos - mid) * softness };
  });
}
