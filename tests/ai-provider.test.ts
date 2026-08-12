import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/lib/ai/mock";
import { aiResponseSchema } from "@/lib/ai/schema";

const mock = new MockAIProvider();

describe("MockAIProvider", () => {
  it("returns schema-valid, role-appropriate responsibility SUGGESTIONS", async () => {
    const res = await mock.complete({
      task: "responsibility_suggestions",
      input: { jobTitle: "Virtual Assistant" },
    });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    expect(res.suggestions.length).toBeGreaterThan(0);
    // VA-specific content, not generic filler.
    expect(res.suggestions.map((s) => s.text).join(" ")).toMatch(/calendar|email|research/i);
  });

  it("only returns skills that are evidenced by confirmed statements", async () => {
    const res = await mock.complete({
      task: "skills_discovery",
      input: { confirmedStatements: ["Handled cash and card payments at the till"] },
    });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    expect(res.suggestions.some((s) => /cash handling/i.test(s.text))).toBe(true);
    // Every suggested skill carries its evidence (trust).
    for (const s of res.suggestions) expect(s.rationale).toBeTruthy();
  });

  it("does not invent skills from empty input", async () => {
    const res = await mock.complete({ task: "skills_discovery", input: { confirmedStatements: [] } });
    expect(res.suggestions).toHaveLength(0);
  });

  it("offers three labelled summary styles without fabricating metrics", async () => {
    const res = await mock.complete({
      task: "summary_options",
      input: { targetRole: "Receptionist", level: "beginner", strengths: ["Communication"] },
    });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    expect(res.suggestions).toHaveLength(3);
    const styles = res.suggestions.map((s) => s.meta?.style);
    expect(styles).toEqual(["Professional", "Confident", "Simple"]);
    // No invented numbers in generated summaries.
    for (const s of res.suggestions) expect(s.text).not.toMatch(/\d+%|\$\d/);
  });
});
