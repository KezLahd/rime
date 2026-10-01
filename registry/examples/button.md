# Button examples

The action control: primary gradient, glass secondary, ghost, and two danger forms, in three sizes.

```tsx
import { Button } from "@/components/ui";

<Button onClick={save}>Save changes</Button>
```

## Variants

One primary per view. Secondary switches to a white tile inside solid surfaces.

```tsx
<Button>Create invoice</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="dangerSecondary">Review deletion</Button>
<Button variant="danger">Delete project</Button>
```

## Sizes

sm for table rows and toolbars, md everywhere else, lg for the one action on an auth card.

```tsx
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
```

## With icons

```tsx
<Button iconStart={<IconPlus size={15} />}>Add team member</Button>
<Button variant="secondary" iconEnd={<IconArrowRight size={15} />}>Continue</Button>
```

## Loading and disabled

Loading keeps the fill, dulls it and swaps the label. Disabled is a flat tint, not a faded gradient.

```tsx
<Button loading loadingLabel="Saving…">Save</Button>
<Button disabled>Submit</Button>
<Button href="/projects" variant="secondary">Link as button</Button>
```

## shadcn names

shadcn's variant and size names work as aliases: default is primary, destructive is danger, outline is secondary; link is an inline text link; icon, icon-sm and icon-lg are square. buttonVariants is buttonClassName.

```tsx
<Button variant="default">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Read the terms</Button>
<Button variant="outline" size="icon" aria-label="Settings"><Settings size={16} /></Button>
```

## asChild

asChild renders the single child (a Next Link, an <a>) with the button's look, as shadcn does. href remains the shorter way for internal links.

```tsx
import Link from "next/link";

<Button asChild>
  <Link href="/projects/new">New project</Link>
</Button>
<Button variant="destructive" size="icon" asChild>
  <Link href="/trash" aria-label="Open trash"><Trash2 size={16} /></Link>
</Button>
```

Docs: https://rime.mjsons.net/components/button
