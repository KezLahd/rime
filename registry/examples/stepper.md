# Stepper examples

The wizard's step list: lettered markers, states, and optional navigation back to finished steps.

```tsx
import { Stepper } from "@/components/ui";

<Stepper aria-label="Checkout" steps={steps} onStepClick={goTo} />
```

## Default

```tsx
<Stepper steps={steps} aria-label="Checkout" />
```

Docs: https://rime.mjsons.net/components/stepper
