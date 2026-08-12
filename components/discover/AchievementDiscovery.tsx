"use client";

import { useState } from "react";
import { completeAI } from "@/lib/ai/client";
import { ACHIEVEMENT_QUESTIONS } from "@/lib/interview/achievements";

export interface AchievementResult {
  text: string;
  original: string;
  edited: boolean;
}

type Phase = "ask" | "describe" | "confirm" | "done";

// One gentle question at a time. A "yes" opens a follow-up; the follow-up is polished
// by the AI (wording only) and shown back for confirmation. Nothing is recorded until
// the user confirms. "Not really" simply moves on — having no achievements is fine.
export function AchievementDiscovery({
  onConfirm,
  onDone,
}: {
  onConfirm: (result: AchievementResult) => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [detail, setDetail] = useState("");
  const [polished, setPolished] = useState("");
  const [editText, setEditText] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recorded, setRecorded] = useState(0);

  const q = ACHIEVEMENT_QUESTIONS[index];

  function nextQuestion() {
    setDetail("");
    setPolished("");
    setEditing(false);
    if (index + 1 < ACHIEVEMENT_QUESTIONS.length) {
      setIndex((i) => i + 1);
      setPhase("ask");
    } else {
      setPhase("done");
      onDone();
    }
  }

  async function submitDetail() {
    if (!detail.trim()) return;
    setBusy(true);
    try {
      const res = await completeAI({ task: "achievement_wording", input: { description: detail.trim() } });
      // Wording only — if the model gives nothing usable, fall back to the user's text.
      setPolished(res.suggestions[0]?.text ?? detail.trim());
    } catch {
      setPolished(detail.trim());
    } finally {
      setBusy(false);
      setPhase("confirm");
    }
  }

  function confirm(text: string, edited: boolean) {
    onConfirm({ text, original: polished, edited });
    setRecorded((n) => n + 1);
    nextQuestion();
  }

  if (phase === "done") {
    return (
      <p className="text-sm text-muted">
        {recorded > 0
          ? `Added ${recorded} achievement${recorded === 1 ? "" : "s"}. You can run this again anytime.`
          : "No problem — not everyone has these to list, and that's completely fine."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Question {index + 1} of {ACHIEVEMENT_QUESTIONS.length}. We won&apos;t invent anything — this only uses what you
        tell us.
      </p>

      {phase === "ask" && (
        <>
          <p className="text-sm font-medium text-navy">{q.question}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPhase("describe")}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
            >
              Yes
            </button>
            <button
              onClick={nextQuestion}
              className="rounded-full border border-hair bg-white px-4 py-2 text-sm font-medium text-muted hover:text-navy"
            >
              Not really
            </button>
          </div>
        </>
      )}

      {phase === "describe" && (
        <>
          <p className="text-sm font-medium text-navy">{q.followup}</p>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            placeholder="In your own words. Don't worry about exact numbers — we won't make any up."
            className="w-full resize-none rounded-lg border border-hair bg-white px-3 py-2 text-sm text-navy placeholder:text-muted/50 focus:border-accent focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={submitDetail}
              disabled={!detail.trim() || busy}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-40"
            >
              {busy ? "Working…" : "See it written up"}
            </button>
            <button
              onClick={nextQuestion}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-navy"
            >
              Skip
            </button>
          </div>
        </>
      )}

      {phase === "confirm" && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-mint">Here&apos;s the wording</p>
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-accent bg-white px-3 py-2 text-sm text-navy focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="rounded-lg border border-hair bg-white px-3 py-2 text-sm text-navy">{polished}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <button
                onClick={() => confirm(editText.trim() || polished, true)}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
              >
                Save &amp; add
              </button>
            ) : (
              <>
                <button
                  onClick={() => confirm(polished, false)}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
                >
                  Add this
                </button>
                <button
                  onClick={() => {
                    setEditText(polished);
                    setEditing(true);
                  }}
                  className="rounded-full border border-hair bg-white px-4 py-2 text-sm font-medium text-navy hover:border-accent/50"
                >
                  Edit
                </button>
              </>
            )}
            <button onClick={nextQuestion} className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-navy">
              Not this one
            </button>
          </div>
        </>
      )}
    </div>
  );
}
