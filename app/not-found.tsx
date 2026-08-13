import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { Button, Eyebrow, Heading, Section } from "@/components/ds";

// Custom 404 — keeps people inside the site with useful next steps rather than
// a dead end.
export default function NotFound() {
  return (
    <PageShell>
      <Section tone="paper" as="header" className="min-h-[60vh]">
        <Eyebrow number="404">Page not found</Eyebrow>
        <Heading level={1} size="lg" className="mt-3 max-w-content">
          That page took a different path.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          The page you were looking for isn&rsquo;t here. It may have moved, or the link may be
          incomplete. Here&rsquo;s where most people go next:
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/" size="lg">
            Back to home
          </Button>
          <Button href="/journey" size="lg" variant="secondary">
            Start your Career Journey
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Or browse the{" "}
          <Link href="/resources" className="underline decoration-red/40 hover:decoration-red">
            resources
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
