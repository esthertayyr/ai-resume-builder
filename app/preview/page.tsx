"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { completeAI } from "@/lib/ai/client";
import type { AISuggestion } from "@/lib/ai/provider";
import { downloadDocx, downloadPdf } from "@/lib/export";
import { RenderedResume } from "@/lib/render/RenderedResume";
import { toResumeDocument } from "@/lib/render/toResumeDocument";
import { TEMPLATES, TEMPLATE_LIST, DEFAULT_TEMPLATE_ID } from "@/lib/render/templates";
import type { PaperSize, TemplateDefinition } from "@/lib/render/contract";
import { aiConfirmedFact, editFact } from "@/lib/profile/facts";
import { loadProfile, nowIso, saveProfile } from "@/lib/session/store";
import { completionPercent } from "@/lib/profile/factory";
import { strengthLabel } from "@/components/progress/MilestoneRail";
import { CompletionBanner } from "@/components/CompletionBanner";
import { AchievementDiscovery, type AchievementResult } from "@/components/discover/AchievementDiscovery";
import { attachAchievement, canRecordAchievements } from "@/lib/interview/achievements";
import type { MasterProfile } from "@/lib/profile/types";

export default function PreviewPage() {
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [templateId, setTemplateId] = useState<TemplateDefinition["id"]>(DEFAULT_TEMPLATE_ID);
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [busy, setBusy] = useState<null | "summary" | "skills">(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryOptions, setSummaryOptions] = useState<AISuggestion[] | null>(null);
  const [skillOptions, setSkillOptions] = useState<AISuggestion[] | null>(null);
  const [pickedSkills, setPickedSkills] = useState<string[]>([]);

  useEffect(() => setProfile(loadProfile()), []);

  const doc = useMemo(() => (profile ? toResumeDocument(profile) : null), [profile]);
  const template = TEMPLATES[templateId];

  function persist(next: MasterProfile) {
    saveProfile(next);
    setProfile({ ...next });
  }

  function confirmedStatements(p: MasterProfile): string[] {
    const s: string[] = [];
    p.projects.forEach((pr) => {
      if (pr.description) s.push(pr.description.value);
      pr.highlights.forEach((h) => s.push(h.value));
    });
    p.experience.forEach((e) => e.responsibilities.forEach((r) => s.push(r.value)));
    return s;
  }

  async function generateSummary() {
    if (!profile) return;
    setBusy("summary");
    setError(null);
    try {
      const res = await completeAI({
        task: "summary_options",
        input: {
          targetRole: profile.targetRole?.value.title ?? "a new role",
          level: profile.progress.path === "experienced" ? "experienced" : "beginner",
          strengths: profile.skills.map((s) => s.value),
        },
      });
      setSummaryOptions(res.suggestions);
    } catch {
      setError("We couldn't generate a summary just now. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function chooseSummary(s: AISuggestion) {
    if (!profile) return;
    const next = { ...profile, summary: aiConfirmedFact(s.text, s.text, nowIso()) };
    next.progress.milestones.career_story.status = "complete";
    persist(next);
    setSummaryOptions(null);
  }

  function editSummary(text: string) {
    if (!profile?.summary) return;
    persist({ ...profile, summary: editFact(profile.summary, text, nowIso()) });
  }

  async function discoverSkills() {
    if (!profile) return;
    setBusy("skills");
    setError(null);
    try {
      const res = await completeAI({
        task: "skills_discovery",
        input: { confirmedStatements: confirmedStatements(profile) },
      });
      setSkillOptions(res.suggestions);
      setPickedSkills([]);
    } catch {
      setError("We couldn't find skills just now. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function confirmSkills() {
    if (!profile || !skillOptions) return;
    const chosen = skillOptions.filter((s) => pickedSkills.includes(s.text));
    const facts = chosen.map((s) => aiConfirmedFact(s.text, s.text, nowIso()));
    const next = { ...profile, skills: [...profile.skills, ...facts] };
    if (facts.length) next.progress.milestones.skills_confirmed.status = "complete";
    persist(next);
    setSkillOptions(null);
  }

  function recordAchievement({ text, original, edited }: AchievementResult) {
    if (!profile) return;
    const now = nowIso();
    // Edited: keep the AI wording as originalSuggestion, flag the user's change.
    // As-is: confirmed AI wording. Either way the source detail came from the user.
    const fact = edited
      ? editFact(aiConfirmedFact(original, original, now), text, now)
      : aiConfirmedFact(text, original, now);
    persist(attachAchievement(profile, fact, now));
  }

  function markResumeReady() {
    if (!profile || profile.progress.milestones.resume_ready.status === "complete") return;
    const next = { ...profile };
    next.progress.milestones.resume_ready.status = "complete";
    persist(next);
  }

  if (!profile || !doc) {
    return <main className="flex min-h-screen items-center justify-center text-muted">Loading your resume…</main>;
  }

  const percent = completionPercent(profile);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <aside className="no-print order-2 space-y-5 lg:order-1">
        <div>
          <Link href="/interview" className="text-sm text-muted hover:text-navy">
            ← Return to the coach
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy">Your resume</h1>
          <p className="mt-1 text-sm text-muted">
            Profile strength: <span className="font-semibold text-accent">{strengthLabel(percent)}</span> · {percent}%
          </p>
        </div>

        {percent === 100 ? <CompletionBanner profile={profile} /> : null}

        {error ? <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}

        <Panel title="Professional summary">
          {profile.summary ? (
            <>
              <textarea
                value={profile.summary.value}
                onChange={(e) => editSummary(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-hair bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">
                {profile.summary.editedByUser ? "Edited by you" : "AI-suggested, confirmed by you"}
              </p>
            </>
          ) : summaryOptions ? (
            <div className="space-y-2">
              {summaryOptions.map((o, i) => (
                <button
                  key={i}
                  onClick={() => chooseSummary(o)}
                  className="w-full rounded-lg border border-hair bg-white p-3 text-left text-sm text-navy hover:border-accent/60 hover:shadow-soft"
                >
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-accent">
                    {(o.meta?.style as string) ?? "Option"}
                  </span>
                  {o.text}
                </button>
              ))}
            </div>
          ) : (
            <ActionButton onClick={generateSummary} loading={busy === "summary"} label="Generate summary" />
          )}
        </Panel>

        <Panel title="Skills">
          {skillOptions ? (
            skillOptions.length === 0 ? (
              <p className="text-sm text-muted">
                We didn&apos;t find enough detail yet. Add more about what you did, then try again.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="rounded bg-sky/10 px-2 py-1.5 text-xs font-medium text-sky">
                  ✦ We found some skills in what you told us. Confirm the ones that fit.
                </p>
                {skillOptions.map((s) => {
                  const on = pickedSkills.includes(s.text);
                  return (
                    <button
                      key={s.text}
                      onClick={() => setPickedSkills((c) => (on ? c.filter((x) => x !== s.text) : [...c, s.text]))}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        on ? "border-accent bg-accent/10 text-navy" : "border-hair text-navy"
                      }`}
                    >
                      {s.text}
                      {s.rationale ? <span className="mt-0.5 block text-xs text-muted">{s.rationale}</span> : null}
                    </button>
                  );
                })}
                <ActionButton
                  onClick={confirmSkills}
                  disabled={pickedSkills.length === 0}
                  label={`Add ${pickedSkills.length || ""} skill${pickedSkills.length === 1 ? "" : "s"}`}
                />
              </div>
            )
          ) : (
            <>
              {profile.skills.length > 0 && (
                <p className="mb-2 text-sm text-navy">{profile.skills.map((s) => s.value).join(", ")}</p>
              )}
              <ActionButton onClick={discoverSkills} loading={busy === "skills"} label="Find my skills" />
            </>
          )}
        </Panel>

        {canRecordAchievements(profile) ? (
          <Panel title="Achievements">
            <p className="mb-3 text-xs text-muted">
              A few quick questions. Anything you confirm is added to your most recent experience.
            </p>
            <AchievementDiscovery onConfirm={recordAchievement} onDone={() => {}} />
          </Panel>
        ) : null}

        <Panel title="Template">
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATE_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`rounded-lg border px-2 py-2 text-xs ${
                  templateId === t.id ? "border-accent bg-accent/10 text-navy" : "border-hair text-muted"
                }`}
                title={t.description}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {(["A4", "Letter"] as PaperSize[]).map((p) => (
              <button
                key={p}
                onClick={() => setPaper(p)}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  paper === p ? "border-accent bg-accent/10 text-navy" : "border-hair text-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Download">
          <div className="flex gap-2">
            <button
              onClick={() => {
                markResumeReady();
                downloadPdf();
              }}
              className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:brightness-105"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                markResumeReady();
                if (doc) downloadDocx(doc, template, paper);
              }}
              className="flex-1 rounded-full border border-hair bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent/50"
            >
              Download Word
            </button>
          </div>
        </Panel>
      </aside>

      {/* Preview — this exact element is what prints (Prompt 15b/17 parity) */}
      <section className="order-1 flex justify-center lg:order-2">
        <div className="rounded-xl bg-white shadow-lift">
          <RenderedResume doc={doc} template={template} paper={paper} />
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hair bg-white p-4 shadow-soft">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
      {children}
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  loading,
  disabled,
}: {
  onClick: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full rounded-full border border-hair bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-accent/50 disabled:opacity-40"
    >
      {loading ? "Working…" : label}
    </button>
  );
}
