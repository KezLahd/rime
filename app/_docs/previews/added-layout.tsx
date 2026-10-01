"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Bar, BarChart as RBarChart, CartesianGrid, XAxis } from "recharts";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  DonutChart,
  LineChart,
  StatStrip,
  TOOLTIP_MOTION,
  formatMonth,
  formatMonthTick,
  type ChartConfig,
} from "@/components/charts";
import {
  Accordion,
  AspectRatio,
  Breadcrumb,
  Carousel,
  Collapsible,
  IconBook,
  IconHome,
  NavigationMenu,
  Pagination,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  StatusPill,
} from "@/components/ui";

// Live specimens for the layout, navigation and data components added to
// match the shadcn/ui set. Neutral sample data only.

const FAQ = [
  {
    id: "billing",
    title: "When is an invoice issued?",
    content: "On the first working day of each month, for the month before. It lists every order by project.",
  },
  {
    id: "seats",
    title: "Can I add a team member mid-cycle?",
    content: "Yes. The new seat is charged from the day it is added, on the next invoice.",
  },
  {
    id: "export",
    title: "How do I export a project?",
    content: "Open the project, then choose Export from its menu. You get a CSV of every order and its status.",
  },
];

// ── Accordion ─────────────────────────────────────────────────────────────

function AccordionDefault() {
  return <Accordion items={FAQ} defaultValue={["billing"]} />;
}

function AccordionMultiple() {
  return <Accordion type="multiple" items={FAQ} defaultValue={["billing", "seats"]} />;
}

function AccordionPlain() {
  return <Accordion appearance="plain" items={FAQ} defaultValue={["export"]} />;
}

// ── Collapsible ───────────────────────────────────────────────────────────

const rowStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "var(--r-sm)",
  background: "var(--glass-fill-nested)",
  boxShadow: "inset 0 0 0 1px var(--line)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-small)",
  color: "var(--ink-body)",
};

function CollapsibleDefault() {
  return (
    <Collapsible title="Jane Cooper starred 3 projects" summary={<div style={rowStyle}>north-office/website</div>} defaultOpen>
      <div style={rowStyle}>north-office/brand-refresh</div>
      <div style={rowStyle}>north-office/quarterly-report</div>
    </Collapsible>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────

function BreadcrumbDefault() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/", icon: <IconHome size={14} /> },
        { label: "Projects", href: "/components/breadcrumb" },
        { label: "Website relaunch" },
      ]}
    />
  );
}

function BreadcrumbCollapsed() {
  return (
    <Breadcrumb
      maxItems={4}
      items={[
        { label: "Home", href: "/" },
        { label: "Workspace", href: "/components/breadcrumb" },
        { label: "Projects", href: "/components/breadcrumb" },
        { label: "Website relaunch", href: "/components/breadcrumb" },
        { label: "Invoices", href: "/components/breadcrumb" },
        { label: "INV-004213" },
      ]}
    />
  );
}

function BreadcrumbSlash() {
  return (
    <Breadcrumb
      separator="/"
      items={[
        { label: "Settings", href: "/" },
        { label: "Team", href: "/components/breadcrumb" },
        { label: "Members" },
      ]}
    />
  );
}

// ── NavigationMenu ────────────────────────────────────────────────────────

