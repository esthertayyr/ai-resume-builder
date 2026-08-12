import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenRouterProvider } from "@/lib/ai/openrouter";

// Build a fake OpenRouter chat-completions response whose content is `content`.
function fetchReturning(content: string, ok = true, status = 200) {
  return vi.fn(async () => ({
    ok,
    status,
    json: async () => ({ choices: [{ message: { content } }] }),
  })) as unknown as typeof fetch;
}

const req = { task: "skills_discovery", input: { confirmedStatements: ["Served customers"] } } as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OpenRouterProvider", () => {
  it("parses and returns validated suggestions on a successful call", async () => {
    vi.stubGlobal(
      "fetch",
      fetchReturning(JSON.stringify({ suggestions: [{ text: "Customer Service", rationale: "you served customers" }] })),
    );
    const provider = new OpenRouterProvider("test-key", "test/model");
    const res = await provider.complete(req);
    expect(res.suggestions).toEqual([{ text: "Customer Service", rationale: "you served customers" }]);
  });

  it("falls back to the offline mock (never throws) on a provider error", async () => {
    vi.stubGlobal("fetch", fetchReturning("", false, 429)); // rate limited
    const provider = new OpenRouterProvider("test-key", "test/model");
    const res = await provider.complete(req);
    expect(Array.isArray(res.suggestions)).toBe(true); // graceful, valid shape
  });

  it("falls back when the model returns schema-invalid JSON", async () => {
    vi.stubGlobal("fetch", fetchReturning(JSON.stringify({ not: "our shape" })));
    const provider = new OpenRouterProvider("test-key", "test/model");
    const res = await provider.complete(req);
    // mock evidences "Customer Service" from "Served customers"
    expect(res.suggestions.some((s) => /customer service/i.test(s.text))).toBe(true);
  });

  it("uses the offline mock when unconfigured (no key/model), making no network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);
    const provider = new OpenRouterProvider("", "");
    const res = await provider.complete(req);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(Array.isArray(res.suggestions)).toBe(true);
  });
});
