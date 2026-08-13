import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { ARTICLES, CATEGORIES } from "@/lib/resources/content";

// Sitemap generated from the real route map — static pages, resource categories
// and every article. No lastModified is invented; we only include it where a
// genuine article date exists.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/journey",
    "/start",
    "/resume/builder",
    "/resume/ats",
    "/cover-letter",
    "/interview/prep",
    "/internship",
    "/resources",
    "/about",
    "/support",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly",
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/resources/${c.slug}`,
    changeFrequency: "monthly",
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/resources/${a.category}/${a.slug}`,
    changeFrequency: "yearly",
    ...(a.updatedAt ? { lastModified: a.updatedAt } : {}),
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
