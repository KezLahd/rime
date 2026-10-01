# Rime brand source

- `rime-original.png`: the master artwork (iconmark + wordmark), 1920x640, transparent.
- `trace.mjs` / `compose.mjs`: regenerate every file in `public/rime/` from the master.
  Run from a folder with `potrace` and `sharp` installed: `node trace.mjs && node compose.mjs`
  (it reads rime-original.png from this folder; output lands in `out/`).

## Brand colours

| Name  | Hex       | Use                                   |
|-------|-----------|---------------------------------------|
| Frost | `#468CFB` | Deep blue petals; primary accent      |
| Ice   | `#94C4FB` | Mid petals and the wordmark           |
| Mist  | `#C8DDF9` | Pale petals; tints and washes         |

## Files in public/rime/

- `rime-mark.svg`: iconmark, full colour, square viewBox
- `rime-wordmark.svg`: "rime" wordmark, Ice
- `rime-lockup.svg`: mark + wordmark
- `*-white.svg`: for dark grounds (petals keep their steps through opacity)
- `rime-mark-mono.svg`: one colour via `currentColor`
- `icon.svg`, `favicon.ico` (16/32/48), `icon-192.png`, `icon-512.png`, `apple-icon.png` (on white)
