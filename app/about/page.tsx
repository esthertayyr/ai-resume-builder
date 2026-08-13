import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Button, Eyebrow, Heading, Section } from "@/components/ds";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "The Annotated Career reveals the experience and skills you already have, and helps turn them into stronger career materials and next steps.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header">
        <Eyebrow>About</Eyebrow>
        <Heading level={1} size="lg" className="mt-3 max-w-content">
          We don&rsquo;t just build resumes. We reveal potential.
        </Heading>
        <p className="mt-4 max-w-prose text-lg text-muted">
          Most people have done far more than their resume shows. The problem is rarely a lack of
          experience — it&rsquo;s not recognising the experience you already have.
        </p>
      </Section>

      <Section tone="surface">
        <div className="max-w-prose space-y-5 text-ink">
          <p>
            The Annotated Career starts from what you&rsquo;ve actually done — jobs, yes, but also
            projects, volunteering, study, and the responsibilities of everyday life. We help you
            annotate those experiences, reveal the skills inside them, and turn them into clear,
            honest career materials.
          </p>
          <h2 className="font-display text-2xl font-semibold">What we believe</h2>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="mt-1 text-red" aria-hidden>•</span>
              <span>Experience is a situation where you did something that mattered — not just a job title.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-red" aria-hidden>•</span>
              <span>Honesty beats inflation. We never invent facts, metrics or achievements on your behalf.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-red" aria-hidden>•</span>
              <span>Good tools should be clear, calm and free of pressure.</span>
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Button href="/journey" size="lg">
            Start your Career Journey
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted">
          Prefer to explore first?{" "}
          <Link href="/resources" className="underline decoration-red/40 hover:decoration-red">
            Browse the resources
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
