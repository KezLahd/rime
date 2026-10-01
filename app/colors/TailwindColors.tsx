"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast/Toast";
import { FAMILIES, FORMATS, SHADES, formatColor, type Format } from "./tailwind-palette";
import styles from "./TailwindColors.module.css";

/**
 * The full Tailwind palette — 22 families, 11 shades each — rendered in
 * shadcn's /colors layout: family title on the left, format dropdown on
 * the right, a row of eleven large colour tiles underneath with the shade
 * name below each. Each tile copies the colour in the chosen format.
 */
export function TailwindColors() {
  const [format, setFormat] = useState<Format>("hex");
  const toast = useToast();

  const copy = (hex: string) => {
    const value = formatColor(hex, format);
    void navigator.clipboard?.writeText(value).then(
      () => toast.success("Copied", { description: value }),
      () => toast.error("Couldn't copy"),
    );
  };

  return (
    <div className={styles.palette}>
      {FAMILIES.map((family) => (
        <section key={family.slug} id={`c-${family.slug}`} className={styles.family} aria-labelledby={`c-${family.slug}-t`}>
          <div className={styles.familyHead}>
            <h2 id={`c-${family.slug}-t`} className={styles.familyTitle}>{family.name}</h2>
            <label className={styles.formatPicker}>
              <span className={styles.formatLabel}>Format:</span>
              <select
                className={styles.formatSelect}
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                aria-label="Colour value format"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.row}>
            {SHADES.map((shade) => {
              const hex = family.shades[shade];
              return (
                <button
                  key={shade}
                  type="button"
                  className={styles.swatch}
                  onClick={() => copy(hex)}
                  title={`Copy ${formatColor(hex, format)}`}
                >
                  <span className={styles.tile} style={{ background: hex }} aria-hidden="true" />
                  <span className={styles.swatchLabel}>{family.slug}-{shade}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
