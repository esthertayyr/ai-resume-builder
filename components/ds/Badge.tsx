import type { ReactNode } from "react";

// Small status pill. Used for "Coming soon" / "Available" labels so a tool's
// state is communicated by text (not colour alone).
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "available" | "soon";
  className?: string;
}) {
  const toneClass =
    tone === "available"
      ? "bg-red/10 text-red"
      : tone === "soon"
        ? "bg-warmgray text-muted"
        : "bg-warmgray text-ink";
  return (
    <span
      className={`label-mono inline-flex items-center rounded-pill px-2.5 py-1 ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
