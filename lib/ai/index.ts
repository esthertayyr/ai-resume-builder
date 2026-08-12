import type { AIProvider } from "./provider";
import { MockAIProvider } from "./mock";
import { OpenRouterProvider } from "./openrouter";

let cached: AIProvider | null = null;

/**
 * Single factory for the AI seam, keyed on `AI_PROVIDER`. Swapping providers is one
 * env change and touches NO feature code — callers only know the AIProvider interface.
 *
 * IMPORTANT: this module is server-only (imported by the /api/ai route and tests). It
 * must never be imported into a client component, so provider SDKs and secrets stay
 * out of the browser bundle. The browser talks to the API route via lib/ai/client.ts.
 *
 * "anthropic" / "ollama" are not implemented yet and fall through to the offline mock,
 * so the app always works with zero secrets.
 */
export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const kind = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  switch (kind) {
    case "openrouter":
      cached = new OpenRouterProvider();
      break;
    case "mock":
    default:
      cached = new MockAIProvider();
  }
  return cached;
}

export type { AIProvider } from "./provider";
export * from "./provider";
