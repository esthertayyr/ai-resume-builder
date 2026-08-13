import type { Metadata } from "next";

// Reusable SEO helpers — a single source for the site URL, name, and per-page
// metadata assembly so titles/descriptions/canonicals stay consistent instead of
// being hand-rolled on every page.

export const SITE_URL = "https://theannotatedcareer.com";
export const SITE_NAME = "The Annotated Career";
export const SITE_TAGLINE = "You've done more than you think.";

/** Build page metadata with a canonical URL and matching Open Graph fields. */
export function pageMeta(opts: {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/resume/builder". */
  path: string;
  type?: "website" | "article";
}): Metadata {
  const { title, description, path, type = "website" } = opts;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Organisation + website structured data for the homepage. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    slogan: SITE_TAGLINE,
    description:
      "We annotate your real experiences, reveal the skills inside them, and help turn them into stronger career materials and next steps.",
  };
}
