import type { RegistryEntry } from "../types";

export const SHELL: RegistryEntry[] = [
  {
    slug: "sidebar-shell",
    name: "SidebarShell",
    category: "Shell",
    summary: "The signed-in frame in four layouts: an expanded frosted sidebar, a collapsible icon rail, a header-only top nav, and a drawer on narrow screens.",
    description: [
      "SidebarShell is the dashboard frame. The page field is painted once on the whole frame; the sidebar and top bar are frosted glass over it, so the chrome carries a whitened version of the field and the screen reads as one surface. Only <main> scrolls, so the chrome never moves and its blur always has content passing beneath it.",
      "layout picks the frame. sidebar (the default) is the expanded glass L. rail is the sidebar collapsed to icons: labels are visually hidden (each item keeps its title as a tooltip), counts sit on the icon and the logo corner shows the compact mark (logoCompact). header drops the sidebar: the logo, the nav as horizontal links and topbarRight share one frosted top bar, and the page sits below. collapsible adds a panel button to the top bar that folds the sidebar to the rail and back; storageKey remembers the choice in localStorage, read after mount so the server and client render the same.",
      "Below 900px of the frame's own width (600px when contained; set mobileBelow to change it) the sidebar becomes an off-canvas drawer: a menu button in the top bar opens it, focus moves in and is held there, and Esc, the scrim or picking a link closes it and returns focus to the button. mobileDrawer={false} keeps the icon rail on narrow screens instead. forceMobile and defaultDrawerOpen exist for previews like the one here.",
      "The logo corner is flush, square and exactly the top bar's height. By default (logoCorner=\"glass\") it is the same frosted glass as the sidebar and top bar, so the chrome reads as one continuous L. logoCorner=\"fill\" opts in to a set colour or gradient behind the logo (--logo-corner-bg, with --logo-corner-ink for the default wordmark), for brands whose guidelines require one. Pass your logo as an element (logo) or an image URL (logoSrc); without either it shows a sample glyph and \"Acme\", the placeholder brand. strip adds a full-width band across the top (an admin session, a staging site), on --admin-strip-bg. The active nav item is the solid brand-gradient pill, the one gradient on the chrome.",
      "Every chrome colour reads a token: --chrome-sidebar, --chrome-topbar, --chrome-shadow, --sidebar-bg, --topbar-bg, --sidebar-ink, --sidebar-hover-bg, --sidebar-active-bg and -ink, --sidebar-rule, --shell-sidebar-width, --shell-rail-width, --shell-drawer-width, plus --shell-logo (a url()). It is presentation only: no auth in here.",
    ],
    importLine: `import { SidebarShell } from "@/components/shell/SidebarShell";`,
    usage: `<SidebarShell
  navLabel="Main"
  logo={<img src="/logo.svg" alt="Acme" width={140} height={32} />}
  nav={[
    { href: "/dashboard", label: "Dashboard", icon: <IconHome size={16} />, exact: true },
    { href: "/projects", label: "Projects", icon: <IconClipboard size={16} />, count: 2 },
  ]}
  title="Projects"
  topbarRight={<Avatar name="Jane Cooper" size="sm" />}
  collapsible
  storageKey="app-sidebar-collapsed"
>
  {children}
</SidebarShell>`,
    props: ["SidebarShell"],
    css: ["components/shell/SidebarShell.module.css"],
    examples: [
      {
        id: "default",
        title: "Sidebar expanded (logo corner: match glass)",
        code: `<SidebarShell contained navLabel="Main" nav={NAV} activeHref="/projects" title="Projects">
  …
</SidebarShell>`,
      },
      {
        id: "collapsible",
        title: "Collapsible, remembered",
        description: "The panel button folds the sidebar to the icon rail and back. storageKey keeps the choice across reloads.",
        code: `<SidebarShell
  contained
  collapsible
  storageKey="app-sidebar-collapsed"
  onCollapsedChange={(collapsed) => console.log("collapsed", collapsed)}
  navLabel="Main"
  nav={NAV}
  title="Projects"
>
  …
</SidebarShell>`,
      },
      {
        id: "rail",
        title: "Collapsed to an icon rail",
        description: "layout=\"rail\" starts collapsed. With collapsible it can still be expanded.",
        code: `<SidebarShell contained layout="rail" collapsible navLabel="Main" nav={NAV} title="Projects" logoCompact={<Mark />}>
  …
</SidebarShell>`,
      },
      {
        id: "header",
        title: "Header only (top nav)",
        description: "No sidebar: the logo, the nav and topbarRight share one frosted bar.",
        code: `<SidebarShell contained layout="header" navLabel="Main" nav={NAV} topbarRight={<Avatar name="Jane Cooper" size="sm" />}>
  …
</SidebarShell>`,
      },
      {
        id: "drawer",
        title: "Mobile drawer",
        description: "Below 900px the sidebar is a drawer from the menu button. Shown open here with forceMobile and defaultDrawerOpen.",
        code: `// Automatic below 900px of the frame's width. For a preview at desktop width:
<SidebarShell contained forceMobile defaultDrawerOpen navLabel="Main" nav={NAV} title="Projects">
  …
</SidebarShell>

// Keep the icon rail on narrow screens instead of a drawer:
<SidebarShell mobileDrawer={false} navLabel="Main" nav={NAV}>…</SidebarShell>`,
      },
      {
        id: "fill",
        title: "Logo corner: brand fill",
        description: "Opt in for brands that require a set colour behind the logo. Set the colour with --logo-corner-bg (a colour or a gradient).",
        code: `<SidebarShell contained logoCorner="fill" navLabel="Main" nav={NAV} activeHref="/projects" title="Projects">…</SidebarShell>

/* theme.css */
:root { --logo-corner-bg: linear-gradient(135deg, #0f766e, #0b5c56); --logo-corner-ink: #ffffff; }`,
      },
      {
        id: "admin",
        title: "With a context strip",
        code: `<SidebarShell contained strip="Admin session" navLabel="Admin" nav={ADMIN_NAV} activeHref="/admin" title="Overview">…</SidebarShell>`,
      },
    ],
    accessibility: [
      "A skip link (\"Skip to content\") is the first focusable element and targets <main id=\"main\">.",
      "The nav is a labelled <nav> (navLabel) in every layout; the current item has aria-current=\"page\". In the rail the labels stay in the accessibility tree (visually hidden) and each item has a title tooltip.",
      "The collapse toggle is a real button with aria-expanded and a label that says what it will do (\"Collapse sidebar\", \"Expand sidebar\").",
      "The drawer's menu button has aria-expanded and aria-controls. While open, focus is held in the drawer, the page behind is inert, and Esc or the scrim closes it and returns focus to the button. A closed drawer is inert, so it is out of the tab order.",
      "The top bar title is not a heading: each page owns its h1.",
      "contained renders a <div> instead of <main>, so a preview never adds a second main landmark.",
    ],
    dos: [
      "Gate access inside each page.tsx, never in the layout that renders the shell (a layout gate leaks the page into the RSC payload).",
      "Give the rail a compact mark (logoCompact) when your logo is a wide wordmark.",
      "Use the header layout for products with five or fewer top-level sections and no deep navigation.",
      "Keep account links in a profile menu in the top bar, not at the sidebar's foot.",
    ],
    donts: [
      "Don't give the sidebar a hue of its own; it is whitened glass over the same field.",
      "Don't add a second gradient to the chrome; the active pill is the one.",
      "Don't hide navigation behind the drawer on wide screens; it is for narrow frames only.",
    ],
    related: ["page-header", "glass-panel"],
    depth: "full",
    layout: "block",
  },
  {
    slug: "page-header",
    name: "PageHeader",
    category: "Shell",
    summary: "A page's h1 with a back link, a meta line, a description and actions.",
    description: [
      "PageHeader opens every signed-in page: the h1, an optional back link above it, meta beside the title (a status pill, a reference) and actions on the right. Nothing is stacked over the title, and the description uses the full width of its column.",
    ],
    importLine: `import { PageHeader } from "@/components/shell/PageHeader";`,
    usage: `<PageHeader title="Atlas redesign" back={{ href: "/projects", label: "Projects" }} actions={<Button variant="secondary">Share</Button>} />`,
    props: ["PageHeader"],
    css: ["components/shell/PageHeader.module.css"],
    examples: [
      {
        id: "default",
        title: "Back link, meta and actions",
        code: `<PageHeader
  title="Atlas redesign"
  description="Started 12 Oct 2026 · 4 members"
  back={{ href: "/projects", label: "Projects" }}
  meta={<StatusPill tone="success">Active</StatusPill>}
  actions={<Button variant="secondary">Share</Button>}
/>`,
      },
    ],
    accessibility: ["Renders the page's only h1."],
    dos: ["One PageHeader per page."],
    donts: ["Don't repeat the top bar title as a second heading.", "Don't stack a small label over the title."],
    depth: "summary",
    layout: "block",
  },
  {
    slug: "auth-card",
    name: "AuthCard and AuthLayout",
    category: "Shell",
    summary: "The sign-in card: a solid card on a deep field, with a logo slot, icon tile, title, footer strip and back link.",
    description: [
      "AuthLayout paints the auth field (--auth-background, --auth-floor, --auth-sky), centres its child, and takes an optional header (your brand mark, a help link) and footer (a security note). AuthCard frames sign-in, sign-up, MFA, reset and onboarding steps: a logo slot, an optional icon tile, the title (the page's h1) with an optional inline badge, the form, an optional back link and a footer strip.",
    ],
    importLine: `import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";`,
    usage: `<AuthLayout>
  <AuthCard logo={<Logo />} title="Sign in" subtitle="Use the email you signed up with.">
    …form…
  </AuthCard>
</AuthLayout>`,
    props: ["AuthCard", "AuthLayout"],
    css: ["components/shell/AuthCard.module.css"],
    examples: [
      {
        id: "default",
        title: "Sign in with multi-factor authentication",
        description: "A brand bar in the header, the card centred, the security note in the footer. Switch between the password, MFA code and authenticator setup steps.",
        code: `<AuthLayout
  header={<Logo />}
  footer={<><IconShield size={14} /> Protected by multi-factor authentication.</>}
>
  <AuthCard icon={<IconLock size={22} />} title="Sign in" subtitle="Use your work email.">
    <Field label="Work email"><TextInput type="email" autoComplete="username" /></Field>
    <Field label="Password"><TextInput type="password" revealable autoComplete="current-password" /></Field>
    <Button size="lg" fullWidth>Continue</Button>
  </AuthCard>
</AuthLayout>`,
      },
      {
        id: "code",
        title: "MFA code step",
        code: `<AuthCard icon={<IconShield size={22} />} title="Enter your code" subtitle="Open your authenticator app and enter the 6-digit code.">
  <OtpInput aria-label="Authentication code" value={code} onChange={setCode} onComplete={verify} />
  <Button size="lg" fullWidth disabled={code.length < 6}>Verify</Button>
</AuthCard>`,
      },
      {
        id: "setup",
        title: "Authenticator setup step",
        code: `<AuthCard width="md" icon={<IconShield size={22} />} title="Set up your authenticator">
  <QrCode value={otpauthUrl} />
  <code>{secret}</code>
  <OtpInput aria-label="Code from your authenticator app" value={code} onChange={setCode} />
  <Button size="lg" fullWidth>Turn on two-step sign-in</Button>
</AuthCard>`,
      },
    ],
    accessibility: ["The title is the page's h1; the layout renders the main landmark."],
    dos: ["One primary action, full width, size lg."],
    donts: ["Don't put navigation inside the card beyond the back link."],
    depth: "summary",
    layout: "block",
  },
];
