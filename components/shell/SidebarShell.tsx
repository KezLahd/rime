"use client";

import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/components/ui/_internal/cx";
import { focusableWithin } from "@/components/ui/_internal/position";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import styles from "./SidebarShell.module.css";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Work waiting behind this item. */
  count?: number;
  /** Match the path exactly (for a section root like /admin). */
  exact?: boolean;
};

export type SidebarShellLayout = "sidebar" | "rail" | "header";

/**
 * Two-bar hamburger that animates into an X when the drawer is open. Pure
 * CSS: the two bars crossfade their top and rotate 45 degrees in opposite
 * directions.
 */
function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className={styles.menuToggle} data-open={open ? "" : undefined} aria-hidden="true">
      <span className={styles.menuBar} />
      <span className={styles.menuBar} />
    </span>
  );
}

export type SidebarShellProps = {
  children: ReactNode;
  nav: ReadonlyArray<SidebarNavItem>;
  /** Pinned to the bottom of the sidebar (settings, sign out). Not shown in the header layout. */
  bottomNav?: ReadonlyArray<SidebarNavItem>;
  navLabel: string;
  /** Page title shown in the top bar (sidebar and rail layouts). */
  title?: ReactNode;
  /** Right side of the top bar: search, workspace switcher, profile. */
  topbarRight?: ReactNode;
  /** Full-width strip across the top of the frame, logo corner included (the admin context). */
  strip?: ReactNode;
  footer?: ReactNode;
  /**
   * sidebar (the default) = the expanded frosted sidebar and top bar, one
   * glass L. rail = the sidebar collapsed to an icon rail. header = no
   * sidebar: the logo, the nav as horizontal links and topbarRight in one
   * frosted top bar, with the page below.
   */
  layout?: SidebarShellLayout;
  /**
   * Shows a toggle in the top bar that collapses the sidebar to the rail and
   * back. The starting state is the layout prop (rail = collapsed) unless
   * defaultCollapsed says otherwise. Ignored in the header layout.
   */
  collapsible?: boolean;
  /** Start collapsed (as the rail). Defaults to layout === "rail". */
  defaultCollapsed?: boolean;
  /** Persists the collapsed state in localStorage under this key. Read after mount. */
  storageKey?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Below the mobile breakpoint, the sidebar becomes an off-canvas drawer
   * opened from a menu button in the top bar. On by default; false keeps the
   * icon rail on narrow screens instead.
   */
  mobileDrawer?: boolean;
  /**
   * The frame width (px) below which the drawer (or rail if mobileDrawer is
   * false) applies. Defaults to 600, or 420 when contained.
   */
  mobileBelow?: number;
  /**
   * The frame width (px) below which the sidebar auto-collapses to the icon
   * rail (tablet mode). A chevron at the bottom of the rail toggles back to
   * the full width. Defaults to 1024, or 760 when contained. Set below
   * mobileBelow to disable tablet mode.
   */
  tabletBelow?: number;
  /** Treat the frame as narrow whatever its width: the docs use it to show the drawer at desktop width. */
  forceMobile?: boolean;
  /** Open the drawer on first render, without moving focus (a static docs preview). */
  defaultDrawerOpen?: boolean;
  /**
   * The logo corner's content: your logo as an element (an <img>, an inline
   * SVG, a wordmark). Defaults to a sample glyph and "Acme", the placeholder brand.
   */
  logo?: ReactNode;
  /** The logo for the rail's narrow corner: a mark without the wordmark. Defaults to the glyph. */
  logoCompact?: ReactNode;
  /**
   * The logo corner's ground. glass (the default) = the same frosted glass as
   * the sidebar and top bar, one continuous L. fill = a set colour behind the
   * logo, from --logo-corner-bg (ink --logo-corner-ink), for brands whose
   * guidelines require one.
   */
  logoCorner?: "glass" | "fill";
  /** A logo image URL (or data URL) for the corner, in place of `logo`. Up to 176px wide. */
  logoSrc?: string;
  /** Alt text for logoSrc. Required in practice whenever logoSrc is set. */
  logoAlt?: string;
  /** Overrides the pathname match; used by the docs previews. */
  activeHref?: string;
  /**
   * Fill the parent instead of the viewport. The docs render the shell inside
   * a fixed-height frame so the sticky chrome can be seen working.
   */
  contained?: boolean;
};


