import { CareerPath, nodesFromProgress } from "@/components/brand/CareerPath";
import { Label } from "@/components/brand/Label";
import type { ProgressState } from "@/lib/profile/types";

// Career Journey — the signature Career Path motif, driven by live milestone
// progress. Completed = mint, current = coral, upcoming = hairline/muted.
export function CareerJourney({ progress }: { progress?: ProgressState }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Label tone="muted">Career journey / 04</Label>
        <Label tone="muted">5 milestones</Label>
      </div>
      <CareerPath nodes={nodesFromProgress(progress)} />
    </div>
  );
}
