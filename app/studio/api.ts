import type { Overrides } from "./engine/macros";
import type { TokenSource } from "./engine/source";
import type { StudioTheme } from "./engine/theme";

/** What every panel gets: the theme, the preset it starts from, and ways to change it. */
export type StudioApi = {
  /** The theme as the panels edit it: overrides are the ones in force for the current mode. */
  theme: StudioTheme;
  /** The whole theme, both modes (export, saving). */
  source: StudioTheme;
  /** The preset's tokens, as written in the CSS. */
  base: TokenSource;
  /** The token's value in the theme: the override, else the preset's. */
  value: (name: string) => string | undefined;
  /** The token as the browser resolved it in the preview (var() substituted), "" until read. */
  resolved: (name: string) => string;
  /** True when the theme overrides the token. */
  changed: (name: string) => boolean;
  /** Apply overrides. A value equal to the preset's own removes the override. */
  set: (overrides: Overrides, controls?: StudioTheme["controls"]) => void;
  /** Drop overrides (and the named controls) so the preset's values return. */
  reset: (names: string[], controls?: string[]) => void;
  setControls: (controls: StudioTheme["controls"]) => void;
  setLogo: (logo: StudioTheme["logo"]) => void;
  /** Set the business name shown in every preview placeholder (empty clears it). */
  setBrand: (name: string) => void;
  /** Fonts the studio can load (self-hosted by next/font). */
  fonts: ReadonlyArray<StudioFont>;
};

export type StudioFont = { id: string; name: string; family: string; kind: "sans" | "serif" | "display" };
