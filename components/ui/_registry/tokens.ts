// The token catalogue: a name, a kind and a sentence for the system tokens in
// app/styles/tokens.css, grouped the way the Rime Studio and the docs show
// them. Values are NOT here: the studio reads them live from the loaded
// stylesheets, so this file can never disagree with tokens.css about a value.
// A token missing from this list still shows in the studio's "All tokens"
// panel, with its kind inferred (inferKind).

export type TokenKind =
  | "color"
  | "channel" // "r, g, b" for rgba(var(--rgb-x), a)
  | "gradient"
  | "shadow"
  | "length"
  | "number"
  | "font"
  | "backdrop" // a backdrop-filter value: blur(…) saturate(…), or none
  | "duration"
  | "easing"
  | "image"
  | "keyword"
  | "other";

export type TokenGroup =
  | "Palette"
  | "Ink"
  | "Brand and gradients"
  | "Status"
  | "Surfaces"
  | "Glass"
  | "Lines"
  | "Focus"
  | "Radius"
  | "Scale"
  | "Shadow"
  | "Type"
  | "Motion"
  | "Scroll"
  | "Shell"
  | "Table"
  | "Overlays";

export type TokenMeta = {
  name: string;
  kind: TokenKind;
  group: TokenGroup;
  label: string;
  description: string;
  /** Slider bounds for length and number kinds. */
  range?: [min: number, max: number, step: number];
};

const t = (
  name: string,
  kind: TokenKind,
  group: TokenGroup,
  label: string,
  description: string,
  range?: TokenMeta["range"],
): TokenMeta => ({ name, kind, group, label, description, range });

