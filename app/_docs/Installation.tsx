"use client";

import { useId, useState } from "react";
import type { InstallInfo } from "@/lib/registry-items";
import { CodeBlock } from "./CodeBlock";
import styles from "./Docs.module.css";
import { InstallCommand } from "./Install";

/** A component's Installation section, as shadcn's: CLI | Manual tabs. */
export function Installation({ info }: { info: InstallInfo }) {
  const [tab, setTab] = useState<"cli" | "manual">("cli");
  const uid = useId();
  return (
    <div>
      <div className={styles.exampleTabs} role="tablist" aria-label="Installation method">
        {(
          [
            ["cli", "CLI"],
            ["manual", "Manual"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            id={`${uid}-${v}`}
            aria-selected={tab === v}
            tabIndex={tab === v ? 0 : -1}
            className={styles.exampleTab}
            onClick={() => setTab(v)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") setTab(tab === "cli" ? "manual" : "cli");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-labelledby={`${uid}-${tab}`}>
        {tab === "cli" ? (
          <>
            <InstallCommand items={[info.item]} label={`Install ${info.item}`} />
            {info.registryDependencies.length ? (
              <p className={styles.passThrough}>Also installs: {info.registryDependencies.join(", ")}.</p>
            ) : null}
          </>
        ) : (
          <ol className={styles.steps}>
            {info.dependencies.length ? (
              <li className={styles.step}>
                <div>
                  <p className={styles.stepTitle}>Install the dependencies</p>
                  <CodeBlock language="text" label="Dependencies" code={`npm install ${info.dependencies.join(" ")}`} />
                </div>
              </li>
            ) : null}
            <li className={styles.step}>
              <div>
                <p className={styles.stepTitle}>Add the Rime items it uses</p>
                <p className={styles.note}>{info.registryDependencies.join(", ") || "base"}, each from its own page or the CLI.</p>
              </div>
            </li>
            <li className={styles.step}>
              <div>
                <p className={styles.stepTitle}>Copy the source into your project</p>
                {info.files.map((f) => (
                  <details key={f.path} className={styles.fileSource}>
                    <summary>{f.target}</summary>
                    <CodeBlock code={f.source} language={f.path.endsWith(".css") ? "css" : "tsx"} label={f.target} />
                  </details>
                ))}
              </div>
            </li>
            <li className={styles.step}>
              <div>
                <p className={styles.stepTitle}>Update the import paths if your alias differs</p>
                <p className={styles.note}>Rime imports through @/* (the project root), with no src/ directory.</p>
              </div>
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}
