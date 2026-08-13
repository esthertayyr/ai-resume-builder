import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { ArticleBody } from "@/components/resources/ArticleBody";
import { ARTICLES, getArticle, getCategory, readingMinutes } from "@/lib/resources/content";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ category: a.category, slug: a.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Metadata {
  const article = getArticle(params.slug);
  if (!article) return { title: "Resource" };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/resources/${article.category}/${article.slug}` },
    openGraph: { title: article.title, description: article.description, type: "article" },
  };
}

export default function ArticlePage({ params }: { params: { category: string; slug: string } }) {
  const article = getArticle(params.slug);
  // Guard against a slug that exists under the wrong category path.
  if (!article || article.category !== params.category) notFound();
  const cat = getCategory(article.category);

  // Structured data — Article. Only include dates if they genuinely exist.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: "The Annotated Career" },
  };
  if (article.publishedAt) jsonLd.datePublished = article.publishedAt;
  if (article.updatedAt) jsonLd.dateModified = article.updatedAt;

  return (
    <PageShell>
      <Section tone="paper" as="article">
        <nav aria-label="Breadcrumb" className="label-mono text-muted">
          <Link href="/resources" className="hover:text-red">
            Resources
          </Link>{" "}
          /{" "}
          <Link href={`/resources/${article.category}`} className="hover:text-red">
            {cat?.name}
          </Link>
        </nav>

        <Heading level={1} size="md" className="mt-3 max-w-content">
          {article.title}
        </Heading>
        <p className="mt-4 max-w-prose text-lg text-muted">{article.description}</p>
        <p className="label-mono mt-3 text-muted">
          {article.author} · {readingMinutes(article)} min read
          {article.updatedAt ? ` · Updated ${article.updatedAt}` : ""}
        </p>

        <hr className="my-8 border-hair" />

        <ArticleBody blocks={article.body} />

        {article.related.length > 0 && (
          <div className="mt-12 rounded-card border border-hair bg-surface p-6">
            <Eyebrow>Related</Eyebrow>
            <ul className="mt-3 space-y-2">
              {article.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-ink underline decoration-red/40 hover:decoration-red">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </PageShell>
  );
}
