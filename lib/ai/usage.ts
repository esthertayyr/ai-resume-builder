// Server-only AI usage control: fixed-window per-session rate limiting + minimal,
// content-free usage logging. In-memory (single-instance) — good enough to stop
// runaway clicks and protect a rate-limited free model. For multi-instance deploys
// swap the Map for a shared store (Redis) behind the same interface.
//
// PRIVACY: we log COUNTS and TIMINGS only — never resume text, prompts, inputs, or the
// API key.
import { AI_LIMITS, type AITaskType } from "./provider";

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

/** Fixed-window limiter. Returns whether the request is allowed + seconds until reset. */
export function rateLimit(key: string, now: number): { ok: boolean; retryAfter: number } {
  const w = windows.get(key);
  if (!w || now >= w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + AI_LIMITS.windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (w.count >= AI_LIMITS.windowRequests) {
    return { ok: false, retryAfter: Math.ceil((w.resetAt - now) / 1000) };
  }
  w.count++;
  return { ok: true, retryAfter: 0 };
}

// Aggregate counters (process-lifetime) for quick visibility. No user content.
const totals = { requests: 0, ok: 0, failed: 0, rateLimited: 0 };

export function logUsage(entry: {
  task: AITaskType;
  provider: string;
  model: string;
  ok: boolean;
  rateLimited?: boolean;
  ms: number;
  status: number;
}): void {
  totals.requests++;
  if (entry.rateLimited) totals.rateLimited++;
  else if (entry.ok) totals.ok++;
  else totals.failed++;
  // Content-free structured line. Model name is config, not a secret.
  console.info(
    `[ai] task=${entry.task} provider=${entry.provider} model=${entry.model} ` +
      `ok=${entry.ok} status=${entry.status} ms=${entry.ms} ` +
      `totals=${totals.requests}/${totals.ok}/${totals.failed}/${totals.rateLimited}`,
  );
}

export function usageTotals() {
  return { ...totals };
}
