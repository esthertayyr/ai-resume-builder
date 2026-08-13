// The AI seam. The whole app talks to this interface and never to a concrete vendor,
// so mock <-> real is a single swap in the factory (lib/ai/index.ts) with no feature
// changes. A provider only ever returns SUGGESTIONS; nothing becomes a fact until the
// user confirms it in the UI.

export type AITaskType =
  | "responsibility_suggestions"
  | "skills_discovery"
  | "summary_options"
  | "achievement_wording"
  | "extract_resume"
  | "cover_letter";

export interface AIRequest {
  task: AITaskType;
  /** Task-specific, plain JSON. Kept loose so providers stay decoupled from UI shapes. */
  input: Record<string, unknown>;
}

export interface AISuggestion {
  text: string;
  /** Optional "why we suggested this" (evidence), shown to build trust. */
  rationale?: string;
  /** Optional provider hints (e.g. { style: "Professional" }). Never treated as fact. */
  meta?: Record<string, unknown>;
}

export interface AIResponse {
  suggestions: AISuggestion[];
}

export interface AIProvider {
  complete(req: AIRequest): Promise<AIResponse>;
}
