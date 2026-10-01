"use client";

import { useEffect, useState, type ComponentType } from "react";
import * as Ui from "@/components/ui";
import { useToast } from "@/components/ui";
import { COLOUR_GROUPS } from "./colour-groups";
import styles from "./Foundations.module.css";

// Foundations: the tokens every component is built from, read live from the
// page so they always show the preset (or Studio theme) in force. This is
// the old styleguide folded into the docs: colour, type, radius, shadow,
// motion and the icon set. Per-component specimens live on each component
// page instead.


const TYPE: ReadonlyArray<{ token: string; label: string; sample: string; weight: number; display?: boolean }> = [
  { token: "--text-display", label: "Display", sample: "$48,210", weight: 800, display: true },
  { token: "--text-page-title", label: "Page title", sample: "Invoices", weight: 400, display: true },
  { token: "--text-section", label: "Section", sample: "Recent activity", weight: 400, display: true },
  { token: "--text-card-title", label: "Card title", sample: "This month", weight: 700 },
  { token: "--text-input", label: "Input", sample: "jane@example.com", weight: 400 },
  { token: "--text-body", label: "Body", sample: "Invoices are sent as soon as a project closes.", weight: 400 },
  { token: "--text-small", label: "Small", sample: "Updated 2 minutes ago", weight: 400 },
  { token: "--text-caption", label: "Caption", sample: "Showing 1 to 10 of 42", weight: 400 },
];

const RADII = ["--r-2xs", "--r-xs", "--r-sm", "--r-md", "--r-lg", "--r-xl", "--r-2xl", "--r-full"];
const SHADOWS = ["--shadow-input", "--shadow-hairline-card", "--shadow-control", "--shadow-panel-light", "--shadow-panel", "--shadow-float", "--shadow-lift", "--shadow-menu", "--shadow-modal"];
const MOTION = ["--dur-fast", "--dur", "--dur-slow", "--ease", "--ease-out"];

type IconComponent = ComponentType<{ size?: number }>;
const ICONS = Object.entries(Ui).filter(([name, v]) => name.startsWith("Icon") && typeof v === "function") as Array<[string, IconComponent]>;

/** Every token's resolved value on this page, re-read whenever <html> changes preset. */
export function useTokens(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  const key = names.join("|");
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const n of key.split("|")) next[n] = cs.getPropertyValue(n).trim();
      setValues(next);
    };
    const frame = requestAnimationFrame(read);
    const mo = new MutationObserver(() => requestAnimationFrame(read));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode", "style", "class"] });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
    };
  }, [key]);
  return values;
}

export function Foundations() {
  const all = [...TYPE.map((t) => t.token), ...RADII, ...SHADOWS, ...MOTION, "--font-body", "--font-display"];
  const v = useTokens(all);
  return (
    <>
      <section className={styles.section} id="type" aria-labelledby="type-h">
        <h2 id="type-h" className={styles.h2}>
          Type
        </h2>
        <p className={styles.note}>
          Body: <code>{v["--font-body"] || "…"}</code>. Display: <code>{v["--font-display"] || "…"}</code>.
        </p>
        <div className={styles.typeList}>
          {TYPE.map((t) => (
            <div key={t.token} className={styles.typeRow}>
              <span className={styles.typeLabel}>
                {t.label}
                <span className={styles.value}>
                  {t.token} · {v[t.token] || "…"}
                </span>
              </span>
              <span
                className={styles.typeSample}
                style={{
                  fontSize: `var(${t.token})`,
                  fontWeight: t.weight,
                  fontFamily: t.display ? "var(--font-display)" : "var(--font-body)",
                  letterSpacing: t.display ? "var(--tracking-display)" : undefined,
                }}
              >
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} id="shape" aria-labelledby="shape-h">
        <h2 id="shape-h" className={styles.h2}>
          Radius and shadow
        </h2>
        <div className={styles.tiles}>
          {RADII.map((r) => (
            <figure key={r} className={styles.tileFig}>
              <div className={styles.radiusTile} style={{ borderRadius: `var(${r})` }} />
              <figcaption className={styles.meta}>
                <span className={styles.name}>{r}</span>
                <span className={styles.value}>{v[r] || "…"}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.tiles}>
          {SHADOWS.map((s) => (
            <figure key={s} className={styles.tileFig}>
              <div className={styles.shadowTile} style={{ boxShadow: `var(${s})` }} />
              <figcaption className={styles.meta}>
                <span className={styles.name}>{s}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.section} id="motion" aria-labelledby="motion-h">
        <h2 id="motion-h" className={styles.h2}>
          Motion
        </h2>
        <p className={styles.note}>
          Overlays enter with a short fade and a 6px drop, never a scale. Reduced motion sets every duration to 0.
        </p>
        <dl className={styles.cells}>
          {MOTION.map((m) => (
            <div key={m} className={styles.cell}>
              <dt className={styles.name}>{m}</dt>
              <dd className={styles.value}>{v[m] || "…"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} id="icons" aria-labelledby="icons-h">
        <h2 id="icons-h" className={styles.h2}>
          Icons
        </h2>
        <p className={styles.note}>
          Lucide, at its own stroke. The Icon* names come from the barrel; any other Lucide icon can be imported from lucide-react
          directly. Size 16 matches control text.
        </p>
        <div className={styles.icons}>
          {ICONS.map(([name, Icon]) => (
            <figure key={name} className={styles.iconCell}>
              <Icon size={20} />
              <figcaption className={styles.iconName}>{name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

/** The colour reference (/colors): every colour token, live; a click copies var(--token). */
export function Colours() {
  const v = useTokens(COLOUR_GROUPS.flatMap((g) => g.tokens));
  const toast = useToast();
  const copy = (t: string) => {
    void navigator.clipboard?.writeText(`var(${t})`).then(() => toast.success(`Copied var(${t})`), () => toast.error("Couldn't copy"));
  };
  return (
    <>
      {COLOUR_GROUPS.map((g) => (
        <section key={g.title} className={styles.section} aria-labelledby={`c-${g.title.toLowerCase()}`}>
            <h2 id={`c-${g.title.toLowerCase()}`} className={styles.h2}>{g.title}</h2>
            <p className={styles.note}>{g.note}</p>
            <div className={styles.swatches}>
              {g.tokens.map((t) => (
                <button key={t} type="button" className={styles.swatch} onClick={() => copy(t)} title={`Copy var(${t})`}>
                  <span className={styles.chip} style={{ background: `var(${t})` }} />
                  <span className={styles.meta}>
                    <span className={styles.name}>{t}</span>
                    <span className={styles.value}>{v[t] || "…"}</span>
                  </span>
                </button>
              ))}
            </div>
        </section>
      ))}
    </>
  );
}
