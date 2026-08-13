"use client";

// Reusable editorial AI-action primitives for the resume builder. These look like an
// editor's marks — a small Signature-Red mark + restrained type — NOT generic SaaS
// buttons. Every action is explicit (click-only), disables itself while running
// (duplicate-click protection on top of the client's in-flight de-dup), and fails to a
// calm, brand-appropriate message. Nothing here ever writes to the resume; the caller
// decides what to accept.
import { useState, type ReactNode } from "react";
import { AIError, type AIErrorKind } from "@/lib/ai/client";

// Brand loading lines (never "AI is thinking…"). Pick per action.
export const LOADING = {
  lookCloser: "Looking closer…",
  evidence: "Finding the evidence…",
  improve: "Sharpening the wording…",
  summary: "Finding the thread in your experience…",
  review: "Reading it like an editor…",
  job: "Comparing the two documents…",
} as const;

const UNAVAILABLE = "AI assistance is temporarily unavailable. Your resume is safe — you can continue editing manually.";

export type ActionStatus = "idle" | "loading" | "done" | "error";

export function useAIAction<T>() {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [data, setData] = useState<T | null>(null);
  const [errorKind, setErrorKind] = useState<AIErrorKind>("unavailable");

  async function run(thunk: () => Promise<T>) {
    if (status === "loading") return; // no duplicate simultaneous requests
    setStatus("loading");
    try {
      const result = await thunk();
      setData(result);
      setStatus("done");
    } catch (e) {
      setErrorKind(e instanceof AIError ? e.kind : "unavailable");
      setStatus("error");
    }
  }
  function reset() {
    setStatus("idle");
    setData(null);
  }
  return { status, data, errorKind, run, reset };
}

/** Small editorial trigger. `mark` is the annotation glyph (✦ discover, → improve). */
export function AIActionButton({
  onClick,
  disabled,
  loading,
  mark = "✦",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  mark?: "✦" | "→" | "✎";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="group inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:text-red disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
    >
      <span aria-hidden className="text-red">
        {mark}
      </span>
      <span className="underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-red">
        {children}
      </span>
    </button>
  );
}

/** Inline expansion panel (not a modal). Renders loading / error / content states. */
export function AIPanel({
  title,
  subtitle,
  status,
  errorKind,
  loadingText,
  onClose,
  onRetry,
  children,
}: {
  title: string;
  subtitle?: string;
  status: ActionStatus;
  errorKind?: AIErrorKind;
  loadingText: string;
  onClose: () => void;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  if (status === "idle") return null;
  return (
    <div className="mt-3 rounded-lg border border-ink/15 bg-paper p-4" role="region" aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-mono text-red">{title}</p>
          {subtitle && status === "done" && <p className="mt-1 text-sm text-ink/70">{subtitle}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
          ✕
        </button>
      </div>

      {status === "loading" && (
        <p className="mt-3 text-sm italic text-muted motion-safe:animate-pulse">{loadingText}</p>
      )}

      {status === "error" && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ink/80">{UNAVAILABLE}</p>
          {onRetry && errorKind !== "rate_limited" && (
            <button type="button" onClick={onRetry} className="text-sm font-semibold text-red underline underline-offset-4">
              Try again
            </button>
          )}
        </div>
      )}

      {status === "done" && <div className="mt-3">{children}</div>}
    </div>
  );
}

/** Accept / dismiss row used by findings & skills. */
export function AcceptRow({
  onAccept,
  acceptLabel = "Add skill",
  onDismiss,
  dismissLabel = "Dismiss",
  accepted,
}: {
  onAccept: () => void;
  acceptLabel?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
  accepted?: boolean;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <button
        type="button"
        onClick={onAccept}
        disabled={accepted}
        className="rounded border border-red bg-red px-2.5 py-1 text-xs font-semibold text-paper transition hover:bg-[#CC2E3A] disabled:opacity-50"
      >
        {accepted ? "Added ✓" : acceptLabel}
      </button>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs text-muted hover:text-ink">
          {dismissLabel}
        </button>
      )}
    </div>
  );
}

/** Confidence chip — subtle, never shouting. */
export function ConfidenceTag({ value }: { value: string }) {
  return (
    <span className="ml-2 rounded-pill border border-hair px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wide text-muted">
      {value}
    </span>
  );
}
