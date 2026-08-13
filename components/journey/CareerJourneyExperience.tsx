"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ds";
import { Underline } from "@/components/ds/Annotation";
import { completeAI } from "@/lib/ai/client";
import {
  emptyDraft,
  loadDraft,
  makeId,
  saveDraft,
  type JourneyDraft,
} from "@/lib/journey/store";

// WE DON'T JUST BUILD RESUMES. WE REVEAL POTENTIAL.
// A 6-step story-telling flow (not a boring form). Uses the existing server-side
// AI seam (/api/ai via completeAI) for skill discovery. Every keystroke is saved
// locally, so an AI failure or refresh never loses the user's words.

const STEPS = [
  "Tell us what you've done",
  "Discover your skills",
  "Build your story",
  "Create your resume",
  "Prepare",
  "Next move",
] as const;

const PROMPTS = [
  "What jobs have you had?",
  "What have you done outside work?",
  "Have you helped a family business?",
  "Have you volunteered?",
  "Have you worked on school projects?",
  "Have you freelanced?",
  "Have you organized events?",
  "Have you managed social media?",
  "Have you cared for responsibilities that required planning?",
];

const GOALS = [
  "Get my first job",
  "Change careers",
  "Return to work",
  "Land an internship",
  "Find remote work",
  "Get promoted",
];

type Status = "idle" | "loading" | "error";

