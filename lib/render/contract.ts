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

// A certification / licence. Only `name` is required; every other field renders
// ONLY when the user filled it in. Nothing here is ever invented by the app or the
// AI — dates, credential numbers, and issuers come from the user alone.
export interface CertificationItem {
  name: string;
  issuingOrganization?: string;
  /** Optional ID/number exactly as issued. Never generated. */
  credentialNumber?: string;
  /** "YYYY-MM" (from a month picker) or free text; formatted for display. */
  issueDate?: string;
  /** "YYYY-MM" or free text. Ignored when doesNotExpire is true. */
  expiryDate?: string;
  /** When true, the credential has no expiry and expiryDate is not shown. */
  doesNotExpire?: boolean;
  verificationUrl?: string;
  description?: string;
  /** Skills this credential evidences (user-confirmed; feeds the Skills section). */
  relatedSkills?: string[];
}

export type ResumeSection =
  | { kind: "summary"; heading: string; text: string }
  | { kind: "experience"; heading: string; items: ExperienceItem[] }
  | { kind: "projects"; heading: string; items: ExperienceItem[] }
  | { kind: "education"; heading: string; items: EducationItem[] }
  | { kind: "skills"; heading: string; items: string[] }
  | { kind: "certifications"; heading: string; items: CertificationItem[] };

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
  | { type: "inline"; text: string }
  | { type: "note"; text: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-01" -> "Jan 2024". Leaves human/free-text values (e.g. "Jan 2024") as-is. */
export function formatMonth(v?: string): string {
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})$/.exec(v.trim());
  if (!m) return v.trim();
  const mi = parseInt(m[2], 10) - 1;
  return mi >= 0 && mi < 12 ? `${MONTHS[mi]} ${m[1]}` : v.trim();
}

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
      case "certifications": {
        const shown = section.items.filter((it) => it.name.trim());
        if (shown.length) {
          lines.push({ type: "heading", text: section.heading });
          for (const it of shown) {
            const dateText = it.doesNotExpire
              ? [formatMonth(it.issueDate) && `Issued ${formatMonth(it.issueDate)}`, "No expiry"]
                  .filter(Boolean)
                  .join(" · ")
              : [
                  formatMonth(it.issueDate) && `Issued ${formatMonth(it.issueDate)}`,
                  formatMonth(it.expiryDate) && `Expires ${formatMonth(it.expiryDate)}`,
                ]
                  .filter(Boolean)
                  .join(" · ");
            const meta = [it.issuingOrganization?.trim(), dateText].filter(Boolean).join(" · ");
            lines.push({ type: "subheading", text: it.name.trim(), meta: meta || undefined });
            if (it.credentialNumber?.trim())
              lines.push({ type: "note", text: `Credential ID: ${it.credentialNumber.trim()}` });
            if (it.description?.trim()) lines.push({ type: "note", text: it.description.trim() });
            if (it.relatedSkills?.length)
              lines.push({ type: "note", text: `Related skills: ${it.relatedSkills.join(", ")}` });
            if (it.verificationUrl?.trim())
              lines.push({ type: "note", text: `Verify: ${it.verificationUrl.trim()}` });
          }
        }
        break;
      }
    }
  }
  return lines;
}

export function headingText(raw: string, def: TemplateDefinition): string {
  return def.headingCase === "uppercase" ? raw.toUpperCase() : raw;
}
