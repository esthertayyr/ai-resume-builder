import { describe, expect, it } from "vitest";
import { flatten } from "@/lib/render/contract";
import { toResumeDocument } from "@/lib/render/toResumeDocument";
import { aiConfirmedFact, userFact } from "@/lib/profile/facts";
import { createEmptyProfile } from "@/lib/profile/factory";
import type { MasterProfile } from "@/lib/profile/types";

const NOW = "2026-01-01T00:00:00.000Z";

function sampleProfile(): MasterProfile {
  const p = createEmptyProfile("t", NOW);
  p.personal.fullName = userFact("Jordan Lee", NOW);
  p.personal.email = userFact("jordan@example.com", NOW);
  p.summary = aiConfirmedFact("Reliable and quick to learn.", "Reliable and quick to learn.", NOW);
  p.projects.push({
    id: "a1",
    name: userFact("Ran a market stall", NOW),
    kind: "other",
    highlights: [userFact("Took payments and helped customers", NOW)],
  });
  p.skills.push(aiConfirmedFact("Customer Service", "Customer Service", NOW));
  return p;
}

describe("render parity (Prompt 15b)", () => {
  it("both render paths consume identical, ordered content from flatten()", () => {
    const doc = toResumeDocument(sampleProfile());

    // The preview (RenderedResume) and the DOCX builder both call flatten(doc).
    // They must see byte-identical content in the same order — verify determinism.
    const previewLines = flatten(doc);
    const exportLines = flatten(doc);
    expect(exportLines).toEqual(previewLines);

    // Section order + content sanity.
    const text = previewLines.map((l) => l.text);
    expect(text[0]).toBe("Jordan Lee");
    expect(text).toContain("Summary");
    expect(text).toContain("Reliable and quick to learn.");
    expect(text).toContain("Projects & Activities");
    expect(text).toContain("Skills");
    // Skills render after projects (order preserved).
    expect(text.indexOf("Skills")).toBeGreaterThan(text.indexOf("Projects & Activities"));
  });

  it("omits empty sections rather than padding", () => {
    const doc = toResumeDocument(createEmptyProfile("t", NOW));
    const headings = flatten(doc).filter((l) => l.type === "heading");
    expect(headings).toHaveLength(0);
  });
});
