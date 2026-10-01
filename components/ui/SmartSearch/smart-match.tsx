import type { ReactNode } from "react";

/*
 * Record matching for SmartSearch, taken from the search boxes of a
 * production records dashboard, so a list finds things the way people
 * already expect:
 *
 *  - the query splits on spaces and every word has to be found, in any order
 *    and in any field, so "cooper north" finds Jane Cooper at North Office;
 *  - case, spaces and punctuation are ignored, so "inv0007", "INV 0007" and
 *    "inv-0007" all find INV-0007, and "14.03.1988" finds 14/03/1988;
 *  - prefixed codes also match without their leading zeros
 *    (prefixedIdVariants).
 *
 * SearchField/match.tsx stays the plain-substring version for option lists,
 * where "St." should not match "St Kilda". A server search should apply
 * the same rules so the highlight marks what actually matched.
 */

/** Lower case, letters and digits only. */
export function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** The query's words, normalised. Empty when there is nothing to match. */
export function smartTokens(query: string): string[] {
  return query.trim().split(/\s+/).map(normalise).filter(Boolean);
}

/** True when every token appears in at least one field. */
export function smartMatches(tokens: ReadonlyArray<string>, ...fields: Array<string | null | undefined>): boolean {
  if (tokens.length === 0) return true;
  const hay = fields.filter((f): f is string => Boolean(f)).map(normalise);
  return tokens.every((t) => hay.some((h) => h.includes(t)));
}

/**
 * The other ways a prefixed code gets typed. "ACC0001234567" already
 * contains "0001234567" and "1234567"; this adds "ACC1234567" (zeros
 * dropped, prefix kept), which people type from memory.
 */
export function prefixedIdVariants(code: string): string[] {
  const prefix = code.slice(0, 3);
  const digits = code.slice(3);
  const stripped = digits.replace(/^0+/, "");
  return [code, `${prefix}${stripped}`];
}

/**
 * The text with every token marked. Matching runs on the normalised text and
 * maps back, so a mark can span the punctuation it skipped: "inv-0007" marks
 * all of "INV-0007", "oconnor" all of "O'Connor". Overlaps merge.
 */
export function highlightTokens(text: string, tokens: ReadonlyArray<string>, markClassName: string): ReactNode {
  if (tokens.length === 0 || !text) return text;

  let flat = "";
  const origin: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i].toLowerCase();
    if (/[a-z0-9]/.test(c)) {
      flat += c;
      origin.push(i);
    }
  }

  const hits: Array<[number, number]> = [];
  for (const t of tokens) {
    let from = 0;
    while (from <= flat.length - t.length) {
      const at = flat.indexOf(t, from);
      if (at === -1) break;
      hits.push([origin[at], origin[at + t.length - 1] + 1]);
      from = at + t.length;
    }
  }
  if (hits.length === 0) return text;

  hits.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [s, e] of hits) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  const out: ReactNode[] = [];
  let cursor = 0;
  merged.forEach(([s, e], i) => {
    if (s > cursor) out.push(text.slice(cursor, s));
    out.push(
      <mark key={i} className={markClassName}>
        {text.slice(s, e)}
      </mark>,
    );
    cursor = e;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