/**
 * The dashboard frame: a full-height glass sidebar and a glass top bar
 * forming one frosted L over the page gradient, collapsible to an icon rail,
 * or a header-only top-nav layout. Only <main> scrolls, so the chrome never
 * moves and its blur always has content passing beneath it. Narrow frames get
 * an off-canvas drawer. Presentation only: no auth here (gate inside each
 * page.tsx).
 */
export function SidebarShell({
  children,
  nav,
  bottomNav,
  navLabel,
  title,
  topbarRight,
  strip,
  footer,
  layout = "sidebar",
  collapsible,
  defaultCollapsed,
  storageKey,
  onCollapsedChange,
  mobileDrawer = true,
  mobileBelow,
  tabletBelow,
  forceMobile,
  defaultDrawerOpen,
  logo,
  logoCompact,
  logoCorner = "glass",
  logoSrc,
  logoAlt,
  activeHref,
  contained,
}: SidebarShellProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const drawerId = useId();

  // ── Collapsed state: from the layout prop, kept in step when it changes
  // (the Rime Studio switches it live), and optionally persisted.
  const [collapsed, setCollapsedState] = useState(defaultCollapsed ?? layout === "rail");
  const [prevLayout, setPrevLayout] = useState(layout);
  if (layout !== prevLayout) {
    setPrevLayout(layout);
    setCollapsedState(layout === "rail");
  }

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "1" || saved === "0") {
        const frame = requestAnimationFrame(() => setCollapsedState(saved === "1"));
        return () => cancelAnimationFrame(frame);
      }
    } catch {
      // Storage blocked: the default state stands.
    }
  }, [storageKey]);

  const setCollapsed = (next: boolean) => {
    setCollapsedState(next);
    onCollapsedChange?.(next);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // Storage blocked or full: the state lasts for this page only.
      }
    }
  };

  // ── Narrow frames: measured on the frame itself, so a contained preview
  // behaves like the viewport it stands in for. Two breakpoints: tablet
  // (auto-collapse to the rail, chevron to expand) and mobile (drawer or
  // forced rail).
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const mobileBreak = mobileBelow ?? (contained ? 420 : 600);
  const tabletBreak = tabletBelow ?? (contained ? 760 : 1024);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const check = () => setFrameWidth(el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const mobile = Boolean(forceMobile) || (frameWidth > 0 && frameWidth < mobileBreak);
  const tablet = !mobile && frameWidth > 0 && frameWidth < tabletBreak;

  // In tablet mode the sidebar is a rail by default; the chevron at its
  // bottom lets the user expand it to full for the current session. Resets
  // when the frame grows out of the tablet band.
  const [tabletExpanded, setTabletExpanded] = useState(false);
  useEffect(() => {
    if (!tablet) setTabletExpanded(false);
  }, [tablet]);

  const header = layout === "header";
  const drawer = !header && mobile && mobileDrawer;
  const rail = !header && !drawer && (collapsed || (tablet && !tabletExpanded) || (mobile && !mobileDrawer));

  // ── Drawer: open state, focus in on open, back to the button on close.
  const [drawerOpen, setDrawerOpen] = useState(Boolean(defaultDrawerOpen));
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const userOpened = useRef(false);
  const open = drawer && drawerOpen;

  useEffect(() => {
    if (!open || !userOpened.current) return;
    const el = sidebarRef.current;
    (el ? focusableWithin(el)[0] : undefined)?.focus();
  }, [open]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    if (userOpened.current) menuButtonRef.current?.focus();
    userOpened.current = false;
  }, []);

  const onSidebarKey = (e: KeyboardEvent<HTMLElement>) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDrawer();
      return;
    }
    if (e.key !== "Tab" || !sidebarRef.current) return;
    const items = focusableWithin(sidebarRef.current);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const isActive = (item: SidebarNavItem) =>
    item.exact ? current === item.href : current === item.href || current.startsWith(`${item.href}/`);

  const renderItem = (item: SidebarNavItem) => {
    const active = isActive(item);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cx(styles.item, active && styles.active)}
          title={item.label}
          onClick={open ? closeDrawer : undefined}
        >
          {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
          <span className={styles.label}>{item.label}</span>
          {item.count ? (
            <span className={styles.badge} aria-label={`${item.count} waiting`}>
              {item.count}
            </span>
          ) : null}
        </Link>
      </li>
    );
  };

  const glyph = (
    <span className={styles.glyph} aria-hidden="true">
      A
    </span>
  );
  const fullLogo = logoSrc ? (
    // eslint-disable-next-line @next/next/no-img-element -- any URL or data URL; next/image adds nothing here
    <img src={logoSrc} alt={logoAlt ?? ""} width={176} height={53} className={styles.logo} />
  ) : (
    (logo ?? (
      <span className={styles.wordmark}>
        {glyph}
        Acme
      </span>
    ))
  );
  const compactLogo = logoCompact ?? (
    <span className={styles.wordmark}>
      {glyph}
      <span className="sr-only">Acme</span>
    </span>
  );

  const toggle =
    collapsible && !header && !mobile ? (
      <IconButton
        label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        icon={collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        variant="ghost"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
        className={styles.toggle}
      />
    ) : null;

  const menuButton = drawer ? (
    <IconButton
      ref={menuButtonRef}
      label={open ? "Close navigation" : "Open navigation"}
      icon={<MenuToggleIcon open={open} />}
      variant="ghost"
      aria-expanded={open}
      aria-controls={drawerId}
      onClick={() => {
        if (open) closeDrawer();
        else {
          userOpened.current = true;
          setDrawerOpen(true);
        }
      }}
      className={styles.toggle}
    />
  ) : null;

  // The tablet rail's bottom handle: a chevron the user clicks to expand
  // the rail to full width (and back). Only in tablet mode.
  const tabletHandle = tablet && !drawer ? (
    <button
      type="button"
      className={styles.railHandle}
      onClick={() => setTabletExpanded((v) => !v)}
      aria-label={tabletExpanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={tabletExpanded}
    >
      {tabletExpanded ? <ChevronLeft size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
    </button>
  ) : null;

  const mainArea = contained ? (
    <div className={styles.main}>
      <div className={styles.content}>{children}</div>
      {footer}
    </div>
  ) : (
    <main id="main" className={styles.main}>
      <div className={styles.content}>{children}</div>
      {footer}
    </main>
  );

  return (
    <div
      ref={frameRef}
      className={cx(
        styles.frame,
        contained && styles.contained,
        header && styles.headerLayout,
        rail && styles.rail,
        drawer && styles.drawerMode,
        open && styles.drawerOpen,
      )}
      data-layout={header ? "header" : rail ? "rail" : drawer ? "drawer" : "sidebar"}
    >
      {contained ? null : (
        <a href="#main" className={styles.skip}>
          Skip to content
        </a>
      )}
      {/* Spans the full width, across the logo corner too, so an admin session
          is marked edge to edge. */}
      {strip ? <div className={styles.strip}>{strip}</div> : null}

      {header ? (
        <div className={styles.headerColumn}>
          <header className={cx(styles.topbar, styles.topnav)}>
            <div className={cx(styles.headerBrand, logoCorner === "fill" && styles.brandFill)}>{fullLogo}</div>
            <nav aria-label={navLabel} className={styles.topnavNav}>
              <ul className={styles.topnavList}>{nav.map(renderItem)}</ul>
            </nav>
            {topbarRight ? <div className={styles.right}>{topbarRight}</div> : null}
          </header>
          {mainArea}
        </div>
      ) : (
        <div className={styles.body}>
          <aside
            ref={sidebarRef}
            id={drawerId}
            className={styles.sidebar}
            onKeyDown={onSidebarKey}
            aria-label={drawer ? `${navLabel} menu` : undefined}
            // Off-canvas and closed: out of the tab order and the accessibility tree.
            inert={drawer && !open ? true : undefined}
          >
            <div className={cx(styles.brand, logoCorner === "fill" && styles.brandFill)}>{rail ? compactLogo : fullLogo}</div>
            <nav aria-label={navLabel} className={styles.nav}>
              <ul className={styles.list}>{nav.map(renderItem)}</ul>
              {bottomNav?.length ? <ul className={cx(styles.list, styles.bottom)}>{bottomNav.map(renderItem)}</ul> : null}
            </nav>
            {tabletHandle}
          </aside>
          {drawer ? <div className={styles.scrim} aria-hidden="true" onClick={closeDrawer} /> : null}

          <div className={styles.column} inert={open ? true : undefined}>
            <header className={styles.topbar}>
              <div className={styles.left}>
                {menuButton ?? toggle}
                {/* Not a heading: each page owns its h1. This names the area. */}
                {title ? <p className={styles.title}>{title}</p> : null}
              </div>
              {topbarRight ? <div className={styles.right}>{topbarRight}</div> : null}
            </header>
            {mainArea}
          </div>
        </div>
      )}
    </div>
  );
}
