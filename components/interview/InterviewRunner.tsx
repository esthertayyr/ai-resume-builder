"use client";

import { useEffect, useState } from "react";
import { useInterview } from "@/lib/interview/useInterview";
import type { Script } from "@/lib/interview/types";

// Renders a Script through the shared engine. One question at a time. Offers Skip /
// I don't know / Not applicable / Go back / Edit per the question's allowed actions.
export function InterviewRunner({ script, onComplete }: { script: Script; onComplete: () => void }) {
  const iv = useInterview(script);
  const { question } = iv;

  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{ text: string; rationale?: string }[] | null>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (!question) return;
    const prior = iv.state.answers[question.id];
    setText(typeof prior?.value === "string" ? prior.value : "");
    setSelected(Array.isArray(prior?.value) ? (prior?.value as string[]) : []);
    setCustom("");
    setSuggestions(null);
    if (question.kind === "suggestion_multi" && question.loadSuggestions) {
      let cancelled = false;
      question.loadSuggestions({ answers: iv.state.answers }).then((s) => {
        if (!cancelled) setSuggestions(s);
      });
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  useEffect(() => {
    if (iv.finished) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iv.finished]);

  if (!iv.ready) return <div className="text-muted">Restoring where you left off…</div>;
  if (!question) return null;

  const allow = question.allow ?? {};
  const canSubmit =
    question.kind === "suggestion_multi"
      ? selected.length > 0
      : question.kind === "single_select"
        ? selected.length === 1
        : text.trim().length > 0;

  const fieldClass =
    "w-full rounded-xl border border-hair bg-white px-4 py-3.5 text-navy placeholder:text-muted/50 shadow-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="animate-fade-up">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        <span>
          Step {iv.step} of {iv.total}
        </span>
        {question.progressMessage ? (
          <span className="font-medium normal-case tracking-normal text-muted">{question.progressMessage}</span>
        ) : null}
      </div>

      <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">{question.prompt}</h2>
      {question.helper ? <p className="mt-3 text-muted">{question.helper}</p> : null}

      <div className="mt-6">
        {question.kind === "short_text" && (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={question.placeholder}
            className={fieldClass}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && iv.submit("answered", text.trim())}
          />
        )}

        {question.kind === "long_text" && (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`${fieldClass} resize-none`}
          />
        )}

        {question.kind === "single_select" && (
          <div className="grid gap-2.5">
            {question.options?.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelected([o.id])}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected[0] === o.id
                    ? "border-accent bg-accent/10 text-navy"
                    : "border-hair bg-white text-navy hover:border-accent/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {question.kind === "suggestion_multi" && (
          <div>
            <p className="mb-3 rounded-lg bg-sky/10 px-3 py-2 text-sm font-medium text-sky">
              These are suggestions. Select only what you actually did.
            </p>
            {suggestions === null ? (
              <p className="text-muted">Thinking of common tasks…</p>
            ) : (
              <div className="grid gap-2.5">
                {suggestions.map((s) => {
                  const on = selected.includes(s.text);
                  return (
                    <button
                      key={s.text}
                      onClick={() => setSelected((cur) => (on ? cur.filter((x) => x !== s.text) : [...cur, s.text]))}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        on ? "border-accent bg-accent/10" : "border-hair bg-white hover:border-accent/50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                          on ? "border-accent bg-accent text-white" : "border-muted/40"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span>
                        <span className="text-navy">{s.text}</span>
                        {s.rationale ? <span className="mt-0.5 block text-xs text-muted">{s.rationale}</span> : null}
                      </span>
                    </button>
                  );
                })}
                <div className="mt-1 flex gap-2">
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Add your own…"
                    className="flex-1 rounded-lg border border-hair bg-white px-3 py-2 text-sm text-navy placeholder:text-muted/50 focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const v = custom.trim();
                      if (v) {
                        setSuggestions((s) => [...(s ?? []), { text: v }]);
                        setSelected((cur) => [...cur, v]);
                        setCustom("");
                      }
                    }}
                    className="rounded-lg border border-hair px-3 py-2 text-sm text-muted hover:text-navy"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          disabled={!canSubmit}
          onClick={() =>
            iv.submit(
              "answered",
              question.kind === "single_select"
                ? selected[0]
                : question.kind === "suggestion_multi"
                  ? selected
                  : text.trim(),
            )
          }
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-soft transition-all hover:brightness-105 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>

        {allow.skip && <SecondaryAction label="Skip" onClick={() => iv.submit("skipped")} />}
        {allow.dont_know && <SecondaryAction label="I don't know" onClick={() => iv.submit("dont_know")} />}
        {allow.not_applicable && <SecondaryAction label="Not applicable" onClick={() => iv.submit("not_applicable")} />}
        {iv.canGoBack && allow.back !== false && <SecondaryAction label="← Go back" onClick={iv.back} />}
      </div>

      {question.kind !== "single_select" && (allow.skip || allow.dont_know) && (
        <p className="mt-4 text-sm text-muted">
          You don&apos;t remember the exact detail? That&apos;s okay. We won&apos;t make anything up.
        </p>
      )}
    </div>
  );
}

function SecondaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-navy">
      {label}
    </button>
  );
}
