import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { InterviewPrep } from "@/components/interview/InterviewPrep";

export const metadata: Metadata = {
  title: "Interview Preparation — practise the real questions",
  description:
    "Practise the questions employers actually ask, with STAR guidance for behavioural questions and an honest self-check. Your answers save in your browser.",
  alternates: { canonical: "/interview/prep" },
};

export default function InterviewPrepPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header" className="pb-0">
        <Eyebrow number="08">Interview Preparation</Eyebrow>
        <Heading level={1} size="md" className="mt-3 max-w-content">
          Practise the questions employers actually ask.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          Work through common questions at your own pace. Behavioural questions come with a STAR
          scaffold, and every answer gets a self-check you apply yourself — because no tool can honestly
          score an interview.
        </p>
      </Section>
      <InterviewPrep />
    </PageShell>
  );
}
