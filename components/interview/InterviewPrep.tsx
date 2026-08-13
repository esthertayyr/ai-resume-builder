"use client";

import { useEffect, useState } from "react";
import { PREP_QUESTIONS, SELF_CHECK, STAR_STEPS, type PrepQuestion, type StarKey } from "@/lib/interview/prep";

// Interview practice. The user picks a question, reads the guidance, and drafts an
// answer (with a STAR scaffold for behavioural questions). Notes are saved locally.
// We deliberately provide a self-check the USER applies — never a fake AI score.

const KEY = "tac.interview.v1";

type Notes = Record<string, string>; // questionId -> free answer
type Stars = Record<string, Partial<Record<StarKey, string>>>;

export function InterviewPrep() {
  const [activeId, setActiveId] = useState<string>(PREP_QUESTIONS[0].id);
  const [notes, setNotes] = useState<Notes>({});
  const [stars, setStars] = useState<Stars>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { notes?: Notes; stars?: Stars };
        setNotes(parsed.notes ?? {});
        setStars(parsed.stars ?? {});
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify({ notes, stars }));
    }
  }, [notes, stars, hydrated]);

  const active = PREP_QUESTIONS.find((q) => q.id === activeId)!;

  return (
    <div className="mx-auto max-w-content px-5 py-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Question list */}
        <nav aria-label="Interview questions">
          <p className="label-mono text-muted">Questions</p>
          <ol className="mt-3 space-y-1">
            {PREP_QUESTIONS.map((q, i) => {
              const answered = (notes[q.id]?.trim().length ?? 0) > 0 || hasStar(stars[q.id]);
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(q.id)}
                    aria-current={q.id === activeId}
                    className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      q.id === activeId ? "bg-ink text-paper" : "text-ink hover:bg-warmgray"
                    }`}
                  >
                    <span className={q.id === activeId ? "text-paper/70" : "text-red"}>{i + 1}.</span>
                    <span className="flex-1">{q.question}</span>
                    {answered && (
                      <span className={q.id === activeId ? "text-paper" : "text-sage"} aria-label="drafted">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Active question */}
        <div>
          <QuestionPanel
            key={active.id}
            q={active}
            note={notes[active.id] ?? ""}
            star={stars[active.id] ?? {}}
            onNote={(v) => setNotes((n) => ({ ...n, [active.id]: v }))}
            onStar={(k, v) => setStars((s) => ({ ...s, [active.id]: { ...s[active.id], [k]: v } }))}
          />
        </div>
      </div>
    </div>
  );
}

function hasStar(s: Partial<Record<StarKey, string>> | undefined): boolean {
  return !!s && Object.values(s).some((v) => (v ?? "").trim().length > 0);
}

function QuestionPanel({
  q,
  note,
  star,
  onNote,
  onStar,
}: {
  q: PrepQuestion;
  note: string;
  star: Partial<Record<StarKey, string>>;
  onNote: (v: string) => void;
  onStar: (k: StarKey, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">{q.question}</h2>
        <p className="mt-2 text-sm text-muted">
          <span className="font-medium text-ink">Why they ask:</span> {q.why}
        </p>
        <div className="mt-3 rounded-card border border-hair bg-warmgray p-4 text-sm text-ink">
          <span className="hand text-lg text-red">Tip — </span>
          {q.guidance}
        </div>
      </div>

      {q.star && (
        <div className="rounded-card border border-hair bg-surface p-5">
          <p className="label-mono text-muted">Build it with STAR</p>
          <div className="mt-3 space-y-3">
            {STAR_STEPS.map((step) => (
              <div key={step.key}>
                <label htmlFor={`star-${step.key}`} className="text-sm font-medium text-ink">
                  {step.label} <span className="font-normal text-muted">— {step.hint}</span>
                </label>
                <textarea
                  id={`star-${step.key}`}
                  value={star[step.key] ?? ""}
                  onChange={(e) => onStar(step.key, e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-hair bg-paper p-2 text-sm text-ink outline-none focus:border-red"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="prep-answer" className="label-mono block text-muted">
          {q.star ? "Or write it out in full" : "Draft your answer"}
        </label>
        <textarea
          id="prep-answer"
          value={note}
          onChange={(e) => onNote(e.target.value)}
          rows={6}
          placeholder="Practise your answer here. It saves automatically."
          className="mt-2 w-full rounded-lg border border-hair bg-paper p-3 text-sm leading-relaxed text-ink outline-none focus:border-red"
        />
      </div>

      <div className="rounded-card border border-dashed border-hair p-5">
        <p className="label-mono text-muted">Check it yourself</p>
        <p className="mt-1 text-sm text-muted">
          We don&rsquo;t score answers — no tool can objectively judge an interview. Read yours aloud and
          check it against these:
        </p>
        <ul className="mt-3 space-y-2">
          {SELF_CHECK.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-0.5 text-red" aria-hidden>
                ▢
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
