# Carousel examples

A row of slides on a native scroll-snap track, with frosted prev and next buttons, dots and arrow keys.

```tsx
import { Carousel } from "@/components/ui";

<Carousel aria-label="Featured projects" perView={3}>
  {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
</Carousel>
```

## One per view

```tsx
<Carousel aria-label="Projects">{slides}</Carousel>
```

## Three per view

```tsx
<Carousel aria-label="Projects" perView={3}>{slides}</Carousel>
```

Docs: https://rime.mjsons.net/components/carousel
