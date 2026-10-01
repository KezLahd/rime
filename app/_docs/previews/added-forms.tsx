"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Copy, Italic, Underline } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Button,
  ButtonGroup,
  Calendar,
  Combobox,
  Field,
  IconButton,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  InputGroup,
  Kbd,
  KbdGroup,
  Label,
  Slider,
  Switch,
  TextInput,
  Toggle,
  ToggleGroup,
  type ComboboxOption,
  type DateRange,
  type IsoDate,
} from "@/components/ui";

// Live specimens for the forms and actions components added to match the
// shadcn/ui set. Neutral sample data only.

const PROJECTS: ComboboxOption[] = [
  { value: "atlas", label: "Atlas redesign", description: "Design · 12 tasks" },
  { value: "beacon", label: "Beacon launch", description: "Marketing · 8 tasks" },
  { value: "cobalt", label: "Cobalt API", description: "Engineering · 21 tasks" },
  { value: "delta", label: "Delta onboarding", description: "Customer success · 5 tasks" },
  { value: "ember", label: "Ember billing", description: "Finance · 9 tasks", disabled: true },
];

const col = { display: "flex", flexDirection: "column", gap: 14, width: 320 } as const;
const row = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } as const;

// ── Label ─────────────────────────────────────────────────────────────────

function LabelDefault() {
  const [on, setOn] = useState(true);
  return (
    <div style={col}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="label-demo-name" required>
          Project name
        </Label>
        <TextInput id="label-demo-name" placeholder="Atlas redesign" required />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="label-demo-ref" optional>
          Purchase order
        </Label>
        <TextInput id="label-demo-ref" placeholder="PO-2041" />
      </div>
      <Switch label="Email the team when it ships" checked={on} onChange={setOn} />
    </div>
  );
}

function LabelStyles() {
  return (
    <div style={row}>
      <Label>Sentence label</Label>
      <Label labelStyle="caps">Caps label</Label>
      <Label disabled>Disabled label</Label>
    </div>
  );
}

// ── Kbd ───────────────────────────────────────────────────────────────────

function KbdDefault() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={row}>
        <KbdGroup keys={["Ctrl", "K"]} />
        <KbdGroup keys={["Shift", "Alt", "N"]} />
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-secondary)" }}>
        Press <KbdGroup keys={["Ctrl", "S"]} size="sm" /> to save the invoice.
      </p>
    </div>
  );
}

// ── Slider ────────────────────────────────────────────────────────────────

function SliderDefault() {
  const [v, setV] = useState(60);
  return (
    <div style={{ width: 320 }}>
      <Slider label="Volume" value={v} onValueChange={setV} showValue formatValue={(n) => `${n}%`} />
    </div>
  );
}

function SliderRangeDemo() {
  const [r, setR] = useState<[number, number]>([200, 750]);
  return (
    <div style={{ width: 360 }}>
      <Slider
        label="Order value"
        value={r}
        onValueChange={setR}
        min={0}
        max={1000}
        step={50}
        showValue
        formatValue={(n) => `$${n}`}
        marks={[
          { value: 0, label: "$0" },
          { value: 500, label: "$500" },
          { value: 1000, label: "$1,000" },
        ]}
      />
    </div>
  );
}

function SliderStates() {
  return (
    <div style={{ ...col, width: 320 }}>
      <Slider aria-label="Step of five" value={35} onValueChange={() => {}} step={5} showValue label="Step 5" />
      <Slider label="Disabled" value={40} onValueChange={() => {}} disabled showValue />
    </div>
  );
}

// ── Toggle and ToggleGroup ───────────────────────────────────────────────

function ToggleDefault() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [archived, setArchived] = useState(false);
  return (
    <div style={row}>
      <Toggle aria-label="Bold" icon={<Bold size={16} />} pressed={bold} onPressedChange={setBold} />
      <Toggle aria-label="Italic" icon={<Italic size={16} />} pressed={italic} onPressedChange={setItalic} />
      <Toggle variant="outline" pressed={archived} onPressedChange={setArchived}>
        Show archived
      </Toggle>
      <Toggle disabled>Disabled</Toggle>
    </div>
  );
}

function ToggleGroupDefault() {
  const [align, setAlign] = useState<string | null>("left");
  const [marks, setMarks] = useState<string[]>(["bold"]);
  return (
    <div style={row}>
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={setAlign}
        items={[
          { value: "left", icon: <AlignLeft size={16} />, "aria-label": "Align left" },
          { value: "center", icon: <AlignCenter size={16} />, "aria-label": "Align centre" },
          { value: "right", icon: <AlignRight size={16} />, "aria-label": "Align right" },
        ]}
      />
      <ToggleGroup
        type="multiple"
        aria-label="Text formatting"
        value={marks}
        onValueChange={setMarks}
        items={[
          { value: "bold", icon: <Bold size={16} />, "aria-label": "Bold" },
          { value: "italic", icon: <Italic size={16} />, "aria-label": "Italic" },
          { value: "underline", icon: <Underline size={16} />, "aria-label": "Underline" },
        ]}
      />
    </div>
  );
}

