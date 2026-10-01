"use client";

import { Check, ImagePlus, Sparkles, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import type { StudioApi } from "../api";
import { Group, Notice } from "../controls";
import { toHex } from "../engine/colour";
import { extractPalette, samplePixels, type Swatch } from "../engine/extract";
import { autoAssign, mapToTheme, type Assignment } from "../engine/mapping";
import styles from "../Studio.module.css";

const MAX_LOGO = 1.5 * 1024 * 1024;

/**
 * Step 1 of the theme walkthrough: drop a logo, and the Studio pulls the
 * palette out of it. The logo appears big in the drop zone, extracted
 * swatches tile beneath, and "Use these colours" writes brand / action /
 * strong / deep / neutral in one commit. Users can then tweak the result
 * on the Colours step.
 *
 * Pure white and pure black are deprioritised during extraction (brand kits
 * commonly carry both as "paper" and "ink"), so the suggested brand lands
 * on an actual accent hue instead of #ffffff.
 */
export function LogoPanel({ api }: { api: StudioApi }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [roles, setRoles] = useState<Assignment>({ brand: null, deep: null, accent: null, neutral: null });
  const [applied, setApplied] = useState(false);
  const logo = api.theme.logo;

  const extract = (src: string) => {
    const img = new Image();
    img.onload = () => {
      try {
        const all = extractPalette(samplePixels(img), 10);
        // Prefer non-paper, non-ink swatches for the brand slot: pure white
        // (#f8-ff) and near-black (#00-10) are deprioritised unless they are
        // all we have. Keeps the brand suggestion on an accent hue.
        const chromatic = all.filter((s) => {
          const { r, g, b } = s.rgb;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return !(max >= 248 && min >= 248) && !(max <= 16 && min <= 16);
        });
        const found = chromatic.length ? [...chromatic, ...all.filter((s) => !chromatic.includes(s))] : all;
        setSwatches(found);
        setRoles(autoAssign(found));
        setApplied(false);
        if (!found.length) setError("No colours found: the image may be fully transparent.");
      } catch {
        setError("The image could not be read for colours.");
      } finally {
        setBusy(false);
      }
    };
    img.onerror = () => {
      setBusy(false);
      setError("The browser could not open that image.");
    };
    img.src = src;
  };

  const fromFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That file is not an image. Use SVG, PNG, JPG or WebP.");
    if (file.size > MAX_LOGO) return setError("That image is over 1.5 MB. Export a smaller one (an SVG is best).");
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      api.setLogo({ src, alt: logo?.alt || file.name.replace(/\.[^.]+$/, "") });
      extract(src);
    };
    reader.onerror = () => {
      setBusy(false);
      setError("The file could not be read. Try it again.");
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    fromFile(e.dataTransfer.files?.[0]);
  };

  const applyPalette = () => {
    const mapped = mapToTheme(swatches, roles);
    api.set(mapped.overrides);
    setApplied(true);
  };

  const removeLogo = () => {
    api.setLogo(null);
    setSwatches([]);
    setRoles({ brand: null, deep: null, accent: null, neutral: null });
    setApplied(false);
  };

  return (
    <>
      <Group
        title="Drop your logo"
        note="SVG, PNG, JPG or WebP, up to 1.5 MB. The Studio pulls the palette out of it and suggests brand colours."
        action={logo ? <Button size="sm" variant="ghost" onClick={removeLogo}>Remove</Button> : null}
      >
        <div
          className={cx(styles.logoDrop, over && styles.logoDropActive, !!logo && styles.logoDropFilled)}
          role="button"
          tabIndex={0}
          aria-label="Drop a logo here or click to choose a file"
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- user's data URL, preview only
            <img src={logo.src} alt={logo.alt || "Logo"} className={styles.logoDropImage} />
          ) : (
            <>
              <ImagePlus size={28} aria-hidden="true" className={styles.logoDropIcon} />
              <p className={styles.logoDropTitle}>Drop your logo here</p>
              <p className={styles.logoDropHint}>or choose a file below. The theme reads its colours from it.</p>
            </>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="secondary"
            iconStart={<Upload size={14} aria-hidden="true" />}
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {logo ? "Replace logo" : "Choose a file"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.srOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              fromFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {error ? <Notice tone="bad">{error}</Notice> : null}
      </Group>

      {swatches.length > 0 ? (
        <Group
          title="Suggested palette"
          note="The most prominent colours in your logo, light paper and dark ink deprioritised. Click Apply to write them into the theme."
          action={
            applied ? (
              <span className={styles.appliedPill}>
                <Check size={13} aria-hidden="true" /> Applied
              </span>
            ) : (
              <Button size="sm" iconStart={<Sparkles size={14} aria-hidden="true" />} onClick={applyPalette}>
                Apply
              </Button>
            )
          }
        >
          <div className={styles.logoPaletteGrid}>
            {swatches.slice(0, 8).map((s) => (
              <div key={s.id} className={styles.logoPaletteTile}>
                <span className={styles.logoPaletteSwatch} style={{ background: toHex(s.rgb) }} aria-hidden="true" />
                <span className={styles.logoPaletteHex}>{toHex(s.rgb)}</span>
                <span className={styles.logoPaletteShare}>{Math.round(s.share * 100)}%</span>
              </div>
            ))}
          </div>
        </Group>
      ) : null}
    </>
  );
}
