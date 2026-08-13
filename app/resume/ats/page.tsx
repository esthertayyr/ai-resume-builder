import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { AtsChecker } from "@/components/ats/AtsChecker";

export const metadata: Metadata = {
  title: "ATS Resume Checker — readability & relevance",
  description:
    "Check your resume for common ATS readability and relevance issues: headings, contact details, formatting risks, clarity and keyword match. Runs in your browser.",
  alternates: { canonical: "/resume/ats" },
};

export default function AtsPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header" className="pb-0">
        <Eyebrow number="07">ATS Resume Checker</Eyebrow>
        <Heading level={1} size="md" className="mt-3 max-w-content">
          See what an applicant tracking system might trip over.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          We identify common ATS readability and relevance issues. We can&rsquo;t promise any specific
          system will accept a resume — no honest tool can — but we can help you remove the things that
          commonly get in the way.
        </p>
      </Section>

      {/* Educational content */}
      <Section tone="surface">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">What is an ATS?</h2>
            <p className="mt-2 text-muted">
              An <strong>Applicant Tracking System</strong> is software many employers use to collect,
              search and sort resumes. When you apply online, your resume often lands in an ATS before a
              person ever opens it. If the software can&rsquo;t read your resume cleanly, your experience
              can get lost — even when you&rsquo;re a strong fit.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Why it matters</h2>
            <p className="mt-2 text-muted">
              A recruiter may search the ATS for specific skills or filter by keywords. A resume with
              clear headings, plain formatting and language that matches the role is easier for both the
              software and the human to understand. This checker looks for the issues that most often get
              in the way — then leaves the writing to you.
            </p>
          </div>
        </div>
      </Section>

      <AtsChecker />
    </PageShell>
  );
}
