// Fixed-format codes with a set prefix: "INV" then six digits, "ACC" then
// eight. Pure helpers, no React, so server code can import them.

export type PrefixedFormat = {
  /** The fixed segment shown in the box and never typed: "INV". */
  prefix: string;
  /** How many characters follow it. */
  length: number;
  /** digits = 0-9 only (the default). alphanumeric = A-Z and 0-9, upper-cased. */
  charset?: "digits" | "alphanumeric";
};

/**
 * One choice in a multi-prefix PrefixedInput. Each option carries its own
 * length so a +61 mobile (9 digits) and a 1300 (6 digits) can live in the
 * same field. `label` is the display name in the dropdown; the trigger
 * always shows `value`.
 */
export type PrefixedOption = {
  value: string;
  label?: string;
  length: number;
  charset?: "digits" | "alphanumeric";
};

/** Match the longest prefix option against raw text; used when pasting a
 *  full code so pasting "+61400112233" picks +61 over nothing. */
export function matchPrefixOption(raw: string, options: ReadonlyArray<PrefixedOption>): PrefixedOption | null {
  const text = raw.trim();
  // Sort by prefix length descending so "1300" beats "13" when both match.
  const ranked = options.slice().sort((a, b) => b.value.length - a.value.length);
  for (const o of ranked) {
    if (text.toLowerCase().startsWith(o.value.toLowerCase())) return o;
  }
  return null;
}

const escapePrefix = (prefix: string) => prefix.replace(/[^a-z0-9]/gi, "");

/**
 * The part after the prefix. Accepts whatever gets typed, pasted or
 * autofilled ("INV-004213", "inv 004 213", "004213") and keeps at most
 * `length` characters.
 */
export function codeBodyFrom(raw: string, f: PrefixedFormat): string {
  const p = escapePrefix(f.prefix);
  const lead = p ? new RegExp(`^\\s*${p}[\\s-]*`, "i") : /^\s*/;
  const body = raw.replace(lead, "").replace(f.charset === "alphanumeric" ? /[^a-z0-9]/gi : /\D/g, "");
  return (f.charset === "alphanumeric" ? body.toUpperCase() : body).slice(0, f.length);
}

/** "004213" → "INV004213". An empty body gives "", never a bare prefix. */
export const toPrefixedCode = (body: string, f: PrefixedFormat) => (body ? `${f.prefix}${body}` : "");

export const isCompleteCode = (value: string, f: PrefixedFormat) => codeBodyFrom(value, f).length === f.length;
