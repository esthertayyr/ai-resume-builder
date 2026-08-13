import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import {
  CATEGORIES,
  articlesInCategory,
  getCategory,
  readingMinutes,
  type CategorySlug,
} from "@/lib/resources/content";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const cat = getCategory(params.category);
  if (!cat) return { title: "Resources" };
  return {
    title: `${cat.name} guides`,
    description: cat.blurb,
    alternates: { canonical: `/resources/${cat.slug}` },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();
  const articles = articlesInCategory(cat.slug as CategorySlug);

  return (
    <PageShell>
      <Section tone="paper" as="header">
        <nav aria-label="Breadcrumb" className="label-mono text-muted">
          <Link href="/resources" className="hover:text-red">
            Resources
          </Link>{" "}
          / {cat.name}
        </nav>
        <Heading level={1} size="lg" className="mt-3 max-w-content">
          {cat.name}
        </Heading>
        <p className="mt-4 max-w-prose text-muted">{cat.blurb}</p>
      </Section>

      <Section tone="surface">
        {articles.length === 0 ? (
          <p className="text-muted">More guides are on the way for this topic.</p>
        ) : (
          <ul className="divide-y divide-hair">
            {articles.map((a) => (
              <li key={a.slug} className="py-5">
                <Link href={`/resources/${a.category}/${a.slug}`} className="group block">
                  <h2 className="font-display text-xl font-semibold text-ink group-hover:text-red">
                    {a.title}
                  </h2>
                  <p className="mt-1 max-w-prose text-muted">{a.description}</p>
                  <p className="label-mono mt-2 text-muted">{readingMinutes(a)} min read</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </PageShell>
  );
}
