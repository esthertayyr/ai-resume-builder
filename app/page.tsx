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
// Repeated sections are data-driven; layout uses the DS primitives. Images resolve
// from the asset manifest by id (hero, that-counts, resume, next-move, step + who
// icons), so ratio/alt/priority stay consistent and there's no layout shift.
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
  { n: "01", icon: "how-experience", title: "Tell us what you've done", copy: "Jobs, projects, volunteering, life — in your own words." },
  { n: "02", icon: "how-discover-skills", title: "Discover your skills", copy: "We reveal the real skills hidden inside those experiences." },
  { n: "03", icon: "how-skills", title: "Build your story", copy: "Turn experiences into clear, structured career stories." },
  { n: "04", icon: "how-resume", title: "Create your resume", copy: "A professional resume, built from what's actually yours." },
  { n: "05", icon: "how-interview", title: "Prepare for opportunities", copy: "Practise interviews and applications with confidence." },
  { n: "06", icon: "how-next-move", title: "Make your next move", copy: "Clear, recommended next steps toward your goal." },
];

// Every audience we speak to. Rendered as connected pills (the Career Thread
// motif used elsewhere on the page) rather than an icon-per-item grid, so the
// list isn't capped by the five approved "who" icons — no audience gets dropped
// and no icon has to be faked or duplicated.
const SITUATIONS = [
  "Starting out",
  "Changing careers",
  "Returning to work",
  "Applying for internships",
  "Looking for remote work",
  "Ready for your next move",
];

// Each href resolves to a real published guide under /resources/[category]/[slug]
// (see lib/resources/content.ts). No links to routes that don't exist.
const RESOURCES = [
  { title: "Your first resume, step by step", href: "/resources/resumes/first-resume" },
  { title: "Discover the skills you already have", href: "/resources/career-stories/discover-skills" },
  { title: "Changing careers: making your past count", href: "/resources/career-stories/career-change" },
  { title: "Interview preparation that actually helps", href: "/resources/interviews/interview-prep" },
  { title: "What actually counts as experience", href: "/resources/career-stories/what-counts-as-experience" },
  { title: "What is an ATS, and why care?", href: "/resources/ats/what-is-an-ats" },
  { title: "A job application email that gets read", href: "/resources/applications/job-application-email" },
  { title: "Finding remote work when starting out", href: "/resources/remote-work/finding-remote-work" },
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
                assetId="hero-desktop"
                priority
                sizes="100vw"
                className="h-full rounded-none border-0"
                imageClassName=""
              />
            </div>
            <div className="h-full md:hidden">
              <EditorialImage
                assetId="hero-mobile"
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
                assetId="that-counts-closeup"
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
                  <HandDrawnIcon assetId={step.icon} size={48} />
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
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {SITUATIONS.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                <span className="rounded-pill border border-hair bg-surface px-4 py-2 text-sm font-medium text-ink">
                  {s}
                </span>
                {i < SITUATIONS.length - 1 && (
                  <span className="hidden h-px w-6 bg-red/40 sm:inline-block" aria-hidden />
                )}
              </span>
            ))}
          </div>
          <p className="hand mt-6 text-2xl text-red">…wherever you are, you're welcome here.</p>
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
              assetId="resume-mockup"
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
              assetId="editorial-next-move"
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