const NAV = [
  {
    id: "product",
    label: "Product",
    feature: (
      <>
        <strong style={{ fontSize: "var(--text-card-title)", color: "var(--ink-heading)" }}>Workspace</strong>
        <span>Projects, orders and invoices in one place.</span>
      </>
    ),
    links: [
      { href: "/components/navigation-menu#projects", title: "Projects", description: "Plan work and track every order." },
      { href: "/components/navigation-menu#invoices", title: "Invoices", description: "Bill clients and see what is paid." },
      { href: "/components/navigation-menu#reports", title: "Reports", description: "Revenue and throughput by region." },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    links: [
      { href: "/components/navigation-menu#guides", title: "Guides", description: "Step-by-step setup.", icon: <IconBook size={15} /> },
      { href: "/components/navigation-menu#changelog", title: "Changelog", description: "What shipped this month." },
      { href: "/components/navigation-menu#api", title: "API", description: "Endpoints and webhooks." },
      { href: "/components/navigation-menu#status", title: "Status", description: "Uptime and incidents." },
    ],
  },
  { id: "pricing", label: "Pricing", href: "/components/navigation-menu#pricing" },
];

function NavigationMenuDefault() {
  return <NavigationMenu aria-label="Main" items={NAV} inline defaultValue="product" />;
}

function NavigationMenuFloating() {
  return <NavigationMenu aria-label="Site" items={NAV} />;
}

// ── Pagination ────────────────────────────────────────────────────────────

const pagerStyle: CSSProperties = { width: "100%" };

function PaginationDefault() {
  const [page, setPage] = useState(3);
  return (
    <div style={pagerStyle}>
      <Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={236} pageSize={20} itemLabel="orders" />
    </div>
  );
}

function PaginationPagesOnly() {
  const [page, setPage] = useState(1);
  return (
    <div style={pagerStyle}>
      <Pagination page={page} pageCount={5} onPageChange={setPage} />
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "Website relaunch", owner: "Jane Cooper", status: "On track", tone: "success" as const },
  { name: "Brand refresh", owner: "Devon Lane", status: "In review", tone: "warning" as const },
  { name: "Quarterly report", owner: "Priya Shah", status: "Draft", tone: "neutral" as const },
  { name: "Onboarding flow", owner: "Marcus Bell", status: "On track", tone: "success" as const },
  { name: "Pricing page", owner: "Ana Ruiz", status: "Blocked", tone: "danger" as const },
];

function Slide({ name, owner, status, tone, tall }: (typeof PROJECTS)[number] & { tall?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
        height: tall ? 220 : 150,
        padding: 20,
        borderRadius: "var(--r-lg)",
        background: "var(--brand-gradient-soft), var(--glass-fill-nested)",
        boxShadow: "inset 0 0 0 1px var(--glass-edge)",
      }}
    >
      <div>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-section)", fontWeight: 700, color: "var(--ink-heading)" }}>{name}</p>
        <p style={{ fontSize: "var(--text-small)", color: "var(--ink-muted)" }}>Owner: {owner}</p>
      </div>
    </div>
  );
}

function CarouselDefault() {
  return (
    <Carousel aria-label="Projects">
      {PROJECTS.map((p) => (
        <Slide key={p.name} {...p} tall />
      ))}
    </Carousel>
  );
}

function CarouselMultiple() {
  return (
    <Carousel aria-label="Projects" perView={3}>
      {PROJECTS.map((p) => (
        <Slide key={p.name} {...p} />
      ))}
    </Carousel>
  );
}

// ── AspectRatio ───────────────────────────────────────────────────────────

const art: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(var(--rgb-brand), 0.35), rgba(var(--rgb-bloom-b), 0.7))",
  fontSize: "var(--text-small)",
  fontWeight: 700,
  color: "var(--ink-heading)",
};

function AspectDefault() {
  return (
    <div style={{ width: 360 }}>
      <AspectRatio ratio={16 / 9}>
        <div style={art}>16 / 9</div>
      </AspectRatio>
    </div>
  );
}

function AspectSquare() {
  return (
    <>
      <div style={{ width: 160 }}>
        <AspectRatio ratio={1}>
          <div style={art}>1 / 1</div>
        </AspectRatio>
      </div>
      <div style={{ width: 240 }}>
        <AspectRatio ratio={4 / 3}>
          <div style={art}>4 / 3</div>
        </AspectRatio>
      </div>
    </>
  );
}

// ── Resizable ─────────────────────────────────────────────────────────────

function Pane({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100%",
        padding: 16,
        fontSize: "var(--text-small)",
        fontWeight: 700,
        color: "var(--ink-secondary)",
      }}
    >
      {children}
    </div>
  );
}

