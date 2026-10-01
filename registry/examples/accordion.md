# Accordion examples

Stacked sections that open and close in place: one at a time or several, on glass or plain hairlines.

```tsx
import { Accordion } from "@/components/ui";

<Accordion
  defaultValue={["billing"]}
  items={[
    { id: "billing", title: "When is an invoice issued?", content: "On the first working day of each month." },
    { id: "seats", title: "Can I add a team member mid-cycle?", content: "Yes, from the day it is added." },
  ]}
/>
```

## Single, one open

```tsx
<Accordion items={FAQ} defaultValue={["billing"]} />
```

## Multiple open

type="multiple": opening one section leaves the others as they are.

```tsx
<Accordion type="multiple" items={FAQ} defaultValue={["billing", "seats"]} />
```

## Plain, inside a surface

```tsx
<Card title="Help">
  <Accordion appearance="plain" items={FAQ} />
</Card>
```

Docs: https://rime.mjsons.net/components/accordion
