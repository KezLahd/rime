import type { Metadata } from "next";
import { inter } from "./fonts/fonts";
import { ToastProvider } from "@/components/ui/Toast/Toast";
import Script from "next/script";
import { THEME_SCRIPT } from "./_docs/theme-script";
import { SITE } from "@/lib/site";
import "./globals.css";

// One sans for the whole kit, self-hosted (app/fonts). --font-inter is what
// tokens.css points --font-body and --font-display at; a theme swaps the
// family there.

export const metadata: Metadata = {
  title: { default: "Rime", template: "%s · Rime" },
  description: "Rime: frosted-glass React components, docs and a theme studio for every project.",
  metadataBase: new URL(SITE.url),
  openGraph: { siteName: "Rime", type: "website", url: SITE.url },
  // The docs are public (rime.mjsons.net).
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script id="rime-theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
