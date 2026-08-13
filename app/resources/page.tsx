import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Card, Eyebrow, Heading, Section } from "@/components/ds";
import { ARTICLES, CATEGORIES, articlesInCategory, readingMinutes } from "@/lib/resources/content";

export const metadata: Metadata = {
  title: "Resources — honest, practical career guides",
  description:
    "Practical guides on resumes, ATS, interviews, job search, internships, remote work and more. Clear, honest advice with no fluff.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header">
        <Eyebrow number="10">Resources</Eyebrow>
        <Heading level={1} size="lg" className="mt-3 max-w-content">
          Practical guides, written plainly.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          Everything here is meant to be useful and honest — no inflated promises, no filler. Browse by
          topic, or start with a guide below.
        </p>
      </Section>

      <Section tone="surface">
        <Eyebrow>Browse by topic</Eyebrow>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const count = articlesInCategory(c.slug).length;
            return (
              <li key={c.slug}>
                <Card href={`/resources/${c.slug}`} tone="paper">
                  <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
                  <p className="mt-1 text-sm text-muted">{c.blurb}</p>
                  <p className="label-mono mt-3 text-muted">
                    {count} {count === 1 ? "guide" : "guides"}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="paper">
        <Eyebrow>All guides</Eyebrow>
        <ul className="mt-6 divide-y divide-hair">
          {ARTICLES.map((a) => (
            <li key={a.slug} className="py-5">
              <Link href={`/resources/${a.category}/${a.slug}`} className="group block">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-red">
                  {a.title}
                </h2>
                <p className="mt-1 max-w-prose text-muted">{a.description}</p>
                <p className="label-mono mt-2 text-muted">
                  {a.author} · {readingMinutes(a)} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  );
}