export const TOKENS: ReadonlyArray<TokenMeta> = [
  // ── Palette: brand primitives ───────────────────────────────────────────
  t("--brand-action", "color", "Palette", "Action brand", "The button-safe shade of the accent: the primary gradient's light stop, holding 4.5:1 with white text."),
  t("--brand-strong", "color", "Palette", "Strong brand", "The gradient's dark stop: primary buttons, the logo corner, the active nav pill."),
  t("--brand-deep", "color", "Palette", "Deep brand", "The deepest tone: strong ink, the dark tooltip, tinted shadows, the context strip's end."),
  t("--brand", "color", "Palette", "Brand", "The working brand hue: the gradient's light stop, focus, links' family. Keep white text above 4.5:1 on it."),
  t("--brand-soft", "color", "Palette", "Accent", "A soft accent for fills, rules and info tints. Never text."),
  t("--support", "color", "Palette", "Support neutral", "The support neutral: table header sweep, legal boxes."),
  t("--danger-base", "color", "Palette", "Danger hue", "The danger hue for rules, invalid edges and blooms. Never text."),
  t("--danger-base-text", "color", "Palette", "Danger text", "Danger hue darkened for text on white."),
  t("--danger-base-solid", "color", "Palette", "Danger solid", "Danger fill behind white text (the danger button)."),
  t("--night", "color", "Palette", "Night", "Near-black for the context strip and the deepest shadows."),
  t("--rgb-brand-deep", "channel", "Palette", "Deep brand channel", "--brand-deep as r, g, b, for tints: rgba(var(--rgb-brand-deep), 0.1)."),
  t("--rgb-brand", "channel", "Palette", "Brand channel", "--brand as r, g, b: washes, glows, focus halos."),
  t("--rgb-support", "channel", "Palette", "Support neutral channel", "--support as r, g, b: the table header sweep."),
  t("--rgb-brand-soft", "channel", "Palette", "Accent channel", "--brand-soft as r, g, b: info tints."),
  t("--rgb-danger", "channel", "Palette", "Danger channel", "--danger-base as r, g, b: danger tints and glows."),
  t("--rgb-bloom-a", "channel", "Palette", "Bloom one", "The top-left page bloom. Background only, never text."),
  t("--rgb-bloom-b", "channel", "Palette", "Bloom two", "The bottom-right page bloom. Background only."),
  t("--rgb-contact", "channel", "Palette", "Contact shadow", "The tight shadow under objects: night pulled toward the brand."),
  t("--rgb-shade", "channel", "Palette", "Press shade", "Laid over fills on press and while loading."),
  t("--rgb-white", "channel", "Palette", "Light channel", "Glass fills, specular edges and highlights."),

  // ── Ink ─────────────────────────────────────────────────────────────────
  t("--ink-heading", "color", "Ink", "Headings", "Headings and hero numbers."),
  t("--ink-body", "color", "Ink", "Body", "Body copy, table cells, input text."),
  t("--ink-secondary", "color", "Ink", "Secondary", "Labels and secondary copy."),
  t("--ink-muted", "color", "Ink", "Muted", "Captions, resting control labels, column headers. The lightest ink allowed for text."),
  t("--ink-brand", "color", "Ink", "Brand ink", "Links and \"this control is doing something\"."),
  t("--ink-placeholder", "color", "Ink", "Placeholder", "Placeholder text on white fields."),
  t("--ink-disabled", "color", "Ink", "Disabled", "Disabled text (exempt from contrast minimums)."),
  t("--ink-inverse", "color", "Ink", "Inverse", "Text on brand and danger fills."),

  // ── Brand gesture and gradients ─────────────────────────────────────────
  t("--brand-gradient", "gradient", "Brand and gradients", "Brand gradient", "The one brand gesture per view: primary button, active nav pill, selected day, ticked box."),
  t("--danger-gradient", "gradient", "Brand and gradients", "Danger gradient", "The irreversible action."),
  t("--success-gradient", "gradient", "Brand and gradients", "Success gradient", "Success in the brand gesture's form."),
  t("--logo-corner-bg", "gradient", "Brand and gradients", "Logo corner", "The ground under the sidebar's logo."),
  t("--admin-strip-bg", "gradient", "Brand and gradients", "Admin strip", "The full-width admin context band."),
  t("--auth-background", "gradient", "Brand and gradients", "Sign-in field", "The field behind the sign-in card."),
  t("--gradient-brand-deep", "gradient", "Brand and gradients", "Guide gradient", "Brand book guide gradient, for logo tiles and key-message panels."),
  t("--brand-gradient-soft", "gradient", "Brand and gradients", "Soft brand wash", "A faint brand gradient for tiles."),
  t("--brand-gradient-wash", "gradient", "Brand and gradients", "Brand wash", "Menu headers and quiet brand areas."),
  t("--highlight-edge", "gradient", "Brand and gradients", "Highlight edge", "The top rule on Card tone=\"highlight\"."),
  t("--highlight-glow", "gradient", "Brand and gradients", "Highlight glow", "The soft glow under a highlighted card. none turns it off."),

  // ── Status ──────────────────────────────────────────────────────────────
  t("--success-ink", "color", "Status", "Success ink", "Success text on its tint."),
  t("--success-fill", "color", "Status", "Success fill", "Success tint."),
  t("--success-line", "color", "Status", "Success line", "Success edge."),
  t("--success-solid", "color", "Status", "Success solid", "Success fill behind white text."),
  t("--warning-ink", "color", "Status", "Warning ink", "Warning text on its tint."),
  t("--warning-fill", "color", "Status", "Warning fill", "Warning tint."),
  t("--warning-line", "color", "Status", "Warning line", "Warning edge."),
  t("--warning-solid", "color", "Status", "Warning solid", "Warning fill behind white text."),
  t("--danger-ink", "color", "Status", "Danger ink", "Danger text, including on glass."),
  t("--danger-fill", "color", "Status", "Danger fill", "Danger tint."),
  t("--danger-line", "color", "Status", "Danger line", "Danger edge."),
  t("--danger-field-fill", "color", "Status", "Invalid field fill", "An invalid field's warmed white."),
  t("--info-ink", "color", "Status", "Info ink", "Info text on its tint."),
  t("--info-fill", "color", "Status", "Info fill", "Info tint."),
  t("--neutral-fill", "color", "Status", "Neutral fill", "Neutral pill tint."),

  // ── Surfaces ────────────────────────────────────────────────────────────
  t("--page-base", "color", "Surfaces", "Page base", "The field's base colour, under the blooms."),
  t("--page-background", "gradient", "Surfaces", "Page field", "The whole page field: blooms, a diagonal wash and the base."),
  t("--surface-solid", "color", "Surfaces", "Solid surface", "Cards, modals (public), fields."),
  t("--surface-sunken", "color", "Surfaces", "Sunken", "Info boxes, card header wash start, disabled fields."),
  t("--surface-sunken-2", "color", "Surfaces", "Sunken 2", "Card header wash end."),
  t("--recess-fill", "color", "Surfaces", "Recess", "The grey frosted controls: Select field, chips, search."),
  t("--recess-fill-hover", "color", "Surfaces", "Recess hover", "Recess on hover."),
  t("--scrim", "color", "Surfaces", "Scrim", "Behind sheets and overlays."),
  t("--wash-hover", "color", "Surfaces", "Wash: hover", "Brand wash for hovered rows and tiles."),
  t("--wash-subtle", "color", "Surfaces", "Wash: subtle", "Ghost button hover, pagination hover."),
  t("--wash-active", "color", "Surfaces", "Wash: active", "Pressed and open states."),
  t("--wash-strong", "color", "Surfaces", "Wash: strong", "Count badges, match highlights."),
  t("--chip-active-fill", "color", "Surfaces", "Active chip fill", "A filter chip whose filter is applied."),

  // ── Glass ───────────────────────────────────────────────────────────────
  t("--glass-fill", "color", "Glass", "Panel glass", "GlassPanel page fill."),
  t("--glass-fill-light", "color", "Glass", "Light glass", "GlassPanel light fill."),
  t("--glass-fill-nested", "color", "Glass", "Nested glass", "Glass inside glass; the glass table."),
  t("--chrome-sidebar", "color", "Glass", "Sidebar glass", "The sidebar's frosted fill."),
  t("--chrome-topbar", "color", "Glass", "Top bar glass", "The top bar's frosted fill."),
  t("--glass-edge", "color", "Glass", "Glass edge", "The lit edge of a glass panel."),
  t("--glass-edge-strong", "color", "Glass", "Strong glass edge", "Secondary button ring on glass."),
  t("--blur-panel", "backdrop", "Glass", "Panel blur", "backdrop-filter for page panels."),
  t("--blur-panel-light", "backdrop", "Glass", "Light panel blur", "backdrop-filter for light panels."),
  t("--blur-chrome", "backdrop", "Glass", "Chrome blur", "backdrop-filter for the sidebar and top bar."),
  t("--blur-row", "backdrop", "Glass", "Nested blur", "backdrop-filter for nested glass."),
  t("--blur-callout", "backdrop", "Glass", "Callout blur", "Secondary buttons and info callouts."),
  t("--blur-recess", "backdrop", "Glass", "Recess blur", "The grey frosted controls."),
  t("--popover-surface", "color", "Glass", "Popover glass", "Menus and dropdown lists."),
  t("--popover-blur", "backdrop", "Glass", "Popover blur", "backdrop-filter for popovers."),
  t("--modal-surface", "color", "Glass", "Modal glass", "The modal panel."),
  t("--modal-blur", "backdrop", "Glass", "Modal blur", "backdrop-filter for the modal panel."),
  t("--modal-scrim", "gradient", "Glass", "Modal scrim", "The veil behind a modal."),
  t("--modal-scrim-blur", "backdrop", "Glass", "Scrim blur", "How far the page recedes behind a modal."),
  t("--shadow-specular", "shadow", "Glass", "Specular edge", "The white top inner light line on glass."),
  t("--bloom-opacity", "number", "Glass", "Panel bloom", "GlassPanel bloom strength. 0 turns it off.", [0, 1, 0.05]),
  t("--modal-wash-opacity", "number", "Glass", "Modal tone wash", "The modal header's tone wash. 0 turns it off.", [0, 1, 0.05]),

  // ── Lines ───────────────────────────────────────────────────────────────
  t("--line", "color", "Lines", "Hairline", "Hairline on white."),
  t("--line-soft", "color", "Lines", "Soft line", "Row dividers."),
  t("--line-glass", "color", "Lines", "Glass line", "Dividers inside glass; table rows."),
  t("--line-input", "color", "Lines", "Field edge", "A field's resting border."),
  t("--line-brand", "color", "Lines", "Brand line", "Brand-tinted edges."),
  t("--neutral-border", "color", "Lines", "Control edge", "Checkbox and radio resting edge (3:1 non-text)."),

  // ── Focus ───────────────────────────────────────────────────────────────
  t("--focus-color", "color", "Focus", "Focus colour", "The focus ring's colour. Needs 3:1 against what it sits on."),
  t("--focus-gap", "color", "Focus", "Focus gap", "The inner ring that separates focus from fills."),
  t("--focus-ring", "shadow", "Focus", "Focus ring", "The composed ring: gap then colour."),
  t("--focus-halo", "shadow", "Focus", "Field halo", "The soft halo around a focused field."),

  // ── Radius ──────────────────────────────────────────────────────────────
  t("--r-2xs", "length", "Radius", "2xs", "Checkbox, tiny tag, kbd.", [0, 16, 1]),
  t("--r-xs", "length", "Radius", "xs", "Menu items, segmented thumb, calendar day.", [0, 20, 1]),
  t("--r-sm", "length", "Radius", "sm", "Small button, chip, tooltip.", [0, 24, 1]),
  t("--r-md", "length", "Radius", "md", "Medium button, input, callout.", [0, 28, 1]),
  t("--r-lg", "length", "Radius", "lg", "Large button, popover, toast.", [0, 32, 1]),
  t("--r-xl", "length", "Radius", "xl", "Card, nested glass, modal.", [0, 40, 1]),
  t("--r-2xl", "length", "Radius", "2xl", "Page-level glass panel, large modal.", [0, 48, 1]),
  t("--r-full", "length", "Radius", "Full", "Pills, count badges, avatars, switch.", [0, 999, 1]),

  // ── Scale ───────────────────────────────────────────────────────────────
  t("--density", "number", "Scale", "Density", "Multiplies every primitive's padding. 0.85 compact, 1.15 roomy.", [0.7, 1.4, 0.05]),
  t("--control-h-sm", "length", "Scale", "Control height sm", "Small buttons, chips, pagination.", [24, 44, 1]),
  t("--control-h-md", "length", "Scale", "Control height md", "Medium buttons.", [32, 52, 1]),
  t("--control-h-lg", "length", "Scale", "Control height lg", "Large buttons.", [40, 60, 1]),
  t("--field-h-sm", "length", "Scale", "Field height sm", "Small text fields.", [28, 48, 1]),
  t("--field-h-md", "length", "Scale", "Field height md", "Text fields, Select, DateField.", [36, 56, 1]),
  t("--border-w", "length", "Scale", "Hairline width", "Card, popover, pill and tooltip borders.", [0, 3, 0.5]),
  t("--border-w-field", "length", "Scale", "Field border width", "Text field edges.", [0, 3, 0.5]),

  // ── Shadow ──────────────────────────────────────────────────────────────
  t("--shadow-hairline-card", "shadow", "Shadow", "Card", "Elevation 1: the white card's near-flat contact shadow."),
  t("--shadow-control", "shadow", "Shadow", "Control", "Secondary buttons on solid surfaces."),
  t("--shadow-recess", "shadow", "Shadow", "Recess", "The pressed-in look of the grey controls."),
  t("--shadow-input", "shadow", "Shadow", "Field", "A text field's hairline shadow."),
  t("--shadow-panel-light", "shadow", "Shadow", "Light panel", "Elevation 2: light glass panels."),
  t("--shadow-panel", "shadow", "Shadow", "Panel", "Elevation 3: page glass panels, two layers."),
  t("--shadow-float", "shadow", "Shadow", "Float", "Elevation 4: light tooltips, the skip link."),
  t("--shadow-lift", "shadow", "Shadow", "Lift", "The highlighted card's soft pooled lift."),
  t("--shadow-menu", "shadow", "Shadow", "Menu", "Menus in the public system."),
  t("--popover-shadow", "shadow", "Shadow", "Popover", "Menus and dropdowns: shade above, lift below."),
  t("--modal-shadow", "shadow", "Shadow", "Modal", "Elevation 5: the modal panel."),
  t("--shadow-chrome", "shadow", "Shadow", "Chrome", "Profile chip and top bar controls."),
  t("--shadow-auth-card", "shadow", "Shadow", "Sign-in card", "The sign-in card on its field."),
  t("--glow-sm", "shadow", "Shadow", "Glow sm", "Ticked boxes, active page number."),
  t("--glow-md", "shadow", "Shadow", "Glow md", "Primary button at rest."),
  t("--glow-md-hover", "shadow", "Shadow", "Glow md hover", "Primary button on hover."),
  t("--glow-danger", "shadow", "Shadow", "Danger glow", "Danger button at rest."),

  // ── Type ────────────────────────────────────────────────────────────────
  t("--font-display", "font", "Type", "Display face", "h1, h2, page and modal titles."),
  t("--font-body", "font", "Type", "Body face", "Everything else."),
  t("--text-body", "length", "Type", "Body size", "Body copy.", [12, 18, 0.5]),
  t("--text-small", "length", "Type", "Small size", "Table cells, captions.", [11, 16, 0.5]),
  t("--text-caption", "length", "Type", "Caption size", "Hints, column headers.", [10, 14, 0.5]),
  t("--text-input", "length", "Type", "Input size", "Text in fields.", [13, 18, 0.5]),
  t("--text-page-title", "length", "Type", "Page title", "Page h1.", [22, 40, 1]),

  // ── Motion ──────────────────────────────────────────────────────────────
  t("--dur-fast", "duration", "Motion", "Fast", "Menu items, tooltips."),
  t("--dur", "duration", "Motion", "Standard", "Hover and press transitions."),
  t("--dur-slow", "duration", "Motion", "Slow", "Edges and larger changes."),
  t("--ease", "easing", "Motion", "Ease", "Standard easing."),
  t("--ease-out", "easing", "Motion", "Ease out", "Entrances."),

  // ── Scroll ──────────────────────────────────────────────────────────────
  t("--scrollbar-width", "keyword", "Scroll", "Scrollbar width", "thin, auto or none."),
  t("--scrollbar-thumb", "color", "Scroll", "Scrollbar thumb", "The thumb's tint."),
  t("--scrollbar-track", "color", "Scroll", "Scrollbar track", "The track (transparent in the default theme)."),
  t("--scroll-edge-top", "shadow", "Scroll", "Top edge shadow", "Cast by a header once content has scrolled under it."),
  t("--scroll-edge-bottom", "shadow", "Scroll", "Bottom edge shadow", "Cast by a footer while there is more below."),

  // ── Shell ───────────────────────────────────────────────────────────────
  t("--topbar-height", "length", "Shell", "Top bar height", "The top bar, and the logo corner with it.", [56, 96, 1]),
  t("--sidebar-art", "image", "Shell", "Sidebar watermark", "An image bleeding off the sidebar's foot. none turns it off."),
  t("--sidebar-art-opacity", "number", "Shell", "Watermark strength", "Its opacity.", [0, 0.4, 0.01]),

  // ── Table ───────────────────────────────────────────────────────────────
  t("--table-head-fill", "gradient", "Table", "Header fill", "The header row's sweep."),
  t("--table-head-ink", "color", "Table", "Header ink", "Column header text."),
  t("--table-head-pad", "other", "Table", "Header padding", "Header cell padding (y x)."),
  t("--table-cell-pad", "other", "Table", "Cell padding", "Body cell padding (y x)."),
  t("--table-row-hover", "color", "Table", "Row hover", "A hovered row's wash."),
  t("--table-row-line", "other", "Table", "Row rule", "The rule between rows."),
];

