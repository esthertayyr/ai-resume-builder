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
]);

export const aiRequestSchema = z.object({
  task: aiTaskSchema,
  input: z.record(z.unknown()).default({}),
});

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
