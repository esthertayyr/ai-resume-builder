// Server-only OpenRouter provider. Selected via AI_PROVIDER=openrouter. The key is
// read from server env and NEVER sent to the client (this module is only imported by
// the /api/ai route + tests). The model is configurable (OPENROUTER_MODEL) — no free
// model is hard-coded as a permanent assumption.
//
// Robustness: timeouts, non-2xx, rate limits, network failures, and malformed or
// schema-invalid output all resolve to the offline Mock provider rather than crashing
// the flow or leaking raw errors. Output is validated before use.
import type { AIProvider, AIRequest, AIResponse } from "./provider";
import { safeParseAIResponse } from "./schema";
import { MockAIProvider } from "./mock";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 20_000;

export class OpenRouterProvider implements AIProvider {
  private readonly fallback = new MockAIProvider();

  constructor(
    private readonly apiKey: string = process.env.OPENROUTER_API_KEY ?? "",
    private readonly model: string = process.env.OPENROUTER_MODEL ?? "",
  ) {}

  async complete(req: AIRequest): Promise<AIResponse> {
    // Misconfigured → behave exactly like the offline mock. The product keeps working.
    if (!this.apiKey || !this.model) return this.fallback.complete(req);

    try {
      const first = safeParseAIResponse(await this.callModel(req, false));
      if (first) return first;
      // One stricter retry before giving up (Prompt: validate / retry once / fallback).
      const second = safeParseAIResponse(await this.callModel(req, true));
      if (second) return second;
    } catch {
      // Timeout / rate limit / network / provider / parse error — swallow raw detail.
    }
    return this.fallback.complete(req);
  }

  private async callModel(req: AIRequest, strict: boolean): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: buildMessages(req, strict),
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`openrouter status ${res.status}`);
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      return JSON.parse(content);
    } finally {
      clearTimeout(timer);
    }
  }
}

function buildMessages(req: AIRequest, strict: boolean) {
  const system =
    "You are a careful resume assistant. You only ever return SUGGESTIONS that the " +
    "user must confirm. Never invent employers, dates, metrics, achievements, " +
    "certifications, or facts. Prefer omission over guessing. Respond ONLY with a " +
    'JSON object of the exact form {"suggestions":[{"text":"...","rationale":"..."}]}.' +
    (strict ? " Return valid JSON only — no prose, no markdown, no code fences." : "");
  return [
    { role: "system", content: system },
    { role: "user", content: `Task: ${req.task}\nInput: ${JSON.stringify(req.input)}` },
  ];
}