export function CareerJourneyExperience() {
  const [draft, setDraft] = useState<JourneyDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (hydrated) saveDraft(draft);
  }, [draft, hydrated]);

  const update = (patch: Partial<JourneyDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const canDiscover = draft.experiencesText.trim().length > 12;

  async function discoverSkills() {
    if (!canDiscover) return;
    setStatus("loading");
    try {
      // Split the free-form text into statements the seam can reason over.
      const statements = draft.experiencesText
        .split(/[\n.]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3);
      const res = await completeAI({
        task: "skills_discovery",
        input: { confirmedStatements: statements },
      });
      const found = res.suggestions.map((s) => s.text);
      // Merge with anything the user already added; de-dupe.
      const merged = Array.from(new Set([...draft.skills, ...found]));
      update({ skills: merged });
      setStatus("idle");
    } catch {
      // Never lose input — we only flag the failure and offer retry.
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
      {/* Philosophy line */}
      <p className="hand text-2xl text-red">We don&apos;t just build resumes.</p>
      <h1 className="mt-1 font-display text-display-md font-semibold text-ink">
        We reveal your <Underline>potential.</Underline>
      </h1>

      {/* Stepper */}
      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`label-mono rounded-pill border px-3 py-1.5 transition ${
                i === step
                  ? "border-red bg-red text-paper"
                  : i < step
                    ? "border-hair bg-surface text-ink"
                    : "border-hair bg-transparent text-muted"
              }`}
            >
              <span className="mr-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 min-h-[18rem]">
        {step === 0 && (
          <section aria-labelledby="s1">
            <h2 id="s1" className="font-display text-2xl font-semibold text-ink">
              Tell us what you&apos;ve done.
            </h2>
            <p className="mt-2 text-muted">
              In your own words — jobs, projects, volunteering, life. There are no wrong answers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    update({
                      experiencesText: (draft.experiencesText + (draft.experiencesText ? "\n" : "") + p + " ").slice(0, 4000),
                    })
                  }
                  className="rounded-pill border border-hair bg-surface px-3 py-1.5 text-sm text-ink transition hover:border-red hover:text-red"
                >
                  {p}
                </button>
              ))}
            </div>
            <label htmlFor="exp" className="sr-only">
              Your experiences
            </label>
            <textarea
              id="exp"
              value={draft.experiencesText}
              onChange={(e) => update({ experiencesText: e.target.value })}
              rows={8}
              placeholder="e.g. I worked part-time at a cafe taking orders and handling payments. I ran my school's fundraising event and managed the group's social media…"
              className="mt-4 w-full rounded-card border border-hair bg-surface p-4 text-ink outline-none focus:border-red"
            />
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!canDiscover}>
                Next: discover skills →
              </Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="s2">
            <h2 id="s2" className="font-display text-2xl font-semibold text-ink">
              Discover your skills.
            </h2>
            <p className="mt-2 text-muted">
              These come from what you told us. Add, edit, or remove any — you&apos;re in control.
            </p>

            {!canDiscover && draft.skills.length === 0 && (
              <div className="mt-6 rounded-card border border-dashed border-hair bg-warmgray p-6 text-muted">
                Tell us a little more in step 1 first, then we can reveal your skills.
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 rounded-card border border-red/40 bg-red/5 p-4 text-ink">
                <p className="font-medium">We couldn&apos;t reveal skills just now.</p>
                <p className="mt-1 text-sm text-muted">
                  Your words are safe. Please try again.
                </p>
                <Button variant="secondary" className="mt-3" onClick={discoverSkills}>
                  Retry
                </Button>
              </div>
            )}

            {canDiscover && draft.skills.length === 0 && status !== "error" && (
              <div className="mt-6">
                <Button onClick={discoverSkills} disabled={status === "loading"}>
                  {status === "loading" ? "Revealing…" : "Reveal my skills"}
                </Button>
              </div>
            )}

            {draft.skills.length > 0 && (
              <>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {draft.skills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 rounded-pill border border-hair bg-surface px-3 py-1.5 text-sm text-ink"
                    >
                      {skill}
                      <button
                        type="button"
                        aria-label={`Remove ${skill}`}
                        onClick={() => update({ skills: draft.skills.filter((s) => s !== skill) })}
                        className="text-muted hover:text-red"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <AddSkill onAdd={(s) => update({ skills: Array.from(new Set([...draft.skills, s])) })} />
                <div className="mt-4">
                  <Button variant="ghost" onClick={discoverSkills} disabled={status === "loading"}>
                    {status === "loading" ? "Revealing…" : "↻ Reveal more from my text"}
                  </Button>
                </div>
              </>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(2)}>Next: build your story →</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <StoryStep draft={draft} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}

        {step === 3 && (
          <section aria-labelledby="s4">
            <h2 id="s4" className="font-display text-2xl font-semibold text-ink">
              Create your resume.
            </h2>
            <p className="mt-2 text-muted">
              We&apos;ll carry your {draft.skills.length} skill{draft.skills.length === 1 ? "" : "s"} and{" "}
              {draft.stories.length} story item{draft.stories.length === 1 ? "" : "s"} into the resume builder.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/resume/builder">Open the resume builder →</Button>
              <Button href="/start" variant="secondary">
                Use the guided beginner flow
              </Button>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(4)}>Next: prepare →</Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="s5">
            <h2 id="s5" className="font-display text-2xl font-semibold text-ink">
              Prepare for opportunities.
            </h2>
            <p className="mt-2 text-muted">Practise the questions employers actually ask.</p>
            <ul className="mt-6 space-y-2 text-ink">
              {["Tell me about yourself", "Why should we hire you?", "Tell me about a time you solved a problem"].map(
                (q) => (
                  <li key={q} className="rounded-card border border-hair bg-surface p-4">
                    {q}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-6">
              <Button href="/interview">Practise interviews →</Button>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(5)}>Next: your next move →</Button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="s6">
            <h2 id="s6" className="font-display text-2xl font-semibold text-ink">
              Your next move.
            </h2>
            <p className="mt-2 text-muted">What are you working toward? We&apos;ll point the way.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update({ goal: g })}
                  aria-pressed={draft.goal === g}
                  className={`rounded-pill border px-4 py-2 text-sm transition ${
                    draft.goal === g
                      ? "border-red bg-red text-paper"
                      : "border-hair bg-surface text-ink hover:border-red"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {draft.goal && <NextSteps goal={draft.goal} />}
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(4)}>
                ← Back
              </Button>
              <Button href="/resume/builder">Build my resume →</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AddSkill({ onAdd }: { onAdd: (s: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (v) onAdd(v);
        setValue("");
      }}
    >
      <label htmlFor="add-skill" className="sr-only">
        Add a skill
      </label>
      <input
        id="add-skill"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a skill…"
        className="w-48 rounded-pill border border-hair bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-red"
      />
      <Button type="submit" variant="secondary" size="md">
        Add
      </Button>
    </form>
  );
}

function StoryStep({
  draft,
  update,
  onNext,
  onBack,
}: {
  draft: JourneyDraft;
  update: (p: Partial<JourneyDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const add = () =>
    update({ stories: [...draft.stories, { id: makeId(), title: "", detail: "" }] });

  return (
    <section aria-labelledby="s3">
      <h2 id="s3" className="font-display text-2xl font-semibold text-ink">
        Build your story.
      </h2>
      <p className="mt-2 text-muted">
        Turn each experience into a short, structured story. What did you do, and what came of it?
      </p>
      <div className="mt-6 space-y-4">
        {draft.stories.length === 0 && (
          <div className="rounded-card border border-dashed border-hair bg-warmgray p-6 text-muted">
            No stories yet. Add your first below.
          </div>
        )}
        {draft.stories.map((story, i) => (
          <div key={story.id} className="rounded-card border border-hair bg-surface p-4">
            <label htmlFor={`t-${story.id}`} className="sr-only">
              Story {i + 1} title
            </label>
            <input
              id={`t-${story.id}`}
              value={story.title}
              onChange={(e) =>
                update({
                  stories: draft.stories.map((s) => (s.id === story.id ? { ...s, title: e.target.value } : s)),
                })
              }
              placeholder="e.g. Cafe team member"
              className="w-full border-b border-hair bg-transparent pb-2 font-display text-lg text-ink outline-none focus:border-red"
            />
            <textarea
              value={story.detail}
              onChange={(e) =>
                update({
                  stories: draft.stories.map((s) => (s.id === story.id ? { ...s, detail: e.target.value } : s)),
                })
              }
              rows={2}
              placeholder="What you did and what came of it…"
              className="mt-3 w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => update({ stories: draft.stories.filter((s) => s.id !== story.id) })}
                className="text-sm text-muted hover:text-red"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" className="mt-4" onClick={add}>
        + Add a story
      </Button>
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext}>Next: create your resume →</Button>
      </div>
    </section>
  );
}

function NextSteps({ goal }: { goal: string }) {
  const steps = useMemo(() => {
    const base = ["Finish your resume", "Practise 3 interview questions"];
    const byGoal: Record<string, string[]> = {
      "Land an internship": ["Build an internship-focused resume", "List school projects and activities"],
      "Find remote work": ["Explore remote & VA guidance", "Write a strong application email"],
      "Change careers": ["Map transferable skills to the new field", "Draft a focused cover letter"],
    };
    return [...(byGoal[goal] ?? []), ...base];
  }, [goal]);

  return (
    <div className="mt-6 rounded-card border border-hair bg-surface p-6">
      <p className="label-mono text-red">Recommended next steps</p>
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s} className="flex items-start gap-2 text-ink">
            <span className="mt-1 text-red" aria-hidden>
              →
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
