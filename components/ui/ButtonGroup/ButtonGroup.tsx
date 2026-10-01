import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Names the group for assistive tech: "Text alignment", "Pagination". Required in practice. */
  "aria-label"?: string;
  /** horizontal (default) joins left to right; vertical stacks top to bottom. */
  orientation?: "horizontal" | "vertical";
};

/**
 * Joins Buttons and IconButtons into one segmented control: shared outer
 * corners, square inner joins and a hairline between neighbours. The
 * buttons keep their own variants and states; the group only shapes them.
 */
export function ButtonGroup({ children, orientation = "horizontal", className, ...rest }: ButtonGroupProps) {
  return (
    <div data-slot="button-group" role="group" aria-orientation={orientation} className={cx(styles.group, styles[orientation], className)} {...rest}>
      {children}
    </div>
  );
}
