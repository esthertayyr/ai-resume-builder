"use client";

import { saveAs } from "file-saver";
import type { PaperSize, ResumeDocument, TemplateDefinition } from "@/lib/render/contract";
import { buildDocxBlob } from "./docx";

function safeFileName(doc: ResumeDocument): string {
  const base = (doc.contact.name ?? "resume").trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  return base.length ? base : "resume";
}

/** Download a real, editable .docx built from the shared render layer. */
export async function downloadDocx(
  doc: ResumeDocument,
  template: TemplateDefinition,
  paper: PaperSize = "A4",
): Promise<void> {
  const blob = await buildDocxBlob(doc, template, paper);
  saveAs(blob, `${safeFileName(doc)}.docx`);
}

/**
 * PDF export via the browser's print pipeline. This prints the EXACT preview DOM
 * (RenderedResume), so the PDF is pixel-consistent with the preview, keeps selectable
 * text, and gets correct page breaks for free. The caller ensures only the resume page
 * is visible when printing (see the preview page's print CSS).
 */
export function downloadPdf(): void {
  if (typeof window !== "undefined") window.print();
}
