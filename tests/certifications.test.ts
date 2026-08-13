import { describe, it, expect } from "vitest";
import { flatten, formatMonth, type ResumeDocument } from "@/lib/render/contract";

function docWith(items: any): ResumeDocument {
  return {
    contact: { name: "A", links: [] },
    sections: [{ kind: "certifications", heading: "Certifications", items }],
  };
}

describe("Certifications rendering", () => {
  it("formatMonth turns ISO months into human labels, leaves free text alone", () => {
    expect(formatMonth("2024-01")).toBe("Jan 2024");
    expect(formatMonth("2027-12")).toBe("Dec 2027");
    expect(formatMonth("")).toBe("");
    expect(formatMonth("Spring 2024")).toBe("Spring 2024");
  });

  it("renders only the fields the user filled in (no invented content)", () => {
    const lines = flatten(docWith([{ name: "First Aid", issuingOrganization: "Red Cross", issueDate: "2024-03" }]));
    const notes = lines.filter((l) => l.type === "note").map((l) => l.text);
    const sub = lines.find((l) => l.type === "subheading") as any;
    expect(sub.text).toBe("First Aid");
    expect(sub.meta).toBe("Red Cross · Issued Mar 2024");
    // No credential id / verify / description notes when those fields are empty.
    expect(notes).toHaveLength(0);
  });

  it("shows 'No expiry' when doesNotExpire and omits the expiry date", () => {
    const lines = flatten(
      docWith([{ name: "CPR", issueDate: "2024-01", expiryDate: "2026-01", doesNotExpire: true }]),
    );
    const sub = lines.find((l) => l.type === "subheading") as any;
    expect(sub.meta).toContain("No expiry");
    expect(sub.meta).not.toContain("2026");
  });

  it("emits credential id, description, related skills and verify notes when present", () => {
    const lines = flatten(
      docWith([
        {
          name: "AWS Cloud Practitioner",
          credentialNumber: "ABC-123",
          description: "Foundational cloud certification.",
          relatedSkills: ["Cloud", "AWS"],
          verificationUrl: "https://verify.example/abc",
        },
      ]),
    );
    const notes = lines.filter((l) => l.type === "note").map((l) => l.text);
    expect(notes).toContain("Credential ID: ABC-123");
    expect(notes).toContain("Foundational cloud certification.");
    expect(notes).toContain("Related skills: Cloud, AWS");
    expect(notes).toContain("Verify: https://verify.example/abc");
  });

  it("skips entries with no name and renders no heading when all are empty", () => {
    const lines = flatten(docWith([{ name: "" }, { name: "  " }]));
    expect(lines.some((l) => l.type === "heading")).toBe(false);
  });
});
