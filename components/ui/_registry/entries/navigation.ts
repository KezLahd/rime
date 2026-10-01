import type { RegistryEntry } from "../types";

export const NAVIGATION: RegistryEntry[] = [
  {
    slug: "filter-bar",
    name: "FilterBar",
    category: "Navigation",
    summary: "The one filter row above every table: a growing search, dropdown chips at the end, clear, and the list's own action.",
    description: [
      "FilterBar lays out a list's filters in a fixed order: a FilterSearch that grows to fill the row, then Select chips (and a DateRangeFilter), then a ghost \"Clear filters\" while anything is applied, then the list's own action after a hairline (\"New invoice\").",
      "It is presentational. Filter state lives with the screen, which also decides when to pass onClear (only while a filter is applied). No title, no \"n of m shown\" line and never a row of toggle chips.",
    ],
    importLine: `import { FilterBar, FilterSearch, Select } from "@/components/ui";`,
    usage: `<FilterBar aria-label="Filter invoices" onClear={filtering ? clear : undefined} actions={<Button size="sm" iconStart={<IconPlus size={14} />}>New invoice</Button>}>
  <FilterSearch grow aria-label="Search invoices" value={query} onChange={setQuery} placeholder="Customer or invoice number" />
  <Select appearance="chip" aria-label="Status" value={status} onChange={setStatus} active={status !== "all"} options={STATUSES} />
</FilterBar>`,
    props: ["FilterBar", "FilterSearch", "FilterChip"],
    css: ["components/ui/FilterBar/FilterBar.module.css", "components/ui/FilterChip/FilterChip.module.css"],
    examples: [
      {
        id: "default",
        title: "Search, dropdowns, clear and action",
        description: "Type or pick a status to see Clear filters appear.",
        code: `<FilterBar aria-label="Filter invoices" onClear={filtering ? clear : undefined} actions={<Button size="sm">New invoice</Button>}>
  <FilterSearch grow aria-label="Search" value={q} onChange={setQ} />
  <Select appearance="chip" aria-label="Status" … />
  <DateRangeFilter aria-label="Issued" … />
</FilterBar>`,
      },
    ],
    accessibility: [
      "The filters sit in role=\"group\" named by the required aria-label (\"Filter invoices\").",
      "Every chip needs its own aria-label: chips show a value, not a label.",
      "Announce result counts from the table region (a polite status line), not from the bar.",
    ],
    dos: [
      "Order: search, dropdowns, date, clear, then the action.",
      "Pass onClear only while a filter is applied.",
      "Use FilterSearch here, not SearchField, so the row's heights match.",
    ],
    donts: [
      "Never a row of toggle chips for a single-choice filter; use a Select chip.",
      "Don't put a heading or result count above the bar.",
    ],
    related: ["table", "select", "date-range-filter"],
    depth: "full",
    layout: "block",
  },
  {
    slug: "tabs",
    name: "FolderTabs and SegmentedControl",
    category: "Navigation",
    summary: "Folder tabs that sit on a glass panel with always-visible counts, and a segmented control for views.",
    description: [
      "FolderTabs switch between queues of the same list (Open, In review, Cancelled). Each tab shows its count so the workload reads without opening each; the panel's top-left corner squares off so the tabs sit on it.",
      "SegmentedControl switches the view of the same content (Chart or Table, List or Board). The active segment is a white key lifted out of a recess.",
    ],
    importLine: `import { FolderTabs, SegmentedControl } from "@/components/ui";`,
    usage: `<SegmentedControl aria-label="View" value={view} onChange={setView} options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]} />`,
    props: ["FolderTabs", "SegmentedControl"],
    css: ["components/ui/Tabs/Tabs.module.css"],
    examples: [
      { id: "folder", title: "Folder tabs", code: `<FolderTabs aria-label="Orders" tabs={[{ id: "open", label: "Open", count: 12 }, { id: "review", label: "In review", count: 4, colour: "amber" }]} value={tab} onChange={setTab}>…</FolderTabs>` },
      { id: "segmented", title: "Segmented control", code: `<SegmentedControl aria-label="View" value={view} onChange={setView} options={VIEWS} />` },
    ],
    accessibility: [
      "FolderTabs implement the ARIA tabs pattern: role=\"tablist\", arrow keys move between tabs, the panel is role=\"tabpanel\".",
      "SegmentedControl is a radiogroup: arrow keys change the value.",
    ],
    dos: ["Always show counts on folder tabs."],
    donts: ["Don't use folder tabs for page navigation; that is the sidebar."],
    depth: "summary",
    layout: "block",
  },
  {
    slug: "menu",
    name: "Menu",
    category: "Overlays",
    summary: "An action menu from a button: groups, headings, separators, icons, links and danger items, in a frosted popover.",
    description: ["Menu lists actions (not choices; that is Select). Items can be links (rendered as Next Links) or callbacks, carry an icon and a description, and be marked danger or disabled. It shares Select's popover family."],
    importLine: `import { Menu } from "@/components/ui";`,
    usage: `<Menu label="Actions" items={[{ id: "edit", label: "Edit", onSelect: edit }, { id: "sep", separator: true }, { id: "void", label: "Void invoice", tone: "danger", onSelect: confirm }]} />`,
    props: ["Menu"],
    css: ["components/ui/Menu/Menu.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline renders the menu open under its trigger, in place.", code: `<Menu inline label="Actions" items={ITEMS} />` }, { id: "default", title: "Default", code: `<Menu label="Actions" items={ITEMS} />` }],
    accessibility: ["role=\"menu\" with roving focus: arrows, Home, End, typeahead; Esc and Tab close and return focus to the trigger."],
    dos: ["Put destructive items last, after a separator."],
    donts: ["Don't hide the only way to do something important in a menu."],
    depth: "summary",
  },
  {
    slug: "nav-search",
    name: "NavSearch and SmartSearch",
    category: "Navigation",
    summary: "Top-bar search: NavSearch jumps to pages and actions; SmartSearch queries records with grouped results.",
    description: ["NavSearch filters a fixed list of destinations with a keyboard shortcut (Ctrl or Cmd K). SmartSearch takes an async search function with abort signals and renders grouped record results with highlighting."],
    importLine: `import { NavSearch, SmartSearch } from "@/components/ui";`,
    usage: `<NavSearch aria-label="Search pages" items={DESTINATIONS} />`,
    props: ["NavSearch", "SmartSearch"],
    css: ["components/ui/NavSearch/NavSearch.module.css", "components/ui/SmartSearch/SmartSearch.module.css"],
    examples: [{ id: "open", title: "Open", description: "inline shows the results panel open under the bar, in place.", code: `<NavSearch inline aria-label="Search pages and actions" items={DESTINATIONS} />` }, { id: "default", title: "NavSearch", code: `<NavSearch items={DESTINATIONS} aria-label="Search pages and actions" />` }],
    accessibility: ["Combobox with a listbox of results; the shortcut is announced in the hint."],
    dos: ["Keep NavSearch items to real destinations."],
    donts: ["Don't use SmartSearch without debouncing on the server side too."],
    depth: "summary",
  },
];
