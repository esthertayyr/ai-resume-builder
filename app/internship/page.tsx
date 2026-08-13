import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Reveal, Section } from "@/components/ds";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export const metadata: Metadata = {
  title: "Internship & First Resume — you have more to show than you think",
  description:
    "Less formal work experience doesn't mean you have nothing to show. Turn school projects, clubs, volunteering and part-time work into a strong internship resume.",
  alternates: { canonical: "/internship" },
};

// The twelve places real, resume-worthy experience hides for students and
// first-time applicants. Each is paired with the kind of skill it can evidence —
// never invented for the user, just prompts to help them recognise their own.
const SOURCES: { label: string; shows: string }[] = [
  { label: "School & course projects", shows: "planning, research, seeing something through" },
  { label: "Clubs & societies", shows: "commitment, working with others" },
  { label: "Leadership roles", shows: "responsibility, organising people" },
  { label: "Volunteering", shows: "reliability, care, initiative" },
  { label: "Competitions", shows: "drive, performing under pressure" },
  { label: "Part-time jobs", shows: "customer service, time management" },
  { label: "Family responsibilities", shows: "dependability, budgeting, care" },
  { label: "Freelance & side work", shows: "self-direction, client communication" },
  { label: "Technical projects", shows: "problem-solving, specific tools" },
  { label: "Events you helped run", shows: "coordination, logistics" },
  { label: "Presentations", shows: "communication, confidence" },
  { label: "Research", shows: "analysis, attention to detail" },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "I don't have work experience. What do I put on a resume?",
    a: "More than you'd expect. Education, projects, clubs, volunteering, leadership and part-time work all show real skills. This page helps you find them and turn them into clear resume lines.",
  },
  {
    q: "How do I describe a school project or club?",
    a: "Treat it like any role: what you did, how, and what came of it. 'Led a five-person group project and presented our findings to the class' is a genuine, resume-worthy line.",
  },
  {
    q: "Do part-time jobs and family responsibilities really count?",
    a: "Yes. A part-time job shows reliability and customer skills. Caring for family or managing a household budget shows dependability and organisation. What matters is describing it honestly and clearly.",
  },
  {
    q: "How long should a student resume be?",
    a: "One page is plenty at this stage. Focus on your strongest, most relevant examples rather than trying to fill space.",
  },
];

export default function InternshipPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header">
        <Eyebrow number="09">Students & First Resumes</Eyebrow>
        <Heading level={1} size="lg" className="mt-3 max-w-content">
          You may have less formal experience. That doesn&rsquo;t mean you have nothing to show.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          This is the same platform, not a lesser version of it. Employers hiring for internships and
          first roles expect you to be early in your career — what they want to see is potential,
          described clearly. Let&rsquo;s find yours.
        </p>
      </Section>

      {/* Experience-source discovery */}
      <Section tone="surface">
        <Eyebrow>Where your experience hides</Eyebrow>
        <Heading level={2} size="sm" className="mt-2">
          Look here first.
        </Heading>
        <p className="mt-3 max-w-prose text-muted">
          Real experience rarely arrives labelled &ldquo;work experience.&rdquo; Each of these can
          evidence a skill an employer cares about.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 40}>
              <div className="h-full rounded-card border border-hair bg-paper p-5">
                <p className="font-display text-lg font-semibold text-ink">{s.label}</p>
                <p className="mt-1 text-sm text-muted">
                  <span className="text-red">Shows:</span> {s.shows}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Educational content */}
      <Section tone="paper">
        <Eyebrow>Common questions</Eyebrow>
        <Heading level={2} size="sm" className="mt-2">
          If you&rsquo;re starting from scratch.
        </Heading>
        <dl className="mt-8 max-w-prose space-y-6">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-display text-lg font-semibold text-ink">{f.q}</dt>
              <dd className="mt-1 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Internship Resume Builder */}
      <Section tone="surface" className="pb-0">
        <Eyebrow>Internship Resume Builder</Eyebrow>
        <Heading level={2} size="sm" className="mt-2">
          Build it, section by section.
        </Heading>
        <p className="mt-3 max-w-prose text-muted">
          This starts you with the sections that suit a first resume — Education, Projects, Leadership &amp;
          Activities, Skills, Volunteering and Achievements. Add, remove or reorder anything.
        </p>
      </Section>
      <ResumeBuilder variant="internship" />
    </PageShell>
  );
}
