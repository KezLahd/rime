import { Children, cloneElement, isValidElement, type CSSProperties, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { mergeRefs } from "./merge-refs";

type AnyProps = Record<string, unknown> & {
  className?: string;
  style?: CSSProperties;
  ref?: Ref<unknown>;
};

export type SlotProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};

/**
 * asChild support, as shadcn (Radix Slot) does it: renders its single child
 * element instead of its own tag, merging the props it was given onto it.
 * className joins (slot first, child after), style merges (child wins), and
 * event handlers both run (the child's first; the slot's is skipped when the
 * child's calls preventDefault). Refs are merged. Any other prop the child
 * sets wins over the slot's.
 */
export function Slot({ children, ref, ...slotProps }: SlotProps) {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;
  const el = child as ReactElement<AnyProps>;
  const childProps = el.props;
  const merged: AnyProps = { ...(slotProps as AnyProps) };

  for (const key of Object.keys(childProps)) {
    const slotValue = (slotProps as AnyProps)[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => void)(...args);
        const event = args[0] as { defaultPrevented?: boolean } | undefined;
        if (!event?.defaultPrevented) (slotValue as (...a: unknown[]) => void)(...args);
      };
    } else if (key === "className") {
      merged.className = cx(slotProps.className, childProps.className);
    } else if (key === "style") {
      merged.style = { ...slotProps.style, ...childProps.style };
    } else if (key !== "children" && key !== "ref") {
      merged[key] = childValue;
    }
  }

  const childRef = childProps.ref;
  if (ref || childRef) merged.ref = mergeRefs(ref as Ref<unknown>, childRef as Ref<unknown>);
  return cloneElement(el, merged as Partial<AnyProps>);
}
