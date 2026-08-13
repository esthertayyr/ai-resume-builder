"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ds";
import { completeAI } from "@/lib/ai/client";
import { loadDraft } from "@/lib/journey/store";

// Cover Letter Builder. The user supplies the target role, company, a few real
// strengths and why the role interests them; we assemble a structured draft they
// then edit. We never fabricate company facts or achievements, and we explicitly
// discourage sending the same letter to many employers.

type Status = "idle" | "loading" | "error";

export function CoverLetterBuilder() {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Offer the skills the user already discovered in the Career Journey as a
  // convenient (editable) starting set — real data, never invented.
  useEffect(() => {
    const d = loadDraft();
    if (d.skills.length) setStrengths(d.skills.slice(0, 4));
    if (d.goal) setMotivation((m) => m || "");
  }, []);

  async function generate() {
    if (!role.trim()) return;
    setStatus("loading");
    try {
      const res = await completeAI({
        task: "cover_letter",
        input: { role, company, name, motivation, strengths },
      });
      const text = res.suggestions.map((s) => s.text).join("\n\n");
      setDraft(text);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-content px-5 py-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="rounded-card border border-hair bg-warmgray p-4 text-sm text-muted">
            One letter, one role. A focused letter written for a specific job reads far better than a
            generic one sent everywhere — so tailor this to the role in front of you.
          </div>

          <TextField label="Target role" value={role} onChange={setRole} placeholder="e.g. Administrative Assistant" required />
          <TextField label="Company (optional)" value={company} onChange={setCompany} placeholder="e.g. Riverside Clinic" />
          <TextField label="Your name (optional)" value={name} onChange={setName} placeholder="e.g. Jordan Lee" />

          <div>
            <label htmlFor="cl-motivation" className="label-mono block text-muted">
              Why this role? (optional)
            </label>
            <textarea
              id="cl-motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={3}
              placeholder="One or two honest sentences about why this role interests you."
              className="mt-1 w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
            />
          </div>

          <StrengthEditor strengths={strengths} onChange={setStrengths} />

          <div className="flex items-center gap-3">
            <Button onClick={generate} disabled={!role.trim() || status === "loading"}>
              {status === "loading" ? "Drafting…" : draft ? "Regenerate draft" : "Create a draft"}
            </Button>
            {!role.trim() && <span className="text-sm text-muted">Add a target role to start.</span>}
          </div>

          {status === "error" && (
            <div className="rounded-lg border border-red/40 bg-red/5 p-3 text-sm text-ink" role="alert">
              We couldn&rsquo;t build the draft just now. Your inputs are safe —{" "}
              <button type="button" onClick={generate} className="font-medium text-red underline">
                try again
              </button>
              .
            </div>
          )}
        </div>

        {/* Draft */}
        <div>
          <label htmlFor="cl-draft" className="label-mono block text-muted">
            Your editable draft
          </label>
          <p className="mt-1 text-sm text-muted">
            This is a starting point, not a finished letter. Read every line and make it true to you.
          </p>
          <textarea
            id="cl-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={18}
            placeholder="Your draft will appear here once you create it. You can edit it freely."
            className="mt-2 w-full rounded-lg border border-hair bg-paper p-4 text-sm leading-relaxed text-ink outline-none focus:border-red"
          />
          <div className="mt-3 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => draft && navigator.clipboard?.writeText(draft)}
              disabled={!draft}
            >
              Copy to clipboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const id = `cl-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="label-mono block text-muted">
        {label}
        {required && <span className="text-red"> *</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-red"
      />
    </div>
  );
}

function StrengthEditor({ strengths, onChange }: { strengths: string[]; onChange: (s: string[]) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <p className="label-mono text-muted">Your strengths</p>
      <p className="mt-1 text-sm text-muted">A few real strengths to weave in (we pre-filled any from your journey).</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {strengths.map((s) => (
          <li key={s} className="flex items-center gap-2 rounded-pill border border-hair bg-paper px-3 py-1.5 text-sm text-ink">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(strengths.filter((x) => x !== s))} className="text-muted hover:text-red">
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (v && !strengths.includes(v)) onChange([...strengths, v]);
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Add a strength"
          placeholder="Add a strength…"
          className="w-44 rounded-pill border border-hair bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-red"
        />
        <button type="submit" className="rounded-lg border border-hair bg-surface px-3 py-1.5 text-sm text-ink hover:border-red hover:text-red">
          Add
        </button>
      </form>
    </div>
  );
}
