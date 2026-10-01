import type { ComponentType } from "react";
import AuthCheckEmail from "./auth-check-email";
import AuthLogin from "./auth-login";
import AuthMfaSetup from "./auth-mfa-setup";
import AuthOtp from "./auth-otp";
import AuthReset from "./auth-reset";
import AuthSignup from "./auth-signup";
import Dashboard from "./dashboard";
import DataTable from "./data-table";
import HeaderOnly from "./header-only";
import Inbox from "./inbox";
import Settings from "./settings";
import SidebarIcon from "./sidebar-icon";
import SidebarInset from "./sidebar-inset";
import manifest from "./blocks.json";

// Every block, by name, for the docs (the /blocks viewer and the home page
// showcase). In a project, import the one you installed directly:
// import Dashboard from "@/components/blocks/dashboard".

export type BlockMeta = {
  name: string;
  title: string;
  description: string;
  category: "dashboard" | "apps" | "data" | "settings" | "layout" | "auth";
  route: string;
};

export const BLOCKS = manifest as BlockMeta[];

export const BLOCK_COMPONENTS: Record<string, ComponentType<{ contained?: boolean }>> = {
  dashboard: Dashboard,
  inbox: Inbox,
  "data-table": DataTable,
  settings: Settings,
  "sidebar-icon": SidebarIcon,
  "sidebar-inset": SidebarInset,
  "header-only": HeaderOnly,
  "auth-login": AuthLogin,
  "auth-signup": AuthSignup,
  "auth-otp": AuthOtp,
  "auth-mfa-setup": AuthMfaSetup,
  "auth-reset": AuthReset,
  "auth-check-email": AuthCheckEmail,
};
