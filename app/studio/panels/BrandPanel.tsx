"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Field, Popover, TextInput } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { Advanced } from "../advanced";
import type { StudioApi } from "../api";
import { ColourRow, Group, Notice } from "../controls";
import { colourOf, setColour } from "../engine/macros";
import styles from "../Studio.module.css";

// Brand (the palette and the logo), Colour (signals, ink and the page
// field) and Type (the two families). Each colour's rgb channel moves with
// it, so every tint, wash and glow follows.

const PALETTE: ReadonlyArray<[string, string, string]> = [
  ["--brand", "Brand", "Primary buttons, focus, the selected day, the ticked box."],
  ["--brand-action", "Action brand", "The button-safe shade: where the primary gradient starts. Keep white text at 4.5:1."],
  ["--brand-strong", "Strong brand", "The dark stop of the brand gradient."],
  ["--brand-deep", "Deep brand", "The deepest tone: strong ink, the dark tooltip, tinted shadows."],
  ["--brand-soft", "Accent", "A quiet second tone for info tints and meters. Never text."],
  ["--support", "Neutral", "Table header sweeps and sunken boxes."],
];

const FIELD: ReadonlyArray<[string, string, string]> = [
  ["--page-base", "Page base", "The colour under everything."],
  ["--rgb-bloom-a", "Top-left bloom", "The soft light in the top-left corner of the page."],
  ["--rgb-bloom-b", "Bottom-right bloom", "The soft light in the bottom-right corner."],
  ["--night", "Night", "Near-black for the context strip and the deepest shadows."],
];

const CHARTS: ReadonlyArray<[string, string, string]> = [
  ["--chart-1", "Series 1", "The first series: usually the brand. Every chart reads it."],
  ["--chart-2", "Series 2", "Keep it far from series 1 in hue, for colour-blind readers."],
  ["--chart-3", "Series 3", "The third categorical slot."],
  ["--chart-4", "Series 4", "The fourth categorical slot."],
  ["--chart-5", "Series 5", "The fifth categorical slot."],
  ["--chart-6", "Series 6", "The last slot; a seventh series folds into Other."],
  ["--chart-other", "Other", "Folded and de-emphasised series. Never the story."],
];

const CHART_RAMP: ReadonlyArray<[string, string, string]> = [
  ["--chart-seq-1", "Ramp, lightest", "Ordered categories, light to dark."],
  ["--chart-seq-2", "Ramp, step 2", ""],
  ["--chart-seq-3", "Ramp, step 3", ""],
  ["--chart-seq-4", "Ramp, step 4", ""],
  ["--chart-seq-5", "Ramp, darkest", ""],
];

const SIGNALS: ReadonlyArray<[string, string, string]> = [
  ["--danger-base", "Danger hue", "Rules and invalid edges. Never text."],
  ["--danger-base-solid", "Danger fill", "Behind white text on danger buttons."],
  ["--danger-ink", "Danger text", "Error messages. Needs 4.5:1 on glass."],
  ["--focus-color", "Focus ring", "Needs 3:1 against what it sits on."],
];

const INKS: ReadonlyArray<[string, string, string]> = [
  ["--ink-heading", "Headings", "Page titles, card titles, hero numbers."],
  ["--ink-body", "Body text", "Paragraphs, table cells, input text."],
  ["--ink-secondary", "Secondary text", "Labels and secondary body."],
  ["--ink-muted", "Muted text", "Captions, resting control labels, column headers."],
  ["--ink-brand", "Links", "Links and active controls."],
  ["--ink-placeholder", "Placeholder", "Placeholders, on white fields."],
];

const CHANNELS: Record<string, string> = {
  "--brand-deep": "--rgb-brand-deep",
  "--brand": "--rgb-brand",
  "--support": "--rgb-support",
  "--brand-soft": "--rgb-brand-soft",
  "--danger-base": "--rgb-danger",
};

function useColourRow(api: StudioApi) {
  return ([name, label, help]: readonly [string, string, string]) => (
    <ColourRow
      key={name}
      label={label}
      token={name}
      help={help}
      colour={colourOf(api.resolved(name)) ?? colourOf(api.value(name))}
      changed={api.changed(name) || (CHANNELS[name] ? api.changed(CHANNELS[name]) : false)}
      onChange={(c) => api.set(setColour(name, c))}
      onReset={() => api.reset([name, ...(name in CHANNELS ? [CHANNELS[name]] : [])])}
    />
  );
}