export const TOKEN_GROUPS: ReadonlyArray<TokenGroup> = [
  "Palette",
  "Ink",
  "Brand and gradients",
  "Status",
  "Surfaces",
  "Glass",
  "Lines",
  "Focus",
  "Radius",
  "Scale",
  "Shadow",
  "Type",
  "Motion",
  "Scroll",
  "Shell",
  "Table",
  "Overlays",
];

const BY_NAME = new Map(TOKENS.map((m) => [m.name, m]));

export function tokenMeta(name: string): TokenMeta | undefined {
  return BY_NAME.get(name);
}

/** A best guess for a token the catalogue does not list, from its name and value. */
export function inferKind(name: string, value: string): TokenKind {
  const v = value.trim();
  if (/^--rgb-/.test(name)) return "channel";
  if (/gradient\(/.test(v)) return "gradient";
  if (/^url\(/.test(v)) return "image";
  if (/^(blur|saturate)\(/.test(v)) return "backdrop";
  if (/shadow|glow|ring|halo|outline/.test(name) && /\d+px/.test(v)) return "shadow";
  if (/^-?[\d.]+(px|em|rem|%)$/.test(v) || /^calc\(/.test(v)) return "length";
  if (/^-?[\d.]+$/.test(v)) return "number";
  if (/^\d+ms$/.test(v)) return "duration";
  if (/^cubic-bezier|^ease/.test(v)) return "easing";
  if (/^(#|rgb|hsl|var\(--)/.test(v) || v === "transparent") return "color";
  if (/font/.test(name)) return "font";
  return "other";
}