function ToggleGroupText() {
  const [days, setDays] = useState<string[]>(["mon", "wed", "fri"]);
  return (
    <ToggleGroup
      type="multiple"
      size="sm"
      aria-label="Days"
      value={days}
      onValueChange={setDays}
      items={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({ value: d.toLowerCase(), label: d }))}
    />
  );
}

// ── InputGroup ────────────────────────────────────────────────────────────

function InputGroupDefault() {
  return (
    <div style={col}>
      <InputGroup start="https://" placeholder="example.com" aria-label="Website" />
      <InputGroup start={<IconSearch size={16} />} placeholder="Search invoices" aria-label="Search invoices" />
      <InputGroup start="$" end="USD" inputMode="decimal" defaultValue="1,250.00" aria-label="Amount" />
      <InputGroup
        readOnly
        mono
        defaultValue="sk_live_4f9a2c"
        aria-label="API key"
        end={<IconButton size="sm" label="Copy key" icon={<Copy size={14} />} />}
      />
    </div>
  );
}

function InputGroupField() {
  return (
    <div style={col}>
      <Field label="Workspace address" hint="Letters, numbers and dashes.">
        <InputGroup end=".example.app" placeholder="acme" />
      </Field>
      <Field label="Weight" error="Enter a weight under 30 kg.">
        <InputGroup end="kg" inputMode="decimal" defaultValue="42" />
      </Field>
    </div>
  );
}

// ── Combobox ──────────────────────────────────────────────────────────────

function ComboboxOpen() {
  const [v, setV] = useState<string | null>("beacon");
  return (
    <div style={{ width: 320 }}>
      <Combobox inline aria-label="Project" options={PROJECTS} value={v} onChange={setV} placeholder="Choose a project" />
    </div>
  );
}

function ComboboxField() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div style={{ width: 320 }}>
      <Field label="Project">
        <Combobox options={PROJECTS} value={v} onChange={setV} placeholder="Type to search projects" />
      </Field>
    </div>
  );
}

function ComboboxCreatable() {
  const [tags, setTags] = useState<ComboboxOption[]>([
    { value: "urgent", label: "Urgent" },
    { value: "billing", label: "Billing" },
    { value: "follow-up", label: "Follow-up" },
  ]);
  const [v, setV] = useState<string | null>(null);
  return (
    <div style={{ width: 320 }}>
      <Field label="Tag" hint="Type a new tag to create it.">
        <Combobox
          creatable
          options={tags}
          value={v}
          onChange={setV}
          onCreate={(label) => {
            const value = label.toLowerCase().replace(/\s+/g, "-");
            setTags((t) => [...t, { value, label }]);
            setV(value);
          }}
          placeholder="Choose or create a tag"
        />
      </Field>
    </div>
  );
}

// ── ButtonGroup ───────────────────────────────────────────────────────────

function ButtonGroupDefault() {
  return (
    <div style={row}>
      <ButtonGroup aria-label="Invoice actions">
        <Button variant="secondary">Archive</Button>
        <Button variant="secondary">Report</Button>
        <Button variant="secondary">Snooze</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Pages">
        <IconButton variant="secondary" label="Previous" icon={<IconChevronLeft size={16} />} />
        <IconButton variant="secondary" label="Next" icon={<IconChevronRight size={16} />} />
      </ButtonGroup>
      <ButtonGroup aria-label="Send">
        <Button>Send invoice</Button>
        <IconButton variant="primary" label="More send options" icon={<IconChevronDown size={16} />} />
      </ButtonGroup>
    </div>
  );
}

function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Order view">
      <Button variant="secondary">Details</Button>
      <Button variant="secondary">Line items</Button>
      <Button variant="secondary">History</Button>
    </ButtonGroup>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────

function CalendarSingle() {
  const [d, setD] = useState<IsoDate | null>("2026-10-14");
  return <Calendar value={d} onChange={setD} defaultMonth="2026-10-01" />;
}

function CalendarRange() {
  const [r, setR] = useState<DateRange>({ start: "2026-10-06", end: "2026-10-17" });
  return <Calendar range={r} onRangeChange={setR} numberOfMonths={2} defaultMonth="2026-10-01" />;
}

function CalendarDropdown() {
  const [d, setD] = useState<IsoDate | null>(null);
  return <Calendar value={d} onChange={setD} captionLayout="dropdown" defaultMonth="1990-06-01" fromYear={1940} toYear={2026} />;
}

export const ADDED_FORMS_PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  label: { default: LabelDefault, styles: LabelStyles },
  kbd: { default: KbdDefault },
  slider: { default: SliderDefault, range: SliderRangeDemo, states: SliderStates },
  toggle: { default: ToggleDefault },
  "toggle-group": { default: ToggleGroupDefault, text: ToggleGroupText },
  "input-group": { default: InputGroupDefault, field: InputGroupField },
  combobox: { open: ComboboxOpen, field: ComboboxField, creatable: ComboboxCreatable },
  "button-group": { default: ButtonGroupDefault, vertical: ButtonGroupVertical },
  calendar: { single: CalendarSingle, range: CalendarRange, dropdown: CalendarDropdown },
};
