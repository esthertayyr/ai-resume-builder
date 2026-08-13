"use client";

// Browser-side helper. The UI calls this and never imports a provider directly, so no
// AI SDK or secret can enter the client bundle. It's provider-agnostic: the client
// can't tell whether the mock or a real model answered.
//
// Cost control lives here too: identical in-flight requests are de-duplicated so rapid
// double-clicks issue ONE network call. Callers should also disable their trigger while
// a request is pending (see useAIAction).
import type { AIRequest, AIResponse } from "./provider";

export type AIErrorKind = "rate_limited" | "unavailable";

export class AIError extends Error {
  constructor(readonly kind: AIErrorKind = "unavailable") {
    super(kind);
    this.name = "AIError";
  }
}

// Map identical concurrent requests to a single promise.
const inFlight = new Map<string, Promise<AIResponse>>();

export async function completeAI(req: AIRequest): Promise<AIResponse> {
  const key = JSON.stringify(req);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = (async () => {
    let res: Response;
    try {
      res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
    } catch {
      throw new AIError("unavailable"); // network failure
    }
    if (res.status === 429) throw new AIError("rate_limited");
    if (!res.ok) throw new AIError("unavailable");
    return (await res.json()) as AIResponse;
  })();

  inFlight.set(key, p);
  try {
    return await p;
  } finally {
    inFlight.delete(key);
  }
}