function ResizableDefault() {
  return (
    <ResizablePanelGroup height={240}>
      <ResizablePanel defaultSize={25} minSize={15}>
        <Pane>Projects</Pane>
      </ResizablePanel>
      <ResizableHandle withGrip aria-label="Resize the project list" />
      <ResizablePanel defaultSize={50}>
        <Pane>Invoice INV-004213</Pane>
      </ResizablePanel>
      <ResizableHandle withGrip aria-label="Resize the details" />
      <ResizablePanel defaultSize={25} minSize={15}>
        <Pane>Details</Pane>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function ResizableVertical() {
  return (
    <ResizablePanelGroup direction="vertical" height={280}>
      <ResizablePanel defaultSize={60}>
        <Pane>Editor</Pane>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize the console" />
      <ResizablePanel defaultSize={40} minSize={20}>
        <Pane>Console</Pane>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// ── Chart ─────────────────────────────────────────────────────────────────

const ORDERS = [
  { month: "2026-01", online: 182, retail: 120 },
  { month: "2026-02", online: 205, retail: 118 },
  { month: "2026-03", online: 231, retail: 131 },
  { month: "2026-04", online: 248, retail: 127 },
  { month: "2026-05", online: 276, retail: 140 },
  { month: "2026-06", online: 301, retail: 152 },
  { month: "2026-07", online: 322, retail: 149 },
  { month: "2026-08", online: 344, retail: 161 },
];

const REVENUE = [
  { region: "North", revenue: 48200 },
  { region: "South", revenue: 39100 },
  { region: "East", revenue: 31800 },
  { region: "West", revenue: 27400 },
  { region: "Central", revenue: 18900 },
];

// A chart is a panel of its own: give it the gutter a card would, so axis
// labels are never clipped by the example frame.
const chartBox: CSSProperties = { width: "100%", padding: "16px 20px 12px" };

function ChartLine() {
  return (
    <div style={chartBox}>
      <AreaChart
        title="Orders per month"
        subtitle="Online and retail, January to August 2026"
        summary="Online orders rose every month, from 182 in January to 344 in August. Retail held between 118 and 161."
        data={ORDERS}
        x="month"
        series={[
          { key: "online", label: "Online" },
          { key: "retail", label: "Retail" },
        ]}
        formatX={formatMonthTick}
        formatXLong={formatMonth}
        height={240}
      />
    </div>
  );
}

function ChartLineOnly() {
  return (
    <div style={chartBox}>
      <LineChart
        title="Online orders"
        summary="Online orders rose from 182 in January to 344 in August, against a target of 300."
        data={ORDERS}
        x="month"
        series={[{ key: "online", label: "Online" }]}
        formatX={formatMonthTick}
        formatXLong={formatMonth}
        reference={{ value: 300, label: "Target" }}
        height={220}
      />
    </div>
  );
}

function ChartBar() {
  return (
    <div style={chartBox}>
      <BarChart
        title="Revenue by region"
        subtitle="Year to date"
        summary="North leads with 48,200 in revenue; Central is lowest at 18,900."
        data={REVENUE}
        category="region"
        series={[{ key: "revenue", label: "Revenue" }]}
        orientation="bars"
        valueLabels
        height={240}
      />
    </div>
  );
}

function ChartDonut() {
  return (
    <div style={chartBox}>
      <DonutChart
        title="Projects by status"
        summary="Of 40 projects, 22 are on track, 9 in review, 6 drafts and 3 blocked."
        centreLabel="Projects"
        data={[
          { key: "track", label: "On track", value: 22 },
          { key: "review", label: "In review", value: 9 },
          { key: "draft", label: "Draft", value: 6 },
          { key: "blocked", label: "Blocked", value: 3 },
        ]}
      />
    </div>
  );
}

function ChartStats() {
  return (
    <div style={chartBox}>
      <StatStrip
        aria-label="This month"
        stats={[
          {
            label: "Orders",
            value: 505,
            delta: { value: 32, period: "vs last month" },
            trend: [302, 323, 362, 375, 416, 453, 471, 505],
            trendLabel: "Monthly, last 8 months: 302 to 505",
          },
          { label: "Revenue", value: 165400, delta: { value: 12800, period: "vs last month" } },
          {
            label: "Median turnaround",
            value: 1.8,
            unit: "days",
            delta: { value: -0.3, period: "vs last month", goodWhen: "down" },
          },
          { label: "Open invoices", value: 14, note: "3 overdue" },
        ]}
      />
    </div>
  );
}

const PRIMITIVE_CONFIG = {
  online: { label: "Online", color: "var(--chart-1)" },
  retail: { label: "Retail", color: "var(--chart-3)" },
} satisfies ChartConfig;

function ChartPrimitives() {
  return (
    <div style={chartBox}>
      <ChartContainer config={PRIMITIVE_CONFIG} style={{ aspectRatio: "auto", height: 220 }}>
        <RBarChart accessibilityLayer data={ORDERS}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatMonthTick(String(v))} />
          <ChartTooltip {...TOOLTIP_MOTION} content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => formatMonth(String(v))} />} />
          <Bar dataKey="online" fill="var(--color-online)" radius={4} />
          <Bar dataKey="retail" fill="var(--color-retail)" radius={4} />
        </RBarChart>
      </ChartContainer>
    </div>
  );
}

export const ADDED_LAYOUT_PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  accordion: { default: AccordionDefault, multiple: AccordionMultiple, plain: AccordionPlain },
  collapsible: { default: CollapsibleDefault },
  breadcrumb: { default: BreadcrumbDefault, collapsed: BreadcrumbCollapsed, slash: BreadcrumbSlash },
  "navigation-menu": { default: NavigationMenuDefault, floating: NavigationMenuFloating },
  pagination: { default: PaginationDefault, "pages-only": PaginationPagesOnly },
  carousel: { default: CarouselDefault, multiple: CarouselMultiple },
  "aspect-ratio": { default: AspectDefault, square: AspectSquare },
  resizable: { default: ResizableDefault, vertical: ResizableVertical },
  chart: { area: ChartLine, line: ChartLineOnly, bar: ChartBar, donut: ChartDonut, stats: ChartStats, primitives: ChartPrimitives },
};
