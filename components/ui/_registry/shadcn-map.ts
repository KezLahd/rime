// shadcn/ui names mapped onto Rime: the "Coming from shadcn" table in
// /docs/shadcn, llms.txt and the Rime skill. Agents are trained on shadcn,
// so this is the single most useful thing they can read first.

export type ShadcnMapRow = {
  /** shadcn component name(s). */
  shadcn: string;
  /** Rime component(s). */
  rime: string;
  /** Rime docs slug. */
  slug: string;
  /** Registry item to install. */
  install: string;
  note?: string;
};

export const SHADCN_MAP: ReadonlyArray<ShadcnMapRow> = [
  { shadcn: "button", rime: "Button", slug: "button", install: "button", note: "variant default→primary, destructive→danger, outline→secondary; link and icon sizes as in shadcn" },
  { shadcn: "button-group", rime: "ButtonGroup", slug: "button-group", install: "button-group" },
  { shadcn: "card", rime: "Card (+ CardHeader, CardTitle, CardContent...)", slug: "card", install: "card", note: "props (title, description, actions, footer) or the shadcn parts" },
  { shadcn: "dialog", rime: "Modal, ConfirmModal", slug: "modal", install: "dialog" },
  { shadcn: "alert-dialog", rime: "AlertDialog", slug: "alert-dialog", install: "alert-dialog" },
  { shadcn: "sheet, drawer", rime: "Sheet, Drawer", slug: "sheet", install: "sheet" },
  { shadcn: "dropdown-menu", rime: "Menu", slug: "menu", install: "dropdown-menu" },
  { shadcn: "context-menu", rime: "ContextMenu", slug: "context-menu", install: "context-menu" },
  { shadcn: "menubar", rime: "Menubar", slug: "menubar", install: "menubar" },
  { shadcn: "navigation-menu", rime: "NavigationMenu", slug: "navigation-menu", install: "navigation-menu" },
  { shadcn: "popover", rime: "Popover", slug: "popover", install: "popover" },
  { shadcn: "hover-card", rime: "HoverCard", slug: "hover-card", install: "hover-card" },
  { shadcn: "tooltip", rime: "Tooltip, Toggletip", slug: "tooltip", install: "tooltip" },
  { shadcn: "command", rime: "Command, CommandDialog", slug: "command", install: "command" },
  { shadcn: "input", rime: "TextInput", slug: "text-input", install: "input" },
  { shadcn: "input-group", rime: "InputGroup", slug: "input-group", install: "input-group" },
  { shadcn: "input-otp", rime: "OtpInput", slug: "otp-input", install: "input-otp" },
  { shadcn: "textarea", rime: "Textarea", slug: "textarea", install: "textarea" },
  { shadcn: "label", rime: "Label", slug: "label", install: "label" },
  { shadcn: "field, form", rime: "Field, ErrorSummary", slug: "field", install: "field" },
  { shadcn: "checkbox", rime: "Checkbox", slug: "checkbox", install: "checkbox" },
  { shadcn: "radio-group", rime: "RadioGroup", slug: "radio-group", install: "radio-group" },
  { shadcn: "switch", rime: "Switch", slug: "switch", install: "switch" },
  { shadcn: "slider", rime: "Slider", slug: "slider", install: "slider" },
  { shadcn: "select", rime: "Select (searchable option)", slug: "select", install: "select" },
  { shadcn: "combobox", rime: "Combobox", slug: "combobox", install: "combobox" },
  { shadcn: "calendar, date-picker", rime: "Calendar, DateField, DateRangeFilter", slug: "date-field", install: "date-field" },
  { shadcn: "toggle, toggle-group", rime: "Toggle, ToggleGroup", slug: "toggle", install: "toggle" },
  { shadcn: "tabs", rime: "FolderTabs, SegmentedControl", slug: "tabs", install: "tabs" },
  { shadcn: "accordion", rime: "Accordion", slug: "accordion", install: "accordion" },
  { shadcn: "collapsible", rime: "Collapsible", slug: "collapsible", install: "collapsible" },
  { shadcn: "breadcrumb", rime: "Breadcrumb", slug: "breadcrumb", install: "breadcrumb" },
  { shadcn: "pagination", rime: "Pagination (in Table)", slug: "pagination", install: "table" },
  { shadcn: "table, data-table", rime: "Table + FilterBar + Pagination", slug: "table", install: "table", note: "the list page pattern" },
  { shadcn: "badge", rime: "Badge, StatusPill, CountBadge", slug: "status-pill", install: "badge" },
  { shadcn: "avatar", rime: "Avatar", slug: "avatar", install: "avatar" },
  { shadcn: "separator", rime: "Divider", slug: "divider", install: "separator" },
  { shadcn: "progress", rime: "Meter, ProgressBar", slug: "meter", install: "progress" },
  { shadcn: "skeleton", rime: "Skeleton", slug: "skeleton", install: "skeleton" },
  { shadcn: "spinner", rime: "Spinner", slug: "spinner", install: "spinner" },
  { shadcn: "kbd", rime: "Kbd", slug: "kbd", install: "kbd" },
  { shadcn: "alert", rime: "Alert", slug: "alert", install: "alert" },
  { shadcn: "sonner, toast", rime: "Toast + ToastProvider", slug: "toast", install: "sonner" },
  { shadcn: "empty", rime: "EmptyState", slug: "empty-state", install: "empty" },
  { shadcn: "scroll-area", rime: "ScrollArea", slug: "scroll-area", install: "scroll-area" },
  { shadcn: "aspect-ratio", rime: "AspectRatio", slug: "aspect-ratio", install: "aspect-ratio" },
  { shadcn: "carousel", rime: "Carousel", slug: "carousel", install: "carousel" },
  { shadcn: "resizable", rime: "ResizablePanelGroup, ResizablePanel, ResizableHandle", slug: "resizable", install: "resizable" },
  { shadcn: "chart", rime: "LineChart, AreaChart, BarChart, DonutChart, ChartContainer", slug: "chart", install: "chart" },
  { shadcn: "sidebar", rime: "SidebarShell (components/shell)", slug: "sidebar-shell", install: "sidebar" },
];

/** shadcn CSS variable names and the Rime token each one aliases (app/styles/shadcn-bridge.css). */
export const SHADCN_TOKENS: ReadonlyArray<[shadcn: string, rime: string]> = [
  ["--background", "--page-base"],
  ["--foreground", "--ink-body"],
  ["--card / --card-foreground", "--surface-solid / --ink-body"],
  ["--popover / --popover-foreground", "--popover-surface / --ink-body"],
  ["--primary / --primary-foreground", "--brand-action / --ink-inverse"],
  ["--secondary / --secondary-foreground", "--surface-sunken / --ink-heading"],
  ["--muted / --muted-foreground", "--surface-sunken / --ink-muted"],
  ["--accent / --accent-foreground", "--wash-hover / --ink-heading"],
  ["--destructive", "--danger-base-solid"],
  ["--border", "--line"],
  ["--input", "--line-input"],
  ["--ring", "--focus-color"],
  ["--radius", "--r-md"],
  ["--chart-1..5", "--chart-1..5"],
  ["--sidebar*", "--chrome-sidebar, --brand-action, --wash-active, --line-soft"],
  ["--font-sans / --font-heading", "--font-body / --font-display"],
];
