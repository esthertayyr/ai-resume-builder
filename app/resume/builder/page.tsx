import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "Resume Builder — an editorial document editor",
  description:
    "Build a clean, ATS-friendly resume with a live preview. Edit every section, pick a template, and export to Word (.docx) or PDF.",
  alternates: { canonical: "/resume/builder" },
};

export default function ResumeBuilderPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header" className="pb-0">
        <Eyebrow number="06">Resume Builder</Eyebrow>
        <Heading level={1} size="md" className="mt-3 max-w-content">
          A document editor, not a form to fill in.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          Everything you type appears in the live preview exactly as it will export. Reorder sections,
          switch templates, and download a Word file or print to PDF when you&rsquo;re ready.
        </p>
      </Section>
      <ResumeBuilder />
    </PageShell>
  );
}
