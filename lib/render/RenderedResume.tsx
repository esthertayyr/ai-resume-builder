import type { CSSProperties } from "react";
import { flatten, headingText, type PaperSize, type ResumeDocument, type TemplateDefinition } from "./contract";

// THE render layer. Both the preview (Prompt 14) and the print-to-PDF path (Prompt 17)
// mount this exact component, so what you see is what exports. DOCX reads the same
// flatten() output. No parallel renderer exists.

const PAPER: Record<PaperSize, { w: string; minH: string }> = {
  A4: { w: "210mm", minH: "297mm" },
  Letter: { w: "8.5in", minH: "11in" },
};

const SPACING: Record<TemplateDefinition["spacing"], { section: number; line: number }> = {
  tight: { section: 10, line: 3 },
  normal: { section: 14, line: 4 },
  roomy: { section: 18, line: 5 },
};

export function RenderedResume({
  doc,
  template,
  paper = "A4",
}: {
  doc: ResumeDocument;
  template: TemplateDefinition;
  paper?: PaperSize;
}) {
  const lines = flatten(doc);
  const paperDims = PAPER[paper];
  const sp = SPACING[template.spacing];
  const fontFamily =
    template.bodyFont === "serif"
      ? 'Georgia, "Times New Roman", serif'
      : 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const page: CSSProperties = {
    width: paperDims.w,
    minHeight: paperDims.minH,
    padding: "16mm 15mm",
    background: "#ffffff",
    color: "#111827",
    fontFamily,
    fontSize: "10.5pt",
    lineHeight: 1.4,
    boxSizing: "border-box",
  };

  return (
    <div className="print-page" style={page} data-paper={paper} data-template={template.id}>
      {lines.map((line, i) => {
        switch (line.type) {
          case "name":
            return (
              <div
                key={i}
                style={{
                  fontSize: "20pt",
                  fontWeight: 700,
                  textAlign: template.nameAlign,
                  color: template.accent,
                  letterSpacing: "0.2px",
                }}
              >
                {line.text}
              </div>
            );
          case "contact":
            return (
              <div
                key={i}
                style={{
                  textAlign: template.nameAlign,
                  color: "#4b5563",
                  fontSize: "9.5pt",
                  marginTop: 2,
                  marginBottom: sp.section,
                }}
              >
                {line.text}
              </div>
            );
          case "heading":
            return (
              <div
                key={i}
                style={{
                  marginTop: sp.section,
                  marginBottom: 4,
                  fontSize: "11pt",
                  fontWeight: 700,
                  color: template.accent,
                  borderBottom: template.headingRule ? `1px solid #e5e7eb` : "none",
                  paddingBottom: template.headingRule ? 2 : 0,
                }}
              >
                {headingText(line.text, template)}
              </div>
            );
          case "subheading":
            return (
              <div key={i} style={{ marginTop: 6, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontWeight: 600 }}>{line.text}</span>
                {line.meta ? <span style={{ color: "#6b7280", fontSize: "9.5pt", whiteSpace: "nowrap" }}>{line.meta}</span> : null}
              </div>
            );
          case "bullet":
            return (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: sp.line }}>
                <span style={{ color: template.accent }}>•</span>
                <span>{line.text}</span>
              </div>
            );
          case "paragraph":
            return (
              <p key={i} style={{ margin: `${sp.line}px 0 0` }}>
                {line.text}
              </p>
            );
          case "inline":
            return (
              <div key={i} style={{ marginTop: sp.line }}>
                {line.text}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
