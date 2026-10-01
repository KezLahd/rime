# Combobox examples

A text field that filters a list of options as you type and picks one, with optional create.

```tsx
import { Combobox } from "@/components/ui";

<Field label="Project">
  <Combobox options={PROJECTS} value={project} onChange={setProject} placeholder="Type to search projects" />
</Field>
```

## Open list

Shown inline so the list is visible; in a form it is a popover.

```tsx
<Combobox inline aria-label="Project" options={PROJECTS} value={project} onChange={setProject} />
```

## In a Field

```tsx
<Field label="Project">
  <Combobox options={PROJECTS} value={project} onChange={setProject} placeholder="Type to search projects" />
</Field>
```

## Creatable

```tsx
<Combobox
  creatable
  options={tags}
  value={tag}
  onChange={setTag}
  onCreate={(label) => {
    const value = slugify(label);
    setTags((t) => [...t, { value, label }]);
    setTag(value);
  }}
/>
```

Docs: https://rime.mjsons.net/components/combobox
