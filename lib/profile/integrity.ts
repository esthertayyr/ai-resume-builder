import { isFact } from "./facts";
import type { AnyFact, MasterProfile } from "./types";

/**
 * Collects EVERY fact stored in the profile by walking the known schema.
 * If a new fact-bearing field is added to MasterProfile, add it here so the
 * source-integrity test (Prompt 12) keeps covering it.
 */
export function collectFacts(p: MasterProfile): { path: string; fact: unknown }[] {
  const out: { path: string; fact: unknown }[] = [];
  const push = (path: string, fact: unknown | undefined) => {
    if (fact !== undefined && fact !== null) out.push({ path, fact });
  };
  const pushAll = (path: string, arr: unknown[] | undefined) =>
    (arr ?? []).forEach((f, i) => push(`${path}[${i}]`, f));

  // Personal
  push("personal.fullName", p.personal.fullName);
  push("personal.email", p.personal.email);
  push("personal.phone", p.personal.phone);
  push("personal.location", p.personal.location);
  pushAll("personal.links", p.personal.links);

  // Target role + summary
  push("targetRole", p.targetRole);
  push("summary", p.summary);

  // Experience
  p.experience.forEach((e, i) => {
    push(`experience[${i}].company`, e.company);
    push(`experience[${i}].title`, e.title);
    push(`experience[${i}].startDate`, e.startDate);
    push(`experience[${i}].endDate`, e.endDate);
    push(`experience[${i}].location`, e.location);
    pushAll(`experience[${i}].responsibilities`, e.responsibilities);
    pushAll(`experience[${i}].achievements`, e.achievements);
  });

  // Education
  p.education.forEach((e, i) => {
    push(`education[${i}].institution`, e.institution);
    push(`education[${i}].credential`, e.credential);
    push(`education[${i}].field`, e.field);
    push(`education[${i}].startDate`, e.startDate);
    push(`education[${i}].endDate`, e.endDate);
    pushAll(`education[${i}].details`, e.details);
  });

  // Projects / activities
  p.projects.forEach((pr, i) => {
    push(`projects[${i}].name`, pr.name);
    push(`projects[${i}].description`, pr.description);
    pushAll(`projects[${i}].highlights`, pr.highlights);
    push(`projects[${i}].link`, pr.link);
  });

  // Flat fact arrays
  pushAll("skills", p.skills);
  pushAll("tools", p.tools);
  pushAll("certifications", p.certifications);
  pushAll("languages", p.languages);

  return out;
}

export interface SourceViolation {
  path: string;
  reason: string;
}

/**
 * Returns every fact that reached the profile without valid provenance.
 * An empty array means every statement is traceable. (Prompt 12)
 */
export function validateProfileSources(p: MasterProfile): SourceViolation[] {
  return collectFacts(p)
    .filter(({ fact }) => !isFact(fact))
    .map(({ path, fact }) => ({
      path,
      reason: describe(fact as Partial<AnyFact>),
    }));
}

function describe(f: Partial<AnyFact> | undefined): string {
  if (!f || typeof f !== "object") return "not a Fact object";
  if (!("source" in f)) return "missing `source`";
  if (!("confirmedAt" in f)) return "missing `confirmedAt`";
  if (f.source === "ai_suggested_confirmed" && !("originalSuggestion" in f)) {
    return "AI-sourced fact missing `originalSuggestion`";
  }
  return "invalid provenance";
}
