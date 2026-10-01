"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton, SegmentedControl, Tooltip } from "@/components/ui";

// Theme = preset x mode, as tokens.css defines it.
// - Preset: Rime Default (no attribute) or Rime Flat (data-theme="flat").
// - Mode: light or dark (data-mode="dark" plus the .dark class), following
//   the system until the reader picks one. The D key toggles it.
// Both live on <html>, so every page, portal and the Studio follow them, and
// both are remembered per browser. ThemeScript applies them before paint, so
// a reload never flashes. THEME_EVENT fires on every change.

export type Preset = "default" | "flat";
export type Mode = "light" | "dark";
export type ModeChoice = Mode | "system";

const PRESET_KEY = "rime-preset";
const MODE_KEY = "rime-mode";
export const THEME_EVENT = "rime-theme-change";

export const PRESET_OPTIONS: ReadonlyArray<{ value: Preset; label: string }> = [
  { value: "default", label: "Default" },
  { value: "flat", label: "Flat" },
];

const store = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
};
const load = (k: string) => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};

const systemMode = (): Mode => (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/** Disable transitions for one frame so a mode switch never tweens colours. */
function withoutTransitions(fn: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  fn();
  void getComputedStyle(document.body).opacity;
  requestAnimationFrame(() => style.remove());
}

export function readPreset(): Preset {
  const v = load(PRESET_KEY);
  return v === "flat" ? "flat" : "default";
}

export function readModeChoice(): ModeChoice {
  const v = load(MODE_KEY);
  return v === "light" || v === "dark" ? v : "system";
}

export function readMode(): Mode {
  const c = readModeChoice();
  return c === "system" ? systemMode() : c;
}

export function setPresetAttr(p: Preset) {
  const html = document.documentElement;
  if (p === "flat") html.setAttribute("data-theme", "flat");
  else html.removeAttribute("data-theme");
}

export function setModeAttr(m: Mode) {
  const html = document.documentElement;
  html.classList.toggle("dark", m === "dark");
  if (m === "dark") html.setAttribute("data-mode", "dark");
  else html.removeAttribute("data-mode");
  html.style.colorScheme = m;
}

/** "dark" is accepted for older callers: Rime Default in dark mode. */
export function applyPreset(p: Preset | "dark") {
  if (p === "dark") {
    applyPreset("default");
    applyMode("dark");
    return;
  }
  withoutTransitions(() => setPresetAttr(p));
  store(PRESET_KEY, p);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function applyMode(choice: ModeChoice) {
  withoutTransitions(() => setModeAttr(choice === "system" ? systemMode() : choice));
  store(MODE_KEY, choice);
  window.dispatchEvent(new Event(THEME_EVENT));
}


/** The preset in force and the resolved mode, kept in step with <html>. */
export function useTheme() {
  const [state, setState] = useState<{ preset: Preset; mode: Mode }>({ preset: "default", mode: "light" });
  useEffect(() => {
    const read = () => {
      const html = document.documentElement;
      setState({
        preset: html.getAttribute("data-theme") === "flat" ? "flat" : "default",
        mode: html.classList.contains("dark") || html.getAttribute("data-mode") === "dark" ? "dark" : "light",
      });
    };
    const frame = requestAnimationFrame(read);
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode", "class"] });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
    };
  }, []);
  return state;
}

/** Light or dark, with the D key (outside fields) and the system as the default. */
export function ModeToggle() {
  const { mode } = useTheme();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      applyMode(readMode() === "dark" ? "light" : "dark");
    };
    // Follow the system while the reader has not chosen.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (readModeChoice() === "system") setModeAttr(systemMode());
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onSystem);
    };
  }, []);
  const next = mode === "dark" ? "light" : "dark";
  return (
    <Tooltip content={`Switch to ${next} mode`} shortcut={["D"]}>
      <IconButton
        label={`Switch to ${next} mode`}
        icon={mode === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        onClick={() => applyMode(next)}
      />
    </Tooltip>
  );
}

/** The preset switch (Default or Flat). Mode is ModeToggle. */
export function PresetSwitch() {
  const { preset } = useTheme();
  return (
    <SegmentedControl
      aria-label="Preset"
      size="sm"
      value={preset}
      onChange={(p) => applyPreset(p)}
      options={PRESET_OPTIONS}
    />
  );
}
