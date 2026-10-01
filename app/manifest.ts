import type { MetadataRoute } from "next";
import { asset } from "@/lib/site";

// The web app manifest, with the Rime icons from public/rime/.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rime",
    short_name: "Rime",
    description: "Rime: frosted-glass React components, docs and a theme studio.",
    start_url: asset("/"),
    display: "standalone",
    background_color: "#eef3fa",
    theme_color: "#468cfb",
    icons: [
      { src: asset("/rime/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: asset("/rime/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: asset("/rime/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
