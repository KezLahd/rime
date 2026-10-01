# FolderTabs and SegmentedControl examples

Folder tabs that sit on a glass panel with always-visible counts, and a segmented control for views.

```tsx
import { FolderTabs, SegmentedControl } from "@/components/ui";

<SegmentedControl aria-label="View" value={view} onChange={setView} options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]} />
```

## Folder tabs

```tsx
<FolderTabs aria-label="Orders" tabs={[{ id: "open", label: "Open", count: 12 }, { id: "review", label: "In review", count: 4, colour: "amber" }]} value={tab} onChange={setTab}>…</FolderTabs>
```

## Segmented control

```tsx
<SegmentedControl aria-label="View" value={view} onChange={setView} options={VIEWS} />
```

Docs: https://rime.mjsons.net/components/tabs
