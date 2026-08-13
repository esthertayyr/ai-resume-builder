import { Button, Card, CareerThread, Eyebrow, Heading, Reveal, Section } from "@/components/ds";
import { Underline } from "@/components/ds/Annotation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SupportCTA } from "@/components/site/SupportCTA";
import { BackToTop } from "@/components/site/BackToTop";
import { EditorialImage } from "@/components/media/EditorialImage";
import { HandDrawnIcon } from "@/components/media/HandDrawnIcon";
import { TOOLS } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";

// ============================================================================
// HOMEPAGE — The Annotated Career
// A visual story, not a SaaS landing page:
// PROBLEM → LOOK CLOSER → DISCOVER → REVEAL SKILLS → BUILD → RESUME → PREPARE → NEXT MOVE
// Repeated sections are data-driven; layout uses the DS primitives. Images are
// production-ready placeholders at the exact intended aspect ratios.
// ============================================================================

const EXPERIENCES = [
  "Part-time work",
  "School projects",
  "Volunteering",
  "Freelance work",
  "Family responsibilities",
  "Side projects",
  "Community work",
];

const SKILLS_FROM_JOB = ["Customer Service", "Communication", "Time Management", "Problem Solving"];

const STEPS = [
  { n: "01", title: "Tell us what you've done", copy: "Jobs, projects, volunteering, life — in your own words." },
  { n: "02", title: "Discover your skills", copy: "We reveal the real skills hidden inside those experiences." },
  { n: "03", title: "Build your story", copy: "Turn experiences into clear, structured career stories." },
  { n: "04", title: "Create your resume", copy: "A professional resume, built from what's actually yours." },
  { n: "05", title: "Prepare for opportunities", copy: "Practise interviews and applications with confidence." },
  { n: "06", title: "Make your next move", copy: "Clear, recommended next steps toward your goal." },
];

const SITUATIONS = [
  "Starting out",
  "Changing careers",
  "Returning to work",
  "Applying for internships",
  "Looking for remote work",
  "Ready for your next move",
];

