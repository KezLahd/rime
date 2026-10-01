"use client";

import { useMemo, useState } from "react";
import { EmptyState, FilterBar, FilterSearch, Select } from "@/components/ui";
import { ComponentCards, type ComponentCardData } from "../_docs/ComponentCards";
import styles from "../_docs/Docs.module.css";

type Card = ComponentCardData & { category: string; keywords: string };

/**
 * The component index: every component as a live card, with one full-width
 * search and a category dropdown (never a row of toggle chips). Grouped by
 * category while unfiltered, one flat grid while searching.
 */
export function ComponentIndex({ cards, categories }: { cards: Card[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const q = query.trim().toLowerCase();
  const filtering = Boolean(q) || category !== "all";
  const visible = useMemo(
    () => cards.filter((c) => (category === "all" || c.category === category) && (!q || c.keywords.includes(q))),
    [cards, category, q],
  );
  const clear = () => {
    setQuery("");
    setCategory("all");
  };
  return (
    <>
      <FilterBar aria-label="Filter components" onClear={filtering ? clear : undefined}>
        <FilterSearch grow aria-label="Search components" value={query} onChange={setQuery} placeholder="Search components, e.g. date or menu" />
        <Select
          appearance="chip"
          aria-label="Category"
          value={category}
          onChange={setCategory}
          active={category !== "all"}
          options={[
            { value: "all", label: "All categories", count: cards.length },
            ...categories.map((c) => ({ value: c, label: c, count: cards.filter((x) => x.category === c).length })),
          ]}
        />
      </FilterBar>
      <p className="sr-only" role="status">
        {visible.length} components shown
      </p>
      {visible.length === 0 ? (
        <EmptyState compact tone="filtered" title="No components match" description="Try another word, or clear the filters." />
      ) : q ? (
        <ComponentCards cards={visible} />
      ) : (
        categories
          .filter((c) => visible.some((v) => v.category === c))
          .map((c) => (
            <section key={c} aria-labelledby={`cat-${c}`}>
              <h2 id={`cat-${c}`} className={styles.h3}>
                {c}
              </h2>
              <ComponentCards cards={visible.filter((v) => v.category === c)} />
            </section>
          ))
      )}
    </>
  );
}
