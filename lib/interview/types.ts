import type { MasterProfile, MilestoneId } from "@/lib/profile/types";

// Reusable conversation engine (Prompt 4A). Every guided interview in the app
// (beginner, simple-job, zero-experience, achievement discovery — Prompts 5/6/7/11)
// is a data-driven Script fed to this one engine. Do not fork it per flow.

export type AnswerAction = "answered" | "skipped" | "dont_know" | "not_applicable";

export interface Answer {
  questionId: string;
  action: AnswerAction;
  value?: unknown;
  at: string;
}

export interface QuestionOption {
  id: string;
  label: string;
}

export type QuestionKind =
  | "short_text"
  | "long_text"
  | "single_select"
  | "suggestion_multi"; // AI suggestions the user must explicitly confirm (Prompt 5)

/** Which secondary actions a question offers. Defaults are generous for beginners. */
export interface AllowedActions {
  skip?: boolean;
  dont_know?: boolean;
  not_applicable?: boolean;
  back?: boolean;
}

export interface EngineContext {
  answers: Record<string, Answer>;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  /** Plain-language prompt. No resume jargon (Prompts 4b, 20). */
  prompt: string;
  helper?: string;
  placeholder?: string;
  options?: QuestionOption[];
  /**
   * For suggestion_multi: produces the SUGGESTIONS to confirm. These are marked as
   * suggestions in the UI and never become facts until the user selects them.
   */
  loadSuggestions?: (ctx: EngineContext) => Promise<{ text: string; rationale?: string }[]>;
  /** Encouraging message shown beside the step counter (Prompt 4b). */
  progressMessage?: string;
  allow?: AllowedActions;
  /** Branch to another question based on the answer. Return null to end. */
  next?: (answer: Answer, ctx: EngineContext) => string | null;
}

export interface Script {
  id: string;
  title: string;
  milestone: MilestoneId;
  start: string;
  /** Used for "STEP x OF y" — an estimate; branching may shorten the real path. */
  totalHint: number;
  questions: Record<string, Question>;
  /**
   * Writes confirmed answers into the profile as facts (source "user_provided",
   * or "ai_suggested_confirmed" for confirmed suggestions). Called on finish.
   */
  commit?: (profile: MasterProfile, answers: Record<string, Answer>, now: string) => MasterProfile;
}

export interface EngineState {
  scriptId: string;
  currentId: string | null; // null once finished
  history: string[]; // visited question ids, for Back
  answers: Record<string, Answer>;
  finished: boolean;
}
