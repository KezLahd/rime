"use client";

import type { ReactNode } from "react";
import { ShellFrame } from "../_docs/previews/core";

/** Live previews for the shell layout patterns, keyed by pattern slug. Each fills its width. */
export const SHELL_PATTERN_PREVIEWS: Record<string, () => ReactNode> = {
  "shell-sidebar": () => <ShellFrame />,
  "shell-rail": () => <ShellFrame variant="collapsible" />,
  "shell-header": () => <ShellFrame variant="header" />,
  "shell-drawer": () => <ShellFrame variant="drawer" />,
};
