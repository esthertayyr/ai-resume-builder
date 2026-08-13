"use client";

// Named, typed AI actions for the UI. The rest of the app calls THESE — it never sees
// task strings, the generic suggestion wire shape, or OpenRouter. Each function sends
// only the minimum text required for its task (privacy), then reshapes the validated
// {suggestions:[{text,rationale,meta}]} response into a task-specific typed structure.
//
// Nothing here fabricates: reshapers only relabel what the provider returned. Empty
// results are legitimate ("not enough evidence") and surfaced as empty arrays.
import { completeAI } from "./client";
import type { AISuggestion } from "./provider";

export type Confidence = "high" | "medium" | "low";

async function run(task: string, input: Record<string, unknown>): Promise<AISuggestion[]> {
  const res = await completeAI({ task: task as never, input });
  return Array.isArray(res.suggestions) ? res.suggestions : [];
}

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const conf = (v: unknown): Confidence => (v === "high" || v === "low" ? v : "medium");

// ---- LOOK CLOSER (single experience) --------------------------------------
export type Finding = { skill: string; evidence: string; explanation: string; confidence: Confidence };

export async function lookCloser(experienceText: string): Promise<Finding[]> {
  const s = await run("look_closer", { text: experienceText });
  return s.map((x) => ({
    skill: x.text,
    evidence: str(x.rationale),
    explanation: str(x.meta?.explanation),
    confidence: conf(x.meta?.confidence),
  }));
}

// ---- IMPROVE THIS (one bullet/line) ---------------------------------------
export type ImproveSuggestion = { text: string; reason: string };

export async function improveExperience(line: string): Promise<ImproveSuggestion[]> {
  const s = await run("achievement_wording", { description: line });
  return s.map((x) => ({ text: x.text, reason: str(x.rationale) }));
}

// ---- DISCOVER SKILLS (across the resume) ----------------------------------
export type DiscoveredSkill = { name: string; evidence: string; source: string; confidence: Confidence };

export async function discoverSkills(evidence: { text: string; source: string }[]): Promise<DiscoveredSkill[]> {
  const s = await run("skills_discovery", { evidence });
  return s.map((x) => ({
    name: x.text,
    evidence: str(x.rationale),
    source: str(x.meta?.source, "experience"),
    confidence: conf(x.meta?.confidence),
  }));
}

// ---- WRITE SUMMARY --------------------------------------------------------
export type SummaryOption = { style: string; text: string };

export async function generateSummary(input: {
  targetRole?: string;
  level?: string;
  strengths?: string[];
}): Promise<SummaryOption[]> {
  const s = await run("summary_options", { ...input });
  return s.map((x) => ({ style: str(x.meta?.style, "professional"), text: x.text }));
}

// ---- REVIEW MY RESUME -----------------------------------------------------
export type ReviewCategory = "look_closer" | "needs_evidence" | "already_strong" | "optional_improvement";
export type ReviewFinding = {
  category: ReviewCategory;
  section: string;
  issue: string;
  suggestion: string;
  priority: Confidence;
};

export async function reviewResume(input: {
  summary?: string;
  sections: { section: string; lines: string[] }[];
}): Promise<ReviewFinding[]> {
  const s = await run("resume_review", input);
  const cats: ReviewCategory[] = ["look_closer", "needs_evidence", "already_strong", "optional_improvement"];
  return s.map((x) => ({
    category: (cats.includes(x.meta?.category as ReviewCategory) ? x.meta?.category : "look_closer") as ReviewCategory,
    section: str(x.meta?.section, "Resume"),
    issue: x.text,
    suggestion: str(x.rationale),
    priority: conf(x.meta?.priority),
  }));
}

// ---- COMPARE WITH A JOB ---------------------------------------------------
export type MatchItem = { text: string; evidence: string };
export type JobMatchResult = {
  strongMatches: MatchItem[];
  lookCloser: MatchItem[];
  possibleGaps: MatchItem[];
  suggestions: MatchItem[];
};

export async function matchJob(input: { jobText: string; evidence: string[] }): Promise<JobMatchResult> {
  const s = await run("job_match", input);
  const out: JobMatchResult = { strongMatches: [], lookCloser: [], possibleGaps: [], suggestions: [] };
  for (const x of s) {
    const g = str(x.meta?.group) as keyof JobMatchResult;
    if (g in out) out[g].push({ text: x.text, evidence: str(x.rationale) });
  }
  return out;
}

// ---- COVER LETTER ---------------------------------------------------------
export type CoverLetter = { opening: string; body: string; closing: string };

export async function generateCoverLetter(input: {
  role?: string;
  company?: string;
  name?: string;
  strengths?: string[];
  motivation?: string;
}): Promise<CoverLetter> {
  const s = await run("cover_letter", input);
  const pick = (part: string) => s.find((x) => x.meta?.part === part)?.text ?? "";
  return {
    opening: pick("opening") || pick("Opening"),
    body: pick("body") || pick("Body"),
    closing: pick("closing") || pick("Closing"),
  };
}

// ---- INTERVIEW PREP -------------------------------------------------------
export type InterviewPrep = {
  questions: string[];
  preparationPoints: string[];
  clarifications: string[];
  candidateQuestions: string[];
};

export async function generateInterviewQuestions(input: {
  evidence: string[];
  jobText?: string;
}): Promise<InterviewPrep> {
  const s = await run("interview_prep", input);
  const out: InterviewPrep = { questions: [], preparationPoints: [], clarifications: [], candidateQuestions: [] };
  for (const x of s) {
    const g = str(x.meta?.group) as keyof InterviewPrep;
    if (g in out) out[g].push(x.text);
  }
  return out;
}
