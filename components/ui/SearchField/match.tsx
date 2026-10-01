import type { ReactNode } from "react";

/*
 * Plain substring matching for short, known lists (select options, pages in
 * the nav search). Every word of the query has to appear somewhere in the
 * haystack, in any order, so "derm syd" finds "Sydney Dermatology". No fuzzy
 * scoring: with lists this size a predictable filter beats a clever one.
 */

/** Lower-cased words of a query, empty when there is nothing to filter by. */
export function queryWords(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** True when every query word appears in at least one of the texts. */
export function matchesQuery(words: ReadonlyArray<string>, ...texts: Array<string | undefined>): boolean {
  if (words.length === 0) return true;
  const haystack = texts.filter(Boolean).join(" ").toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/**
 * The text with each query word marked. Overlapping hits merge into one mark,
 * so "de" and "derm" in the same query never nest.
 */
export function highlightMatches(text: string, words: ReadonlyArray<string>, markClassName: string): ReactNode {
  if (words.length === 0) return text;
  const lower = text.toLowerCase();
  const hits: Array<[number, number]> = [];
  for (const w of words) {
    let from = 0;
    while (from <= lower.length - w.length) {
      const at = lower.indexOf(w, from);
      if (at === -1) break;
      hits.push([at, at + w.length]);
      from = at + w.length;
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
