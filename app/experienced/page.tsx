"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Faster path for people who know their experience (Prompt 8). MVP: paste text or
// upload a file (validated per Prompt 19). Full extraction into the profile is the
// next increment — it will route pasted/parsed content through the AIProvider
// "extract_resume" task, then a review-and-confirm screen (no auto-facts).

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function ExperiencedPage() {
  const router = useRouter();
  const [pasted, setPasted] = useState("");
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    setFileNote(null);
    const f = e.target.files?.[0];
    if (!f) return;
    // Validate BEFORE any parsing (Prompt 19): type + size, reject anything unexpected.
    const okType = ALLOWED.includes(f.type) || /\.(pdf|docx)$/i.test(f.name);
    if (!okType) {
      setFileError("Please upload a PDF or Word (.docx) file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("That file is larger than 5 MB. Please upload a smaller file.");
      return;
    }
    setFileNote(`Ready: ${f.name}. Structured import is coming next — for now, paste the text below or continue guided.`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">Great — let&apos;s move faster.</h1>
      <p className="mt-3 text-muted">
        Upload your existing resume or paste it below. We&apos;ll pull out the details and show you a review screen before
        anything is used — nothing is added without your confirmation.
      </p>

      <div className="mt-8 space-y-4">
        <label className="block rounded-2xl border border-dashed border-hair bg-white p-6 text-center shadow-soft">
          <input type="file" accept=".pdf,.docx" onChange={onFile} className="hidden" />
          <span className="cursor-pointer font-semibold text-accent">Upload PDF or Word</span>
          <span className="mt-1 block text-xs text-muted">Max 5 MB. PDF or .docx only.</span>
        </label>
        {fileError ? <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{fileError}</p> : null}
        {fileNote ? <p className="rounded-lg bg-sky/10 px-3 py-2 text-sm text-sky">{fileNote}</p> : null}

        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={6}
          placeholder="…or paste your resume text here"
          className="w-full resize-none rounded-2xl border border-hair bg-white px-4 py-3 text-navy placeholder:text-muted/50 shadow-soft focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/preview")}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-soft hover:brightness-105"
        >
          Continue to review
        </button>
        <button
          onClick={() => router.push("/interview")}
          className="rounded-full border border-hair bg-white px-6 py-3 font-semibold text-navy hover:border-accent/50"
        >
          Guide me more
        </button>
      </div>
    </main>
  );
}
