import type { RegistryEntry } from "../types";

const FIELD_A11Y =
  "Wrap it in <Field label=…>: Field wires the label, hint and error to the control (id, aria-describedby, aria-invalid) through context, so the control needs no ids of its own.";

export const FORMS: RegistryEntry[] = [
  {
    slug: "text-input",
    name: "TextInput",
    category: "Forms",
    summary: "The text field: a white box with a tinted edge, a brand halo on focus, adornments and a password reveal.",
    description: [
      "TextInput is the one box every text-like field wears: Textarea, Select's field trigger, DateField, SearchField and PrefixedInput all share its --input-* tokens, so one theme change moves them together.",
      "Focus is drawn on the whole box, adornments included (a leading icon, a trailing unit, the reveal button), never on the bare <input>. Invalid warms the fill and turns the edge to the danger hue; read-only is a dashed sunken box; disabled is flat and sunken.",
      "It is a plain controlled or uncontrolled <input>: every native attribute passes through (type, autoComplete, inputMode, maxLength).",
    ],
    importLine: `import { Field, TextInput } from "@/components/ui";`,
    usage: `<Field label="Email" hint="We send the sign-in link here.">
  <TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>`,
    props: ["TextInput", "Field"],
    css: ["components/ui/TextInput/TextInput.module.css", "components/ui/Field/Field.module.css"],
    examples: [
      {
        id: "default",
        title: "In a Field",
        description: "Label, hint and error come from Field; the input reads them from context.",
        code: `<Field label="Project name" hint="Shown to everyone on the team.">
  <TextInput placeholder="e.g. Atlas redesign" />
</Field>`,
      },
      {
        id: "adornments",
        title: "Adornments and reveal",
        code: `<TextInput leadingIcon={<IconSearch size={16} />} placeholder="Search" />
<TextInput trailing="kg" inputMode="decimal" />
<TextInput type="password" revealable autoComplete="current-password" />`,
      },
      {
        id: "states",
        title: "States",
        code: `<Field label="Postcode" error="Enter a 4-digit postcode.">
  <TextInput invalid defaultValue="20" />
</Field>
<TextInput readOnly defaultValue="INV-1042" mono />
<TextInput disabled placeholder="Disabled" />
<TextInput size="sm" placeholder="Small" />`,
      },
    ],
    accessibility: [
      FIELD_A11Y,
      "Placeholder ink holds 4.97:1 on the white box; never put instructions only in a placeholder.",
      "revealable adds a real button inside the box whose name switches between \"Show password\" and \"Hide password\" (no aria-pressed, which would read as \"Hide password, pressed\").",
      "Set autoComplete on every personal-data field (WCAG 1.3.5).",
    ],
    dos: ["Size the box to the content where the content is short (a postcode), with a className width."],
    donts: [
      "Don't style the <input> itself; theme the box with --input-* tokens.",
      "Don't show an error before the user has left the field or submitted.",
    ],
    related: ["select", "textarea", "search-field"],
    depth: "full",
  },
  {
    slug: "textarea",
    name: "Textarea",
    category: "Forms",
    summary: "Multi-line text in the TextInput box, resizable vertically, with an optional character count.",
    description: ["Textarea wears the TextInput box and tokens. showCount with maxLength shows a live count that turns to warning ink near the limit."],
    importLine: `import { Field, Textarea } from "@/components/ui";`,
    usage: `<Field label="Note for the customer">
  <Textarea maxLength={1000} showCount rows={4} />
</Field>`,
    props: ["Textarea"],
    css: ["components/ui/Textarea/Textarea.module.css"],
    examples: [{ id: "default", title: "With a count", code: `<Textarea maxLength={280} showCount placeholder="Plain language." />` }],
    accessibility: [FIELD_A11Y, "The count sits in a polite live region tied to the textarea by aria-describedby."],
    dos: ["Give a maxLength whenever the server has one."],
    donts: ["Don't disable resize; vertical resize is the user's."],
    depth: "summary",
  },
  {
    slug: "select",
    name: "Select",
    category: "Forms",
    summary: "A custom listbox: a recessed field or filter chip that opens a frosted popover, optionally searchable.",
    description: [
      "Select replaces the native <select> with a combobox and a listbox popover that keeps the design system's look while matching native keyboard behaviour. It has two appearances: field (a grey frosted recess, so a choice reads as something you press rather than type in) and chip (the compact filter dropdown used in a FilterBar).",
      "Options can be grouped (consecutive options sharing group), described (a second line), disabled, and counted (filter dropdowns show how many rows each option would show). searchable adds a pinned search well with keyword matching for long lists.",
      "The popover portals to document.body, flips above the trigger when there is no room below, and returns focus to the trigger on close.",
    ],
    importLine: `import { Field, Select } from "@/components/ui";`,
    usage: `<Field label="Topic">
  <Select
    value={topic}
    onChange={setTopic}
    placeholder="Choose a topic"
    options={[
      { value: "billing", label: "Billing and invoices" },
      { value: "access", label: "Account access" },
    ]}
  />
</Field>`,
    props: ["Select"],
    css: ["components/ui/Select/Select.module.css", "components/ui/TextInput/TextInput.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline renders the list open under its trigger, in place: how it looks when someone opens it.", code: `<Select inline aria-label="Topic" value={topic} onChange={setTopic} options={TOPICS} />` }, 
      {
        id: "field",
        title: "Field appearance",
        code: `<Select value={value} onChange={setValue} placeholder="Choose a topic" options={TOPICS} />`,
      },
      {
        id: "chip",
        title: "Chip appearance (filters)",
        description: "active marks a chip whose filter is applied; count shows the rows each option would leave.",
        code: `<Select
  appearance="chip"
  aria-label="Status"
  value={status}
  onChange={setStatus}
  active={status !== "all"}
  options={[
    { value: "all", label: "All statuses" },
    { value: "sent", label: "Sent", count: 2 },
    { value: "paid", label: "Paid", count: 5 },
  ]}
/>`,
      },
      {
        id: "searchable",
        title: "Searchable, grouped",
        code: `<Select searchable value={project} onChange={setProject} placeholder="Choose a project" options={PROJECTS} />`,
      },
      { id: "states", title: "Invalid and disabled", code: `<Select invalid … />\n<Select disabled … />` },
    ],
    accessibility: [
      "The trigger is role=\"combobox\" with aria-expanded, aria-controls and aria-activedescendant; options are role=\"option\" with aria-selected.",
      "Keyboard: Down, Up, Enter, Space, Home and End open it; Up/Down/Home/End/PageUp/PageDown move; typing jumps to the next label starting with those letters (closed, it selects); Enter or Space selects; Esc clears a search first, then closes, and stops there so an enclosing Modal stays open; Tab closes without selecting and moves on.",
      "Searchable lists announce the result count through a polite status region.",
      "A chip has no visible label, so aria-label is required on it.",
      FIELD_A11Y,
    ],
    dos: [
      "Use appearance=\"chip\" inside FilterBar, and \"field\" in forms.",
      "Turn on searchable past roughly 12 options.",
      "Use RadioGroup instead when there are 2 to 4 options a user should compare at a glance.",
    ],
    donts: [
      "Don't use a native <select>; it cannot take the theme.",
      "Don't put actions (\"Add new…\") inside the options; that is a Menu.",
    ],
    related: ["text-input", "filter-bar", "radio-group", "menu"],
    depth: "full",
  },
  {
    slug: "search-field",
    name: "SearchField",
    category: "Forms",
    summary: "Field-size search on the grey frosted recess: clear button, loading state and an optional key hint.",
    description: ["SearchField is the search box on a page (not in a filter row, where FilterSearch lives). It lifts toward white while focused, shows a clear button once there is a query, and can show a shortcut hint (\"/\") that focuses it from anywhere."],
    importLine: `import { SearchField } from "@/components/ui";`,
    usage: `<SearchField aria-label="Search invoices" value={q} onValueChange={setQ} placeholder="Customer or invoice number" />`,
    props: ["SearchField"],
    css: ["components/ui/SearchField/SearchField.module.css"],
    examples: [{ id: "default", title: "Default, loading", code: `<SearchField value={q} onValueChange={setQ} loading={pending} shortcut="/" aria-label="Search" />` }],
    accessibility: ["Renders input type=\"search\". Esc clears the query and stops there, so an enclosing modal stays open; a second Esc on an empty field bubbles. The clear button returns focus to the input.", "Give it an aria-label or a Field label."],
    dos: ["Debounce the query yourself; the field reports every keystroke."],
    donts: ["Don't use it inside a FilterBar; use FilterSearch there so heights match."],
    depth: "summary",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Forms",
    summary: "A native checkbox drawn as a gradient tick, plain or as a selectable card, with indeterminate.",
    description: ["Checkbox keeps the real <input type=\"checkbox\"> (visually hidden, focusable, form-posting) and draws the box beside it. variant=\"card\" turns the whole option into a bordered target for statements a user agrees to (terms, declarations)."],
    importLine: `import { Checkbox } from "@/components/ui";`,
    usage: `<Checkbox label="I accept the workspace terms" checked={ok} onChange={(e) => setOk(e.target.checked)} />`,
    props: ["Checkbox"],
    css: ["components/ui/Checkbox/Checkbox.module.css"],
    examples: [{ id: "default", title: "Plain, card, indeterminate", code: `<Checkbox label="Email me updates" />\n<Checkbox variant="card" label="I accept the terms" description="Required to continue." />\n<Checkbox indeterminate label="Select all" />` }],
    accessibility: ["The label is the <label> of the real input, so the whole row toggles it.", "error renders under the option and is tied by aria-describedby."],
    dos: ["Use the card variant for statements a user signs up to."],
    donts: ["Don't use a checkbox to trigger an immediate action; that is a Switch."],
    depth: "summary",
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    category: "Forms",
    summary: "One choice from a few: a list, inline, or cards in 1 to 3 columns.",
    description: ["RadioGroup renders real radio inputs in a fieldset. The cards variant suits two to four choices that need a sentence each (a billing period, a plan)."],
    importLine: `import { RadioGroup } from "@/components/ui";`,
    usage: `<RadioGroup aria-label="Billing period" value={period} onChange={setPeriod} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />`,
    props: ["RadioGroup"],
    css: ["components/ui/RadioGroup/RadioGroup.module.css"],
    examples: [{ id: "default", title: "Cards", code: `<RadioGroup variant="cards" columns={3} value={v} onChange={setV} options={PERIODS} aria-label="Billing period" />` }],
    accessibility: ["Arrow keys move the choice within the group, as native radios do.", "Radio dots stay round in every theme: a square radio reads as a checkbox."],
    dos: ["Prefer RadioGroup over Select for 2 to 4 options."],
    donts: ["Don't preselect a choice the user must consciously make (accepting terms, a paid plan)."],
    depth: "summary",
 },
  {
    slug: "switch",
    name: "Switch",
    category: "Forms",
    summary: "An on/off setting that takes effect immediately, with a loading state while it saves.",
    description: ["Switch is role=\"switch\" on a button. Use it for settings that apply at once; use Checkbox inside forms that are submitted."],
    importLine: `import { Switch } from "@/components/ui";`,
    usage: `<Switch label="Email me when an invoice is paid" checked={on} onChange={setOn} />`,
    props: ["Switch"],
    css: ["components/ui/Switch/Switch.module.css"],
    examples: [{ id: "default", title: "States", code: `<Switch label="Saving" checked loading onChange={…} />` }],
    accessibility: ["aria-checked reflects state; loading sets aria-busy and blocks toggling."],
    dos: ["Say what is on, not what pressing does: \"Email notifications\"."],
    donts: ["Don't use a Switch inside a form that has a submit button."],
    depth: "summary",
  },
  {
    slug: "otp-input",
    name: "OtpInput",
    category: "Forms",
    summary: "A six-cell one-time code entry with paste, auto-advance and onComplete.",
    description: ["OtpInput is one real input per cell with roving focus. Pasting a full code fills every cell and fires onComplete."],
    importLine: `import { OtpInput } from "@/components/ui";`,
    usage: `<OtpInput aria-label="Authenticator code" value={code} onChange={setCode} onComplete={verify} />`,
    props: ["OtpInput"],
    css: ["components/ui/OtpInput/OtpInput.module.css"],
    examples: [{ id: "default", title: "Default", code: `<OtpInput value={code} onChange={setCode} aria-label="Authenticator code" />` }],
    accessibility: ["autocomplete=\"one-time-code\" on the first cell lets phones offer the SMS code."],
    dos: ["Verify on onComplete; don't make users press a button too."],
    donts: ["Don't clear the code on a wrong attempt without saying why."],
    depth: "summary",
  },
  {
    slug: "date-field",
    name: "DateField",
    category: "Forms",
    summary: "A typed DD/MM/YYYY field with a calendar popover, min/max and a date-of-birth preset.",
    description: ["DateField accepts typing (DD/MM/YYYY, day first) or picking from Calendar. preset=\"dob\" opens on a sensible year with a year dropdown, for dates decades back."],
    importLine: `import { DateField } from "@/components/ui";`,
    usage: `<Field label="Due date"><DateField value={due} onChange={setDue} /></Field>`,
    props: ["DateField", "Calendar"],
    css: ["components/ui/DateField/DateField.module.css", "components/ui/DateField/Calendar.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline shows the calendar open under the field, in place.", code: `<DateField inline aria-label="Due date" value={due} onChange={setDue} />` }, { id: "default", title: "Default", code: `<DateField value={date} onChange={setDate} min="2026-01-01" />` }],
    accessibility: ["The calendar is a grid with arrow-key navigation; Esc returns focus to the field."],
    dos: ["Always let people type a date of birth; never force a calendar for it."],
    donts: ["Don't mix date orders within one product."],
    depth: "summary",
  },
  {
    slug: "date-range-filter",
    name: "DateRangeFilter",
    category: "Forms",
    summary: "A date-range chip for filter rows: presets plus a two-month range calendar.",
    description: ["DateRangeFilter is the date filter in a FilterBar. It reads as a chip like Select's, with presets (last 7 days, this month) and a range calendar."],
    importLine: `import { DateRangeFilter } from "@/components/ui";`,
    usage: `<DateRangeFilter aria-label="Issued" value={range} onChange={setRange} />`,
    props: ["DateRangeFilter"],
    css: ["components/ui/DateRangeFilter/DateRangeFilter.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline shows the presets and calendars open under the chip, in place.", code: `<DateRangeFilter inline aria-label="Issued" value={range} onChange={setRange} />` }, { id: "default", title: "Chip", code: `<DateRangeFilter value={range} onChange={setRange} aria-label="Date" />` }],
    accessibility: ["The clear button is a separate control, so the trigger never nests a button."],
    dos: ["Put it after the Select chips in a FilterBar."],
    donts: ["Don't use it for a single date; that is DateField."],
    depth: "summary",
  },
  {
    slug: "file-drop",
    name: "FileDrop",
    category: "Forms",
    summary: "A drop zone and file picker with type and size checks and per-file status chips.",
    description: ["FileDrop validates type and size client-side, lists files as FileChips with uploading, done and error states, and keeps a real file input for keyboard users."],
    importLine: `import { FileDrop } from "@/components/ui";`,
    usage: `<FileDrop files={files} onFilesChange={setFiles} accept={[".pdf"]} multiple={false} />`,
    props: ["FileDrop", "FileChip"],
    css: ["components/ui/FileDrop/FileDrop.module.css"],
    examples: [{ id: "default", title: "Default", code: `<FileDrop files={files} onFilesChange={setFiles} />` }],
    accessibility: ["The \"Choose files\" button opens the native picker; drag and drop is an enhancement, never the only way."],
    dos: ["State the accepted types and size limit in description."],
    donts: ["Don't trust the client check; validate on the server too."],
    depth: "summary",
  },
  {
    slug: "field",
    name: "Field",
    category: "Forms",
    summary: "Label, hint, error and required marker for any control, wired through context.",
    description: ["Field renders the label and messages and hands ids to the control inside it (useField). group=true renders a fieldset and legend for RadioGroup and Checkbox lists."],
    importLine: `import { Field } from "@/components/ui";`,
    usage: `<Field label="Email" required error={errors.email}><TextInput type="email" /></Field>`,
    props: ["Field"],
    css: ["components/ui/Field/Field.module.css"],
    examples: [{ id: "default", title: "Required, optional, error", code: `<Field label="Phone" optional><TextInput /></Field>` }],
    accessibility: ["The error is linked by aria-describedby and the control gets aria-invalid.", "labelStyle=\"caps\" is the compact auth-card label; sentence case everywhere else."],
    dos: ["Mark the rare field instead: if most are required, mark the optional ones."],
    donts: ["Don't hide the label; use hideLabel only when a visible heading already names the control."],
    depth: "summary",
  },
  {
    slug: "error-summary",
    name: "ErrorSummary",
    category: "Forms",
    summary: "The list of form errors at the top of a form, focused on submit, each linking to its field.",
    description: ["ErrorSummary follows the GOV.UK pattern: after a failed submit it takes focus, lists every error as a link, and each link moves focus to the field."],
    importLine: `import { ErrorSummary } from "@/components/ui";`,
    usage: `<ErrorSummary errors={[{ id: "email", message: "Enter an email address" }]} focusKey={submitCount} />`,
    props: ["ErrorSummary"],
    css: ["components/ui/ErrorSummary/ErrorSummary.module.css"],
    examples: [{ id: "default", title: "Default", code: `<ErrorSummary errors={errors} focusKey={attempt} />` }],
    accessibility: ["role=\"alert\" and focus moves to the summary when focusKey changes, so it is announced once per submit."],
    dos: ["Use the same message text here and under the field."],
    donts: ["Don't show it before the first submit."],
    depth: "summary",
  },
  {
    slug: "prefixed-input",
    name: "PrefixedInput",
    category: "Forms",
    summary: "A fixed-format code with a set prefix: an invoice number, an account code, a membership number.",
    description: [
      "PrefixedInput is the TextInput box with a fixed prefix segment set into its left end (\"INV\", \"ACC-\") and a counter at the right. The prefix is part of the box, never typed. charset is digits (the default) or alphanumeric, upper-cased as typed.",
      "It normalises whatever is pasted or autofilled (with or without the prefix, spaces or dashes) and reports both the full code and the body after the prefix. Leaving it part-filled marks it invalid; an empty field is left to the form's required check.",
    ],
    importLine: `import { Field, PrefixedInput } from "@/components/ui";`,
    usage: `<Field label="Invoice number">
  <PrefixedInput prefix="INV" length={6} value={code} onValueChange={(full) => setCode(full)} />
</Field>`,
    props: ["PrefixedInput"],
    css: ["components/ui/PrefixedInput/PrefixedInput.module.css", "components/ui/TextInput/TextInput.module.css"],
    examples: [
      { id: "default", title: "Digits", code: `<PrefixedInput prefix="INV" length={6} value={v} onValueChange={(code) => setV(code)} />` },
      { id: "alphanumeric", title: "Letters and numbers", code: `<PrefixedInput prefix="ACC-" length={8} charset="alphanumeric" value={v} onValueChange={(code) => setV(code)} />` },
      {
        id: "phone",
        title: "Switchable prefix (phone)",
        description:
          "prefixOptions turns the prefix into a dropdown. Each option carries its own length so a +61 mobile, a +61 landline, a 1300, a 13 and a 1800 all fit the same field. Pasting a full number picks the matching option automatically. Add validate(body) to catch invalid formats (AU numbers after +61 start with 2, 3, 4, 7, or 8) and detail(body) to show a plain-English hint under the field as the user types.",
        code: `const AU_AREAS = {
  "2": "NSW / ACT landline",
  "3": "VIC / TAS landline",
  "4": "Mobile",
  "7": "QLD landline",
  "8": "WA / SA / NT landline",
};

<PrefixedInput
  prefixOptions={[
    {
      value: "+61",
      label: "Mobile or landline",
      length: 9,
      validate: (b) =>
        AU_AREAS[b[0]]
          ? null
          : "Australian numbers after +61 start with 2 (NSW/ACT), 3 (VIC/TAS), 4 (mobile), 7 (QLD), or 8 (WA/SA/NT).",
      detail: (b) => AU_AREAS[b[0]] ?? null,
    },
    { value: "1300", label: "Business", length: 6, detail: () => "Local-rate business number" },
    { value: "13", label: "Short code", length: 4, detail: () => "National short code (max 4 digits)" },
    { value: "1800", label: "Toll-free", length: 6, detail: () => "Free for the caller" },
  ]}
  value={p}
  onValueChange={(code) => setP(code)}
/>`,
      },
    ],
    accessibility: [
      FIELD_A11Y,
      "The prefix and the expected length are read out through a visually hidden description tied to the input.",
      "A refused key shows a short note in the counter and announces it politely, so a refusal is never silent.",
      "In switchable-prefix mode the dropdown is a listbox: arrow keys move between options, Enter picks, Escape closes and returns focus to the trigger.",
    ],
    dos: [
      "Validate the full code on the server too.",
      "Use it only where the format is truly fixed.",
      "Reach for prefixOptions when the user must pick from a small set of fixed-length formats (phone type, country code, SKU family).",
    ],
    donts: [
      "Don't use it for free text that merely starts with a word; use TextInput with a leading adornment.",
      "Don't put >5 options in the prefix dropdown; use a Combobox or a dedicated phone-country picker instead.",
    ],
    related: ["text-input"],
    depth: "summary",
  },
];
