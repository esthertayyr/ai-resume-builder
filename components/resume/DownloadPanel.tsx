"use client";

import { useState } from "react";
import { Button } from "@/components/ds";
import { downloadDocx, downloadPdf } from "@/lib/export";
import { track } from "@/lib/analytics";
import { SUPPORT_URL } from "@/lib/site";
import type { PaperSize, ResumeDocument, TemplateDefinition } from "@/lib/render/contract";

// The editorial close to the builder: "YOUR STORY IS READY". Both exports read the
// SAME shared render layer as the live preview, so the file matches what's on screen
// (selectable-text PDF via the browser's print pipeline; a real, editable .docx).
// The optional "Buy me a coffee" thank-you appears ONCE, only after a successful
// download, and never blocks the export.

export function DownloadPanel({
  doc,
  template,
  paper,
}: {
  doc: ResumeDocument;
  template: TemplateDefinition;
  paper: PaperSize;
}) {
  const [busy, setBusy] = useState<null | "docx" | "pdf">(null);
  const [error, setError] = useState<string | null>(null);
  // Flips true the first time any export succeeds; the thank-you then stays visible
  // but is never a gate — the file has already downloaded by the time it shows.
  const [downloaded, setDownloaded] = useState(false);

  async function handleDocx() {
    setError(null);
    setBusy("docx");
    try {
      await downloadDocx(doc, template, paper);
      track("resume_download", { format: "docx", template: template.id, paper });
      setDownloaded(true);
    } catch {
      setError("That download didn’t start. Please try again — your resume is safe.");
    } finally {
      setBusy(null);
    }
  }

  function handlePdf() {
    setError(null);
    // PDF goes through the browser's print dialog, so we can't detect success or
    // failure. Fire the intent event, reveal the thank-you, then open the dialog.
    track("resume_download", { format: "pdf", template: template.id, paper });
    setDownloaded(true);
    downloadPdf();
  }

  return (
    <section
      aria-labelledby="download-heading"
      className="no-print rounded-card border border-hair bg-surface p-6"
    >
      <p className="label-mono text-red">The last step</p>
      <h2 id="download-heading" className="mt-1 font-display text-display-sm font-semibold text-ink">
        Your story is ready.
      </h2>
      <p className="mt-2 max-w-prose text-muted">
        Take it with you. The PDF keeps its formatting and stays fully selectable — recruiters and
        applicant-tracking systems can read every word. The Word file is yours to keep editing.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={handlePdf} disabled={busy !== null}>
          Download PDF
        </Button>
        <Button size="lg" variant="secondary" onClick={handleDocx} disabled={busy !== null}>
          {busy === "docx" ? "Preparing…" : "Download Word (.docx)"}
        </Button>
        <span className="label-mono text-muted">
          {paper} · {template.name} template
        </span>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red" role="alert">
          {error}
        </p>
      )}

      {/* Optional, non-pressuring thank-you — only after a successful export, and
          only when a real support link is configured (never a fake payment link). */}
      {downloaded && SUPPORT_URL && (
        <div className="mt-6 border-t border-hair pt-5">
          <p className="text-ink">
            That’s it — you’ve done more than you thought. The Annotated Career is free, and always
            will be. If it helped, a coffee keeps it going.
          </p>
          <div className="mt-3">
            <Button href={SUPPORT_URL} external variant="secondary">
              ☕ Buy Me a Coffee →
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
