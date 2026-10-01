import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { IconArrowLeft } from "@/components/ui/Icon/Icon";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned: the view's one primary button, plus any secondaries. */
  actions?: ReactNode;
  /** Back link above the title, e.g. { href: "/projects", label: "Projects" }. */
  back?: { href: string; label: string };
  /** Sits beside the title: a status pill, a reference. */
  meta?: ReactNode;
  className?: string;
};

/** The page's single h1, with an optional back link, meta, description and actions. */
export function PageHeader({ title, description, actions, back, meta, className }: PageHeaderProps) {
  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.text}>
        {back ? (
          <Link href={back.href} className={styles.back}>
            <IconArrowLeft size={14} />
            {back.label}
          </Link>
        ) : null}
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {meta ? <div className={styles.meta}>{meta}</div> : null}
        </div>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
