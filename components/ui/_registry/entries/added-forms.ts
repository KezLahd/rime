import type { RegistryEntry } from "../types";

// Components added to match the shadcn/ui set (forms and actions group).
export const ADDED_FORMS: RegistryEntry[] = [
  {
    slug: "button-group",
    name: "ButtonGroup",
    category: "Actions",
    summary: "Joins Buttons and IconButtons into one segmented row or column with shared outer corners.",
    description: [
      "ButtonGroup shapes related actions into one control: the outer corners keep the buttons' radius, the joins between them are square, and neighbouring edges share a single hairline. It only shapes; each button keeps its own variant, size, loading and disabled state.",
      "Use it for a split button (a primary action plus a chevron for its options), a pair of previous and next buttons, or a short set of related secondary actions. For a choice that stays selected, use ToggleGroup or SegmentedControl instead.",
    ],
    importLine: `import { Button, ButtonGroup } from "@/components/ui";`,
    usage: `<ButtonGroup aria-label="Invoice actions">
  <Button variant="secondary">Archive</Button>
  <Button variant="secondary">Report</Button>
</ButtonGroup>`,
    props: ["ButtonGroup"],
    defaults: { ButtonGroup: { orientation: `"horizontal"` } },
    css: ["components/ui/ButtonGroup/ButtonGroup.module.css"],
    examples: [
      {
        id: "default",
        title: "Groups and a split button",
        code: `<ButtonGroup aria-label="Invoice actions">
  <Button variant="secondary">Archive</Button>
  <Button variant="secondary">Report</Button>
  <Button variant="secondary">Snooze</Button>
</ButtonGroup>
<ButtonGroup aria-label="Send">
  <Button>Send invoice</Button>
  <IconButton variant="primary" label="More send options" icon={<IconChevronDown size={16} />} />
</ButtonGroup>`,
      },
      {
        id: "vertical",
        title: "Vertical",
        code: `<ButtonGroup orientation="vertical" aria-label="Order view">
  <Button variant="secondary">Details</Button>
  <Button variant="secondary">Line items</Button>
  <Button variant="secondary">History</Button>
</ButtonGroup>`,
      },
    ],
    accessibility: [
      "Renders role=\"group\" with aria-orientation. Give it an aria-label that names the set (\"Invoice actions\").",
      "Every button stays a real, separately focusable button in reading order; hover and focus lift the button over its neighbours so its focus ring is drawn whole.",
    ],
    dos: ["Keep a group to one variant, except a split button's primary half.", "Group two to five actions that belong together."],
    donts: [
      "Don't use a ButtonGroup for a selected state; that is ToggleGroup or SegmentedControl.",
      "Don't put two primary buttons in one group.",
    ],
    related: ["button", "toggle-group"],
    depth: "full",
  },
  {
    slug: "label",
    name: "Label",
    category: "Forms",
    summary: "A standalone form label with required and optional markers, for controls outside a Field.",
    description: [
      "Field renders its own label and wires it to the control, so most forms never need Label. Use Label when a control sits outside a Field: a custom group, a Slider row, a label beside a Switch in a dense settings list.",
      "required adds a red asterisk; optional adds a muted \"(optional)\". Mark whichever is rarer on the form. labelStyle=\"caps\" matches Field's compact uppercase label.",
    ],
    importLine: `import { Label } from "@/components/ui";`,
    usage: `<Label htmlFor="project-name" required>Project name</Label>
<TextInput id="project-name" required />`,
    props: ["Label"],
    defaults: { Label: { labelStyle: `"sentence"` } },
    css: ["components/ui/Label/Label.module.css"],
    examples: [
      {
        id: "default",
        title: "Required and optional",
        code: `<Label htmlFor="name" required>Project name</Label>
<TextInput id="name" required />
<Label htmlFor="po" optional>Purchase order</Label>
<TextInput id="po" />`,
      },
      {
        id: "styles",
        title: "Styles",
        code: `<Label>Sentence label</Label>
<Label labelStyle="caps">Caps label</Label>
<Label disabled>Disabled label</Label>`,
      },
    ],
    accessibility: [
      "Renders a real <label>. Point htmlFor at the control's id so clicking the label focuses it and the control gets its accessible name.",
      "The asterisk is hidden from assistive tech; set required on the control itself so it is announced.",
    ],
    dos: ["Prefer Field, which wires label, hint and error for you.", "Write labels as nouns in sentence case."],
    donts: ["Don't use a Label without htmlFor (or wrapping the control).", "Don't put instructions in a label; use a hint."],
    related: ["field", "text-input"],
    depth: "full",
  },
  {
    slug: "input-group",
    name: "InputGroup",
    category: "Forms",
    summary: "A text field with addons joined to it: a fixed text segment, an icon, or a button such as Copy.",
    description: [
      "InputGroup wears the TextInput box and its --input-* tokens, with addons set into either end. A string addon (\"https://\", \"$\", \"kg\") is drawn as a sunken text segment divided by a hairline; an element addon (an icon or an IconButton) sits inline.",
      "Focus, invalid, read-only and disabled all draw on the whole group, addons included. The <input> takes every native attribute, and reads its id, required and error state from a surrounding Field.",
    ],
    importLine: `import { InputGroup } from "@/components/ui";`,
    usage: `<Field label="Website">
  <InputGroup start="https://" placeholder="example.com" />
</Field>`,
    props: ["InputGroup"],
    defaults: { InputGroup: { size: `"md"` } },
    css: ["components/ui/InputGroup/InputGroup.module.css", "components/ui/TextInput/TextInput.module.css"],
    examples: [
      {
        id: "default",
        title: "Text, icon and button addons",
        code: `<InputGroup start="https://" placeholder="example.com" aria-label="Website" />
<InputGroup start={<IconSearch size={16} />} placeholder="Search invoices" aria-label="Search invoices" />
<InputGroup start="$" end="USD" inputMode="decimal" aria-label="Amount" />
<InputGroup readOnly mono defaultValue="sk_live_4f9a2c" aria-label="API key"
  end={<IconButton size="sm" label="Copy key" icon={<Copy size={14} />} />} />`,
      },
      {
        id: "field",
        title: "In a Field",
        code: `<Field label="Workspace address" hint="Letters, numbers and dashes.">
  <InputGroup end=".example.app" placeholder="acme" />
</Field>
<Field label="Weight" error="Enter a weight under 30 kg.">
  <InputGroup end="kg" inputMode="decimal" />
</Field>`,
      },
    ],
    accessibility: [
      "Text addons are visual only (aria-hidden). If the unit matters to understanding, say it in the label or hint as well (\"Weight in kg\").",
      "Button addons are real buttons with their own accessible names, after the input in tab order.",
      "Wrap it in <Field label=…> so the label, hint and error are wired through context.",
    ],
    dos: ["Use a text addon for a fixed part the user should not type.", "Use PrefixedInput when the whole value has a fixed format."],
    donts: ["Don't put more than one button in an addon.", "Don't style the <input> directly; theme the box with --input-* tokens."],
    related: ["text-input", "prefixed-input", "field"],
    depth: "full",
  },
  {
    slug: "combobox",
    name: "Combobox",
    category: "Forms",
    summary: "A text field that filters a list of options as you type and picks one, with optional create.",
    description: [
      "Combobox is the editable combobox: typing opens a frosted list and narrows it by label, description and keywords. It suits long lists people know the name of (a project, a country, a customer). For a short fixed list a person compares, use Select; Select's searchable mode is the same idea with a button trigger.",
      "Leaving the field restores the chosen option's label, so the text never disagrees with the value. creatable offers \"Create …\" when the text matches nothing, and hands the text to onCreate.",
      "inline renders the list open in normal flow under the field instead of a portalled popover: for docs, previews and pickers that live inside a panel.",
    ],
    importLine: `import { Combobox } from "@/components/ui";`,
    usage: `<Field label="Project">
  <Combobox options={PROJECTS} value={project} onChange={setProject} placeholder="Type to search projects" />
</Field>`,
    props: ["Combobox"],
    defaults: { Combobox: { size: `"md"`, emptyText: `"No matches"`, inline: "false", defaultOpen: "false" } },
    css: ["components/ui/Combobox/Combobox.module.css", "components/ui/TextInput/TextInput.module.css"],
    examples: [
      {
        id: "open",
        title: "Open list",
        description: "Shown inline so the list is visible; in a form it is a popover.",
        code: `<Combobox inline aria-label="Project" options={PROJECTS} value={project} onChange={setProject} />`,
      },
      {
        id: "field",
        title: "In a Field",
        code: `<Field label="Project">
  <Combobox options={PROJECTS} value={project} onChange={setProject} placeholder="Type to search projects" />
</Field>`,
      },
      {
        id: "creatable",
        title: "Creatable",
        code: `<Combobox
  creatable
  options={tags}
  value={tag}
  onChange={setTag}
  onCreate={(label) => {
    const value = slugify(label);
    setTags((t) => [...t, { value, label }]);
    setTag(value);
  }}
/>`,
      },
    ],
    accessibility: [
      "The input is role=\"combobox\" with aria-expanded, aria-controls, aria-autocomplete=\"list\" and aria-activedescendant, so focus stays in the field while Up and Down move the highlight.",
      "Keyboard: typing filters, Up and Down move (and open), Home and End jump, Enter picks, Esc closes and then clears, Tab closes and moves on.",
      "The number of results is announced through a polite status region as you type.",
      "Give it a Field label, or aria-label when it stands alone.",
    ],
    dos: ["Search descriptions and keywords, not only labels.", "Use creatable only where adding a value is safe and expected (tags)."],
    donts: ["Don't use Combobox for fewer than about eight options; use Select or RadioGroup.", "Don't allow free text that is not saved as an option; that is a TextInput."],
    related: ["select", "command", "field"],
    depth: "full",
  },
  {
    slug: "slider",
    name: "Slider",
    category: "Forms",
    summary: "Picks a number or a range by dragging along a track, with steps, marks and a value readout.",
    description: [
      "Slider takes one value or a [low, high] range (two thumbs that never cross). The chosen span is drawn in the accent gradient over a recessed track. step snaps every value, marks draw labelled ticks, and showValue prints the formatted value beside the label.",
      "Use it where the exact number matters less than its position in a range (volume, a price filter, a threshold). When the exact number matters, pair it with a TextInput or use the input alone.",
    ],
    importLine: `import { Slider } from "@/components/ui";`,
    usage: `<Slider label="Volume" value={volume} onValueChange={setVolume} showValue formatValue={(n) => \`\${n}%\`} />`,
    props: ["Slider"],
    defaults: { Slider: { min: "0", max: "100", step: "1" } },
    css: ["components/ui/Slider/Slider.module.css"],
    examples: [
      { id: "default", title: "Single value", code: `<Slider label="Volume" value={v} onValueChange={setV} showValue formatValue={(n) => \`\${n}%\`} />` },
      {
        id: "range",
        title: "Range with marks",
        code: `<Slider
  label="Order value"
  value={range}
  onValueChange={setRange}
  min={0}
  max={1000}
  step={50}
  showValue
  formatValue={(n) => \`$\${n}\`}
  marks={[{ value: 0, label: "$0" }, { value: 500, label: "$500" }, { value: 1000, label: "$1,000" }]}
/>`,
      },
      { id: "states", title: "Step and disabled", code: `<Slider label="Step 5" value={35} onValueChange={set} step={5} showValue />\n<Slider label="Disabled" value={40} onValueChange={set} disabled />` },
    ],
    accessibility: [
      "Each thumb is role=\"slider\" with aria-valuemin, aria-valuemax, aria-valuenow and aria-valuetext (from formatValue), named by the label; range thumbs are named \"minimum\" and \"maximum\".",
      "Keyboard: arrows step, PageUp and PageDown take a large step (a tenth of the range by default), Home and End jump to the ends.",
      "Pressing anywhere on the track moves the nearest thumb there and focuses it.",
    ],
    dos: ["Format values in the unit people think in (\"$500\", \"60%\").", "Use marks for meaningful stops only."],
    donts: ["Don't use a slider for a value that must be exact; offer a text field too.", "Don't hide the current value when it matters; turn on showValue."],
    related: ["meter", "text-input"],
    depth: "full",
  },
  {
    slug: "toggle",
    name: "Toggle",
    category: "Forms",
    summary: "A two-state button, pressed or not, for toolbar formatting and view options.",
    description: [
      "Toggle is a real <button> with aria-pressed: quiet at rest, washed in the accent with a hairline when pressed. ghost (the default) has no edge at rest, for toolbars; outline keeps a hairline box, for a lone option such as \"Show archived\".",
      "Use Switch for a setting that applies at once and reads as on or off; use Checkbox inside a form that is submitted.",
    ],
    importLine: `import { Toggle } from "@/components/ui";`,
    usage: `<Toggle aria-label="Bold" icon={<Bold size={16} />} pressed={bold} onPressedChange={setBold} />`,
    props: ["Toggle"],
    defaults: { Toggle: { variant: `"ghost"`, size: `"md"`, defaultPressed: "false" } },
    css: ["components/ui/Toggle/Toggle.module.css"],
    examples: [
      {
        id: "default",
        title: "Icon, text and disabled",
        code: `<Toggle aria-label="Bold" icon={<Bold size={16} />} pressed={bold} onPressedChange={setBold} />
<Toggle variant="outline" pressed={archived} onPressedChange={setArchived}>Show archived</Toggle>
<Toggle disabled>Disabled</Toggle>`,
      },
    ],
    accessibility: [
      "aria-pressed carries the state, so the label must not change with it: \"Bold\", pressed or not pressed.",
      "An icon-only toggle needs aria-label.",
    ],
    dos: ["Keep the label constant; the pressed state says the rest."],
    donts: ["Don't use a Toggle to trigger a one-off action; that is a Button."],
    related: ["toggle-group", "switch"],
    depth: "full",
  },
  {
    slug: "toggle-group",
    name: "ToggleGroup",
    category: "Forms",
    summary: "A set of toggles sharing one value: single (a clearable radio set) or multiple.",
    description: [
      "ToggleGroup sits its items on one recessed track and lifts the pressed ones out as solid keys. type=\"single\" allows at most one pressed item, and pressing it again clears the value; type=\"multiple\" allows any number.",
      "It has one tab stop: arrow keys move between items and Space or Enter presses. For a view switch where one option is always chosen, SegmentedControl reads better.",
    ],
    importLine: `import { ToggleGroup } from "@/components/ui";`,
    usage: `<ToggleGroup
  type="single"
  aria-label="Text alignment"
  value={align}
  onValueChange={setAlign}
  items={[
    { value: "left", icon: <AlignLeft size={16} />, "aria-label": "Align left" },
    { value: "center", icon: <AlignCenter size={16} />, "aria-label": "Align centre" },
  ]}
/>`,
    props: ["ToggleGroup"],
    defaults: { ToggleGroup: { variant: `"outline"`, size: `"md"`, orientation: `"horizontal"` } },
    css: ["components/ui/Toggle/Toggle.module.css"],
    examples: [
      {
        id: "default",
        title: "Single and multiple",
        code: `<ToggleGroup type="single" aria-label="Text alignment" value={align} onValueChange={setAlign} items={ALIGN} />
<ToggleGroup type="multiple" aria-label="Text formatting" value={marks} onValueChange={setMarks} items={MARKS} />`,
      },
      {
        id: "text",
        title: "Text items",
        code: `<ToggleGroup type="multiple" size="sm" aria-label="Days" value={days} onValueChange={setDays}
  items={["Mon", "Tue", "Wed"].map((d) => ({ value: d.toLowerCase(), label: d }))} />`,
      },
    ],
    accessibility: [
      "single renders role=\"radiogroup\" with role=\"radio\" items and aria-checked; multiple renders role=\"group\" with aria-pressed buttons.",
      "Roving tabindex: one tab stop, arrows move (Up and Down when vertical), Home and End jump to the ends.",
      "aria-label on the group is required; icon-only items each need their own aria-label.",
    ],
    dos: ["Use multiple for independent options (bold, italic).", "Keep items to one short word or a familiar icon."],
    donts: ["Don't use single where a value is always required; use SegmentedControl."],
    related: ["toggle", "tabs", "button-group"],
    depth: "full",
  },
  {
    slug: "kbd",
    name: "Kbd and KbdGroup",
    category: "Data display",
    summary: "Keyboard keys as small raised key caps, alone or as a combination.",
    description: [
      "Kbd renders one key as a real <kbd>: a light fill, a hairline edge and a darker bottom lip so it reads as a key, not a badge. KbdGroup renders a chord (Ctrl + K) as a <kbd> wrapping one <kbd> per key, which is how HTML marks up a combination.",
      "Use them in help text, menus, tooltips and command palettes. size=\"sm\" fits inside a menu row or running text.",
    ],
    importLine: `import { Kbd, KbdGroup } from "@/components/ui";`,
    usage: `<KbdGroup keys={["Ctrl", "K"]} />`,
    props: ["Kbd", "KbdGroup"],
    defaults: { Kbd: { size: `"md"` }, KbdGroup: { size: `"md"`, separator: `"+"` } },
    css: ["components/ui/Kbd/Kbd.module.css"],
    examples: [
      {
        id: "default",
        title: "Keys and combinations",
        code: `<KbdGroup keys={["Ctrl", "K"]} />
<KbdGroup keys={["Shift", "Alt", "N"]} />
<Kbd>Esc</Kbd>
<p>Press <KbdGroup keys={["Ctrl", "S"]} size="sm" /> to save the invoice.</p>`,
      },
    ],
    accessibility: ["Real <kbd> elements, so the keys are read as text; the separator is hidden from assistive tech."],
    dos: ["Name keys as they are printed: Ctrl, Shift, Enter, Esc."],
    donts: ["Don't use Kbd for anything that is not a key; that is a Badge."],
    related: ["tooltip", "command"],
    depth: "full",
  },
  {
    slug: "calendar",
    name: "Calendar",
    category: "Forms",
    summary: "The month grid on its own: a single date or a range, one or two months, with month and year pickers.",
    description: [
      "Calendar is the grid DateField and DateRangeFilter open in their popovers, usable on its own when a date picker should stay on the page (a booking panel, a report range). It takes a single value with onChange, or a range with onRangeChange, where the first pick starts the range, the second ends it and hovering previews it.",
      "min, max and isDateDisabled bound what can be picked; disabled days stay focusable so keyboard users can pass over them. numberOfMonths={2} shows two months side by side; captionLayout=\"dropdown\" adds Month and Year pickers for dates years away. Dates are ISO strings (2026-10-14), never Date objects, so time zones never shift a day.",
    ],
    importLine: `import { Calendar, type DateRange, type IsoDate } from "@/components/ui";`,
    usage: `<Calendar value={date} onChange={setDate} />`,
    props: ["Calendar"],
    defaults: { Calendar: { numberOfMonths: "1", captionLayout: `"label"` } },
    css: ["components/ui/DateField/Calendar.module.css"],
    examples: [
      { id: "single", title: "Single date", code: `<Calendar value={date} onChange={setDate} />` },
      { id: "range", title: "Range, two months", code: `<Calendar range={range} onRangeChange={setRange} numberOfMonths={2} />` },
      {
        id: "dropdown",
        title: "Month and year pickers",
        code: `<Calendar value={date} onChange={setDate} captionLayout="dropdown" fromYear={1940} toYear={2026} />`,
      },
    ],
    accessibility: [
      "The days are a grid: arrows move by day and week, PageUp and PageDown by month (Shift for a year), Home and End to the week's ends, Enter or Space picks.",
      "Each day is named by its full date, and the picked day carries aria-selected, so the choice is never shown by colour alone.",
    ],
    dos: ["Use DateField when people may know the date and want to type it.", "Bound the grid with min and max."],
    donts: ["Don't force a calendar for a date of birth; let people type it."],
    related: ["date-field", "date-range-filter"],
    depth: "full",
  },
  {
    slug: "time-field",
    name: "TimeField and TimeRangeField",
    category: "Forms",
    summary: "A time of day with typed input and a popup picker; the range variant pairs start and end on one row.",
    description: [
      "TimeField lets people type a time the way they say it (\"3pm\", \"0930\", \"14:30\") and offers a popup picker as a second path: scrollable hour, minute and AM/PM columns that auto-center on the current value. The value is \"HH:MM\" 24h regardless of display format, so it sorts, compares and serialises predictably.",
      "format=\"12h\" shows \"9:30 AM\" and parses am/pm; the default is 24h. step sets the minute granularity for the popup list (default 15; set to 1 for a free picker). min and max bound both the parse and the picker — a chosen time outside the bounds is kept on screen with a reason, not silently wiped. TimeRangeField pairs two TimeFields with an en dash between them and flags end at or before start as invalid so the row disagrees with itself until the parent fixes it.",
    ],
    importLine: `import { TimeField, TimeRangeField, type Time, type TimeRange } from "@/components/ui";`,
    usage: `<TimeField value={at} onChange={setAt} />`,
    props: ["TimeField", "TimeRangeField"],
    defaults: {
      TimeField: { format: `"24h"`, step: "15" },
      TimeRangeField: { format: `"24h"`, step: "15", requireEndAfterStart: "true" },
    },
    css: ["components/ui/TimeField/TimeField.module.css"],
    examples: [
      {
        id: "open",
        title: "Open",
        description: "inline shows the picker open under the field, in place.",
        code: `<TimeField inline aria-label="Opens at" value={at} onChange={setAt} format="12h" step={15} />`,
      },
      {
        id: "default",
        title: "Single time and range",
        code: `<TimeField value={at} onChange={setAt} format="12h" step={15} />
<TimeRangeField value={range} onChange={setRange} format="12h" step={30} />`,
      },
    ],
    accessibility: [
      "The field accepts spoken-style input (\"3pm\", \"9:30 am\") and reports a reason when the text can't be read as a time, named by aria-describedby.",
      "The popup is a role=\"dialog\" with hour, minute and (12h only) AM/PM listboxes; arrow keys move focus between cells and Enter picks.",
      "Alt+Down from the field opens the popup. Escape closes it and returns focus to the toggle, so a Modal containing the field doesn't close with it.",
    ],
    dos: [
      "Use step={15} or step={30} for scheduling flows; most times a human picks are on the quarter or half hour.",
      "Pass min and max for opening hours or an event window so the picker only lists times that work.",
    ],
    donts: ["Don't use a free-text input for a time; the picker catches typos and ambiguous formats cheaply."],
    related: ["date-field", "date-range-filter"],
    depth: "full",
  },
];
