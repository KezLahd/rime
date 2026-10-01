# Chart examples

Themed charts on Recharts: line, area, bar and donut in one frame with a table view, plus sparklines and a stat strip.

```tsx
import { AreaChart, BarChart, ChartContainer, ChartTooltip, ChartTooltipContent, DonutChart, LineChart, Sparkline, StatStrip, type ChartConfig } from "@/components/charts";

<LineChart
  title="Orders per month"
  summary="Online orders rose from 182 in January to 344 in August."
  data={rows}
  x="month"
  series={[{ key: "online", label: "Online" }]}
/>
```

## Area, two series

```tsx
<AreaChart
  title="Orders per month"
  summary="Online orders rose every month, from 182 to 344."
  data={ORDERS}
  x="month"
  series={[{ key: "online", label: "Online" }, { key: "retail", label: "Retail" }]}
  formatX={formatMonthTick}
  formatXLong={formatMonth}
/>
```

## Line with a reference

```tsx
<LineChart title="Online orders" summary="…" data={ORDERS} x="month" series={[{ key: "online", label: "Online" }]} reference={{ value: 300, label: "Target" }} />
```

## Bars, labelled

```tsx
<BarChart title="Revenue by region" summary="North leads with 48,200." data={REVENUE} category="region" series={[{ key: "revenue", label: "Revenue" }]} orientation="bars" valueLabels />
```

## Donut

```tsx
<DonutChart title="Projects by status" summary="Of 40 projects, 22 are on track." centreLabel="Projects" data={STATUS_SPLIT} />
```

## Stat strip with sparklines

```tsx
<StatStrip aria-label="This month" stats={[{ label: "Orders", value: 505, delta: { value: 32, period: "vs last month" }, trend: [302, 323, 362, 375, 416, 453, 471, 505] }]} />
```

## The shadcn primitives

ChartContainer with a ChartConfig, Recharts marks reading var(--color-<key>), and ChartTooltipContent. See /charts for every tooltip variant.

```tsx
const chartConfig = {
  online: { label: "Online", color: "var(--chart-1)" },
  retail: { label: "Retail", color: "var(--chart-3)" },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} style={{ aspectRatio: "auto", height: 220 }}>
  <BarChart accessibilityLayer data={rows}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip {...TOOLTIP_MOTION} content={<ChartTooltipContent indicator="dot" />} />
    <Bar dataKey="online" fill="var(--color-online)" radius={4} />
    <Bar dataKey="retail" fill="var(--color-retail)" radius={4} />
  </BarChart>
</ChartContainer>
```

Docs: https://rime.mjsons.net/components/chart
