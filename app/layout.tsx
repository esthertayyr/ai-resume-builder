import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Caveat, DM_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font: no render-blocking <link>, automatic preloading,
// and font-display: swap with size-adjust to prevent layout shift. Each font is
// exposed as a CSS variable the design system reads (see globals.css / Tailwind).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

// Brand-level default metadata. Per-page metadata (Phase 12) overrides title +
// description via the App Router `metadata` export on each route.
export const metadata: Metadata = {
  metadataBase: new URL("https://theannotatedcareer.com"),
  title: {
    default: "The Annotated Career — you've done more than you think",
    template: "%s · The Annotated Career",
  },
  description:
    "You have more experience than you realize. We annotate your real experiences, reveal the skills inside them, and help turn them into stronger resumes, cover letters, and next steps.",
  openGraph: {
    type: "website",
    siteName: "The Annotated Career",
    title: "The Annotated Career — you've done more than you think",
    description:
      "We annotate your real experiences, reveal the skills inside them, and help turn them into stronger career materials.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F7F8FA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable} ${dmMono.variable}`}
    >
      <body className="paper-bg min-h-screen antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
