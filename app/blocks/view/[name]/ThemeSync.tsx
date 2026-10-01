"use client";

import { useEffect } from "react";
import { readMode, readPreset, setModeAttr, setPresetAttr } from "../../../_docs/PresetSwitch";

/**
 * Keeps a block preview (in the /blocks iframe) on the docs' preset and
 * mode: when the parent page switches either, it writes localStorage, which
 * fires a storage event here, and the frame follows without a reload.
 */
export function ThemeSync() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rime-mode") setModeAttr(readMode());
      if (e.key === "rime-preset") setPresetAttr(readPreset());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
