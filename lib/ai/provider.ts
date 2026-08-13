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
  | "cover_letter"
  // Editorial "look closer" features (all evidence-first, never fabricating):
  | "look_closer" // analyse ONE experience entry -> skill/evidence/explanation findings
  | "resume_review" // review the whole structured resume -> grouped editorial findings
  | "job_match" // compare resume vs a pasted job description
  | "interview_prep"; // likely questions + prep points from resume (+ optional JD)

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

/**
 * Cost / abuse limits shared by the route and the client. Kept here so the seam has a
 * single source of truth. These bound how much text ever reaches a paid/rate-limited
 * model and how hard we retry.
 */
export const AI_LIMITS = {
  /** Max characters of task input accepted by the API route (rejects oversized payloads). */
  maxInputChars: 8_000,
  /** Upper bound on model output tokens (passed to OpenRouter as max_tokens). */
  maxOutputTokens: 900,
  /** Per-request timeout, ms. */
  timeoutMs: 20_000,
  /** Total remote attempts before giving up (1 try + retries). Small on purpose. */
  maxAttempts: 2,
  /** Fixed-window rate limit: requests per window, per session. */
  windowRequests: 15,
  windowMs: 60_000,
} as const;

/**
 * Raised when a *real* provider is unavailable (auth, rate limit, timeout, network,
 * or unusable output after retries). The route maps this to a friendly message; we do
 * NOT silently substitute fabricated suggestions on a real failure. `kind` lets the UI
 * distinguish "slow down" (rate limit) from generic unavailability without leaking
 * provider internals.
 */
export type AIFailureKind = "rate_limited" | "unavailable";

export class AIUnavailableError extends Error {
  constructor(readonly kind: AIFailureKind = "unavailable") {
    super(kind);
    this.name = "AIUnavailableError";
  }
}
