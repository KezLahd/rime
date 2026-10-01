"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { BlockMeta } from "@/components/blocks";
import { cx } from "@/components/ui/_internal/cx";
import { SegmentedControl } from "@/components/ui/Tabs/Tabs";
import { asset } from "@/lib/site";
import { CodeBlock } from "../_docs/CodeBlock";
import docs from "../_docs/Docs.module.css";
import styles from "./Blocks.module.css";

type File = { name: string; path: string; code: string };
type View = "preview" | "code";
type Viewport = "desktop" | "tablet" | "mobile";

// Logical widths: the block lays out at these, then the frame is scaled
// down to fit the column, so Desktop really is a desktop layout.
const WIDTH: Record<Viewport, number> = { desktop: 1280, tablet: 768, mobile: 375 };
const HEIGHT = 760;
const VIEWS: ReadonlyArray<[View, string]> = [
  ["preview", "Preview"],
  ["code", "Code"],
];

/**
 * One block in the viewer: Preview | Code tabs in one frame, viewport sizes
 * for the preview (an iframe of /blocks/view/<name>, so the block's own
 * media queries respond), the block's files in the code view, the install
 * command and a link to open it full page.
 */
export function BlockViewer({ block, files, install }: { block: BlockMeta; files: File[]; install: string }) {
  const [view, setView] = useState<View>("preview");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [file, setFile] = useState(files[0]?.path ?? "");
  const uid = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const src = asset(`/blocks/view/${block.name}`);
  const current = files.find((f) => f.path === file) ?? files[0];
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);
  const logical = WIDTH[viewport];
  const scale = stageWidth ? Math.min(1, stageWidth / logical) : 1;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + VIEWS.length) % VIEWS.length;
    setView(VIEWS[next][0]);
    tabs.current[next]?.focus();
  };

  return (
    <section id={block.name} className={docs.exampleBlock} aria-labelledby={`${uid}-t`}>
      <h3 id={`${uid}-t`} className={docs.exampleTitle}>
        {block.title}
      </h3>
      <p className={docs.exampleNote}>{block.description}</p>
      <div className={styles.install}>
        <CodeBlock code={install} language="text" label={`Install ${block.title}`} />
      </div>
      <div className={docs.example}>
        <div className={styles.bar}>
          <div className={docs.exampleTabs} role="tablist" aria-label={`${block.title}: view`}>
            {VIEWS.map(([v, label], i) => (
              <button
                key={v}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-${v}-tab`}
                aria-selected={view === v}
                aria-controls={`${uid}-panel`}
                tabIndex={view === v ? 0 : -1}
                className={docs.exampleTab}
                onClick={() => setView(v)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.tools}>
            {view === "preview" ? (
              <SegmentedControl
                aria-label="Viewport"
                size="sm"
                value={viewport}
                onChange={setViewport}
                options={[
                  { value: "desktop", label: "Desktop" },
                  { value: "tablet", label: "Tablet" },
                  { value: "mobile", label: "Mobile" },
                ]}
              />
            ) : null}
            <a className={styles.open} href={src} target="_blank" rel="noreferrer">
              <ExternalLink size={14} aria-hidden="true" />
              Open
              <span className="sr-only"> {block.title} in a new tab</span>
            </a>
          </div>
        </div>
        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${view}-tab`}>
          {view === "preview" ? (
            <div ref={stageRef} className={styles.stage} style={{ height: HEIGHT * scale }}>
              <div className={styles.viewport} style={{ width: logical * scale, height: HEIGHT * scale }} data-viewport={viewport}>
                <iframe
                  src={src}
                  title={`${block.title} preview`}
                  className={styles.frame}
                  loading="lazy"
                  style={{ width: logical, height: HEIGHT, transform: `scale(${scale})` }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.code}>
              <ul className={styles.files} aria-label="Files">
                {files.map((f) => (
                  <li key={f.path}>
                    <button type="button" className={styles.file} aria-current={f.path === current?.path ? "true" : undefined} onClick={() => setFile(f.path)}>
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.source}>
                {current ? (
                  <>
                    <p className={styles.path}>{current.path}</p>
                    <CodeBlock code={current.code} language={current.name.endsWith(".css") ? "css" : current.name.endsWith(".json") ? "text" : "tsx"} label={current.path} inFrame />
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className={cx(docs.passThrough, styles.route)}>
        Suggested route in your app: <code>{block.route}</code>
      </p>
    </section>
  );
}
