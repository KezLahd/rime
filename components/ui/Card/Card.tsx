"use client";

import { Children, createContext, isValidElement, useContext, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../_internal/cx";
import styles from "./Card.module.css";

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  /** Right side of the header: buttons, a status pill. */
  actions?: ReactNode;
  footer?: ReactNode;
  /**
   * default   = solid card with a washed header.
   * highlight = lifted white panel with a soft brand top edge, for the one block on
   *             a screen that needs the user's action.
   * muted     = sunken neutral box for secondary information.
   */
  tone?: "default" | "highlight" | "muted";
  padding?: "sm" | "md" | "lg";
  as?: "div" | "section" | "article" | "aside";
  headingLevel?: 2 | 3 | 4;
  children?: ReactNode;
};

const HeadingLevel = createContext<2 | 3 | 4>(3);

/** Parts a card can be composed from, shadcn style. */
const PART = Symbol.for("rime.card-part");
type Part = { [PART]?: true };

function isPart(node: ReactNode): boolean {
  return isValidElement(node) && Boolean((node.type as Part)[PART]);
}

/**
 * A solid surface with an optional washed header, body and footer. Two ways
 * to fill it, rendering identically:
 * - props: <Card title description actions footer>body</Card>;
 * - parts: <Card><CardHeader><CardTitle/><CardDescription/><CardAction/></CardHeader>
 *   <CardContent/><CardFooter/></Card>.
 * With parts (or no header props), children render bare and the parts give
 * the structure; plain children without parts are wrapped in the body, as
 * before.
 */
export function Card({
  title,
  description,
  actions,
  footer,
  tone = "default",
  padding = "md",
  as: Tag = "section",
  headingLevel = 3,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const Heading = `h${headingLevel}` as const;
  const hasHeader = Boolean(title || description || actions);
  const composed = Children.toArray(children).some(isPart);
  return (
    <HeadingLevel.Provider value={headingLevel}>
      <Tag
        className={cx(styles.card, styles[tone], styles[`pad_${padding}`], className)}
        data-surface={tone === "muted" ? undefined : "solid"}
        data-slot="card"
        data-variant={tone}
        data-size={padding}
        style={style}
        {...rest}
      >
        {hasHeader ? (
          <header className={styles.header} data-slot="card-header">
            <div className={styles.headerText}>
              {title ? (
                <Heading className={styles.title} data-slot="card-title">
                  {title}
                </Heading>
              ) : null}
              {description ? (
                <p className={styles.description} data-slot="card-description">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className={styles.actions} data-slot="card-action">
                {actions}
              </div>
            ) : null}
          </header>
        ) : null}
        {composed ? (
          children
        ) : children !== undefined && children !== null ? (
          <div className={styles.body} data-slot="card-content">
            {children}
          </div>
        ) : null}
        {footer ? (
          <footer className={styles.footer} data-slot="card-footer">
            {footer}
          </footer>
        ) : null}
      </Tag>
    </HeadingLevel.Provider>
  );
}

type PartProps = HTMLAttributes<HTMLElement> & { children?: ReactNode };

/** Every Card part takes its element's attributes and children. */
export type CardHeaderProps = PartProps;
export type CardContentProps = PartProps;
export type CardFooterProps = PartProps;

/** The washed header: title and description on the left, a CardAction on the right. */
export function CardHeader({ className, children, ...rest }: PartProps) {
  const all = Children.toArray(children);
  const action = all.filter((c) => isValidElement(c) && (c as ReactElement).type === CardAction);
  const text = all.filter((c) => !(isValidElement(c) && (c as ReactElement).type === CardAction));
  return (
    <header className={cx(styles.header, className)} data-slot="card-header" {...rest}>
      <div className={styles.headerText}>{text}</div>
      {action}
    </header>
  );
}
(CardHeader as Part)[PART] = true;

/** The card's heading, at the Card's headingLevel (h3 by default). */
export function CardTitle({ className, children, ...rest }: PartProps) {
  const level = useContext(HeadingLevel);
  const Heading = `h${level}` as const;
  return (
    <Heading className={cx(styles.title, className)} data-slot="card-title" {...rest}>
      {children}
    </Heading>
  );
}

export function CardDescription({ className, children, ...rest }: PartProps) {
  return (
    <p className={cx(styles.description, className)} data-slot="card-description" {...rest}>
      {children}
    </p>
  );
}

/** Buttons or a status pill at the header's right. Place inside CardHeader. */
export function CardAction({ className, children, ...rest }: PartProps) {
  return (
    <div className={cx(styles.actions, className)} data-slot="card-action" {...rest}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...rest }: PartProps) {
  return (
    <div className={cx(styles.body, className)} data-slot="card-content" {...rest}>
      {children}
    </div>
  );
}
(CardContent as Part)[PART] = true;

export function CardFooter({ className, children, ...rest }: PartProps) {
  return (
    <footer className={cx(styles.footer, className)} data-slot="card-footer" {...rest}>
      {children}
    </footer>
  );
}
(CardFooter as Part)[PART] = true;
