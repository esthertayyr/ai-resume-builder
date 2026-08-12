import { MILESTONE_LABELS, MILESTONE_ORDER } from "@/lib/profile/factory";
import type { MilestoneId, ProgressState } from "@/lib/profile/types";

// THE CAREER PATH — the signature brand motif. A gently irregular connecting line
// threading circular milestones: ABOUT → EXPERIENCE → SKILLS → STORY → RESUME.
// Premium editorial infographic, never a childish game board. Reused on the landing
// page, the Career Journey, onboarding and social assets.
//
// State colours: complete = mint, current = coral (accent), upcoming = hairline/muted.

export type PathState = "complete" | "current" | "upcoming";

export interface PathNode {
  label: string;
  /** Short mono caption, e.g. "01". Optional. */
  index?: string;
  state: PathState;
}

// Gently waving node positions in a 1000×220 viewBox — irregular, editorial.
const XS = [70, 300, 520, 745, 945];
const YS = [138, 88, 150, 78, 130];

/** Smooth cubic path through the node points. */
function smoothPath(xs: number[], ys: number[]): string {
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return d;
}

const NODE_FILL: Record<PathState, string> = {
  complete: "#49C6A6", // mint
  current: "#FF5C5C", // coral accent
  upcoming: "#FFFFFF", // card, hairline ring
};
const NODE_RING: Record<PathState, string> = {
  complete: "#49C6A6",
  current: "#FF5C5C",
  upcoming: "#E8E3DA", // hair
};

export function CareerPath({
  nodes,
  animate = true,
  className = "",
}: {
  nodes: PathNode[];
  animate?: boolean;
  className?: string;
}) {
  const n = Math.min(nodes.length, XS.length);
  const xs = XS.slice(0, n);
  const ys = YS.slice(0, n);
  const line = smoothPath(xs, ys);

  // How far along the path is "done" — up to the last complete/current node.
  const lastLit = nodes.reduce((acc, node, i) => (node.state !== "upcoming" ? i : acc), -1);
  const litXs = xs.slice(0, Math.max(lastLit + 1, 1));
  const litYs = ys.slice(0, Math.max(lastLit + 1, 1));
  const litLine = smoothPath(litXs, litYs);

  return (
    <div className={className}>
      <svg viewBox="0 0 1000 220" className="w-full" role="img" aria-label="Your career path">
        {/* Base (upcoming) line — dotted, calm */}
        <path d={line} fill="none" stroke="#E8E3DA" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 12" />
        {/* Lit progress line — solid mint, draws on */}
        {lastLit >= 0 && (
          <path
            d={litLine}
            fill="none"
            stroke="#49C6A6"
            strokeWidth="3.5"
            strokeLinecap="round"
            className={animate ? "animate-draw" : ""}
            style={animate ? ({ ["--dash" as string]: "1400" } as React.CSSProperties) : undefined}
            strokeDasharray={animate ? 1400 : undefined}
          />
        )}
        {/* Milestone nodes */}
        {nodes.slice(0, n).map((node, i) => (
          <g key={node.label}>
            <circle cx={xs[i]} cy={ys[i]} r="16" fill={NODE_FILL[node.state]} stroke={NODE_RING[node.state]} strokeWidth="3" />
            {node.state === "complete" && (
              <path
                d={`M ${xs[i] - 6} ${ys[i]} l 4 5 l 8 -9`}
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {node.state === "current" && <circle cx={xs[i]} cy={ys[i]} r="5" fill="#fff" />}
            {/* Labels */}
            {node.index && (
              <text
                x={xs[i]}
                y={ys[i] - 26}
                textAnchor="middle"
                className="label-mono"
                fill="#657084"
                style={{ fontSize: "13px", letterSpacing: "0.12em" }}
              >
                {node.index}
              </text>
            )}
            <text
              x={xs[i]}
              y={ys[i] + 40}
              textAnchor="middle"
              fill={node.state === "upcoming" ? "#657084" : "#17233B"}
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: "16px" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Build path nodes from live milestone progress (used by the Career Journey). */
export function nodesFromProgress(progress?: ProgressState): PathNode[] {
  return MILESTONE_ORDER.map((id: MilestoneId, i) => {
    const status = progress?.milestones[id].status ?? "not_started";
    const state: PathState = status === "complete" ? "complete" : status === "in_progress" ? "current" : "upcoming";
    return { label: MILESTONE_LABELS[id], index: String(i + 1).padStart(2, "0"), state };
  });
}
