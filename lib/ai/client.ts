"use client";

// Browser-side helper. The UI calls this and never imports a provider directly, so no
// AI SDK or secret can enter the client bundle. It's provider-agnostic: the client
// can't tell whether the mock or a real model answered.
import type { AIRequest, AIResponse } from "./provider";

export async function completeAI(req: AIRequest): Promise<AIResponse> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    // Friendly, non-technical failure — callers show a retry message.
    throw new Error("ai_request_failed");
  }
  return (await res.json()) as AIResponse;
}
