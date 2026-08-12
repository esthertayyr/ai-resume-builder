import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Quest — you've done more",
  description:
    "Everything you've done counts. Tell us what you've done, and we'll help you turn it into a professional resume. AI suggests. You confirm.",
};

export const viewport: Viewport = {
  themeColor: "#FFF9F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts loaded with graceful fallback to system fonts if offline.
            Display: Plus Jakarta Sans · Body: Inter · Technical labels: DM Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-ui:"Inter";--font-display:"Plus Jakarta Sans";--font-mono:"DM Mono";}`}</style>
      </head>
      <body className="adventure-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
