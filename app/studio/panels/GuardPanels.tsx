"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { Button, StatusPill } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import type { StudioApi } from "../api";
import { CheckRow, Group, Notice, SelectRow } from "../controls";
import { toCss, toHex } from "../engine/colour";
import { fixFor, type PairResult } from "../engine/contrast";
import { extractPalette, samplePixels, type Swatch } from "../engine/extract";
import { setColour } from "../engine/macros";
import { autoAssign, mapToTheme, ROLES, type Assignment } from "../engine/mapping";
import styles from "../Studio.module.css";

// ── Contrast guard ────────────────────────────────────────────────────────

export function ContrastPanel({ api, results }: { api: StudioApi; results: PairResult[] | null }) {
  if (!results) return <p className={styles.empty}>Measuring the preview…</p>;
  const failing = results.filter((r) => !r.pass);
  const fixAll = () => {
    const out: Record<string, string> = {};
    for (const r of failing) {
      const c = fixFor(r);
      if (c) Object.assign(out, setColour(r.fix.token, c));
    }
    api.set(out);
  };
  return (
    <>
      <Group
        title="WCAG AA"
        help="Text needs 4.5:1, focus rings and control edges 3:1. Measured live on the preview, glass at its worst (a glass fill over the strongest bloom)."
        action={
          failing.length ? (
            <Button size="sm" onClick={fixAll}>
              Fix all {failing.length}
            </Button>
          ) : null
        }
      >
        {failing.length ? (
          <Notice tone="bad">
            {failing.length} pair{failing.length === 1 ? " fails" : "s fail"}. Fix moves the named token to the nearest shade of the same hue that passes.
          </Notice>
        ) : (
          <Notice tone="ok">Every pair passes.</Notice>
        )}
        <div className={styles.pairs}>
          {results.map((r) => {
            const fix = r.pass ? null : fixFor(r);
            return (
              <div key={r.id} className={styles.pair}>
                <span className={styles.pairSample} style={{ color: toCss(r.fgRgb), background: toCss(r.bgRgb) }} aria-hidden="true">
                  Aa
                </span>
                <span>
                  <span className={styles.pairName}>{r.label}</span>
                  <br />
                  <span className={styles.pairDetail}>
                    {toHex(r.fgRgb)} on {r.on.label} {toHex(r.bgRgb)} · needs {r.target}:1
                  </span>
                </span>
                <span className={styles.pairRatio}>
                  <StatusPill tone={r.pass ? "success" : "danger"}>
                    {r.ratio.toFixed(2)}:1 {r.pass ? "Pass" : "Fail"}
                  </StatusPill>
                  {fix ? (
                    <Button size="sm" variant="secondary" onClick={() => api.set(setColour(r.fix.token, fix))} title={`Set ${r.fix.token} to ${toHex(fix)}`}>
                      Fix
                    </Button>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </Group>
    </>
  );
}

// ── Image to theme ───────────────────────────────────────────────────────

const MAX_IMAGE = 8 * 1024 * 1024;

export function ImagePanel({ api }: { api: StudioApi }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [roles, setRoles] = useState<Assignment>({ brand: null, deep: null, accent: null, neutral: null });
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [asLogo, setAsLogo] = useState(false);

  const load = (file: File | undefined) => {
    setError(null);
    setNotes([]);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That file is not an image. Use a PNG, JPG, SVG or WebP.");
    if (file.size > MAX_IMAGE) return setError("That image is over 8 MB. Use a smaller export.");
    setBusy(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setBusy(false);
      setError("The file could not be read. Try it again.");
    };
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        // A canvas read can throw on a tainted image; ours is a data URL, so it should not.
        try {
          const found = extractPalette(samplePixels(img), 8);
          setSrc(url);
          setSwatches(found);
          setRoles(autoAssign(found));
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
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const apply = () => {
    const mapped = mapToTheme(swatches, roles);
    api.set(mapped.overrides, { imageRoles: JSON.stringify(roles) });
    if (asLogo && src) api.setLogo({ src, alt: api.theme.logo?.alt ?? "Logo" });
    setNotes(mapped.notes.length ? mapped.notes : ["Mapped with no contrast adjustments needed."]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    load(e.dataTransfer.files?.[0]);
  };

  const options = [{ value: "auto", label: "Derive it" }, ...swatches.map((s) => ({ value: s.id, label: `${toHex(s.rgb)} · ${Math.round(s.share * 100)}%` }))];

  return (
    <>
      <Group title="Image to theme" note="A logo, a brand book page or a photo. The palette is extracted here in the browser (no upload anywhere), mapped to the theme's roles, then checked for contrast.">
        <div
          className={cx(styles.drop, over && styles.dropActive)}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- the user's own image, preview only
            <img src={src} alt="The image the palette came from" className={styles.dropImage} />
          ) : (
            <ImagePlus size={22} aria-hidden="true" />
          )}
          <span>{busy ? "Reading colours…" : src ? "Drop another image to replace it" : "Drop an image here"}</span>
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
            Choose an image
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.srOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              load(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {error ? <Notice tone="bad">{error}</Notice> : null}
      </Group>

      {swatches.length ? (
        <>
          <Group title="Extracted" note="By share of the image. Assign any swatch to any role below.">
            <div className={styles.swatches}>
              {swatches.map((s) => {
                const role = ROLES.find((r) => roles[r.id] === s.id);
                return (
                  <div key={s.id} className={styles.swatchCard}>
                    <span className={styles.swatchChip} style={{ background: toHex(s.rgb) }} aria-hidden="true" />
                    <span className={styles.mono}>{toHex(s.rgb)}</span>
                    <span className={styles.swatchMeta}>
                      {Math.round(s.share * 100)}%{role ? ` · ${role.label}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </Group>
          <Group title="Roles" help="Anything left to Derive is built from the brand colour in OKLCH, then checked for contrast.">
            {ROLES.map((r) => (
              <SelectRow
                key={r.id}
                label={r.label}
                help={r.note}
                value={roles[r.id] ?? "auto"}
                options={options}
                onChange={(v) => setRoles({ ...roles, [r.id]: v === "auto" ? null : v })}
              />
            ))}
            <CheckRow label="Use this image as the logo too" checked={asLogo} onChange={setAsLogo} />
            <div className={styles.actions}>
              <Button onClick={apply}>Apply to the theme</Button>
              <Button variant="secondary" onClick={() => setRoles(autoAssign(swatches))}>
                Auto-assign again
              </Button>
            </div>
            {notes.length ? (
              <Notice tone={notes.some((n) => n.includes("cannot")) ? "warn" : "info"}>
                {notes.map((n) => (
                  <span key={n}>
                    {n}
                    <br />
                  </span>
                ))}
                Fine-tune in Brand, Colour, Gradients and Glass; the Contrast section has the full check.
              </Notice>
            ) : null}
          </Group>
        </>
      ) : null}
    </>
  );
}
