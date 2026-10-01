import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast/Toast";
import { inter } from "./fonts";
import { ThemeScript } from "./ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Acme", template: "%s · Acme" },
  description: "Built with Rime.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
