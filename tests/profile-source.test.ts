import { describe, expect, it } from "vitest";
import { basicsScript } from "@/lib/interview/scripts/basics";
import { beginnerScript } from "@/lib/interview/scripts/beginner";
import { createEmptyProfile } from "@/lib/profile/factory";
import { validateProfileSources } from "@/lib/profile/integrity";
import type { Answer } from "@/lib/interview/types";
import type { MasterProfile } from "@/lib/profile/types";

const NOW = "2026-01-01T00:00:00.000Z";
const ans = (id: string, value: unknown): Answer => ({ questionId: id, action: "answered", value, at: NOW });

function buildProfileFromBeginnerFlow(): MasterProfile {
  let p = createEmptyProfile("test", NOW);
  p = basicsScript.commit!(
    p,
    { name: ans("name", "Jordan Lee"), email: ans("email", "jordan@example.com"), location: ans("location", "Manchester") },
    NOW,
  );
  p = beginnerScript.commit!(
    p,
    {
      opportunity: ans("opportunity", "part_time"),
      interest: ans("interest", "retail"),
      done_so_far: ans("done_so_far", "helped at a weekend market"),
      one_thing: ans("one_thing", "Ran a market stall"),
      personally_did: ans("personally_did", "Took payments and helped customers"),
      proud_of: ans("proud_of", "Customers came back and asked for me"),
      employers_know: ans("employers_know", "I'm reliable and learn fast"),
    },
    NOW,
  );
  return p;
}

describe("source integrity (Prompt 12)", () => {
  it("every statement written by the beginner flow carries valid provenance", () => {
    const p = buildProfileFromBeginnerFlow();
    expect(validateProfileSources(p)).toEqual([]);
  });

  it("FAILS when a statement reaches the profile without a source", () => {
    const p = buildProfileFromBeginnerFlow();
    // Simulate a bug: a bare value slipped in without provenance.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p.skills as any[]).push({ value: "Photoshop" });
    const violations = validateProfileSources(p);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].reason).toMatch(/source/i);
  });

  it("FAILS when an AI-sourced fact is missing its original suggestion text", () => {
    const p = buildProfileFromBeginnerFlow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p.skills as any[]).push({ value: "Excel", source: "ai_suggested_confirmed", confirmedAt: NOW });
    const violations = validateProfileSources(p);
    expect(violations.some((v) => /originalSuggestion/.test(v.reason))).toBe(true);
  });
});
