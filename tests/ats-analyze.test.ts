import { describe, expect, it } from "vitest";
import { analyzeResume } from "@/lib/ats/analyze";

const STRONG = `Jane Doe
jane@example.com  •  +1 555 123 4567  •  London

Summary
Operations coordinator with five years of experience.

Experience
Operations Coordinator — Acme Ltd · 2020–2024
• Led a team of 6 and reduced processing time by 30%
• Managed a budget of $50k across 12 projects
• Improved customer response times by 40%

Education
BA Business — City University · 2016

Skills
Project management • Excel • Communication`;

describe("analyzeResume", () => {
  it("computes the score as a real ratio of checks passed", () => {
    const r = analyzeResume(STRONG);
    expect(r.checksTotal).toBeGreaterThan(0);
    expect(r.readinessScore).toBe(Math.round((r.checksPassed / r.checksTotal) * 100));
    expect(r.readinessScore).toBeGreaterThanOrEqual(0);
    expect(r.readinessScore).toBeLessThanOrEqual(100);
  });

  it("recognises contact info, headings and quantified impact in a strong resume", () => {
    const r = analyzeResume(STRONG);
    const ids = r.strengths.map((s) => s.id);
    expect(ids).toContain("contact");
    expect(ids).toContain("headings");
    expect(ids).toContain("impact");
  });

  it("flags a resume with no contact details or headings", () => {
    const r = analyzeResume(
      "I worked at some places and did various tasks that were helpful to the team over time and generally contributed.",
    );
    const issueIds = r.issues.map((i) => i.id);
    expect(issueIds).toContain("contact");
    expect(issueIds).toContain("headings");
  });

  it("only reports a keyword match when a job description is supplied", () => {
    expect(analyzeResume(STRONG).keywordMatch).toBeUndefined();
    const withJd = analyzeResume(STRONG, "We need an operations coordinator skilled in project management and Excel budgeting.");
    expect(withJd.keywordMatch).toBeDefined();
    expect(withJd.keywordMatch!.percent).toBeGreaterThan(0);
    expect(withJd.keywordMatch!.percent).toBeLessThanOrEqual(100);
  });

  it("never fabricates suggestions for checks that passed", () => {
    const r = analyzeResume(STRONG);
    // Every suggestion must correspond to a non-good check.
    expect(r.suggestions.length).toBe(r.issues.filter((i) => i.suggestion).length);
  });
});
