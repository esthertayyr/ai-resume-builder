// Turns a ResumeDocument into the MINIMUM text each AI task needs. This is the privacy
// boundary for AI: it deliberately NEVER includes contact details (name/email/phone/
// location), credential numbers, or verification URLs. Only career evidence — the words
// that describe what the person did — is sent to the model.
import type { ResumeDocument, ResumeSection } from "@/lib/render/contract";

export type Evidence = { text: string; source: string };

function itemText(parts: (string | undefined)[]): string {
  return parts.filter((p) => p && p.trim()).join(" — ").trim();
}

/** Career evidence across the resume, tagged by source. No PII, no credential numbers. */
export function resumeEvidence(doc: ResumeDocument): Evidence[] {
  const out: Evidence[] = [];
  for (const s of doc.sections) {
    switch (s.kind) {
      case "experience":
      case "projects": {
        const source = s.kind === "projects" ? "project" : "experience";
        for (const it of s.items) {
          const head = itemText([it.title, it.organization]);
          for (const b of it.bullets) if (b.trim()) out.push({ text: `${head}: ${b.trim()}`, source });
          if (!it.bullets.length && head) out.push({ text: head, source });
        }
        break;
      }
      case "education":
        for (const it of s.items) {
          const head = itemText([it.credential, it.institution]);
          if (head) out.push({ text: head, source: "education" });
          for (const b of it.bullets) if (b.trim()) out.push({ text: `${head}: ${b.trim()}`, source: "education" });
        }
        break;
      // summary/skills are AI OUTPUTS, not evidence — never fed back in as facts.
      default:
        break;
    }
  }
  return out;
}

/** Flat list of evidence strings (for tasks that only need the text). */
export function evidenceStrings(doc: ResumeDocument): string[] {
  return resumeEvidence(doc).map((e) => e.text);
}

/** Section-grouped lines for the editorial review. Skills collapse to one line. */
export function reviewSections(doc: ResumeDocument): { section: string; lines: string[] }[] {
  const groups: { section: string; lines: string[] }[] = [];
  for (const s of doc.sections) {
    if (s.kind === "summary") continue; // reviewed separately via summaryText()
    const lines: string[] = [];
    if (s.kind === "experience" || s.kind === "projects") {
      for (const it of s.items) {
        const head = itemText([it.title, it.organization, it.dateRange]);
        if (head) lines.push(head);
        for (const b of it.bullets) if (b.trim()) lines.push(b.trim());
      }
    } else if (s.kind === "education") {
      for (const it of s.items) {
        const head = itemText([it.credential, it.institution, it.dateRange]);
        if (head) lines.push(head);
      }
    } else if (s.kind === "skills") {
      if (s.items.length) lines.push(`Skills: ${s.items.join(", ")}`);
    }
    if (lines.length) groups.push({ section: s.heading || s.kind, lines });
  }
  return groups;
}

/** The current professional-summary text, if any. */
export function summaryText(doc: ResumeDocument): string {
  const s = doc.sections.find((x): x is Extract<ResumeSection, { kind: "summary" }> => x.kind === "summary");
  return s?.text ?? "";
}

/** One experience/project entry's text, for a per-entry "Look closer". */
export function experienceText(item: { title?: string; organization?: string; bullets: string[] }): string {
  const head = itemText([item.title, item.organization]);
  const body = item.bullets.filter((b) => b.trim()).join(". ");
  return [head, body].filter(Boolean).join(". ").trim();
}
