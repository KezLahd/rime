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

// Hero banner: 1600 x 440 Frost gradient background with floating frosted
// glass UI panels, the real Rime lockup centred at ~700x180, and an install
// command "terminal" pill below.
const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 440" role="img" aria-label="Rime: frosted-glass React components">
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

  <rect width="1600" height="440" fill="url(#bg)"/>
  <rect width="1600" height="440" fill="url(#grid)"/>
  <rect width="1600" height="440" fill="url(#glow)"/>

  <!-- Floating frosted panels (left: list, right: metrics) -->
  <g>
    <rect x="80" y="70" width="200" height="300" rx="18" fill="url(#glass)" stroke="url(#edge)" stroke-width="1"/>
    <rect x="92" y="82" width="100" height="10" rx="4" fill="#ffffff" fill-opacity="0.5"/>
    <rect x="92" y="100" width="160" height="6" rx="3" fill="#ffffff" fill-opacity="0.25"/>
    <rect x="92" y="110" width="140" height="6" rx="3" fill="#ffffff" fill-opacity="0.2"/>
    <rect x="92" y="140" width="176" height="80" rx="10" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="92" y="230" width="176" height="12" rx="3" fill="#ffffff" fill-opacity="0.22"/>
    <rect x="92" y="248" width="140" height="12" rx="3" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="92" y="275" width="88" height="36" rx="18" fill="#94C4FB" fill-opacity="0.6"/>
    <rect x="190" y="275" width="78" height="36" rx="18" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.3"/>
  </g>

  <g>
    <rect x="1320" y="100" width="200" height="260" rx="18" fill="url(#glass2)" stroke="url(#edge)" stroke-width="1"/>
    <rect x="1332" y="112" width="80" height="10" rx="4" fill="#ffffff" fill-opacity="0.45"/>
    <circle cx="1500" cy="117" r="7" fill="#94C4FB"/>
    <rect x="1332" y="140" width="176" height="56" rx="10" fill="#ffffff" fill-opacity="0.1"/>
    <path d="M 1340 180 L 1364 170 L 1388 174 L 1412 160 L 1436 164 L 1460 150 L 1484 156 L 1500 148"
          fill="none" stroke="#C8DDF9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="1332" y="212" width="100" height="10" rx="3" fill="#ffffff" fill-opacity="0.3"/>
    <rect x="1332" y="228" width="160" height="6" rx="3" fill="#ffffff" fill-opacity="0.18"/>
    <rect x="1332" y="238" width="130" height="6" rx="3" fill="#ffffff" fill-opacity="0.14"/>
    <g transform="translate(1332, 260)">
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="48" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="96" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="144" y="0" width="40" height="40" rx="8" fill="#ffffff" fill-opacity="0.14"/>
    </g>
    <rect x="1332" y="316" width="176" height="30" rx="8" fill="#ffffff" fill-opacity="0.1"/>
  </g>

  <!-- Eyebrow label -->
  <text x="800" y="180" text-anchor="middle"
        font-family="ui-sans-serif,-apple-system,system-ui,Segoe UI,Inter,sans-serif"
        font-size="18" font-weight="700" letter-spacing="6"
        fill="#C8DDF9" fill-opacity="0.95">COMPONENT KIT &#x2022; NEXT.JS 16 &#x2022; CSS MODULES</text>

  <!-- The real Rime lockup (mark + wordmark, white), from public/rime -->
  <svg x="430" y="200" width="740" height="258" viewBox="1050 306 3671 1280" preserveAspectRatio="xMidYMid meet">
${lockupInner}
  </svg>

  <!-- Tagline -->
  <text x="800" y="330" text-anchor="middle"
        font-family="ui-sans-serif,-apple-system,system-ui,Segoe UI,Inter,sans-serif"
        font-size="20" font-weight="500"
        fill="#ffffff" fill-opacity="0.9">frosted-glass React components you own</text>

  <!-- Install line pill (fake terminal) -->
  <g transform="translate(800, 365)">
    <rect x="-280" y="0" width="560" height="46" rx="23" fill="#0F1620" fill-opacity="0.55" stroke="#ffffff" stroke-opacity="0.2"/>
    <circle cx="-258" cy="23" r="4" fill="#FF5F57"/>
    <circle cx="-244" cy="23" r="4" fill="#FEBC2E"/>
    <circle cx="-230" cy="23" r="4" fill="#28C840"/>
    <text x="-205" y="29" font-family="ui-monospace,SFMono-Regular,'JetBrains Mono',monospace"
          font-size="15" fill="#C8DDF9">npx shadcn@latest add KezLahd/rime/kit</text>
  </g>
</svg>
`;

writeFileSync(join(root, "assets/banner-hero.svg"), banner);
console.log(`banner-hero.svg written (${banner.length} bytes)`);
