import { describe, it, expect } from "vitest";
import { attachAchievement, canRecordAchievements } from "@/lib/interview/achievements";
import { createEmptyProfile } from "@/lib/profile/factory";
import { userFact, aiConfirmedFact, isFact } from "@/lib/profile/facts";
import { validateProfileSources } from "@/lib/profile/integrity";
import type { ExperienceEntry, MasterProfile, ProjectEntry } from "@/lib/profile/types";

const NOW = "2026-01-01T00:00:00.000Z";

function withExperience(p: MasterProfile): MasterProfile {
  const entry: ExperienceEntry = {
    id: "e1",
    company: userFact("A cafe", NOW),
    title: userFact("Cafe crew", NOW),
    responsibilities: [userFact("Served customers", NOW)],
    achievements: [],
  };
  return { ...p, experience: [entry] };
}

function withProject(p: MasterProfile): MasterProfile {
  const project: ProjectEntry = {
    id: "p1",
    name: userFact("Community garden", NOW),
    highlights: [],
  };
  return { ...p, projects: [project] };
}

describe("Achievement Discovery — attach & integrity", () => {
  it("has nowhere to record on an empty profile", () => {
    expect(canRecordAchievements(createEmptyProfile("t", NOW))).toBe(false);
  });

  it("attaches to the most recent experience when one exists", () => {
    const profile = withExperience(createEmptyProfile("t", NOW));
    const fact = aiConfirmedFact("Trained two new hires on the till", "Trained two new hires on the till", NOW);
    const next = attachAchievement(profile, fact, NOW);

    expect(next.experience[0].achievements).toHaveLength(1);
    expect(next.experience[0].achievements[0].value).toBe("Trained two new hires on the till");
    // Pure — original profile untouched.
    expect(profile.experience[0].achievements).toHaveLength(0);
  });

  it("falls back to the most recent project highlight when there is no experience", () => {
    const profile = withProject(createEmptyProfile("t", NOW));
    expect(canRecordAchievements(profile)).toBe(true);
    const fact = aiConfirmedFact("Coordinated a dozen volunteers", "Coordinated a dozen volunteers", NOW);
    const next = attachAchievement(profile, fact, NOW);

    expect(next.projects[0].highlights).toHaveLength(1);
    expect(next.projects[0].highlights[0].value).toBe("Coordinated a dozen volunteers");
    expect(isFact(next.projects[0].highlights[0])).toBe(true);
  });

  it("prefers experience over project when both exist", () => {
    const profile = withProject(withExperience(createEmptyProfile("t", NOW)));
    const fact = aiConfirmedFact("Kept the queue moving during a rush", "Kept the queue moving during a rush", NOW);
    const next = attachAchievement(profile, fact, NOW);

    expect(next.experience[0].achievements).toHaveLength(1);
    expect(next.projects[0].highlights).toHaveLength(0);
  });

  it("keeps the profile passing source integrity", () => {
    const profile = withExperience(createEmptyProfile("t", NOW));
    const fact = aiConfirmedFact("Handled a busy holiday period", "Handled a busy holiday period", NOW);
    const next = attachAchievement(profile, fact, NOW);
    expect(validateProfileSources(next)).toHaveLength(0);
  });
});
