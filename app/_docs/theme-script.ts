// Applies the stored preset and mode to <html> before paint (rendered by the
// root layout with next/script beforeInteractive). Keys: rime-preset,
// rime-mode; with no stored mode, the system preference decides.
export const THEME_SCRIPT = `try{var d=document.documentElement,p=localStorage.getItem("rime-preset"),m=localStorage.getItem("rime-mode");if(p==="flat")d.setAttribute("data-theme","flat");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(m==="dark"){d.classList.add("dark");d.setAttribute("data-mode","dark")}d.style.colorScheme=m}catch(e){}`;
