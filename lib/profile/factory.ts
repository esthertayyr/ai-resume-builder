import type { MasterProfile, MilestoneId, ProgressState } from "./types";

export const MILESTONE_ORDER: MilestoneId[] = [
  "basic_profile",
  "experience_discovered",
  "skills_confirmed",
  "career_story",
  "resume_ready",
];

export const MILESTONE_LABELS: Record<MilestoneId, string> = {
  basic_profile: "About You",
  experience_discovered: "Experience",
  skills_confirmed: "Skills",
  career_story: "Career Story",
  resume_ready: "Resume Ready",
};

/** Encouraging microcopy shown when a milestone completes (Prompt 9). */
export const MILESTONE_DONE_MESSAGE: Record<MilestoneId, string> = {
  basic_profile: "Nice. The basics are in place.",
  experience_discovered: "Nice. Your experience section is taking shape.",
  skills_confirmed: "Great — we've confirmed your strengths.",
  career_story: "Your career story is complete.",
  resume_ready: "Your career profile is ready.",
};

function emptyProgress(): ProgressState {
  const milestones = Object.fromEntries(
    MILESTONE_ORDER.map((id) => [id, { status: "not_started" as const }]),
  ) as ProgressState["milestones"];
  return { milestones };
}

/** `now` is injected (never Date.now() in shared/testable code) so tests are deterministic. */
export function createEmptyProfile(id: string, now: string): MasterProfile {
  return {
    id,
    personal: { links: [] },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    tools: [],
    certifications: [],
    languages: [],
    progress: emptyProgress(),
    createdAt: now,
    updatedAt: now,
  };
}

/** 0..100 completion, derived — never stored. */
export function completionPercent(p: MasterProfile): number {
  const done = MILESTONE_ORDER.filter(
    (id) => p.progress.milestones[id].status === "complete",
  ).length;
  return Math.round((done / MILESTONE_ORDER.length) * 100);
}
