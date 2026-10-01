import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

/** Extract everything inside the outer <svg ...> </svg> of a Rime brand asset. */
function innerSvg(path) {
  const raw = readFileSync(join(root, path), "utf8");
  const openEnd = raw.indexOf(">") + 1;
  const close = raw.lastIndexOf("</svg>");
  return raw.slice(openEnd, close);
}

// Lockup viewBox is "1050 306 3671 1280" (mark + wordmark combined, white).
const lockupInner = innerSvg("public/rime/rime-lockup-white.svg");

// Hero banner: 1600 x 480 Frost gradient background with floating frosted
// glass UI panels (clipped to the vertical margins), the real Rime lockup
// at a measured size with real room above and below, and an install line
// "terminal" pill at the base. Vertical rhythm (top -> bottom):
//   y  36 : eyebrow label
//   y  80 - 220 : lockup (140 tall, ~402 wide at 2.87:1 aspect)
//   y 280 : tagline
//   y 356 - 410 : install pill
//
// Nothing overlaps because each band is laid out in its own vertical
// stripe with ~30 px of air between.
const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 480" role="img" aria-label="Rime: frosted-glass React components">
  <title>Rime: frosted-glass React components</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1F5BC4"/>
      <stop offset="0.5" stop-color="#2B6CDB"/>
      <stop offset="1" stop-color="#468CFB"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#C8DDF9" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#C8DDF9" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="glass2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.1"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1600" height="480" fill="url(#bg)"/>
  <rect width="1600" height="480" fill="url(#grid)"/>
  <rect width="1600" height="480" fill="url(#glow)"/>

  <!-- Left frosted panel: "list" specimen. 200 wide, kept narrow so the
       centre column reserves ~1000 px of clean space. -->
  <g>
    <rect x="80" y="70" width="200" height="340" rx="18" fill="url(#glass)" stroke="url(#edge)" stroke-width="1"/>
    <rect x="92" y="86" width="100" height="10" rx="4" fill="#ffffff" fill-opacity="0.5"/>
    <rect x="92" y="104" width="160" height="6" rx="3" fill="#ffffff" fill-opacity="0.25"/>
    <rect x="92" y="114" width="140" height="6" rx="3" fill="#ffffff" fill-opacity="0.2"/>
    <rect x="92" y="146" width="176" height="90" rx="10" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="92" y="248" width="176" height="12" rx="3" fill="#ffffff" fill-opacity="0.22"/>
    <rect x="92" y="266" width="140" height="12" rx="3" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="92" y="296" width="88" height="36" rx="18" fill="#94C4FB" fill-opacity="0.6"/>
    <rect x="190" y="296" width="78" height="36" rx="18" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.3"/>
  </g>

  <!-- Right frosted panel: "metrics" specimen. -->
  <g>
    <rect x="1320" y="100" width="200" height="300" rx="18" fill="url(#glass2)" stroke="url(#edge)" stroke-width="1"/>
    <rect x="1332" y="116" width="80" height="10" rx="4" fill="#ffffff" fill-opacity="0.45"/>
    <circle cx="1500" cy="121" r="7" fill="#94C4FB"/>
    <rect x="1332" y="146" width="176" height="60" rx="10" fill="#ffffff" fill-opacity="0.1"/>
    <path d="M 1340 190 L 1364 178 L 1388 182 L 1412 164 L 1436 170 L 1460 152 L 1484 160 L 1500 148"
          fill="none" stroke="#C8DDF9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="1332" y="226" width="100" height="10" rx="3" fill="#ffffff" fill-opacity="0.3"/>
    <rect x="1332" y="242" width="160" height="6" rx="3" fill="#ffffff" fill-opacity="0.18"/>
    <rect x="1332" y="252" width="130" height="6" rx="3" fill="#ffffff" fill-opacity="0.14"/>
    <g transform="translate(1332, 274)">
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="48" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="96" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="144" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
    </g>
    <rect x="1332" y="334" width="176" height="30" rx="8" fill="#ffffff" fill-opacity="0.1"/>
  </g>

  <!-- Row 1 (y ~ 56): eyebrow label -->
  <text x="800" y="56" text-anchor="middle"
        font-family="ui-sans-serif,-apple-system,system-ui,Segoe UI,Inter,sans-serif"
        font-size="17" font-weight="700" letter-spacing="6"
        fill="#C8DDF9" fill-opacity="0.95">COMPONENT KIT &#x2022; NEXT.JS 16 &#x2022; CSS MODULES</text>

  <!-- Row 2 (y 90 - 230): the real Rime lockup, 140 tall, 402 wide at
       the 2.87:1 aspect ratio of viewBox "1050 306 3671 1280". -->
  <svg x="599" y="90" width="402" height="140" viewBox="1050 306 3671 1280" preserveAspectRatio="xMidYMid meet">
${lockupInner}
  </svg>

  <!-- Row 3 (y ~ 290): tagline, well below the lockup bottom at y 230. -->
  <text x="800" y="290" text-anchor="middle"
        font-family="ui-sans-serif,-apple-system,system-ui,Segoe UI,Inter,sans-serif"
        font-size="22" font-weight="500"
        fill="#ffffff" fill-opacity="0.92">frosted-glass React components you own</text>

  <!-- Row 4 (y 356 - 410): install line pill, like a mini terminal. -->
  <g transform="translate(800, 358)">
    <rect x="-280" y="0" width="560" height="52" rx="26" fill="#0F1620" fill-opacity="0.55" stroke="#ffffff" stroke-opacity="0.2"/>
    <circle cx="-258" cy="26" r="4" fill="#FF5F57"/>
    <circle cx="-244" cy="26" r="4" fill="#FEBC2E"/>
    <circle cx="-230" cy="26" r="4" fill="#28C840"/>
    <text x="-205" y="32" font-family="ui-monospace,SFMono-Regular,'JetBrains Mono',monospace"
          font-size="15" fill="#C8DDF9">npx shadcn@latest add KezLahd/rime/kit</text>
  </g>
</svg>
`;

writeFileSync(join(root, "assets/banner-hero.svg"), banner);
console.log(`banner-hero.svg written (${banner.length} bytes)`);
