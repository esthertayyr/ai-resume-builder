import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { Eyebrow, Heading, Section } from "@/components/ds";
import { SupportCTA } from "@/components/site/SupportCTA";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Support the project",
  description:
    "The Annotated Career is free to use. If it helped you, you can optionally support the project with a coffee — no pressure.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <PageShell>
      <Section tone="paper" as="header">
        <Eyebrow number="11">Support</Eyebrow>
        <Heading level={1} size="md" className="mt-3 max-w-content">
          Free to use. Supported if you&rsquo;d like to.
        </Heading>
        <p className="mt-4 max-w-prose text-muted">
          There&rsquo;s no paywall and nothing to unlock. If the tools here helped you take a real step
          forward and you&rsquo;d like to give something back, you can — entirely on your terms.
        </p>
      </Section>
      <Section tone="surface">
        <SupportCTA />
      </Section>
    </PageShell>
  );
}