const withChannels = (rows: ReadonlyArray<readonly [string, string, string]>) =>
  rows.flatMap(([n]) => (CHANNELS[n] ? [n, CHANNELS[n]] : [n]));

export function BrandPanel({ api }: { api: StudioApi }) {
  const row = useColourRow(api);
  return (
    <>
      <Group title="Brand colours" note="Pick the brand. Every tint, wash, glow and gradient built from it follows.">
        {PALETTE.map(row)}
      </Group>
      <Advanced api={api} tokens={[...withChannels(PALETTE), "--brand-gradient", "--brand-gradient-soft", "--brand-gradient-wash"]} />
    </>
  );
}

export function ColourPanel({ api }: { api: StudioApi }) {
  const row = useColourRow(api);
  return (
    <>
      <Group title="Text" note="Keep muted text at 4.5:1 on the worst glass; the Contrast section shows where each stands.">
        {INKS.map(row)}
      </Group>
      <Group title="Signals" note="Danger and focus.">
        {SIGNALS.map(row)}
      </Group>
      <Group title="Page field" note="The coloured ground the glass floats on.">
        {FIELD.map(row)}
      </Group>
      <Group title="Charts" note="The chart palette: every line, bar and donut reads these. Each series needs 3:1 against the surface it sits on.">
        {CHARTS.map(row)}
      </Group>
      <Group title="Chart ramp" note="One hue, light to dark, for ordered categories.">
        {CHART_RAMP.map(row)}
      </Group>
      <Advanced
        api={api}
        tokens={[
          ...withChannels(INKS),
          ...withChannels(SIGNALS),
          ...FIELD.map(([n]) => n),
          ...CHARTS.map(([n]) => n),
          ...CHART_RAMP.map(([n]) => n),
          "--chart-good",
          "--chart-warning",
          "--chart-danger",
          "--success-ink",
          "--success-fill",
          "--warning-ink",
          "--warning-fill",
          "--info-ink",
          "--info-fill",
          "--line",
          "--line-glass",
          "--line-input",
        ]}
      />
    </>
  );
}

