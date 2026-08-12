import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { flatten, type PaperSize, type ResumeDocument, type TemplateDefinition } from "@/lib/render/contract";

// DOCX export (Prompt 17). Reads the SAME flatten() output as the preview/PDF, so
// content, order, and wording match by construction (Prompt 15b parity). Produces a
// real, editable .docx with selectable text — not a rasterized image.

// twips: 1 inch = 1440. A4 = 210x297mm, Letter = 8.5x11in.
const PAGE: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 11906, height: 16838 },
  Letter: { width: 12240, height: 15840 },
};

export async function buildDocxBlob(
  doc: ResumeDocument,
  template: TemplateDefinition,
  paper: PaperSize = "A4",
): Promise<Blob> {
  const lines = flatten(doc);
  const serif = template.bodyFont === "serif";
  const font = serif ? "Georgia" : "Calibri";
  const accentHex = template.accent.replace("#", "");

  const children: Paragraph[] = lines.map((line) => {
    switch (line.type) {
      case "name":
        return new Paragraph({
          alignment: template.nameAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: line.text, bold: true, size: 40, font, color: accentHex })],
        });
      case "contact":
        return new Paragraph({
          alignment: template.nameAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { after: 200 },
          children: [new TextRun({ text: line.text, size: 19, font, color: "4B5563" })],
        });
      case "heading":
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 60 },
          border: template.headingRule
            ? { bottom: { color: "E5E7EB", size: 6, style: "single", space: 1 } }
            : undefined,
          children: [
            new TextRun({
              text: template.headingCase === "uppercase" ? line.text.toUpperCase() : line.text,
              bold: true,
              size: 22,
              font,
              color: accentHex,
            }),
          ],
        });
      case "subheading":
        return new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: line.text, bold: true, size: 21, font }),
            ...(line.meta ? [new TextRun({ text: `   ${line.meta}`, size: 19, font, color: "6B7280" })] : []),
          ],
        });
      case "bullet":
        return new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ text: line.text, size: 21, font })],
        });
      case "paragraph":
      case "inline":
      default:
        return new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: line.text, size: 21, font })],
        });
    }
  });

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE[paper].width, height: PAGE[paper].height },
            margin: { top: 907, bottom: 907, left: 850, right: 850 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
