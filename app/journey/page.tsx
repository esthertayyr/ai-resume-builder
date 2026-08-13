import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { CareerJourneyExperience } from "@/components/journey/CareerJourneyExperience";

export const metadata: Metadata = {
  title: "Career Journey — reveal your potential",
  description:
    "Tell us what you've done and we'll reveal the skills inside it, build your story, and help you create a resume and plan your next move.",
  alternates: { canonical: "/journey" },
};

export default function JourneyPage() {
  return (
    <PageShell>
      <CareerJourneyExperience />
    </PageShell>
  );
}
