import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Adventure — build your resume",
  description:
    "You have more experience than you think. Tell us what you've done, and we'll help you turn it into a professional resume.",
};

export const viewport: Viewport = {
  themeColor: "#F7F8FC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts loaded with graceful fallback to system fonts if offline. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-ui:"Inter";--font-display:"Sora";}`}</style>
      </head>
      <body className="adventure-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
