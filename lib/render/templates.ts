import type { TemplateDefinition } from "./contract";

// Three ATS-safe templates (Prompt 15). All single-column, standard headings,
// selectable text, no skill bars, no info locked in graphics. They differ only in
// typographic tokens — defined once here and read by every render path (Prompt 15b).

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
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

export const DEFAULT_TEMPLATE_ID: TemplateDefinition["id"] = "clean";
