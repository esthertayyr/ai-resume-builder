import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { CoverLetterBuilder } from "@/components/cover-letter/CoverLetterBuilder";

export const metadata: Metadata = {
  title: "Cover Letter Builder — focused, not generic",
  description:
    "Build a structured cover letter draft for a specific role from your own strengths and reasons. Edit every line — it's a starting point, not a finished letter.",
  alternates: { canonical: "/cover-letter" },
};

export default function CoverLetterPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header" className="pb-0">
        <Eyebrow number="08">Cover Letter</Eyebrow>
        <Heading level={1} size="md" className="mt-3 max-w-content">
          A letter for this role — not every role.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          Tell us the role, a little about why it interests you, and a few real strengths. We&rsquo;ll
          assemble a structured draft you can edit into something that sounds like you.
        </p>
      </Section>
      <CoverLetterBuilder />
    </PageShell>
  );
}
