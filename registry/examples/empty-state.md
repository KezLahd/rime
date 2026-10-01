# EmptyState examples

What an empty list means and what to do next: default, positive (all done) and filtered tones.

```tsx
import { EmptyState } from "@/components/ui";

<EmptyState title="No projects yet" description="Create a project to start tracking work." action={<Button href="/projects/new">New project</Button>} />
```

## Tones

```tsx
<EmptyState tone="positive" title="All caught up" description="Nothing is waiting for review." />
```

Docs: https://rime.mjsons.net/components/empty-state
