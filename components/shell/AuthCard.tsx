import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { IconArrowLeft } from "@/components/ui/Icon/Icon";
import styles from "./AuthCard.module.css";

/**
 * The auth inversion: a solid card on its own deep backdrop, for sign-in,
 * sign-up, password and MFA screens. Three fixed layers (base, floor shade
 * and sky light) are read from tokens (--auth-background, --auth-floor,
 * --auth-sky), so a theme restyles the backdrop without touching this file.
 * `contained` fills a fixed-height parent instead of the viewport (docs).
 */
export type AuthLayoutProps = {
  children: ReactNode;
  /** A bar across the top of the page: your brand mark at the left, a help link at the right. */
  header?: ReactNode;
  /** A strip at the foot of the page: a security note, legal links. */
  footer?: ReactNode;
  /** Fill a fixed-height parent instead of the viewport (docs previews). */
  contained?: boolean;
};

export function AuthLayout({ children, header, footer, contained }: AuthLayoutProps) {
  return (
    <div className={cx(styles.page, contained && styles.contained)}>
      <div className={styles.bgBase} aria-hidden="true" />
      <div className={styles.bgFloor} aria-hidden="true" />
      <div className={styles.bgSky} aria-hidden="true" />
      {header ? <header className={styles.header}>{header}</header> : null}
      {contained ? (
        <div className={styles.column}>{children}</div>
      ) : (
        <main id="main" className={styles.column}>
          {children}
        </main>
      )}
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </div>
  );
}

export type AuthCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Your logo or wordmark, centred above the title. */
  logo?: ReactNode;
  /** Icon tile above the title (MFA screens). */
  icon?: ReactNode;
  /** A small tag beside nothing else: "Admin", "Staging". Sits above the title on one line with it. */
  badge?: ReactNode;
  children: ReactNode;
  /** A strip under the card body: a trust line, a terms link. */
  footer?: ReactNode;
  /** sm 440 (sign-in, MFA), md 520 (set password), lg 720 (onboarding). */
  width?: "sm" | "md" | "lg";
  /** A way out, under the form: "Back to sign in". */
  back?: { href: string; label: string };
};

export function AuthCard({ title, subtitle, logo, icon, badge, children, footer, width = "sm", back }: AuthCardProps) {
  return (
    <section className={cx(styles.card, styles[width])} data-surface="solid">
      <div className={styles.body}>
        {logo ? <div className={styles.logo}>{logo}</div> : null}
        <header className={styles.heading}>
          {icon ? (
            <span className={styles.iconTile} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <h1 className={styles.title}>
            {title}
            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
        {children}
        {back ? (
          <div className={styles.backRow}>
            <Link href={back.href} className={styles.back}>
              <IconArrowLeft size={14} />
              {back.label}
            </Link>
          </div>
        ) : null}
      </div>
      {footer ? <div className={styles.strip}>{footer}</div> : null}
    </section>
  );
}
