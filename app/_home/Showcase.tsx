"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import AuthLogin from "@/components/blocks/auth-login";
import Dashboard from "@/components/blocks/dashboard";
import Tasks from "@/components/blocks/data-table";
import Inbox from "@/components/blocks/inbox";
import Settings from "@/components/blocks/settings";
import styles from "./Home.module.css";

// The home page's showcase: whole example apps built only from Rime
// components, live and interactive, themed by the current preset and mode.
// Each is a block (components/blocks), so what you see is what installs.

const APPS = [
  { id: "dashboard", label: "Dashboard", block: "dashboard", render: () => <Dashboard contained /> },
  { id: "inbox", label: "Inbox", block: "inbox", render: () => <Inbox contained /> },
  { id: "tasks", label: "Tasks", block: "data-table", render: () => <Tasks contained /> },
  { id: "settings", label: "Settings", block: "settings", render: () => <Settings contained /> },
  { id: "auth", label: "Authentication", block: "auth-login", render: () => <AuthLogin contained /> },
] as const;

export function Showcase() {
  const [tab, setTab] = useState<(typeof APPS)[number]["id"]>("dashboard");
  const uid = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + APPS.length) % APPS.length;
    setTab(APPS[n].id);
    refs.current[n]?.focus();
  };
  const app = APPS.find((a) => a.id === tab) ?? APPS[0];
  return (
    <section className={styles.showcase} aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`} className="sr-only">
        Examples
      </h2>
      <div className={styles.showTabs} role="tablist" aria-label="Example apps">
        {APPS.map((a, i) => (
          <button
            key={a.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-${a.id}`}
            aria-selected={tab === a.id}
            aria-controls={`${uid}-panel`}
            tabIndex={tab === a.id ? 0 : -1}
            className={styles.showTab}
            onClick={() => setTab(a.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {a.label}
          </button>
        ))}
        <Link className={styles.showLink} href={`/blocks#${app.block}`}>
          View the block and its code
        </Link>
      </div>
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${tab}`} className={styles.showFrame}>
        {app.render()}
      </div>
    </section>
  );
}
