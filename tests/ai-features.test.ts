import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/lib/ai/mock";
import { aiResponseSchema, inputCharLength } from "@/lib/ai/schema";

const mock = new MockAIProvider();
const CAFE = "Worked part-time at a cafe. Served customers, handled payments and helped train two new staff.";

describe("Evidence-first AI tasks (mock)", () => {
  it("look_closer finds evidenced skills and quotes the user's own words", async () => {
    const res = await mock.complete({ task: "look_closer", input: { text: CAFE } });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    const skills = res.suggestions.map((s) => s.text);
    expect(skills).toContain("Customer Service");
    expect(skills).toContain("Cash Handling");
    expect(skills).toContain("Training & Mentoring");
    // Every finding carries evidence + explanation, and never invents numbers/teams.
    for (const s of res.suggestions) {
      expect(s.rationale).toBeTruthy();
      expect(s.meta?.explanation).toBeTruthy();
      expect(s.text).not.toMatch(/\d+%|\$\d|\bteam of \d+/i);
    }
  });

  it("look_closer returns nothing for thin input (asks for more, never guesses)", async () => {
    const res = await mock.complete({ task: "look_closer", input: { text: "worked" } });
    expect(res.suggestions).toHaveLength(0);
  });

  it("resume_review groups editorial findings and flags vague wording", async () => {
    const res = await mock.complete({
      task: "resume_review",
      input: { summary: "", sections: [{ section: "Experience", lines: ["Helped customers at a cafe"] }] },
    });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    const cats = res.suggestions.map((s) => s.meta?.category);
    expect(cats).toContain("look_closer"); // "Helped" is vague
    expect(cats).toContain("needs_evidence"); // no summary
  });

  it("job_match only claims matches backed by resume evidence", async () => {
    const res = await mock.complete({
      task: "job_match",
      input: { jobText: "Seeking cash handling and customer service", evidence: ["Served customers and handled payments"] },
    });
    const strong = res.suggestions.filter((s) => s.meta?.group === "strongMatches").map((s) => s.text);
    expect(strong).toContain("Customer Service");
    expect(strong).toContain("Cash Handling");
  });

  it("job_match reports gaps instead of fabricating a match", async () => {
    const res = await mock.complete({
      task: "job_match",
      input: { jobText: "Must know Microsoft Excel spreadsheets", evidence: ["Served customers"] },
    });
    const gaps = res.suggestions.filter((s) => s.meta?.group === "possibleGaps").map((s) => s.text);
    expect(gaps).toContain("Microsoft Excel");
  });

  it("interview_prep grounds questions in the user's real experience", async () => {
    const res = await mock.complete({ task: "interview_prep", input: { evidence: ["Served customers", "Trained two new staff"] } });
    expect(aiResponseSchema.safeParse(res).success).toBe(true);
    const groups = new Set(res.suggestions.map((s) => s.meta?.group));
    expect(groups.has("questions")).toBe(true);
    expect(groups.has("candidateQuestions")).toBe(true);
  });

  it("inputCharLength measures serialized input for the size cap", () => {
    expect(inputCharLength({ text: "abc" })).toBe(JSON.stringify({ text: "abc" }).length);
    expect(inputCharLength({ text: "x".repeat(10_000) })).toBeGreaterThan(9_000);
  });
});
