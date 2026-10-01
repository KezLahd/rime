"use client";

import { Collapsible } from "@/components/ui";
import type { StudioApi } from "./api";
import { TokenEditor } from "./panels/DataPanels";
import styles from "./Studio.module.css";

/**
 * The raw layer of a section: every token its friendly controls write, by
 * name, with its value, editable as CSS. Closed by default, so the section
 * reads as human controls first.
 */
export function Advanced({ api, tokens, title = "Advanced" }: { api: StudioApi; tokens: ReadonlyArray<string>; title?: string }) {
  const names = [...new Set(tokens)];
  const changed = names.filter(api.changed).length;
  return (
    <Collapsible
      className={styles.advanced}
      title={title}
      summary={`${names.length} token${names.length === 1 ? "" : "s"} as CSS${changed ? `, ${changed} changed` : ""}`}
    >
      <div className={styles.advancedBody}>
        {names.map((n) => (
          <TokenEditor key={n} api={api} name={n} current={api.resolved(n) || (api.value(n) ?? "")} label={n} />
        ))}
      </div>
    </Collapsible>
  );
}
