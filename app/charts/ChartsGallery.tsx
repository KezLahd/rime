"use client";

import { Globe, Store } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AreaChart,
  BarChart,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  DonutChart,
  LINE_CURSOR,
  LineChart,
  Sparkline,
  StatStrip,
  TOOLTIP_MOTION,
  formatMonth,
  formatMonthTick,
  type ChartConfig,
} from "@/components/charts";
import { SegmentedControl } from "@/components/ui";
import { Example } from "../_docs/Example";
import styles from "./Charts.module.css";

// The charts gallery, after shadcn's /charts: one tab per chart type, each a
// grid of framed examples with Preview | Code, and a Tooltips tab with every
// tooltip variant on the shadcn-compatible primitives. Sample data only.

type Tab = "line" | "area" | "bar" | "donut" | "spark" | "tooltips";

const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: "area", label: "Area" },
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "donut", label: "Donut" },
  { value: "spark", label: "Sparkline and stats" },
  { value: "tooltips", label: "Tooltips" },
];

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

const REGIONS = [
  { region: "North", revenue: 48200, target: 45000 },
  { region: "South", revenue: 39100, target: 42000 },
  { region: "East", revenue: 31800, target: 30000 },
  { region: "West", revenue: 27400, target: 29000 },
  { region: "Central", revenue: 18900, target: 21000 },
];

const ordersConfig = {
  online: { label: "Online", color: "var(--chart-1)" },
  retail: { label: "Retail", color: "var(--chart-3)" },
} satisfies ChartConfig;

const iconConfig = {
  online: { label: "Online", color: "var(--chart-1)", icon: Globe },
  retail: { label: "Retail", color: "var(--chart-3)", icon: Store },
} satisfies ChartConfig;

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-6)" },
} satisfies ChartConfig;

const money = (n: number) => `$${(n / 1000).toFixed(1)}k`;

function Frame({ children }: { children: ReactNode }) {
  return <div className={styles.frame}>{children}</div>;
}

// ── A shadcn example, pasted in ─────────────────────────────────────────
// shadcn's "chart-area-stacked" with its Tailwind classes removed and the
// container given a height. Nothing else changed.

function FromShadcn() {
  return (
    <ChartContainer config={ordersConfig} style={{ aspectRatio: "auto", height: 240 }}>
      <RAreaChart accessibilityLayer data={ORDERS} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatMonthTick(String(v))} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => formatMonth(String(v))} />} />
        <Area dataKey="retail" type="natural" fill="var(--color-retail)" fillOpacity={0.4} stroke="var(--color-retail)" stackId="a" />
        <Area dataKey="online" type="natural" fill="var(--color-online)" fillOpacity={0.4} stroke="var(--color-online)" stackId="a" />
        <ChartLegend content={<ChartLegendContent />} />
      </RAreaChart>
    </ChartContainer>
  );
}

const FROM_SHADCN_CODE = `// shadcn's chart-area-stacked, Tailwind classes removed, ChartContainer given a height.
const chartConfig = {
  online: { label: "Online", color: "var(--chart-1)" },
  retail: { label: "Retail", color: "var(--chart-3)" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} style={{ aspectRatio: "auto", height: 240 }}>
  <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
    <Area dataKey="retail" type="natural" fill="var(--color-retail)" fillOpacity={0.4} stroke="var(--color-retail)" stackId="a" />
    <Area dataKey="online" type="natural" fill="var(--color-online)" fillOpacity={0.4} stroke="var(--color-online)" stackId="a" />
    <ChartLegend content={<ChartLegendContent />} />
  </AreaChart>
</ChartContainer>`;

// ── Tooltip variants on the primitives ──────────────────────────────────

