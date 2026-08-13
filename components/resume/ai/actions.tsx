"use client";

// The concrete editorial AI actions. Each is a self-contained inline expansion built on
// AIKit + the typed AI service. They only ever SUGGEST — accepting a suggestion is an
// explicit click, and the caller owns the mutation, so user content is never silently
// overwritten and the original stays recoverable.
import { useState } from "react";
import {
  lookCloser,
  improveExperience,
  discoverSkills,
  generateSummary,
  reviewResume,
  matchJob,
  type Finding,
  type ImproveSuggestion,
  type DiscoveredSkill,
  type SummaryOption,
  type ReviewFinding,
  type JobMatchResult,
} from "@/lib/ai/service";
import type { ResumeDocument } from "@/lib/render/contract";
import {
  resumeEvidence,
  evidenceStrings,
  reviewSections,
  summaryText,
  experienceText,
} from "@/lib/resume/aiInputs";
import { AIActionButton, AIPanel, AcceptRow, ConfidenceTag, LOADING, useAIAction } from "./AIKit";

// ---- LOOK CLOSER (single experience entry) --------------------------------
export function LookCloserAction({
  item,
  onAddSkills,
}: {
  item: { title?: string; organization?: string; bullets: string[] };
  onAddSkills: (names: string[]) => void;
}) {
  const a = useAIAction<Finding[]>();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const text = experienceText(item);
  const start = () => a.run(() => lookCloser(text));

  return (
    <div className="mt-2">
      <AIActionButton onClick={start} loading={a.status === "loading"} mark="✦">
        Look closer
      </AIActionButton>
      <AIPanel
        title="LOOK CLOSER"
        subtitle="I found a few things worth highlighting."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.lookCloser}
        onClose={a.reset}
        onRetry={start}
      >
        {(a.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink/70">Add a little more detail about what you actually did, and I'll look again.</p>
        ) : (
          <ul className="divide-y divide-hair">
            {a.data!.map((f, i) => (
              <li key={i} className="py-3 first:pt-0">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                  {f.skill}
                  <ConfidenceTag value={f.confidence} />
                </p>
                {f.evidence && <p className="mt-1 text-sm text-ink/80">Evidence: {f.evidence}</p>}
                {f.explanation && <p className="mt-0.5 text-xs text-muted">{f.explanation}</p>}
                <AcceptRow
                  accepted={added.has(f.skill)}
                  onAccept={() => {
                    onAddSkills([f.skill]);
                    setAdded((s) => new Set(s).add(f.skill));
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </AIPanel>
    </div>
  );
}

// ---- IMPROVE THIS (one bullet) --------------------------------------------
export function ImproveBulletAction({ value, onUse }: { value: string; onUse: (text: string) => void }) {
  const a = useAIAction<ImproveSuggestion[]>();
  const start = () => a.run(() => improveExperience(value));
  const disabled = !value.trim();

  return (
    <div>
      <AIActionButton onClick={start} loading={a.status === "loading"} disabled={disabled} mark="→">
        Improve this
      </AIActionButton>
      <AIPanel
        title="IMPROVE THIS"
        subtitle="Same facts — sharper wording. Your original stays until you choose."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.improve}
        onClose={a.reset}
        onRetry={start}
      >
        {(a.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink/70">There isn't enough here to sharpen yet — add a little more detail.</p>
        ) : (
          <ul className="space-y-3">
            {a.data!.map((s, i) => (
              <li key={i} className="rounded border border-hair bg-surface p-3">
                <p className="text-sm text-ink">{s.text}</p>
                {s.reason && <p className="mt-1 text-xs text-muted">{s.reason}</p>}
                <button
                  type="button"
                  onClick={() => {
                    onUse(s.text);
                    a.reset();
                  }}
                  className="mt-2 rounded border border-red bg-red px-2.5 py-1 text-xs font-semibold text-paper transition hover:bg-[#CC2E3A]"
                >
                  Use this
                </button>
              </li>
            ))}
          </ul>
        )}
      </AIPanel>
    </div>
  );
}

// ---- DISCOVER SKILLS (whole resume) ---------------------------------------
export function DiscoverSkillsAction({
  doc,
  onAddSkills,
}: {
  doc: ResumeDocument;
  onAddSkills: (names: string[]) => void;
}) {
  const a = useAIAction<DiscoveredSkill[]>();
  const [added, setAdded] = useState<Set<string>>(new Set());
  const start = () => a.run(() => discoverSkills(resumeEvidence(doc)));

  return (
    <div className="mt-3">
      <AIActionButton onClick={start} loading={a.status === "loading"} mark="✦">
        Discover skills
      </AIActionButton>
      <AIPanel
        title="LOOK CLOSER"
        subtitle="I found these skills in what you've already written."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.evidence}
        onClose={a.reset}
        onRetry={start}
      >
        {(a.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink/70">Add some experience and I'll look closer for the skills inside it.</p>
        ) : (
          <ul className="divide-y divide-hair">
            {a.data!.map((s, i) => (
              <li key={i} className="py-3 first:pt-0">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                  {s.name}
                  <ConfidenceTag value={s.confidence} />
                </p>
                <p className="mt-1 text-xs text-muted">Found in: {s.source}</p>
                {s.evidence && <p className="mt-0.5 text-sm text-ink/80">Evidence: {s.evidence}</p>}
                <AcceptRow
                  accepted={added.has(s.name)}
                  onAccept={() => {
                    onAddSkills([s.name]);
                    setAdded((set) => new Set(set).add(s.name));
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </AIPanel>
    </div>
  );
}

// ---- WRITE MY SUMMARY -----------------------------------------------------
export function WriteSummaryAction({ doc, onUse }: { doc: ResumeDocument; onUse: (text: string) => void }) {
  const a = useAIAction<SummaryOption[]>();
  const skillsSection = doc.sections.find((s) => s.kind === "skills");
  const strengths = skillsSection && skillsSection.kind === "skills" ? skillsSection.items.slice(0, 4) : [];
  const recent = doc.sections.find((s) => s.kind === "experience");
  const targetRole = recent && recent.kind === "experience" ? recent.items[0]?.title : undefined;
  const start = () =>
    a.run(() => generateSummary({ targetRole, level: "beginner", strengths: strengths.length ? strengths : evidenceStrings(doc).slice(0, 3) }));

  return (
    <div className="mt-2">
      <AIActionButton onClick={start} loading={a.status === "loading"} mark="✦">
        Write my summary
      </AIActionButton>
      <AIPanel
        title="WRITE MY SUMMARY"
        subtitle="Three angles, built only from what you've written. Nothing invented."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.summary}
        onClose={a.reset}
        onRetry={start}
      >
        {(a.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink/70">Add a little experience first, and I'll find the thread.</p>
        ) : (
          <ul className="space-y-3">
            {a.data!.map((s, i) => (
              <li key={i} className="rounded border border-hair bg-surface p-3">
                <p className="label-mono text-muted">{s.style}</p>
                <p className="mt-1 text-sm text-ink">{s.text}</p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onUse(s.text);
                      a.reset();
                    }}
                    className="rounded border border-red bg-red px-2.5 py-1 text-xs font-semibold text-paper transition hover:bg-[#CC2E3A]"
                  >
                    Use this
                  </button>
                  <button type="button" onClick={start} className="text-xs text-muted hover:text-ink">
                    Try another
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AIPanel>
    </div>
  );
}

// ---- REVIEW + JOB MATCH (resume-level) ------------------------------------
const REVIEW_GROUPS: { key: ReviewFinding["category"]; label: string }[] = [
  { key: "look_closer", label: "LOOK CLOSER" },
  { key: "needs_evidence", label: "NEEDS EVIDENCE" },
  { key: "already_strong", label: "ALREADY STRONG" },
  { key: "optional_improvement", label: "OPTIONAL IMPROVEMENT" },
];

export function ReviewResumeAction({ doc }: { doc: ResumeDocument }) {
  const a = useAIAction<ReviewFinding[]>();
  const start = () => a.run(() => reviewResume({ summary: summaryText(doc), sections: reviewSections(doc) }));

  return (
    <div>
      <AIActionButton onClick={start} loading={a.status === "loading"} mark="✦">
        Look closer at my resume
      </AIActionButton>
      <AIPanel
        title="AN EDITOR'S READ"
        subtitle="Notes in the margin — you decide what to change."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.review}
        onClose={a.reset}
        onRetry={start}
      >
        {(a.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink/70">Nothing jumps out yet — add a bit more and I'll read it again.</p>
        ) : (
          <div className="space-y-4">
            {REVIEW_GROUPS.map(({ key, label }) => {
              const items = a.data!.filter((f) => f.category === key);
              if (!items.length) return null;
              return (
                <div key={key}>
                  <p className="label-mono text-red">{label}</p>
                  <ul className="mt-1 space-y-2">
                    {items.map((f, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-semibold text-ink">{f.section}: </span>
                        <span className="text-ink/80">{f.issue}</span>
                        {f.suggestion && <span className="block text-xs text-muted">→ {f.suggestion}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </AIPanel>
    </div>
  );
}

const MATCH_GROUPS: { key: keyof JobMatchResult; label: string }[] = [
  { key: "strongMatches", label: "STRONG MATCHES" },
  { key: "lookCloser", label: "LOOK CLOSER" },
  { key: "possibleGaps", label: "POSSIBLE GAPS" },
  { key: "suggestions", label: "SUGGESTED IMPROVEMENTS" },
];

export function JobMatchAction({ doc }: { doc: ResumeDocument }) {
  const a = useAIAction<JobMatchResult>();
  const [jd, setJd] = useState("");
  const start = () => a.run(() => matchJob({ jobText: jd.trim(), evidence: evidenceStrings(doc) }));

  return (
    <div>
      <label className="label-mono block text-muted" htmlFor="jd">
        Paste a job description
      </label>
      <textarea
        id="jd"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={4}
        placeholder="Paste the job posting here…"
        className="mt-1 w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
      />
      <div className="mt-2">
        <AIActionButton onClick={start} loading={a.status === "loading"} disabled={jd.trim().length < 20} mark="✦">
          Compare with this job
        </AIActionButton>
      </div>
      <AIPanel
        title="TWO DOCUMENTS, SIDE BY SIDE"
        subtitle="Only what your resume actually evidences — never a claim you can't back up."
        status={a.status}
        errorKind={a.errorKind}
        loadingText={LOADING.job}
        onClose={a.reset}
        onRetry={start}
      >
        {a.data && (
          <div className="space-y-4">
            {MATCH_GROUPS.map(({ key, label }) => {
              const items = a.data![key];
              if (!items.length) return null;
              return (
                <div key={key}>
                  <p className="label-mono text-red">{label}</p>
                  <ul className="mt-1 space-y-1.5">
                    {items.map((m, i) => (
                      <li key={i} className="text-sm text-ink/80">
                        {m.text}
                        {m.evidence && <span className="block text-xs text-muted">— {m.evidence}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </AIPanel>
    </div>
  );
}
