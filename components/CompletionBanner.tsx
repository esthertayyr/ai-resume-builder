"use client";

import type { MasterProfile } from "@/lib/profile/types";

// "LOOK WHAT YOU BUILT" — the completion moment (spec §16 / gamification). Cinematic
// type is reserved for major moments like this one. It celebrates the truthful things
// the user actually assembled; it never inflates the numbers.
export function CompletionBanner({ profile }: { profile: MasterProfile }) {
  const experience = profile.experience.length;
  const responsibilities = profile.experience.reduce((n, e) => n + e.responsibilities.length, 0);
  const achievements = profile.experience.reduce((n, e) => n + e.achievements.length, 0);
  const projectHighlights = profile.projects.reduce((n, p) => n + p.highlights.length, 0);
  const skills = profile.skills.length;
  const projects = profile.projects.length;

  const stats = [
    { n: experience + projects, label: experience + projects === 1 ? "experience" : "experiences" },
    { n: responsibilities, label: responsibilities === 1 ? "responsibility" : "responsibilities" },
    { n: achievements + projectHighlights, label: "achievements", hideIfZero: true },
    { n: skills, label: skills === 1 ? "skill" : "skills" },
  ].filter((s) => !(s.hideIfZero && s.n === 0));

  return (
    <div className="no-print overflow-hidden rounded-2xl border border-hair bg-gradient-to-br from-accent/10 via-white to-mint/10 p-5">
      <p className="label-mono text-accent">Look what you built / ✦</p>
      <p className="mt-1 font-display text-xl font-bold text-navy animate-fade-up">
        This is your resume — from what you&apos;ve actually done.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {stats.map((s) => (
          <div key={s.label}>
            <span className="font-display text-2xl font-bold text-navy">{s.n}</span>{" "}
            <span className="text-sm text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
