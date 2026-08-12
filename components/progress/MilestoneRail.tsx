"use client";

import { MILESTONE_LABELS, MILESTONE_ORDER } from "@/lib/profile/factory";
import type { MilestoneId, ProgressState } from "@/lib/profile/types";

// Vertical milestone rail for the flow sidebar. Milestones, not XP (Prompt 9).
export function MilestoneRail({ progress }: { progress: ProgressState }) {
  return (
    <ol className="flex flex-col gap-3">
      {MILESTONE_ORDER.map((id: MilestoneId) => {
        const status = progress.milestones[id].status;
        return (
          <li key={id} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors ${
                status === "complete"
                  ? "border-mint bg-mint text-white"
                  : status === "in_progress"
                    ? "border-accent text-accent"
                    : "border-hair text-muted/50"
              }`}
            >
              {status === "complete" ? "✓" : ""}
            </span>
            <span className={status === "not_started" ? "text-muted/60" : "text-navy"}>{MILESTONE_LABELS[id]}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Descriptive strength label — never a hiring score (Prompt 9). */
export function strengthLabel(percent: number): string {
  if (percent >= 100) return "Complete";
  if (percent >= 75) return "Strong";
  if (percent >= 50) return "Taking shape";
  if (percent >= 25) return "Getting started";
  return "Just beginning";
}
