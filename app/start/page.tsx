"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadProfile, nowIso, saveProfile } from "@/lib/session/store";
import type { ExperiencePath } from "@/lib/profile/types";

interface PathChoice {
  id: ExperiencePath;
  icon: string;
  code: string;
  title: string;
  description: string;
  button: string;
  /** Per-card accent — subtle personality, not a rainbow. */
  ring: string;
  glow: string;
  tab: string;
}

// Labels describe amount of GUIDANCE, not ability (never beginner/expert).
const CHOICES: PathChoice[] = [
  {
    id: "just_starting",
    icon: "🌱",
    code: "Path / 01",
    title: "STARTING OUT",
    description: "I've never made a resume.",
    button: "Guide me",
    ring: "hover:border-mint/60 focus-visible:ring-mint",
    glow: "bg-mint/10 text-mint",
    tab: "bg-mint",
  },
  {
    id: "some_experience",
    icon: "🌿",
    code: "Path / 02",
    title: "SOME EXPERIENCE",
    description: "I've worked, studied, volunteered or built things.",
    button: "Help me build it",
    ring: "hover:border-sky/60 focus-visible:ring-sky",
    glow: "bg-sky/10 text-sky",
    tab: "bg-sky",
  },
  {
    id: "experienced",
    icon: "⚡",
    code: "Path / 03",
    title: "I KNOW MY STUFF",
    description: "I want to move quickly.",
    button: "Let's go",
    ring: "hover:border-accent/60 focus-visible:ring-accent",
    glow: "bg-accent/10 text-accent",
    tab: "bg-accent",
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
              className={`animate-fade-up group relative flex flex-col overflow-hidden rounded-3xl border bg-white p-7 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 ${c.ring} ${
                highlight ? "border-accent/50 ring-2 ring-accent/30" : "border-hair"
              }`}
            >
              {/* Colour tab — the card's personality */}
              <span className={`absolute inset-x-0 top-0 h-1.5 ${c.tab}`} aria-hidden />
              <span className="label-mono text-muted">{c.code}</span>
              <span className={`mt-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${c.glow}`}>
                {c.icon}
              </span>
              <span className="mt-5 font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">
                {c.title}
              </span>
              <span className="mt-2 flex-1 text-muted">{c.description}</span>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">
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
