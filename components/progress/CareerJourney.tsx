import { MILESTONE_LABELS, MILESTONE_ORDER } from "@/lib/profile/factory";
import type { MilestoneId, ProgressState } from "@/lib/profile/types";

// Horizontal "Career Journey" rail (marketing + top-of-flow). Milestones, not XP.
export function CareerJourney({ progress }: { progress?: ProgressState }) {
  return (
    <div className="w-full">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        Your Career Journey
      </p>
      <ol className="flex items-center justify-between">
        {MILESTONE_ORDER.map((id: MilestoneId, i) => {
          const status = progress?.milestones[id].status ?? "not_started";
          const done = status === "complete";
          const active = status === "in_progress";
          return (
            <li key={id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    done
                      ? "border-mint bg-mint text-white"
                      : active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-hair bg-white text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`text-[11px] font-medium sm:text-xs ${done || active ? "text-navy" : "text-muted"}`}>
                  {MILESTONE_LABELS[id]}
                </span>
              </div>
              {i < MILESTONE_ORDER.length - 1 && (
                <span className={`mx-1 h-0.5 flex-1 rounded ${done ? "bg-mint" : "bg-hair"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
