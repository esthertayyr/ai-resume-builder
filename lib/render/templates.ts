import type { TemplateDefinition } from "./contract";

// Six ATS-safe templates. All single-column, standard headings, selectable text,
// no skill bars, no info locked in graphics. They differ ONLY in typographic tokens
// — defined once here and read by every render path (Prompt 15b), so switching a
// template never touches resume data and never calls the AI. Accents stay in the
// cool/neutral family per the brand (no beige/brown/yellow).

export const TEMPLATES: Record<TemplateDefinition["id"], TemplateDefinition> = {
  clean: {
    id: "clean",
    name: "Clean",
    description: "Minimal and neutral. Safe for any employer or ATS.",
    headingCase: "uppercase",
    accent: "#1f2937",
    bodyFont: "sans",
    headingRule: true,
    nameAlign: "left",
    spacing: "normal",
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Contemporary with a restrained accent color.",
    headingCase: "uppercase",
    accent: "#4f46e5",
    bodyFont: "sans",
    headingRule: true,
    nameAlign: "left",
    spacing: "roomy",
  },
  executive: {
    id: "executive",
    name: "Executive",
    description: "Refined serif for senior and formal roles.",
    headingCase: "title",
    accent: "#111827",
    bodyFont: "serif",
    headingRule: false,
    nameAlign: "center",
    spacing: "normal",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Quiet and unadorned — no rules, tight spacing, all focus on the words.",
    headingCase: "title",
    accent: "#111318",
    bodyFont: "sans",
    headingRule: false,
    nameAlign: "left",
    spacing: "tight",
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    description: "The Annotated Career voice — serif body, signature-red headings.",
    headingCase: "uppercase",
    accent: "#E63946",
    bodyFont: "serif",
    headingRule: true,
    nameAlign: "left",
    spacing: "roomy",
  },
  creative: {
    id: "creative",
    name: "Creative",
    description: "A centered, airy layout with a cool teal accent for lighter fields.",
    headingCase: "uppercase",
    accent: "#0f766e",
    bodyFont: "sans",
    headingRule: true,
    nameAlign: "center",
    spacing: "roomy",
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

export const DEFAULT_TEMPLATE_ID: TemplateDefinition["id"] = "clean";