const RESOURCES = [
  { title: "Interview Preparation", href: "/interview" },
  { title: "ATS Resume Guide", href: "/resume/ats" },
  { title: "First Resume Guide", href: "/resume/first-resume" },
  { title: "Internship Resume Guide", href: "/resume/internship" },
  { title: "Job Search Guide", href: "/job-search" },
  { title: "Application Email Guide", href: "/job-search/application-email" },
  { title: "Salary / Hourly Rate Guide", href: "/job-search/salary" },
  { title: "Remote Work / VA Guide", href: "/remote-work" },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 01 — HERO ---------------------------------------------------------- */}
        <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-16">
          {/* Cinematic editorial visual (placeholder at final ratios). */}
          <div className="absolute inset-0 -z-10">
            <div className="hidden h-full md:block">
              <EditorialImage
                ratio="16:9"
                alt="A person at a bright desk, writing and reviewing notes — warm and hopeful."
                priority
                sizes="100vw"
                className="h-full rounded-none border-0"
                imageClassName=""
              />
            </div>
            <div className="h-full md:hidden">
              <EditorialImage
                ratio="4:5"
                alt="A person at a bright desk, writing and reviewing notes — warm and hopeful."
                priority
                sizes="100vw"
                className="h-full rounded-none border-0"
              />
            </div>
            {/* Legibility scrim for overlaid type (works over the final photo). */}
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-paper/20" aria-hidden />
          </div>

          <div className="mx-auto w-full max-w-content px-5 py-20 md:px-8">
            <div className="max-w-3xl">
              <Eyebrow number="01">Real people. Real experiences.</Eyebrow>
              <h1 className="mt-5 font-display text-display-xl font-semibold text-ink">
                You've done{" "}
                <span className="whitespace-nowrap">more than you</span>{" "}
                <Underline>
                  <span className="text-red">think.</span>
                </Underline>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink/75">
                Real people. Real experiences. A clearer story. We annotate what you've already done
                and reveal the skills inside it.
              </p>
              <div className="mt-8">
                <Button href="/start" size="lg">
                  Build Your Next Move →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — THE PROBLEM --------------------------------------------------- */}
        <Section tone="paper">
          <div className="max-w-3xl">
            <Eyebrow number="02">The problem</Eyebrow>
            <Heading level={2} size="lg" className="mt-4">
              Your experience may be worth more than your resume says.
            </Heading>
            <p className="mt-5 max-w-prose text-lg text-muted">
              People underestimate ordinary experiences all the time. A part-time job, a school
              project, caring for family, helping a friend's business — these build real, nameable
              skills. Most resumes leave them out.
            </p>
          </div>

          {/* Career Thread connecting the everyday experiences. */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {EXPERIENCES.map((exp, i) => (
              <span key={exp} className="flex items-center gap-3">
                <span className="rounded-pill border border-hair bg-surface px-4 py-2 text-sm font-medium text-ink">
                  {exp}
                </span>
                {i < EXPERIENCES.length - 1 && (
                  <span className="hidden h-px w-6 bg-red/40 sm:inline-block" aria-hidden />
                )}
              </span>
            ))}
          </div>
          <p className="hand mt-6 text-2xl text-red">…this all counts.</p>
        </Section>

        {/* 03 — THAT COUNTS --------------------------------------------------- */}
        <Section tone="warm">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative">
              <EditorialImage
                ratio="1:1"
                alt="A hand writing in a notebook with a pen, seen close up."
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <Eyebrow number="03">That counts</Eyebrow>
              <Heading level={2} size="md" className="mt-4">
                One ordinary experience hides a stack of real skills.
              </Heading>
              <div className="mt-8 rounded-card border border-hair bg-surface p-6">
                <p className="label-mono text-muted">Part-time job</p>
                <ul className="mt-4 space-y-3">
                  {SKILLS_FROM_JOB.map((skill) => (
                    <li key={skill} className="flex items-center gap-3">
                      <span className="hand text-2xl leading-none text-red" aria-hidden>
                        →
                      </span>
                      <span className="text-lg font-medium text-ink">{skill}</span>
                    </li>
                  ))}
                </ul>
                <p className="hand mt-5 text-xl text-red">see? you already have these.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 04 — HOW IT WORKS -------------------------------------------------- */}
        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow number="04">How it works</Eyebrow>
            <Heading level={2} size="md" className="mt-4">
              Six steps, in your own words.
            </Heading>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={(i % 3) * 80} className="rounded-card border border-hair bg-surface p-6">
                <div className="flex items-center justify-between">
                  <HandDrawnIcon alt={step.title} size={48} />
                  <span className="label-mono text-red">{step.n}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.copy}</p>
              </Reveal>
            ))}
          </div>
          {/* Career Thread continuing the story toward the next section. */}
          <CareerThread length={96} className="mt-12" />
        </Section>

        {/* 05 — WHO IT IS FOR ------------------------------------------------- */}
        <Section tone="warm">
          <div className="max-w-2xl">
            <Eyebrow number="05">Who it's for</Eyebrow>
            <Heading level={2} size="md" className="mt-4">
              Wherever you are right now.
            </Heading>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <div
                key={s}
                className="flex items-center gap-4 rounded-card border border-hair bg-surface p-5"
              >
                <HandDrawnIcon alt={s} size={40} />
                <span className="text-lg font-medium text-ink">{s}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 06 — RESUME TRANSFORMATION ---------------------------------------- */}
        <Section tone="paper">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow number="06">The transformation</Eyebrow>
              <Heading level={2} size="md" className="mt-4">
                From plain lines to a resume that reads like you.
              </Heading>
              <ol className="mt-8 space-y-5">
                <li className="flex gap-4">
                  <span className="label-mono w-24 shrink-0 pt-1 text-muted">Before</span>
                  <p className="text-ink/80">A short, undersold list that hides what you actually did.</p>
                </li>
                <li className="flex gap-4">
                  <span className="label-mono w-24 shrink-0 pt-1 text-red">Annotated</span>
                  <p className="text-ink/80">
                    We mark the skills, achievements and impact living inside each line.
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="label-mono w-24 shrink-0 pt-1 text-ink">Stronger</span>
                  <p className="text-ink/80">
                    A clear, professional, ATS-friendly resume — still completely truthful.
                  </p>
                </li>
              </ol>
              <div className="mt-8">
                <Button href="/start" variant="secondary">
                  Start with your experience →
                </Button>
              </div>
            </div>
            <EditorialImage
              ratio="4:3"
              alt="A printed resume on a desk, with sections marked up by hand in red."
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Section>

        {/* 07 — TOOLS --------------------------------------------------------- */}
        <Section tone="warm">
          <div className="max-w-2xl">
            <Eyebrow number="07">The tools</Eyebrow>
            <Heading level={2} size="md" className="mt-4">
              Everything you need for your next move.
            </Heading>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) =>
              tool.available ? (
                <Card key={tool.id} href={tool.href} className="flex flex-col">
                  <h3 className="font-display text-xl font-semibold text-ink">{tool.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{tool.description}</p>
                  <span className="mt-4 text-sm font-semibold text-red group-hover:underline">
                    Open →
                  </span>
                </Card>
              ) : (
                <div
                  key={tool.id}
                  className="flex flex-col rounded-card border border-hair bg-surface/60 p-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-ink/70">{tool.name}</h3>
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted">{tool.description}</p>
                  <span className="label-mono mt-4 text-muted">Coming soon</span>
                </div>
              ),
            )}
          </div>
        </Section>

        {/* 08 — RESOURCES ----------------------------------------------------- */}
        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow number="08">Resources</Eyebrow>
            <Heading level={2} size="md" className="mt-4">
              Plain-language guides, when you want to go deeper.
            </Heading>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map((r) => (
              <Card key={r.title} href={r.href}>
                <h3 className="font-display text-lg font-semibold leading-snug text-ink">{r.title}</h3>
                <span className="mt-3 inline-block text-sm font-semibold text-red group-hover:underline">
                  Read →
                </span>
              </Card>
            ))}
          </div>
        </Section>

        {/* 09 — NEXT MOVE ----------------------------------------------------- */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <EditorialImage
              ratio="16:9"
              alt="An open road at golden hour — a hopeful next step."
              sizes="100vw"
              className="h-full rounded-none border-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/80 to-paper/50" aria-hidden />
          </div>
          <div className="mx-auto max-w-content px-5 py-section md:px-8">
            <div className="flex flex-col items-center gap-2">
              <CareerThread length={72} />
            </div>
            <div className="mx-auto max-w-2xl text-center">
              <Heading level={2} size="lg">
                Your next move starts with your story.
              </Heading>
              <div className="mt-8">
                <Button href="/start" size="lg">
                  Build Your Next Move →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 10 — SUPPORT ------------------------------------------------------- */}
        <Section tone="warm">
          <SupportCTA />
        </Section>
      </main>

      {/* 11 — FOOTER --------------------------------------------------------- */}
      <SiteFooter />
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
