// Validated I/O for the AI seam. Every AI response is checked against these schemas
// before the app trusts it — a provider (or a remote model) can never inject an
// unexpected shape, and the application, not the AI, decides what is used.
import { z } from "zod";
import type { AIRequest, AIResponse } from "./provider";

export const aiTaskSchema = z.enum([
  "responsibility_suggestions",
  "skills_discovery",
  "summary_options",
  "achievement_wording",
  "extract_resume",
  "cover_letter",
  "look_closer",
  "resume_review",
  "job_match",
  "interview_prep",
]);

export const aiRequestSchema = z.object({
  task: aiTaskSchema,
  input: z.record(z.unknown()).default({}),
});

/**
 * Total character budget of a request's `input`, measured on the serialized JSON. This
 * is the hard cap that stops oversized resumes/prompts from ever reaching the model.
 * (Kept in sync with AI_LIMITS.maxInputChars — imported by the route.)
 */
export function inputCharLength(input: unknown): number {
  try {
    return JSON.stringify(input ?? {}).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export const aiSuggestionSchema = z.object({
  text: z.string().min(1),
  rationale: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export const aiResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema),
});

export function safeParseAIRequest(raw: unknown): AIRequest | null {
  const r = aiRequestSchema.safeParse(raw);
  return r.success ? (r.data as AIRequest) : null;
}

export function safeParseAIResponse(raw: unknown): AIResponse | null {
  const r = aiResponseSchema.safeParse(raw);
  return r.success ? r.data : null;
}
