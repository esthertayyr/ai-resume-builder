"use client";

import { useState } from "react";
import { completeAI } from "@/lib/ai/client";
import {
  cardsFromSuggestions,
  confirmedCount,
  userAddedCard,
  type ResponsibilityCard,
} from "@/lib/interview/responsibility";

type Step = "role" | "unpacking" | "cards";

export interface DiscoveryResult {
  jobTitle: string;
  where: string;
  cards: ResponsibilityCard[];
}

export function ResponsibilityDiscovery({
  onComplete,
  onSkip,
}: {
  onComplete: (result: DiscoveryResult) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState<Step>("role");
  const [jobTitle, setJobTitle] = useState("");
  const [where, setWhere] = useState("");
  const [cards, setCards] = useState<ResponsibilityCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [own, setOwn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function unpack(e: React.FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setError(null);
    setStep("unpacking"); // shows the "That counts." moment while we fetch
    try {
      const res = await completeAI({
        task: "responsibility_suggestions",
        input: { jobTitle: jobTitle.trim() },
      });
      setCards(cardsFromSuggestions(res.suggestions));
      setStep("cards");
    } catch {
      setError("We couldn't load suggestions just now. You can add your own instead.");
      setCards([]);
      setStep("cards");
    }
  }

  function setState(id: string, updater: (c: ResponsibilityCard) => ResponsibilityCard) {
    setCards((cs) => cs.map((c) => (c.id === id ? updater(c) : c)));
  }

  function toggleConfirm(c: ResponsibilityCard) {
    if (c.state === "confirmed" || c.state === "edited") {
      setState(c.id, (x) => ({ ...x, state: x.userAdded ? "rejected" : "suggested" }));
    } else {
      setState(c.id, (x) => ({ ...x, state: "confirmed" }));
    }
  }

  function reject(c: ResponsibilityCard) {
    setState(c.id, (x) => ({ ...x, state: "rejected" }));
  }

  function startEdit(c: ResponsibilityCard) {
    setEditingId(c.id);
    setEditText(c.text);
  }

  function saveEdit(c: ResponsibilityCard) {
    const text = editText.trim();
    setEditingId(null);
    if (!text) return;
    setState(c.id, (x) => ({
      ...x,
      text,
      // Editing an AI suggestion marks it EDITED (confirmed + changed); editing your
      // own card just updates the text and stays confirmed.
      state: x.userAdded ? "confirmed" : "edited",
    }));
  }

  function addOwn() {
    const text = own.trim();
    if (!text) return;
    setCards((cs) => [...cs, userAddedCard(text, cs.length)]);
    setOwn("");
  }

  const visible = cards.filter((c) => c.state !== "rejected");
  const count = confirmedCount(cards);

  // ---- Step 1: name the role -------------------------------------------------
  if (step === "role") {
    return (
      <form onSubmit={unpack} className="animate-fade-up">
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Have you had a job, even a simple one?
        </h1>
        <p className="mt-3 text-muted">
          A cafe, a shop, helping a family business, virtual assistant work — it all counts. Tell us the role and
          we&apos;ll help you describe it.
        </p>

        <label className="mt-8 block text-sm font-semibold text-navy" htmlFor="role">
          What was the role?
        </label>
        <input
          id="role"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Virtual Assistant, Cashier, Cafe crew"
          className="mt-2 w-full rounded-2xl border border-hair bg-white px-4 py-3 text-navy shadow-soft placeholder:text-muted/50 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          autoFocus
        />

        <label className="mt-5 block text-sm font-semibold text-navy" htmlFor="where">
          Where was this? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="where"
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder="e.g. a local cafe, my family's shop"
          className="mt-2 w-full rounded-2xl border border-hair bg-white px-4 py-3 text-navy shadow-soft placeholder:text-muted/50 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!jobTitle.trim()}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Unpack it
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full px-4 py-3 font-medium text-muted hover:text-navy"
          >
            I don&apos;t have a job to add
          </button>
        </div>
      </form>
    );
  }

  // ---- Step 2: "That counts." moment ----------------------------------------
  if (step === "unpacking") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center" aria-live="polite">
        <p className="animate-word-in font-display text-5xl font-extrabold tracking-tight text-navy sm:text-6xl">
          That counts.
        </p>
        <p className="animate-fade-in mt-4 text-muted [animation-delay:300ms]">
          Nice. Let&apos;s unpack what you actually did…
        </p>
      </div>
    );
  }

  // ---- Step 3: discovery cards ----------------------------------------------
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-bold text-navy sm:text-3xl">What did you usually help with?</h1>
      <p className="mt-2 rounded-xl bg-sky/10 px-3 py-2 text-sm font-medium text-sky">
        These are suggestions. Select only what you actually did — nothing is added until you confirm it.
      </p>
      {error ? <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {visible.map((c) => {
          const on = c.state === "confirmed" || c.state === "edited";
          const editing = editingId === c.id;
          return (
            <li key={c.id}>
              {editing ? (
                <div className="rounded-2xl border border-accent bg-white p-4 shadow-soft">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-lg border border-hair px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => saveEdit(c)}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-navy"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`group flex h-full flex-col rounded-2xl border p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
                    on ? "border-mint bg-mint/10 ring-1 ring-mint" : "border-hair bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleConfirm(c)}
                    aria-pressed={on}
                    className="flex items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-xs ${
                        on ? "border-mint bg-mint text-white" : "border-hair text-transparent"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium text-navy">
                      {c.text}
                      {c.state === "edited" ? <span className="ml-1 text-xs text-muted">(edited)</span> : null}
                    </span>
                  </button>
                  <div className="mt-3 flex gap-3 pl-8 text-xs">
                    <button onClick={() => startEdit(c)} className="text-muted hover:text-accent">
                      Edit
                    </button>
                    <button onClick={() => reject(c)} className="text-muted hover:text-coral">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add your own */}
      <div className="mt-5 flex flex-wrap gap-2">
        <input
          value={own}
          onChange={(e) => setOwn(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOwn();
            }
          }}
          placeholder="Add something you did that isn't listed"
          className="min-w-[220px] flex-1 rounded-full border border-hair bg-white px-4 py-2.5 text-sm text-navy placeholder:text-muted/50 focus:border-accent focus:outline-none"
        />
        <button
          onClick={addOwn}
          disabled={!own.trim()}
          className="rounded-full border border-hair bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent/50 disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => onComplete({ jobTitle, where, cards })}
          disabled={count === 0}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-soft transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          {count > 0 ? `Add ${count} to my experience` : "Select what you did"}
        </button>
        <button onClick={onSkip} className="rounded-full px-4 py-3 font-medium text-muted hover:text-navy">
          None of these
        </button>
        {count > 0 ? (
          <span className="animate-pop label-mono text-mint" aria-live="polite">
            ✦ {count} confirmed
          </span>
        ) : null}
      </div>
    </div>
  );
}
