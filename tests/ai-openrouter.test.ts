import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenRouterProvider } from "@/lib/ai/openrouter";
import { AIUnavailableError } from "@/lib/ai/provider";

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

  it("throws a rate_limited failure on 429 (never fabricates suggestions)", async () => {
    vi.stubGlobal("fetch", fetchReturning("", false, 429));
    const provider = new OpenRouterProvider("test-key", "test/model");
    await expect(provider.complete(req)).rejects.toMatchObject({ kind: "rate_limited" });
  });

  it("throws unavailable when the model returns schema-invalid JSON (after retry)", async () => {
    vi.stubGlobal("fetch", fetchReturning(JSON.stringify({ not: "our shape" })));
    const provider = new OpenRouterProvider("test-key", "test/model");
    await expect(provider.complete(req)).rejects.toBeInstanceOf(AIUnavailableError);
  });

  it("throws unavailable when the model returns non-JSON content", async () => {
    vi.stubGlobal("fetch", fetchReturning("not json at all"));
    const provider = new OpenRouterProvider("test-key", "test/model");
    await expect(provider.complete(req)).rejects.toBeInstanceOf(AIUnavailableError);
  });

  it("throws unavailable when unconfigured (no key/model), making no network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy as unknown as typeof fetch);
    const provider = new OpenRouterProvider("", "");
    await expect(provider.complete(req)).rejects.toBeInstanceOf(AIUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
