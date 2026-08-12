"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InterviewRunner } from "@/components/interview/InterviewRunner";
import { MilestoneRail } from "@/components/progress/MilestoneRail";
import { basicsScript } from "@/lib/interview/scripts/basics";
import { beginnerScript } from "@/lib/interview/scripts/beginner";
import { loadProfile, nowIso, saveProfile } from "@/lib/session/store";
import { createEmptyProfile } from "@/lib/profile/factory";
import type { MasterProfile } from "@/lib/profile/types";

const SEQUENCE = [basicsScript, beginnerScript] as const;

export default function InterviewPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState<MasterProfile | null>(null);

  useEffect(() => {
    setProfile(loadProfile() ?? createEmptyProfile("anonymous", nowIso()));
  }, []);

  function handleComplete() {
    const script = SEQUENCE[index];
    const next = loadProfile();
    next.progress.milestones[script.milestone].status = "complete";
    if (index === 0) next.progress.milestones.experience_discovered.status = "in_progress";
    saveProfile(next);
    setProfile(next);

    if (index + 1 < SEQUENCE.length) setIndex((i) => i + 1);
    // Next: Responsibility Discovery ("That counts."). Skippable for those with no job.
    else router.push("/discover");
  }

  const script = SEQUENCE[index];

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[1fr_240px]">
      <section className="order-2 md:order-1">
        {/* Friendly "level" framing — discovery, not a form */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {index === 0 ? "Level 1" : "Level 2"}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-navy">
            {index === 0 ? "First, a little about you" : "Let's discover your experience"}
          </p>
          <p className="mt-1 text-sm text-muted">
            Don&apos;t worry about resume wording yet. Just tell us what you&apos;ve done.
          </p>
        </div>

        <div className="rounded-3xl border border-hair bg-white p-6 shadow-soft sm:p-8">
          <InterviewRunner key={script.id} script={script} onComplete={handleComplete} />
        </div>
      </section>

      <aside className="order-1 md:order-2">
        <div className="rounded-3xl border border-hair bg-white p-5 shadow-soft">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Your Career Journey</p>
          {profile ? <MilestoneRail progress={profile.progress} /> : null}
        </div>
        <p className="mt-4 px-1 text-xs text-muted">Progress saves automatically. You can close this tab and come back.</p>
      </aside>
    </main>
  );
}