function TipBars({ content }: { content: ReactNode }) {
  return (
    <ChartContainer config={revenueConfig} style={{ aspectRatio: "auto", height: 220 }}>
      <RBarChart accessibilityLayer data={REGIONS} margin={{ top: 8, left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="region" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip {...TOOLTIP_MOTION} content={content as never} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="target" fill="var(--color-target)" radius={4} />
      </RBarChart>
    </ChartContainer>
  );
}

function TipLines({ content, dashedTarget, config = ordersConfig }: { content: ReactNode; dashedTarget?: boolean; config?: ChartConfig }) {
  return (
    <ChartContainer config={config} style={{ aspectRatio: "auto", height: 220 }}>
      <RLineChart accessibilityLayer data={ORDERS} margin={{ top: 8, left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatMonthTick(String(v))} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip {...TOOLTIP_MOTION} cursor={LINE_CURSOR} content={content as never} />
        <Line dataKey="online" type="monotone" stroke="var(--color-online)" strokeWidth={2} dot={false} />
        <Line
          dataKey="retail"
          type="monotone"
          stroke="var(--color-retail)"
          strokeWidth={2}
          strokeDasharray={dashedTarget ? "5 4" : undefined}
          dot={false}
        />
      </RLineChart>
    </ChartContainer>
  );
}

const TOOLTIPS: ReadonlyArray<{ title: string; description: string; render: () => ReactNode; code: string }> = [
  {
    title: "Indicator: dot",
    description: "The default, for bars and areas.",
    render: () => <TipBars content={<ChartTooltipContent indicator="dot" />} />,
    code: `<ChartTooltip content={<ChartTooltipContent indicator="dot" />} />`,
  },
  {
    title: "Indicator: line",
    description: "Mirrors a line's stroke.",
    render: () => <TipLines content={<ChartTooltipContent indicator="line" labelFormatter={(v) => formatMonth(String(v))} />} />,
    code: `<ChartTooltip content={<ChartTooltipContent indicator="line" />} />`,
  },
  {
    title: "Indicator: dashed",
    description: "For a forecast or reference series drawn dashed.",
    render: () => <TipLines dashedTarget content={<ChartTooltipContent indicator="dashed" labelFormatter={(v) => formatMonth(String(v))} />} />,
    code: `<ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />`,
  },
  {
    title: "Label hidden",
    description: "When the x value is already obvious.",
    render: () => <TipBars content={<ChartTooltipContent hideLabel />} />,
    code: `<ChartTooltip content={<ChartTooltipContent hideLabel />} />`,
  },
  {
    title: "Label formatter",
    description: "The label in full: the month name rather than the key.",
    render: () => <TipLines content={<ChartTooltipContent indicator="line" labelFormatter={(v) => `Orders in ${formatMonth(String(v))}`} />} />,
    code: `<ChartTooltipContent labelFormatter={(value) => \`Orders in \${formatMonth(value)}\`} />`,
  },
  {
    title: "Value formatter with a unit",
    description: "valueFormatter formats every number.",
    render: () => <TipBars content={<ChartTooltipContent valueFormatter={money} />} />,
    code: `<ChartTooltipContent valueFormatter={(n) => \`$\${(n / 1000).toFixed(1)}k\`} />`,
  },
  {
    title: "Icons",
    description: "A config icon replaces the indicator.",
    render: () => <TipLines config={iconConfig} content={<ChartTooltipContent labelFormatter={(v) => formatMonth(String(v))} />} />,
    code: `const chartConfig = {
  online: { label: "Online", color: "var(--chart-1)", icon: Globe },
  retail: { label: "Retail", color: "var(--chart-3)", icon: Store },
} satisfies ChartConfig;`,
  },
  {
    title: "Total row",
    description: "For stacked or part-of-a-whole series.",
    render: () => <TipBars content={<ChartTooltipContent total="All" valueFormatter={money} />} />,
    code: `<ChartTooltipContent total="All" valueFormatter={money} />`,
  },
];

// ── The tabs ────────────────────────────────────────────────────────────

type Item = { title: string; description?: string; code: string; render: () => ReactNode; wide?: boolean };

const SECTIONS: Record<Exclude<Tab, "tooltips">, Item[]> = {
  area: [
    {
      title: "Area, two series",
      description: "The high-level AreaChart: frame, legend, end labels, table view.",
      code: `<AreaChart title="Orders per month" data={orders} x="month" series={[{ key: "online", label: "Online" }, { key: "retail", label: "Retail" }]} />`,
      render: () => (
        <AreaChart
          title="Orders per month"
          summary="Online orders rose every month, from 182 to 344."
          data={ORDERS}
          x="month"
          series={[
            { key: "online", label: "Online" },
            { key: "retail", label: "Retail" },
          ]}
          formatX={formatMonthTick}
          formatXLong={formatMonth}
          height={220}
        />
      ),
    },
    {
      title: "Area, stacked, from a ChartConfig",
      description: "config in place of series: the shadcn shape works on the high-level charts too.",
      code: `<AreaChart stacked title="Orders, stacked" data={orders} x="month" config={chartConfig} />`,
      render: () => (
        <AreaChart
          stacked
          title="Orders, stacked"
          summary="Total orders rose from 302 to 505."
          data={ORDERS}
          x="month"
          config={ordersConfig}
          formatX={formatMonthTick}
          formatXLong={formatMonth}
          height={220}
        />
      ),
    },
    { title: "From shadcn", description: "A shadcn example pasted in: kit colours, kit glass, the glide.", code: FROM_SHADCN_CODE, render: FromShadcn, wide: true },
  ],
  line: [
    {
      title: "Line with a reference",
      code: `<LineChart title="Online orders" data={orders} x="month" series={[{ key: "online", label: "Online" }]} reference={{ value: 300, label: "Target" }} />`,
      render: () => (
        <LineChart
          title="Online orders"
          summary="Online orders passed the target of 300 in June."
          data={ORDERS}
          x="month"
          series={[{ key: "online", label: "Online" }]}
          formatX={formatMonthTick}
          formatXLong={formatMonth}
          reference={{ value: 300, label: "Target" }}
          height={220}
        />
      ),
    },
    {
      title: "Two lines",
      code: `<LineChart title="Orders by channel" data={orders} x="month" config={chartConfig} />`,
      render: () => (
        <LineChart
          title="Orders by channel"
          summary="Online grew faster than retail."
          data={ORDERS}
          x="month"
          config={ordersConfig}
          formatX={formatMonthTick}
          formatXLong={formatMonth}
          height={220}
        />
      ),
    },
  ],
  bar: [
    {
      title: "Columns",
      code: `<BarChart title="Revenue by region" data={regions} category="region" series={[{ key: "revenue", label: "Revenue" }]} />`,
      render: () => (
        <BarChart
          title="Revenue by region"
          summary="North leads with 48,200."
          data={REGIONS}
          category="region"
          series={[{ key: "revenue", label: "Revenue" }]}
          height={220}
        />
      ),
    },
    {
      title: "Horizontal bars, two series",
      code: `<BarChart orientation="bars" title="Revenue against target" data={regions} category="region" config={revenueConfig} />`,
      render: () => (
        <BarChart
          orientation="bars"
          title="Revenue against target"
          summary="North and East beat their targets."
          data={REGIONS}
          category="region"
          config={revenueConfig}
          categoryWidth={80}
        />
      ),
    },
  ],
  donut: [
    {
      title: "Donut",
      code: `<DonutChart title="Projects by status" centreLabel="Projects" data={[{ key: "track", label: "On track", value: 22 }, …]} />`,
      render: () => (
        <DonutChart
          title="Projects by status"
          summary="Of 40 projects, 22 are on track."
          centreLabel="Projects"
          data={[
            { key: "track", label: "On track", value: 22 },
            { key: "review", label: "In review", value: 9 },
            { key: "draft", label: "Draft", value: 6 },
            { key: "blocked", label: "Blocked", value: 3 },
          ]}
        />
      ),
    },
  ],
  spark: [
    {
      title: "Stat strip with sparklines",
      description: "One card with hairline cells, never a grid of stat cards.",
      wide: true,
      code: `<StatStrip stats={[{ label: "Orders", value: 505, delta: { value: 32, period: "vs last month" }, trend: [302, 323, 362, 375, 416, 453, 471, 505] }, …]} />`,
      render: () => (
        <StatStrip
          aria-label="This month"
          stats={[
            {
              label: "Orders",
              value: 505,
              delta: { value: 32, period: "vs last month" },
              trend: [302, 323, 362, 375, 416, 453, 471, 505],
              trendLabel: "Monthly: 302 to 505",
            },
            { label: "Revenue", value: 165400, delta: { value: 12800, period: "vs last month" } },
            { label: "Median turnaround", value: 1.8, unit: "days", delta: { value: -0.3, period: "vs last month", goodWhen: "down" } },
            { label: "Open invoices", value: 14, note: "3 overdue" },
          ]}
        />
      ),
    },
    {
      title: "Sparkline",
      code: `<Sparkline values={[12, 18, 15, 24, 21, 29, 32]} width={160} height={40} />`,
      render: () => <Sparkline values={[12, 18, 15, 24, 21, 29, 32]} width={160} height={40} />,
    },
  ],
};

export function ChartsGallery() {
  const [tab, setTab] = useState<Tab>("area");
  const items: Item[] =
    tab === "tooltips" ? TOOLTIPS.map((t) => ({ ...t, render: t.render })) : SECTIONS[tab];
  return (
    <>
      <div className={styles.tabs}>
        <SegmentedControl aria-label="Chart type" value={tab} onChange={setTab} options={TABS} />
      </div>
      <div className={styles.grid}>
        {items.map((it) => (
          <Example key={`${tab}-${it.title}`} title={it.title} description={it.description} code={it.code} block className={it.wide ? styles.wide : undefined}>
            <Frame>{it.render()}</Frame>
          </Example>
        ))}
      </div>
    </>
  );
}
