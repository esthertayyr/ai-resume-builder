// Single rendering contract (ARCHITECTURE.md §5, Prompt 15b).
// Profile -> ResumeDocument (pure) -> rendered by ONE layer that both the on-screen
// preview (Prompt 14) and the PDF/DOCX export (Prompt 17) consume. No second renderer.

export type SectionKind =
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications"
  | "languages";

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: { label: string; url: string }[];
}

export interface ExperienceItem {
  title: string;
  organization?: string;
  dateRange?: string;
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  credential: string;
  institution?: string;
  dateRange?: string;
  bullets: string[];
}

export type ResumeSection =
  | { kind: "summary"; heading: string; text: string }
  | { kind: "experience"; heading: string; items: ExperienceItem[] }
  | { kind: "projects"; heading: string; items: ExperienceItem[] }
  | { kind: "education"; heading: string; items: EducationItem[] }
  | { kind: "skills"; heading: string; items: string[] };

export interface ResumeDocument {
  contact: ContactInfo;
  sections: ResumeSection[];
}

// ---- Template definitions: DATA, not code (Prompt 15/15b). ----
// Both render paths read these tokens; there is no per-template layout code to drift.

export type PaperSize = "A4" | "Letter";

export interface TemplateDefinition {
  id: "clean" | "modern" | "executive";
  name: string;
  description: string;
  /** Heading casing — all standard ATS-safe words either way. */
  headingCase: "uppercase" | "title";
  /** Accent color (used sparingly — never encodes essential info; ATS-safe). */
  accent: string;
  bodyFont: "sans" | "serif";
  /** Rule under section headings. */
  headingRule: boolean;
  /** Show the name centered vs left-aligned. */
  nameAlign: "left" | "center";
  spacing: "tight" | "normal" | "roomy";
}

/**
 * A single visible line, in final order. BOTH the web preview and the export
 * builders derive their content from flatten() so section order, wording, and
 * content cannot diverge (Prompt 15b parity requirement).
 */
export type DocLine =
  | { type: "name"; text: string }
  | { type: "contact"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string; meta?: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "inline"; text: string };

export function flatten(doc: ResumeDocument): DocLine[] {
  const lines: DocLine[] = [];
  if (doc.contact.name) lines.push({ type: "name", text: doc.contact.name });
  const contactBits = [
    doc.contact.email,
    doc.contact.phone,
    doc.contact.location,
    ...doc.contact.links.map((l) => l.url),
  ].filter((s): s is string => !!s && s.length > 0);
  if (contactBits.length) lines.push({ type: "contact", text: contactBits.join("  •  ") });

  for (const section of doc.sections) {
    switch (section.kind) {
      case "summary":
        if (section.text.trim()) {
          lines.push({ type: "heading", text: section.heading });
          lines.push({ type: "paragraph", text: section.text.trim() });
        }
        break;
      case "experience":
      case "projects":
        if (section.items.length) {
          lines.push({ type: "heading", text: section.heading });
          for (const it of section.items) {
            const meta = [it.organization, it.location, it.dateRange].filter(Boolean).join(" · ");
            lines.push({ type: "subheading", text: it.title, meta: meta || undefined });
            it.bullets.forEach((b) => b.trim() && lines.push({ type: "bullet", text: b.trim() }));
          }
        }
        break;
      case "education":
        if (section.items.length) {
          lines.push({ type: "heading", text: section.heading });
          for (const it of section.items) {
            const meta = [it.institution, it.dateRange].filter(Boolean).join(" · ");
            lines.push({ type: "subheading", text: it.credential, meta: meta || undefined });
            it.bullets.forEach((b) => b.trim() && lines.push({ type: "bullet", text: b.trim() }));
          }
        }
        break;
      case "skills":
        if (section.items.length) {
          lines.push({ type: "heading", text: section.heading });
          lines.push({ type: "inline", text: section.items.join("  •  ") });
        }
        break;
    }
  }
  return lines;
}

export function headingText(raw: string, def: TemplateDefinition): string {
  return def.headingCase === "uppercase" ? raw.toUpperCase() : raw;
}
