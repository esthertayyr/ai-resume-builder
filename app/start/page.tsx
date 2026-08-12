"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadProfile, nowIso, saveProfile } from "@/lib/session/store";
import type { ExperiencePath } from "@/lib/profile/types";

interface PathChoice {
  id: ExperiencePath;
  icon: string;
  title: string;
  description: string;
  button: string;
}

// Labels describe amount of GUIDANCE, not ability (never beginner/expert).
const CHOICES: PathChoice[] = [
  {
    id: "just_starting",
    icon: "🌱",
    title: "STARTING OUT",
    description: "I've never made a resume before.",
    button: "Guide me",
  },
  {
    id: "some_experience",
    icon: "🌿",
    title: "SOME EXPERIENCE",
    description: "I've worked, studied, volunteered or done projects.",
    button: "Help me build it",
  },
  {
    id: "experienced",
    icon: "🚀",
    title: "I KNOW MY STUFF",
    description: "I already know my experience. I want to move quickly.",
    button: "Let's go",
  },
];

function StartInner() {
  const router = useRouter();
  const params = useSearchParams();
  const preferExperienced = params.get("have") === "1";
  const [chosen, setChosen] = useState<ExperiencePath | null>(null);

  function choose(path: ExperiencePath) {
    setChosen(path);
    const profile = loadProfile();
    profile.progress.path = path;
    profile.progress.milestones.basic_profile.status = "in_progress";
    profile.progress.milestones.basic_profile.lastVisitedAt = nowIso();
    saveProfile(profile);
    window.setTimeout(() => {
      router.push(path === "experienced" ? "/experienced" : "/interview");
    }, 1100);
  }

  if (chosen) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="animate-fade-up font-display text-3xl font-bold text-navy sm:text-4xl">
          Great. We&apos;ll take it from here.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="animate-fade-up text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-5xl">
          How much help do you want?
        </h1>
        <p className="mt-3 text-muted">This is about guidance — not a ranking. Every path leads to a great resume.</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {CHOICES.map((c, i) => {
          const highlight = preferExperienced && c.id === "experienced";
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              style={{ animationDelay: `${120 + i * 90}ms` }}
              className={`animate-fade-up group flex flex-col rounded-3xl border bg-white p-7 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                highlight ? "border-accent/50 ring-2 ring-accent/30" : "border-hair"
              }`}
            >
              <span className="text-4xl">{c.icon}</span>
              <span className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-accent">{c.title}</span>
              <span className="mt-2 flex-1 text-navy">{c.description}</span>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent">
                {c.button}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="animate-fade-in mt-10 text-center text-sm text-muted [animation-delay:500ms]">
        You can change this anytime.
      </p>
    </main>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartInner />
    </Suspense>
  );
}
