"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ds";
import { analyzeResume, type AtsReport, type CheckResult, type CheckStatus } from "@/lib/ats/analyze";
import { flatten } from "@/lib/render/contract";
import { loadResumes, type StoredResume } from "@/lib/resume/store";

// The ATS Resume Checker. Analysis is deterministic and runs entirely in the
// browser (see lib/ats/analyze) — nothing is uploaded or stored. We surface
// readability & relevance issues; we never claim a resume "will pass ATS".

function docToText(r: StoredResume): string {
  return flatten(r.doc)
    .map((l) => {
      if (l.type === "subheading") return `${l.text}${l.meta ? " — " + l.meta : ""}`;
      if (l.type === "bullet") return `• ${l.text}`;
      return l.text;
    })
    .join("\n");
}

export function AtsChecker() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [report, setReport] = useState<AtsReport | null>(null);
  const [saved, setSaved] = useState<StoredResume[]>([]);

  useEffect(() => {
    setSaved(loadResumes());
  }, []);

  const canRun = resumeText.trim().length > 40;

  function run() {
    if (!canRun) return;
    setReport(analyzeResume(resumeText, jobText));
  }

  function loadFrom(id: string) {
    const r = saved.find((x) => x.id === id);
    if (r) {
      setResumeText(docToText(r));
      setReport(null);
    }
  }

  return (
    <div className="mx-auto max-w-content px-5 py-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-5">
          {saved.length > 0 && (
            <div className="rounded-card border border-hair bg-surface p-4">
              <label htmlFor="ats-load" className="label-mono block text-muted">
                Use one of your saved resumes
              </label>
              <div className="mt-2 flex gap-2">
                <select
                  id="ats-load"
                  defaultValue=""
                  onChange={(e) => e.target.value && loadFrom(e.target.value)}
                  className="flex-1 rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink"
                >
                  <option value="" disabled>
                    Choose a resume…
                  </option>
                  {saved.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="ats-resume" className="label-mono block text-muted">
              Paste your resume text
            </label>
            <textarea
              id="ats-resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={14}
              placeholder="Paste the plain text of your resume here. Nothing is uploaded — the check runs in your browser."
              className="mt-2 w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
            />
          </div>

          <div>
            <label htmlFor="ats-job" className="label-mono block text-muted">
              Optional: paste the job description
            </label>
            <p className="mt-1 text-sm text-muted">
              Add it to check how well your resume reflects the terms this role actually uses.
            </p>
            <textarea
              id="ats-job"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={6}
              placeholder="Paste the job posting here (optional)."
              className="mt-2 w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={run} disabled={!canRun}>
              Check my resume
            </Button>
            {!canRun && <span className="text-sm text-muted">Add a bit more text to run the check.</span>}
          </div>
          <p className="text-xs text-muted">
            Your resume is analysed locally in your browser and is not uploaded or stored.
          </p>
        </div>

        {/* Results */}
        <div aria-live="polite">
          {!report ? (
            <div className="rounded-card border border-dashed border-hair bg-surface p-8 text-center text-muted">
              <p className="font-display text-lg text-ink">Your results will appear here.</p>
              <p className="mt-2 text-sm">
                We identify common ATS readability and relevance issues — we can&rsquo;t promise any
                specific system will accept a resume, and neither can anyone else.
              </p>
            </div>
          ) : (
            <Results report={report} />
          )}
        </div>
      </div>
    </div>
  );
}

function Results({ report }: { report: AtsReport }) {
  return (
    <div className="space-y-6">
      {/* Overall assessment */}
      <div className="rounded-card border border-hair bg-surface p-5">
        <p className="label-mono text-muted">Overall assessment</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-display text-display-sm font-semibold text-ink">
            {report.checksPassed}/{report.checksTotal}
          </span>
          <span className="text-muted">checks clear</span>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-warmgray"
          role="progressbar"
          aria-valuenow={report.readinessScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Share of readability checks passed"
        >
          <div className="h-full rounded-pill bg-red" style={{ width: `${report.readinessScore}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted">
          This is a readability and relevance summary, not a pass/fail verdict. Use the notes below to
          make your resume easier for both software and people to read.
        </p>
      </div>

      {report.keywordMatch && (
        <div className="rounded-card border border-hair bg-surface p-5">
          <p className="label-mono text-muted">Keyword relevance</p>
          <p className="mt-2 text-ink">
            <span className="font-display text-2xl font-semibold">{report.keywordMatch.percent}%</span>{" "}
            of the job description&rsquo;s frequent terms appear in your resume.
          </p>
          {report.keywordMatch.missing.length > 0 && (
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-ink">Worth considering (only if true of you):</span>{" "}
              {report.keywordMatch.missing.slice(0, 10).join(", ")}
            </p>
          )}
        </div>
      )}

      {report.strengths.length > 0 && (
        <ResultGroup title="Strengths" items={report.strengths} />
      )}
      {report.issues.length > 0 && (
        <ResultGroup title="Issues to review" items={report.issues} />
      )}

      {report.suggestions.length > 0 && (
        <div className="rounded-card border border-hair bg-warmgray p-5">
          <p className="label-mono text-muted">Suggestions</p>
          <ul className="mt-3 space-y-2">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink">
                <span className="hand text-lg leading-none text-red" aria-hidden>
                  →
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Status is conveyed by symbol + word + which group it's in — never colour alone.
// Text shades are darkened from the brand pastels so they still meet WCAG AA
// contrast on a light background.
const STATUS_META: Record<CheckStatus, { label: string; symbol: string; className: string }> = {
  good: { label: "Good", symbol: "✓", className: "text-[#43704F]" },
  warn: { label: "Review", symbol: "!", className: "text-[#8A6A2E]" },
  risk: { label: "Fix", symbol: "×", className: "text-red" },
};

function ResultGroup({ title, items }: { title: string; items: CheckResult[] }) {
  return (
    <div className="rounded-card border border-hair bg-surface p-5">
      <p className="label-mono text-muted">{title}</p>
      <ul className="mt-3 divide-y divide-hair">
        {items.map((c) => {
          const meta = STATUS_META[c.status];
          return (
            <li key={c.id} className="flex gap-3 py-3">
              {/* status uses symbol + text label, never colour alone */}
              <span className={`mt-0.5 font-bold ${meta.className}`} aria-hidden>
                {meta.symbol}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {c.label}{" "}
                  <span className={`text-xs font-normal ${meta.className}`}>· {meta.label}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted">{c.detail}</p>
                {c.suggestion && (
                  <p className="mt-1 text-sm text-ink">
                    <span className="text-red">Tip:</span> {c.suggestion}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
