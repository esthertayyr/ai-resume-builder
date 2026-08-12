"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResponsibilityDiscovery, type DiscoveryResult } from "@/components/discover/ResponsibilityDiscovery";
import { addExperienceToProfile, buildExperienceFromCards } from "@/lib/interview/responsibility";
import { loadProfile, nowIso, saveProfile } from "@/lib/session/store";

// Responsibility Discovery step: name a job -> "That counts." -> confirm what you
// actually did -> only confirmed items become resume experience. Skippable for people
// with no job to add (their projects/activities were captured in the interview).
export default function DiscoverPage() {
  const router = useRouter();

  function handleComplete({ jobTitle, where, cards }: DiscoveryResult) {
    const now = nowIso();
    const entry = buildExperienceFromCards(jobTitle, where, cards, now);
    // Guard: if nothing was actually confirmed, don't write an empty entry.
    if (entry.responsibilities.length === 0) {
      router.push("/preview");
      return;
    }
    saveProfile(addExperienceToProfile(loadProfile(), entry, now));
    router.push("/preview");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Link href="/interview" className="mb-8 text-sm text-muted hover:text-navy">
        ← Back to the coach
      </Link>
      <ResponsibilityDiscovery onComplete={handleComplete} onSkip={() => router.push("/preview")} />
    </main>
  );
}
