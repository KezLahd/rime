import type { ReactNode } from "react";
import { ADDED_FORMS_PREVIEWS } from "./added-forms";
import { ADDED_LAYOUT_PREVIEWS } from "./added-layout";
import { ADDED_OVERLAYS_PREVIEWS } from "./added-overlays";
import { CORE_PREVIEWS } from "./core";
import { SignInFlow, TermsGated } from "./flows";
import { MORE_PREVIEWS } from "./more";

/** slug → example id → live specimen. Every registry example has one. */
export const PREVIEWS: Record<string, Record<string, () => ReactNode>> = {
  ...MORE_PREVIEWS,
  ...CORE_PREVIEWS,
  ...ADDED_FORMS_PREVIEWS,
  ...ADDED_OVERLAYS_PREVIEWS,
  ...ADDED_LAYOUT_PREVIEWS,
};

// The composed flows, added to the entries they belong to.
PREVIEWS.modal = { ...PREVIEWS.modal, terms: TermsGated };
PREVIEWS["auth-card"] = {
  ...PREVIEWS["auth-card"],
  default: () => <SignInFlow />,
  code: () => <SignInFlow initial="code" switcher={false} />,
  setup: () => <SignInFlow initial="setup" switcher={false} />,
};
