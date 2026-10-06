import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/dm-sans/wght.css";
import "../globals.css";

export const metadata: Metadata = { title: "Porte — Sayd Social Club", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#120f0e", width: "device-width", initialScale: 1, maximumScale: 1 };

export default function ScanRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body className="min-h-svh bg-night text-ink">{children}</body>
    </html>
  );
}
