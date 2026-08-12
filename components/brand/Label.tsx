import type { ReactNode } from "react";

// Small technical-style label in DM Mono — e.g. "CAREER JOURNEY / 03", "SKILL FOUND",
// "CONFIRMED". A recurring editorial detail across the brand. `tone` tints it.
type Tone = "muted" | "accent" | "sky" | "mint" | "navy";

const TONES: Record<Tone, string> = {
  muted: "text-muted",
  accent: "text-accent",
  sky: "text-sky",
  mint: "text-mint",
  navy: "text-navy",
};

export function Label({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={`label-mono ${TONES[tone]} ${className}`}>{children}</span>;
}
