// Sets the Rime preset and colour mode on <html> before first paint, so a
// reload never flashes the wrong theme. Preset: data-theme="flat" for Rime
// Flat (nothing for Rime Default). Mode: the .dark class plus
// data-mode="dark", from the stored choice or the system setting.
// Store "flat" in localStorage "rime-preset" and "light" or "dark" in
// "rime-mode" to change them.

const SCRIPT = `try{var d=document.documentElement,p=localStorage.getItem("rime-preset"),m=localStorage.getItem("rime-mode");if(p==="flat")d.setAttribute("data-theme","flat");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(m==="dark"){d.classList.add("dark");d.setAttribute("data-mode","dark")}d.style.colorScheme=m}catch(e){}`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
