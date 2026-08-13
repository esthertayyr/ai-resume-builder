import type { ReactNode } from "react";
import { Container } from "./Container";

// A vertical rhythm band. `tone` sets the paper colour so sections read as
// distinct "spreads" without excessive cards. Whitespace does the work.
export function Section({
  children,
  id,
  tone = "paper",
  className = "",
  containerWidth = "content",
  as: Tag = "section",
}: {
  children: ReactNode;
  id?: string;
  tone?: "paper" | "surface" | "warm" | "ink";
  className?: string;
  containerWidth?: "content" | "prose" | "full";
  as?: "section" | "div" | "footer" | "header" | "article";
}) {
  const toneClass =
    tone === "surface"
      ? "bg-surface"
      : tone === "warm"
        ? "bg-warmgray"
        : tone === "ink"
          ? "bg-ink text-paper"
          : "bg-paper";
  return (
    <Tag id={id} className={`py-section ${toneClass} ${className}`}>
      <Container width={containerWidth}>{children}</Container>
    </Tag>
  );
}
