import type { ReactNode } from "react";

// Small technical eyebrow label above a heading, e.g. "HOW IT WORKS".
// Uses text + optional index number so meaning never depends on colour alone.
export function Eyebrow({
  children,
  number,
  className = "",
}: {
  children: ReactNode;
  number?: string;
  className?: string;
}) {
  return (
    <p className={`label-mono flex items-center gap-2 text-muted ${className}`}>
      {number ? <span className="text-red">{number}</span> : null}
      <span>{children}</span>
    </p>
  );
}
