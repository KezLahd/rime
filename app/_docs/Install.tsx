"use client";

import { useEffect, useId, useState } from "react";
import { installAddress, installCommand } from "@/lib/site";
import { CodeBlock } from "./CodeBlock";
import styles from "./Docs.module.css";

// Package-manager tabs over an install command, as shadcn shows them. The
// choice is remembered per browser (rime-pm) and shared by every page.

type Pm = "npm" | "pnpm" | "yarn" | "bun";
const PMS: ReadonlyArray<Pm> = ["npm", "pnpm", "yarn", "bun"];
const KEY = "rime-pm";
const EVENT = "rime-pm-change";

function readPm(): Pm {
  try {
    const v = window.localStorage.getItem(KEY);
    return PMS.includes(v as Pm) ? (v as Pm) : "npm";
  } catch {
    return "npm";
  }
}

export function InstallCommand({ items, label = "Install" }: { items: string[]; label?: string }) {
  const [pm, setPm] = useState<Pm>("npm");
  const uid = useId();
  useEffect(() => {
    const sync = () => setPm(readPm());
    const frame = requestAnimationFrame(sync);
    window.addEventListener(EVENT, sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(EVENT, sync);
    };
  }, []);
  const choose = (p: Pm) => {
    setPm(p);
    try {
      window.localStorage.setItem(KEY, p);
    } catch {
      // Storage blocked: the choice lasts for this page.
    }
    window.dispatchEvent(new Event(EVENT));
  };
  const cmd = [installCommand(items[0], pm), ...items.slice(1).map(installAddress)].join(" ");
  return (
    <div className={styles.install}>
      <div className={styles.exampleTabs} role="tablist" aria-label={`${label}: package manager`}>
        {PMS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            id={`${uid}-${p}`}
            aria-selected={pm === p}
            tabIndex={pm === p ? 0 : -1}
            className={styles.exampleTab}
            onClick={() => choose(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-labelledby={`${uid}-${pm}`}>
        <CodeBlock code={cmd} language="text" label={`${label} command`} inFrame />
      </div>
    </div>
  );
}
