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