export function TypePanel({ api }: { api: StudioApi }) {
  const current = (slot: "body" | "display") => String(api.theme.controls[slot === "body" ? "fontBody" : "fontDisplay"] ?? "preset");
  const choose = (slot: "body" | "display", id: string) => {
    const token = slot === "body" ? "--font-body" : "--font-display";
    const idKey = slot === "body" ? "fontBody" : "fontDisplay";
    const nameKey = slot === "body" ? "fontBodyName" : "fontDisplayName";
    if (id === "preset") {
      api.reset([token], [idKey, nameKey]);
      return;
    }
    const font = api.fonts.find((f) => f.id === id);
    if (!font) return;
    const tail = font.kind === "serif" ? "Georgia, serif" : "system-ui, sans-serif";
    api.set({ [token]: `${font.family}, ${tail}` }, { [idKey]: id, [nameKey]: font.name });
  };

  const faceOf = (f: { family: string; kind: "sans" | "serif" | "display" }) =>
    `${f.family}, ${f.kind === "serif" ? "Georgia, serif" : "system-ui, sans-serif"}`;

  const Picker = ({ slot, label }: { slot: "body" | "display"; label: string }) => {
    const value = current(slot);
    const token = slot === "body" ? "--font-body" : "--font-display";
    const selectedFont = value === "preset" ? null : api.fonts.find((f) => f.id === value);
    return (
      <div className={styles.fontPicker}>
        <div className={styles.fontPickerHead}>
          <span className={styles.fontPickerLabel}>{label}</span>
          {api.changed(token) ? (
            <button type="button" className={styles.fontPickerReset} onClick={() => choose(slot, "preset")}>
              Reset
            </button>
          ) : null}
        </div>
        <Popover
          label={`${label} picker`}
          width={320}
          trigger={
            <button type="button" className={styles.fontDropdown} aria-label={`Pick ${label}`}>
              <span
                className={styles.fontDropdownName}
                style={selectedFont ? { fontFamily: faceOf(selectedFont) } : undefined}
              >
                {selectedFont ? selectedFont.name : "The preset's font"}
              </span>
              {selectedFont ? (
                <span className={styles.fontDropdownKind}>{selectedFont.kind}</span>
              ) : null}
              <ChevronDown size={14} aria-hidden="true" className={styles.fontDropdownIcon} />
            </button>
          }
        >
          <div className={styles.fontMenu} role="listbox" aria-label={`${label} options`}>
            <button
              type="button"
              role="option"
              aria-selected={value === "preset"}
              className={cx(styles.fontMenuItem, value === "preset" && styles.fontMenuItemActive)}
              onClick={() => choose(slot, "preset")}
            >
              <span className={styles.fontMenuItemName}>The preset&apos;s font</span>
              <span className={styles.fontMenuItemKind}>default</span>
            </button>
            {api.fonts.map((f) => (
              <button
                key={f.id}
                type="button"
                role="option"
                aria-selected={value === f.id}
                className={cx(styles.fontMenuItem, value === f.id && styles.fontMenuItemActive)}
                onClick={() => choose(slot, f.id)}
              >
                <span className={styles.fontMenuItemName} style={{ fontFamily: faceOf(f) }}>
                  {f.name}
                </span>
                <span className={styles.fontMenuItemKind}>{f.kind}</span>
              </button>
            ))}
          </div>
        </Popover>
      </div>
    );
  };

  return (
    <>
      <Group title="Headings" note="Page titles, card titles and the big hero number.">
        <Picker slot="display" label="Heading font" />
      </Group>
      <Group title="Body" note="Paragraphs, labels, controls and table cells.">
        <Picker slot="body" label="Body font" />
      </Group>
      <Advanced
        api={api}
        tokens={["--font-body", "--font-display", "--font-mono", "--text-display", "--text-page-title", "--text-section", "--text-card-title", "--text-body", "--text-small", "--text-caption", "--tracking-display"]}
      />
    </>
  );
}

const MAX_LOGO = 1.5 * 1024 * 1024;

function LogoGroup({ api }: { api: StudioApi }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const logo = api.theme.logo;
  const fill = api.theme.controls.logoCorner === "fill";

  const fromFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That file is not an image. Use SVG, PNG, JPG or WebP.");
    if (file.size > MAX_LOGO) return setError("That image is over 1.5 MB. Export a smaller one (an SVG is best).");
    const reader = new FileReader();
    reader.onload = () => api.setLogo({ src: String(reader.result), alt: logo?.alt || file.name.replace(/\.[^.]+$/, "") });
    reader.onerror = () => setError("The file could not be read. Try it again.");
    reader.readAsDataURL(file);
  };

  const fromUrl = () => {
    setError(null);
    const v = url.trim();
    if (!v) return;
    if (!/^(\/[^/]|data:image\/)/.test(v)) return setError("Use a path on this site (/logo.svg) or upload the file.");
    api.setLogo({ src: v, alt: logo?.alt ?? "" });
  };

  return (
    <Group
      title="Logo"
      note="Shown in the shell's logo corner and in the kit's own top bar while you work."
      action={
        logo ? (
          <Button size="sm" variant="ghost" onClick={() => api.setLogo(null)}>
            Remove
          </Button>
        ) : null
      }
    >
      <div
        className={cx(styles.logoPreview, !fill && styles.logoPreviewGlass)}
        style={fill ? { background: api.resolved("--logo-corner-bg") || undefined } : undefined}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- a user's data URL, preview only
          <img src={logo.src} alt={logo.alt} />
        ) : (
          <span className={styles.logoPlaceholder}>Acme</span>
        )}
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
          Upload an image
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
      <Field label="Or a path on this site">
        <TextInput
          size="sm"
          placeholder="/logo.svg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fromUrl()}
          trailing={
            <Button size="sm" variant="ghost" onClick={fromUrl}>
              Use
            </Button>
          }
        />
      </Field>
      {logo ? (
        <Field label="Alt text" hint="Read by screen readers in place of the logo.">
          <TextInput size="sm" value={logo.alt} onChange={(e) => api.setLogo({ ...logo, alt: e.target.value })} />
        </Field>
      ) : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
    </Group>
  );
}
