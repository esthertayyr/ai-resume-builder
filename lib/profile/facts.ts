import type { AnyFact, Fact, Source } from "./types";

/**
 * The ONLY sanctioned ways to create a Fact. This is where provenance is stamped —
 * nothing else in the app should construct a Fact literal by hand.
 */

/** A value the user supplied directly. */
export function userFact<T>(value: T, at: string): Fact<T> {
  return { value, source: "user_provided", confirmedAt: at };
}

/**
 * An AI suggestion the user explicitly confirmed. Retains the AI's verbatim text
 * for the audit trail (immutable once set).
 */
export function aiConfirmedFact<T>(value: T, originalSuggestion: string, at: string): Fact<T> {
  return {
    value,
    source: "ai_suggested_confirmed",
    confirmedAt: at,
    originalSuggestion,
  };
}

/**
 * Apply a manual edit to an existing fact without destroying provenance (Prompt 14).
 * originalSuggestion is preserved; the edit is flagged and re-timestamped.
 */
export function editFact<T>(fact: Fact<T>, value: T, at: string): Fact<T> {
  return { ...fact, value, editedByUser: true, confirmedAt: at };
}

const VALID_SOURCES: Source[] = ["user_provided", "ai_suggested_confirmed"];

/** True if x looks like a properly-sourced Fact. */
export function isFact(x: unknown): x is AnyFact {
  if (!x || typeof x !== "object") return false;
  const f = x as Record<string, unknown>;
  if (!("value" in f)) return false;
  if (typeof f.confirmedAt !== "string" || f.confirmedAt.length === 0) return false;
  if (!VALID_SOURCES.includes(f.source as Source)) return false;
  // AI-sourced facts must retain the original suggestion text.
  if (f.source === "ai_suggested_confirmed" && typeof f.originalSuggestion !== "string") {
    return false;
  }
  return true;
}
