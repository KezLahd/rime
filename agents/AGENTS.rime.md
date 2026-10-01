# UI: Rime

This project uses Rime, a React component kit installed with the shadcn CLI
(registry KezLahd/rime, docs https://rime.mjsons.net). It looks and installs
like shadcn/ui but is NOT Tailwind: components are CSS Modules themed by CSS
custom properties.

Before writing UI:

1. Read docs/ui/llms.txt and follow its rules.
2. Need a component that is not in components/ui? Install it:
   `npx shadcn@latest add KezLahd/rime/<name>`
   (names follow shadcn: button, card, dialog, dropdown-menu, select, sheet,
   sonner, table...). Never hand-write a component Rime already has; never
   add Tailwind, Radix or real shadcn components unless asked.
3. Import from "@/components/ui" (the barrel) or the component file.
4. Style screens with CSS Modules using tokens (var(--ink-muted),
   var(--r-md)) or the shadcn aliases (var(--muted-foreground),
   var(--radius)). No hex values, no inline colours.
5. Charts: "@/components/charts". Use LineChart, AreaChart, BarChart and
   DonutChart first; drop to ChartContainer + ChartTooltipContent only for a
   custom chart.
6. The theme lives in app/styles/theme.css (exported from Rime Studio). Do
   not edit tokens.css in a project. Dark mode is the .dark class on <html>.
7. Updating Rime: `npx shadcn@latest add KezLahd/rime/<name> --diff`, review,
   then `--overwrite`.
