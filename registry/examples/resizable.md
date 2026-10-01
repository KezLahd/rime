# Resizable examples

Panels split by draggable hairline handles, side by side or stacked, with keyboard resizing and minimum sizes.

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui";

<ResizablePanelGroup height={320}>
  <ResizablePanel defaultSize={30} minSize={20}>Projects</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel>Details</ResizablePanel>
</ResizablePanelGroup>
```

## Three panels

Drag a handle, or focus it and use the arrow keys.

```tsx
<ResizablePanelGroup height={240}>
  <ResizablePanel defaultSize={25} minSize={15}>Projects</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel defaultSize={50}>Invoice INV-004213</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel defaultSize={25} minSize={15}>Details</ResizablePanel>
</ResizablePanelGroup>
```

## Vertical

```tsx
<ResizablePanelGroup direction="vertical" height={280}>…</ResizablePanelGroup>
```

Docs: https://rime.mjsons.net/components/resizable
